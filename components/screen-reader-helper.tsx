import React from 'react';
import { AccessibilityInfo, Platform, Text, View } from 'react-native';

interface ScreenReaderAnnouncementProps {
    message: string;
    priority?: 'low' | 'high';
}

export const ScreenReaderAnnouncement: React.FC<ScreenReaderAnnouncementProps> = ({
    message,
    priority = 'low'
}) => {
    React.useEffect(() => {
        if (message && Platform.OS === 'ios') {
            // Announce to screen reader with a slight delay
            const timer = setTimeout(() => {
                AccessibilityInfo.announceForAccessibility(message);
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <View
            accessible={false}
            importantForAccessibility="no-hide-descendants"
            style={{ position: 'absolute', left: -10000, width: 1, height: 1 }}
        >
            <Text
                accessibilityLiveRegion={priority === 'high' ? 'assertive' : 'polite'}
                accessibilityLabel={message}
            >
                {message}
            </Text>
        </View>
    );
};

interface ScreenReaderHelpTextProps {
    text: string;
    visible?: boolean;
}

export const ScreenReaderHelpText: React.FC<ScreenReaderHelpTextProps> = ({
    text,
    visible = false
}) => {
    return (
        <View
            style={{
                position: visible ? 'relative' : 'absolute',
                left: visible ? 0 : -10000,
                opacity: visible ? 1 : 0,
                width: visible ? 'auto' : 1,
                height: visible ? 'auto' : 1,
            }}
        >
            <Text
                className="text-gray-400 font-rubik text-xs mt-1"
                accessible={true}
                accessibilityRole="text"
                importantForAccessibility="yes"
            >
                {text}
            </Text>
        </View>
    );
};

// Hook to check if screen reader is enabled
export const useScreenReader = () => {
    const [isScreenReaderEnabled, setIsScreenReaderEnabled] = React.useState(false);

    React.useEffect(() => {
        const checkScreenReader = async () => {
            const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
            setIsScreenReaderEnabled(screenReaderEnabled);
        };

        checkScreenReader();

        const subscription = AccessibilityInfo.addEventListener(
            'screenReaderChanged',
            setIsScreenReaderEnabled
        );

        return () => subscription?.remove?.();
    }, []);

    return isScreenReaderEnabled;
};

// Component for skip navigation (important for accessibility)
interface SkipNavigationProps {
    onSkip: () => void;
    skipText?: string;
}

export const SkipNavigation: React.FC<SkipNavigationProps> = ({
    onSkip,
    skipText = "Skip to main content"
}) => {
    return (
        <View
            style={{
                position: 'absolute',
                top: -100,
                left: 0,
                right: 0,
                zIndex: 9999,
            }}
            className="bg-accent p-2"
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={skipText}
            onAccessibilityTap={onSkip}
        >
            <Text className="text-white font-rubik-medium text-center">
                {skipText}
            </Text>
        </View>
    );
};