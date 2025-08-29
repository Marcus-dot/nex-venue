import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, InteractionManager } from 'react-native';

// Hook for debounced values (prevents excessive API calls)
export const useDebounce = <T>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Hook for throttled functions (prevents excessive executions)
export const useThrottle = <T extends (...args: any[]) => any>(
    func: T,
    delay: number
): T => {
    const lastRan = useRef(Date.now());

    return useCallback((...args: any[]) => {
        if (Date.now() - lastRan.current >= delay) {
            func(...args);
            lastRan.current = Date.now();
        }
    }, [func, delay]) as T;
};

// Hook for managing expensive operations
export const useExpensiveOperation = () => {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const task = InteractionManager.runAfterInteractions(() => {
            setIsReady(true);
        });

        return () => task.cancel();
    }, []);

    return isReady;
};

// Hook for app state management
export const useAppState = () => {
    const [appState, setAppState] = useState(AppState.currentState);

    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            setAppState(nextAppState);
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => subscription?.remove();
    }, []);

    return appState;
};

// Hook for memory management
export const useMemoryManagement = () => {
    const cleanupFunctions = useRef<(() => void)[]>([]);

    const addCleanup = useCallback((cleanup: () => void) => {
        cleanupFunctions.current.push(cleanup);
    }, []);

    const cleanup = useCallback(() => {
        cleanupFunctions.current.forEach(fn => fn());
        cleanupFunctions.current = [];
    }, []);

    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    return { addCleanup, cleanup };
};

// Hook for lazy loading components
export const useLazyComponent = <T>(
    importFunction: () => Promise<{ default: T }>,
    fallback?: T
) => {
    const [Component, setComponent] = useState<T | undefined>(fallback);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadComponent = async () => {
            try {
                const module = await importFunction();
                if (isMounted) {
                    setComponent(module.default);
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err : new Error('Failed to load component'));
                    setLoading(false);
                }
            }
        };

        // Use InteractionManager for better performance
        const task = InteractionManager.runAfterInteractions(() => {
            loadComponent();
        });

        return () => {
            isMounted = false;
            task.cancel();
        };
    }, [importFunction]);

    return { Component, loading, error };
};