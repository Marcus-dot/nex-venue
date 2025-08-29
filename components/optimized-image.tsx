import { Feather } from '@expo/vector-icons';
import React, { memo, useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Image, ImageStyle, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface OptimizedImageProps {
    uri: string;
    style?: ImageStyle;
    containerStyle?: ViewStyle;
    placeholder?: React.ReactNode;
    fallback?: React.ReactNode;
    onLoad?: () => void;
    onError?: () => void;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
    cachePolicy?: 'memory' | 'disk' | 'memory-disk';
    showRetry?: boolean;
    maxRetries?: number;
    description?: string;
    testID?: string;
}

const OptimizedImage = memo<OptimizedImageProps>(({
    uri,
    style,
    containerStyle,
    placeholder,
    fallback,
    onLoad,
    onError,
    resizeMode = 'cover',
    showRetry = true,
    maxRetries = 2,
    description,
    testID
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const mountedRef = useRef(true);

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const handleLoad = useCallback(() => {
        if (!mountedRef.current) return;

        setLoading(false);
        setError(false);
        onLoad?.();
    }, [onLoad]);

    const handleError = useCallback(() => {
        if (!mountedRef.current) return;

        setLoading(false);
        setError(true);
        onError?.();
    }, [onError]);

    const handleRetry = useCallback(() => {
        if (retryCount < maxRetries) {
            setRetryCount(prev => prev + 1);
            setError(false);
            setLoading(true);
        }
    }, [retryCount, maxRetries]);

    const defaultPlaceholder = (
        <View className="items-center justify-center bg-gray-800" style={style}>
            <ActivityIndicator size="large" color="#ff4306" />
            <Text className="text-gray-400 font-rubik text-sm mt-2">Loading...</Text>
        </View>
    );

    const defaultFallback = (
        <View className="items-center justify-center bg-gray-800" style={style}>
            <Feather name="image" size={48} color="#9CA3AF" />
            <Text className="text-gray-400 font-rubik text-sm mt-2 text-center px-4">
                {description ? 'Unable to load image' : 'Image unavailable'}
            </Text>
            {showRetry && retryCount < maxRetries && (
                <TouchableOpacity
                    onPress={handleRetry}
                    className="bg-accent px-4 py-2 rounded-lg mt-3"
                    activeOpacity={0.8}
                >
                    <Text className="text-white font-rubik-medium">Retry</Text>
                </TouchableOpacity>
            )}
            {retryCount >= maxRetries && (
                <Text className="text-gray-500 font-rubik text-xs mt-2 text-center">
                    Max retries reached
                </Text>
            )}
        </View>
    );

    if (error) {
        return (
            <View style={containerStyle} testID={testID ? `${testID}-error` : undefined}>
                {fallback || defaultFallback}
            </View>
        );
    }

    return (
        <View style={containerStyle} testID={testID}>
            {loading && (placeholder || defaultPlaceholder)}
            <Image
                source={{
                    uri: `${uri}?retry=${retryCount}`, // Add retry parameter to bypass cache
                    cache: 'default' // Use platform default caching
                }}
                style={[
                    style,
                    loading && { position: 'absolute', opacity: 0 }
                ]}
                resizeMode={resizeMode}
                onLoad={handleLoad}
                onError={handleError}
                // Performance optimizations
                fadeDuration={200}
                // Accessibility
                accessible={!!description}
                accessibilityLabel={description}
                accessibilityRole="image"
            />
        </View>
    );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;