import { useTheme } from '@/context/theme-context';
import { TextInput } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';

import { TEXT_SIZE } from '@/constants';

interface LongTextInputProps {
  placeholder: string
  text: string | undefined
  type?: string
  handleTextChange: (text: string) => void
  max?: number
  width?: string
  error?: boolean
  accessibilityLabel?: string
  accessibilityHint?: string
  editable?: boolean
  multiline?: boolean
}

const LongTextInput = ({
  placeholder,
  width,
  text,
  type,
  handleTextChange,
  max,
  error = false,
  accessibilityLabel,
  accessibilityHint,
  editable = true,
  multiline = false
}: LongTextInputProps) => {
  const { activeTheme } = useTheme();

  // Theme-aware colors
  const themeColors = {
    background: activeTheme === 'light' ? '#f9fafb' : '#374151',
    border: activeTheme === 'light' ? '#d1d5db' : '#6b7280',
    text: activeTheme === 'light' ? '#1f2937' : '#ffffff',
    placeholder: activeTheme === 'light' ? '#9ca3af' : '#9ca3af',
    errorBackground: activeTheme === 'light' ? '#fef2f2' : 'rgba(239, 68, 68, 0.1)',
    errorBorder: activeTheme === 'light' ? '#f87171' : '#ef4444',
    errorPlaceholder: activeTheme === 'light' ? '#f87171' : '#fca5a5'
  };

  const textContentType =
    type === "telephoneNumber" ? "telephoneNumber" :
      type === "birthdate" ? "birthdate" :
        type === "email" ? "emailAddress" :
          "name";

  const keyboardType =
    type === "telephoneNumber" ? "phone-pad" :
      type === "code" ? "number-pad" :
        type === "email" ? "email-address" :
          "default";

  const autoComplete =
    type === "telephoneNumber" ? "tel" :
      type === "birthdate" ? "birthdate-full" :
        type === "code" ? "one-time-code" :
          type === "email" ? "email" :
            "name";

  const autoCapitalize =
    type === "telephoneNumber" ? "none" :
      type === "birthdate" ? "none" :
        type === "email" ? "none" :
          type === "code" ? "none" :
            "words";

  const getAccessibilityLabel = () => {
    if (accessibilityLabel) return accessibilityLabel;

    switch (type) {
      case "telephoneNumber":
        return "Phone number input field";
      case "email":
        return "Email address input field";
      case "code":
        return "Verification code input field";
      default:
        return placeholder + " input field";
    }
  };

  const getAccessibilityHint = () => {
    if (accessibilityHint) return accessibilityHint;

    switch (type) {
      case "telephoneNumber":
        return "Enter your phone number including country code";
      case "email":
        return "Enter a valid email address";
      case "code":
        return "Enter the verification code sent to your device";
      default:
        return `Enter your ${placeholder.toLowerCase()}`;
    }
  };

  return (
    <TextInput
      style={{
        fontSize: TEXT_SIZE,
        height: multiline ? RFPercentage(12) : RFPercentage(6.5),
        textAlignVertical: multiline ? 'top' : 'center',
        backgroundColor: error ? themeColors.errorBackground : themeColors.background,
        color: themeColors.text,
        borderColor: error ? themeColors.errorBorder : themeColors.border,
        width: width
          ? width.endsWith('%')
            ? undefined // Ignore percentage strings for RN style, handle via container if needed
            : Number(width)
          : RFPercentage(90), // Use RFPercentage or a default number value
        opacity: !editable ? 0.6 : 1
      }}
      className={`font-rubik-bold px-4 py-3 rounded-lg border`}
      placeholder={placeholder}
      placeholderTextColor={error ? themeColors.errorPlaceholder : themeColors.placeholder}
      value={text}
      onChangeText={handleTextChange}
      textContentType={textContentType}
      keyboardType={keyboardType}
      autoComplete={autoComplete}
      autoCapitalize={autoCapitalize}
      autoCorrect={type !== "code" && type !== "telephoneNumber" && type !== "email"}
      secureTextEntry={type === "password"}
      editable={editable}
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
      maxLength={max ? max : 100}
      // Accessibility props
      accessible={true}
      accessibilityLabel={getAccessibilityLabel()}
      accessibilityHint={getAccessibilityHint()}
      accessibilityRole="none" // Let TextInput handle its own role
      accessibilityState={{
        disabled: !editable
      }}
      // Enhanced accessibility for screen readers
      importantForAccessibility="yes"
      accessibilityLiveRegion={error ? "polite" : "none"}
    />
  );
};

export default LongTextInput;