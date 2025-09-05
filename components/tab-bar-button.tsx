import { Feather } from '@expo/vector-icons';
import { PlatformPressable } from '@react-navigation/elements';
import React, { useEffect } from 'react';
import { GestureResponderEvent, Platform, StyleSheet, View } from 'react-native';
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from "react-native-reanimated";

import { ACCENT_COlOR, CONTAINER_WIDTH, TAB_BAR_ICON_SIZE } from '@/constants';
import { useTheme } from '@/context/theme-context';

interface TabBarButtonProps {
    onPress: (e: GestureResponderEvent | React.MouseEvent<HTMLAnchorElement>) => void,
    onLongPress: (event: GestureResponderEvent) => void,
    isFocused: boolean,
    routeName: string,
    color: string,
    label: string
}

const TabBarButton = ({ onPress, onLongPress, isFocused, routeName }: TabBarButtonProps) => {
    const { activeTheme } = useTheme();
    const scale = useSharedValue(1);
    const opacity = useSharedValue(isFocused ? 1 : 0.6);
    const backgroundColor = useSharedValue(isFocused ? 1 : 0);

    // Theme-aware colors
    const inactiveColor = activeTheme === 'light' ? '#6b7280' : '#9CA3AF';
    const pressedBackgroundColor = activeTheme === 'light'
        ? 'rgba(0, 0, 0, 0.05)'
        : 'rgba(255, 255, 255, 0.1)';

    useEffect(() => {
        // Smooth spring animation for background
        backgroundColor.value = withSpring(isFocused ? 1 : 0, {
            damping: 20,
            stiffness: 150,
            mass: 1,
        });

        // Opacity animation for icon
        opacity.value = withTiming(isFocused ? 1 : 0.6, {
            duration: 200,
        });

        // Scale animation for press feedback
        if (isFocused) {
            scale.value = withSpring(1, {
                damping: 15,
                stiffness: 200,
            });
        }
    }, [isFocused]);

    const animatedBackgroundStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            backgroundColor.value,
            [0, 1],
            ['transparent', ACCENT_COlOR]
        ),
        transform: [
            {
                scale: backgroundColor.value === 0 ? 0.8 : 1
            }
        ],
        opacity: backgroundColor.value,
    }));

    const animatedIconStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { scale: scale.value },
            {
                translateY: backgroundColor.value === 1 ? -1 : 0
            }
        ],
    }));

    // Animated style for inactive button press feedback
    const animatedPressStyle = useAnimatedStyle(() => ({
        backgroundColor: isFocused ? 'transparent' : pressedBackgroundColor,
        opacity: scale.value < 1 ? 0.8 : 0,
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.9, {
            damping: 15,
            stiffness: 400,
        });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, {
            damping: 15,
            stiffness: 200,
        });
    };

    const handlePress = (e: GestureResponderEvent | React.MouseEvent<HTMLAnchorElement>) => {
        // Add haptic feedback
        if (Platform.OS === 'ios' && !isFocused) {
            // Add light haptic feedback if expo-haptics is available
            // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress(e);
    };

    const icon = {
        home: (props: any) => <Feather name='home' size={TAB_BAR_ICON_SIZE} {...props} />,
        discover: (props: any) => <Feather name='compass' size={TAB_BAR_ICON_SIZE} {...props} />,
        events: (props: any) => <Feather name='calendar' size={TAB_BAR_ICON_SIZE} {...props} />,
        profile: (props: any) => <Feather name='user' size={TAB_BAR_ICON_SIZE} {...props} />
    };

    return (
        <PlatformPressable
            onPress={handlePress}
            onLongPress={onLongPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.tabBarItem}
        >
            <View style={styles.innerTabBarItem}>
                {/* Press Feedback Background for Inactive Buttons */}
                {!isFocused && (
                    <Animated.View
                        style={[
                            animatedPressStyle,
                            styles.pressBackgroundCircle
                        ]}
                    />
                )}

                <Animated.View style={animatedIconStyle}>
                    {
                        // @ts-ignore
                        icon[routeName]({
                            color: isFocused ? "white" : inactiveColor
                        })
                    }
                </Animated.View>

                {/* Animated Background for Active State */}
                <Animated.View
                    style={[animatedBackgroundStyle, styles.backgroundCircle]}
                />

                {/* Active indicator dot */}
                {isFocused && (
                    <Animated.View
                        style={[
                            styles.activeDot,
                            {
                                opacity: backgroundColor.value,
                            }
                        ]}
                    />
                )}
            </View>
        </PlatformPressable>
    );
};

export default TabBarButton;

const styles = StyleSheet.create({
    tabBarItem: {
        borderRadius: CONTAINER_WIDTH / 2,
        overflow: 'hidden',
    },
    innerTabBarItem: {
        width: CONTAINER_WIDTH,
        height: CONTAINER_WIDTH,
        borderRadius: CONTAINER_WIDTH / 2,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden"
    },
    backgroundCircle: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: CONTAINER_WIDTH / 2,
        zIndex: -1,
    },
    pressBackgroundCircle: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: CONTAINER_WIDTH / 2,
        zIndex: -2,
    },
    activeDot: {
        position: 'absolute',
        bottom: -2,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'white',
        zIndex: 2,
    }
});