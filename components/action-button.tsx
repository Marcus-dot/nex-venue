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

    const getVariantStyles = () => {
        switch (variant) {
            case 'secondary':
                return 'bg-gray-700 border border-gray-600';
            case 'danger':
                return 'bg-red-600';
            default:
                return 'bg-accent';
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
                {
                    width: width ? width : "90%",
                    opacity: isDisabled ? 0.6 : 1
                }
            ]}
            className={`${getVariantStyles()} mt-6 pr-2 pl-3 rounded-2xl flex flex-row items-center ${loading ? "justify-center" : "justify-between"
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
                    color="white"
                    accessibilityLabel="Loading"
                />
                :
                <>
                    <Text
                        style={{ fontSize: getFontSize() }}
                        className='text-white font-rubik-extrabold'
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {buttonText}
                    </Text>
                    {showArrow && (
                        <Entypo
                            name='chevron-right'
                            size={ICON_SIZE * (size === 'small' ? 0.7 : size === 'large' ? 1.2 : 1)}
                            color="white"
                            accessibilityElementsHidden={true}
                        />
                    )}
                </>
            }
        </TouchableOpacity>
    );
};

export default ActionButton;