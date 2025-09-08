import { useTheme } from '@/context/theme-context';
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
    const { activeTheme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const mountedRef = useRef(true);

    // Theme-aware colors
    const themeColors = {
        background: activeTheme === 'light' ? '#f3f4f6' : '#374151',
        text: activeTheme === 'light' ? '#6b7280' : '#d1d5db',
        textSecondary: activeTheme === 'light' ? '#9ca3af' : '#9ca3af',
        icon: activeTheme === 'light' ? '#9ca3af' : '#9CA3AF',
        retryBackground: activeTheme === 'light' ? '#3b82f6' : '#e85c29',
        retryText: activeTheme === 'light' ? '#ffffff' : '#ffffff'
    };

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
        <View
            className="items-center justify-center"
            style={[
                style,
                { backgroundColor: themeColors.background }
            ]}
        >
            <ActivityIndicator size="large" color="#e85c29" />
            <Text
                className="font-rubik text-sm mt-2"
                style={{ color: themeColors.text }}
            >
                Loading...
            </Text>
        </View>
    );

    const defaultFallback = (
        <View
            className="items-center justify-center"
            style={[
                style,
                { backgroundColor: themeColors.background }
            ]}
        >
            <Feather name="image" size={48} color={themeColors.icon} />
            <Text
                className="font-rubik text-sm mt-2 text-center px-4"
                style={{ color: themeColors.text }}
            >
                {description ? 'Unable to load image' : 'Image unavailable'}
            </Text>
            {showRetry && retryCount < maxRetries && (
                <TouchableOpacity
                    onPress={handleRetry}
                    className="px-4 py-2 rounded-lg mt-3"
                    style={{ backgroundColor: themeColors.retryBackground }}
                    activeOpacity={0.8}
                >
                    <Text
                        className="font-rubik-medium"
                        style={{ color: themeColors.retryText }}
                    >
                        Retry
                    </Text>
                </TouchableOpacity>
            )}
            {retryCount >= maxRetries && (
                <Text
                    className="font-rubik text-xs mt-2 text-center"
                    style={{ color: themeColors.textSecondary }}
                >
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