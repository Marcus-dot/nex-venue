import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppState, useDebounce } from './usePerformance';

interface UseOptimizedFirestoreOptions {
    enabled?: boolean;
    cacheFirst?: boolean;
    refetchOnAppFocus?: boolean;
    debounceMs?: number;
    maxRetries?: number;
}

export const useOptimizedFirestore = <T>(
    collectionPath: string,
    queryConstraints?: (query: FirebaseFirestoreTypes.CollectionReference) => FirebaseFirestoreTypes.Query,
    options: UseOptimizedFirestoreOptions = {}
) => {
    const {
        enabled = true,
        cacheFirst = true,
        refetchOnAppFocus = true,
        debounceMs = 0,
        maxRetries = 3
    } = options;

    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const unsubscribeRef = useRef<(() => void) | null>(null);
    const retryCountRef = useRef(0);
    const appState = useAppState();

    // Debounce query changes to prevent excessive calls
    const debouncedQueryConstraints = useDebounce(queryConstraints, debounceMs);

    const fetchData = useCallback(async (useCache = cacheFirst) => {
        if (!enabled) return;

        try {
            setError(null);

            const collection = firestore().collection(collectionPath);
            const query = debouncedQueryConstraints ? debouncedQueryConstraints(collection) : collection;

            // Use cache first if enabled
            if (useCache) {
                try {
                    const cachedSnapshot = await query.get({ source: 'cache' });
                    if (!cachedSnapshot.empty) {
                        const cachedData = cachedSnapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        })) as T[];
                        setData(cachedData);
                        setLoading(false);
                    }
                } catch (cacheError) {
                    // Cache miss, will fetch from server
                }
            }

            // Fetch from server
            const snapshot = await query.get({ source: 'server' });
            const serverData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as T[];

            setData(serverData);
            setLoading(false);
            setRefreshing(false);
            retryCountRef.current = 0;

        } catch (err) {
            console.error(`Error fetching ${collectionPath}:`, err);

            if (retryCountRef.current < maxRetries) {
                retryCountRef.current++;
                setTimeout(() => fetchData(false), 1000 * retryCountRef.current);
            } else {
                setError(err instanceof Error ? err : new Error('Failed to fetch data'));
                setLoading(false);
                setRefreshing(false);
            }
        }
    }, [enabled, collectionPath, debouncedQueryConstraints, cacheFirst, maxRetries]);

    const setupRealtimeListener = useCallback(() => {
        if (!enabled) return;

        const collection = firestore().collection(collectionPath);
        const query = debouncedQueryConstraints ? debouncedQueryConstraints(collection) : collection;

        const unsubscribe = query.onSnapshot(
            (snapshot) => {
                const realtimeData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as T[];

                setData(realtimeData);
                setLoading(false);
                setRefreshing(false);
                setError(null);
                retryCountRef.current = 0;
            },
            (err) => {
                console.error(`Realtime listener error for ${collectionPath}:`, err);
                setError(err);
                setLoading(false);
                setRefreshing(false);
            }
        );

        unsubscribeRef.current = unsubscribe;
    }, [enabled, collectionPath, debouncedQueryConstraints]);

    const refresh = useCallback(() => {
        setRefreshing(true);
        fetchData(false); // Force server fetch on refresh
    }, [fetchData]);

    // Initial data fetch
    useEffect(() => {
        if (enabled) {
            fetchData();
        }
    }, [fetchData]);

    // Setup realtime listener after initial fetch
    useEffect(() => {
        if (enabled && !loading) {
            const timer = setTimeout(setupRealtimeListener, 1000); // Delay to prevent conflicts
            return () => clearTimeout(timer);
        }
    }, [enabled, loading, setupRealtimeListener]);

    // Handle app state changes
    useEffect(() => {
        if (refetchOnAppFocus && appState === 'active' && !loading) {
            fetchData(false);
        }
    }, [appState, refetchOnAppFocus, loading, fetchData]);

    // Cleanup - Fixed TypeScript error by using proper null check
    useEffect(() => {
        return () => {
            unsubscribeRef.current?.();
        };
    }, []);

    return {
        data,
        loading,
        error,
        refreshing,
        refresh,
        refetch: () => fetchData(false)
    };
};

// Specialized hook for single document
export const useOptimizedDocument = <T>(
    documentPath: string,
    options: UseOptimizedFirestoreOptions = {}
) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const { enabled = true, cacheFirst = true } = options;

    useEffect(() => {
        if (!enabled) return;

        let unsubscribeFunction: (() => void) | null = null;

        const fetchDocument = async () => {
            try {
                setError(null);

                const docRef = firestore().doc(documentPath);

                // Try cache first
                if (cacheFirst) {
                    try {
                        const cachedDoc = await docRef.get({ source: 'cache' });
                        if (cachedDoc.exists()) {
                            setData({ id: cachedDoc.id, ...cachedDoc.data() } as T);
                            setLoading(false);
                        }
                    } catch (cacheError) {
                        // Cache miss
                    }
                }

                // Setup realtime listener
                unsubscribeFunction = docRef.onSnapshot(
                    (doc) => {
                        if (doc.exists()) {
                            setData({ id: doc.id, ...doc.data() } as T);
                        } else {
                            setData(null);
                        }
                        setLoading(false);
                        setError(null);
                    },
                    (err) => {
                        console.error(`Document listener error for ${documentPath}:`, err);
                        setError(err);
                        setLoading(false);
                    }
                );

            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch document'));
                setLoading(false);
            }
        };

        fetchDocument();

        return () => {
            unsubscribeFunction?.();
        };
    }, [documentPath, enabled, cacheFirst]);

    return { data, loading, error };
};