import { useTheme } from '@/context/theme-context';
import { Entypo } from '@expo/vector-icons';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { ActivityIndicator, DimensionValue, Text, TouchableOpacity } from 'react-native';

import { ICON_SIZE, SCREEN_HEIGHT, TEXT_SIZE } from '@/constants';

interface ActionButtonProps {
    handlePress: () => void;
    buttonText: string;
    loading?: boolean;
    showArrow: boolean;
    width?: DimensionValue;
    disabled?: boolean;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'small' | 'medium' | 'large';
}

const ActionButton = ({
    handlePress,
    width,
    buttonText,
    loading,
    showArrow,
    disabled = false,
    accessibilityLabel,
    accessibilityHint,
    variant = 'primary',
    size = 'medium'
}: ActionButtonProps) => {
    const { activeTheme } = useTheme();

    // Theme-aware colors
    const themeColors = {
        primaryBackground: '#e85c29', // Updated from '#ff4306'
        primaryText: '#ffffff',
        secondaryBackground: activeTheme === 'light' ? '#f3f4f6' : '#374151',
        secondaryBorder: activeTheme === 'light' ? '#d1d5db' : '#6b7280',
        secondaryText: activeTheme === 'light' ? '#374151' : '#ffffff',
        dangerBackground: '#ef4444',
        dangerText: '#ffffff'
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'secondary':
                return {
                    backgroundColor: themeColors.secondaryBackground,
                    borderWidth: 1,
                    borderColor: themeColors.secondaryBorder
                };
            case 'danger':
                return {
                    backgroundColor: themeColors.dangerBackground
                };
            default:
                return {
                    backgroundColor: themeColors.primaryBackground
                };
        }
    };

    const getTextColor = () => {
        switch (variant) {
            case 'secondary':
                return themeColors.secondaryText;
            case 'danger':
                return themeColors.dangerText;
            default:
                return themeColors.primaryText;
        }
    };

    const getIconColor = () => {
        switch (variant) {
            case 'secondary':
                return themeColors.secondaryText;
            case 'danger':
                return themeColors.dangerText;
            default:
                return themeColors.primaryText;
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return { height: SCREEN_HEIGHT * 0.055 };
            case 'large':
                return { height: SCREEN_HEIGHT * 0.09 };
            default:
                return { height: SCREEN_HEIGHT * 0.075 };
        }
    };

    const getFontSize = () => {
        switch (size) {
            case 'small':
                return TEXT_SIZE * 0.8;
            case 'large':
                return TEXT_SIZE * 1.1;
            default:
                return TEXT_SIZE * 0.95;
        }
    };

    const handlePressWithHaptics = async () => {
        if (loading || disabled) return;

        // Add haptic feedback on supported platforms
        try {
            await impactAsync(ImpactFeedbackStyle.Light);
        } catch (error) {
            // Haptics not supported, continue silently
        }

        handlePress();
    };

    const isDisabled = loading || disabled;

    return (
        <TouchableOpacity
            disabled={isDisabled}
            style={[
                getSizeStyles(),
                getVariantStyles(),
                {
                    width: width ? width : "90%",
                    opacity: isDisabled ? 0.6 : 1
                }
            ]}
            className={`mt-6 pr-2 pl-3 rounded-2xl flex flex-row items-center ${loading ? "justify-center" : "justify-between"
                } ${isDisabled ? 'opacity-60' : 'active:scale-95'}`}
            onPress={handlePressWithHaptics}
            activeOpacity={0.8}
            // Accessibility props
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel || buttonText}
            accessibilityHint={accessibilityHint || `Tap to ${buttonText.toLowerCase()}`}
            accessibilityState={{
                disabled: isDisabled,
                busy: loading
            }}
        >
            {loading ?
                <ActivityIndicator
                    size={size === 'small' ? 'small' : 'large'}
                    color={getTextColor()}
                    accessibilityLabel="Loading"
                />
                :
                <>
                    <Text
                        style={{
                            fontSize: getFontSize(),
                            color: getTextColor()
                        }}
                        className='font-rubik-extrabold'
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {buttonText}
                    </Text>
                    {showArrow && (
                        <Entypo
                            name='chevron-right'
                            size={ICON_SIZE * (size === 'small' ? 0.7 : size === 'large' ? 1.2 : 1)}
                            color={getIconColor()}
                            accessibilityElementsHidden={true}
                        />
                    )}
                </>
            }
        </TouchableOpacity>
    );
};

export default ActionButton;