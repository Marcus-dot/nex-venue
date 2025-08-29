import React, { useEffect } from 'react';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

interface PageTransitionProps {
    children: React.ReactNode;
    type?: 'fade' | 'slide' | 'scale' | 'slideUp';
    duration?: number;
    onTransitionComplete?: () => void;
    style?: any;
}

const PageTransition = ({
    children,
    type = 'fade',
    duration = 300,
    onTransitionComplete,
    style
}: PageTransitionProps) => {
    const opacity = useSharedValue(0);
    const translateX = useSharedValue(type === 'slide' ? 50 : 0);
    const translateY = useSharedValue(type === 'slideUp' ? 50 : 0);
    const scale = useSharedValue(type === 'scale' ? 0.9 : 1);

    useEffect(() => {
        const animate = () => {
            'worklet';

            opacity.value = withTiming(1, {
                duration,
                easing: Easing.out(Easing.quad),
            });

            if (type === 'slide') {
                translateX.value = withSpring(0, {
                    damping: 15,
                    stiffness: 150,
                    mass: 1,
                });
            }

            if (type === 'slideUp') {
                translateY.value = withSpring(0, {
                    damping: 15,
                    stiffness: 150,
                    mass: 1,
                });
            }

            if (type === 'scale') {
                scale.value = withSpring(1, {
                    damping: 15,
                    stiffness: 150,
                    mass: 1,
                });
            }

            if (onTransitionComplete) {
                runOnJS(onTransitionComplete)();
            }
        };

        // Small delay to ensure smooth transition
        setTimeout(animate, 50);
    }, [type, duration, onTransitionComplete]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    return (
        <Animated.View style={[{ flex: 1 }, animatedStyle, style]}>
            {children}
        </Animated.View>
    );
};

export default PageTransition;