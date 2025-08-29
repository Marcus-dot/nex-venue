import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TEXT_SIZE } from '@/constants';

interface EnhancedHeaderProps {
    title: string;
    subtitle?: string;
    showBackButton?: boolean;
    onBackPress?: () => void;
    rightComponent?: React.ReactNode;
    backgroundColor?: string;
    scrollOffset?: Animated.SharedValue<number>;
    elevation?: boolean;
    centerTitle?: boolean;
    large?: boolean;
}

const EnhancedHeader = ({
    title,
    subtitle,
    showBackButton = true,
    onBackPress,
    rightComponent,
    backgroundColor = 'rgba(22, 22, 22, 1)',
    scrollOffset,
    elevation = true,
    centerTitle = false,
    large = false
}: EnhancedHeaderProps) => {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const handleBackPress = () => {
        if (onBackPress) {
            onBackPress();
        } else if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(app)/home');
        }
    };

    // Animated header styles based on scroll
    const animatedHeaderStyle = useAnimatedStyle(() => {
        if (!scrollOffset) return {};

        const opacity = interpolate(
            scrollOffset.value,
            [0, 100],
            [0, 1],
            'clamp'
        );

        const translateY = interpolate(
            scrollOffset.value,
            [0, 100],
            [-10, 0],
            'clamp'
        );

        return {
            opacity,
            transform: [{ translateY }],
        };
    });

    const animatedTitleStyle = useAnimatedStyle(() => {
        if (!scrollOffset || !large) return {};

        const scale = interpolate(
            scrollOffset.value,
            [0, 100],
            [1.2, 1],
            'clamp'
        );

        const translateY = interpolate(
            scrollOffset.value,
            [0, 100],
            [20, 0],
            'clamp'
        );

        return {
            transform: [{ scale }, { translateY }],
        };
    });

    const headerHeight = large ? 120 : 80;

    return (
        <>
            {Platform.OS === 'ios' && (
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            )}

            <Animated.View
                className={`${elevation ? 'border-b border-gray-700' : ''}`}
                style={[
                    {
                        paddingTop: insets.top,
                        height: headerHeight + insets.top,
                        backgroundColor,
                        zIndex: 1000,
                    },
                    scrollOffset && animatedHeaderStyle,
                    elevation && {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.15,
                        shadowRadius: 8,
                        elevation: 8,
                    }
                ]}
            >
                <View
                    className={`flex-1 flex-row items-center px-4 ${large ? 'items-end pb-4' : 'justify-center'}`}
                >
                    {/* Back Button */}
                    {showBackButton && (
                        <TouchableOpacity
                            onPress={handleBackPress}
                            className="mr-3 p-2 -ml-2 rounded-full active:bg-gray-800"
                            activeOpacity={0.7}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        >
                            <Feather name="arrow-left" size={24} color="white" />
                        </TouchableOpacity>
                    )}

                    {/* Title Section */}
                    <Animated.View
                        className={`flex-1 ${centerTitle && !showBackButton ? 'items-center' : ''}`}
                        style={large ? animatedTitleStyle : undefined}
                    >
                        <Text
                            style={{
                                fontSize: large ? TEXT_SIZE * 1.5 : TEXT_SIZE * 1.1,
                                color: 'white',
                                lineHeight: large ? TEXT_SIZE * 1.7 : TEXT_SIZE * 1.3
                            }}
                            className={`font-rubik-bold ${centerTitle ? 'text-center' : ''}`}
                            numberOfLines={large ? 2 : 1}
                            ellipsizeMode="tail"
                        >
                            {title}
                        </Text>
                        {subtitle && (
                            <Text
                                style={{
                                    fontSize: TEXT_SIZE * 0.8,
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    marginTop: 2
                                }}
                                className={`font-rubik ${centerTitle ? 'text-center' : ''}`}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {subtitle}
                            </Text>
                        )}
                    </Animated.View>

                    {/* Right Component */}
                    {rightComponent && (
                        <View className="ml-3">
                            {rightComponent}
                        </View>
                    )}
                </View>
            </Animated.View>
        </>
    );
};

export default EnhancedHeader;