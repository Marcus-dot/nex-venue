import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import React from 'react';
import { AccessibilityRole, Platform, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface AccessibleTouchableProps extends TouchableOpacityProps {
    children: React.ReactNode;
    accessibilityLabel: string;
    accessibilityHint?: string;
    accessibilityRole?: AccessibilityRole;
    onPress?: () => void;
    hapticFeedback?: boolean;
    hapticType?: ImpactFeedbackStyle;
    disabled?: boolean;
    testID?: string;
}

const AccessibleTouchable: React.FC<AccessibleTouchableProps> = ({
    children,
    accessibilityLabel,
    accessibilityHint,
    accessibilityRole = "button",
    onPress,
    hapticFeedback = true,
    hapticType = ImpactFeedbackStyle.Light,
    disabled = false,
    testID,
    ...props
}) => {
    const handlePressWithHaptics = async () => {
        if (disabled || !onPress) return;

        // Add haptic feedback on supported platforms
        if (hapticFeedback && Platform.OS === 'ios') {
            try {
                await impactAsync(hapticType);
            } catch (error) {
                // Haptics not supported, continue silently
            }
        }

        onPress();
    };

    return (
        <TouchableOpacity
            {...props}
            onPress={handlePressWithHaptics}
            disabled={disabled}
            activeOpacity={disabled ? 1 : (props.activeOpacity || 0.7)}
            // Accessibility props
            accessible={true}
            accessibilityRole={accessibilityRole}
            accessibilityLabel={accessibilityLabel}
            accessibilityHint={accessibilityHint}
            accessibilityState={{
                disabled,
                ...props.accessibilityState
            }}
            // Testing
            testID={testID}
            // Enhanced touch target (minimum 44x44 points)
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[
                {
                    minHeight: 44,
                    minWidth: 44,
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                props.style,
                disabled && { opacity: 0.6 }
            ]}
        >
            {children}
        </TouchableOpacity>
    );
};

export default AccessibleTouchable;