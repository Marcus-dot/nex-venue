import { TextInput } from 'react-native'
import { RFPercentage } from 'react-native-responsive-fontsize'

import { TEXT_SIZE } from '@/constants'

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
        textAlignVertical: multiline ? 'top' : 'center'
      }}
      className={`w-[${width ? width : "90%"}] text-white font-rubik-bold px-4 py-3 rounded-lg ${error ? 'bg-red-900/20 border border-red-500' : 'bg-zinc-800 border border-gray-700'
        } ${!editable ? 'opacity-60' : ''}`}
      placeholder={placeholder}
      placeholderTextColor={error ? "#fca5a5" : "gray"}
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