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
}

const LongTextInput = ({ placeholder, width, text, type, handleTextChange, max }: LongTextInputProps) => {

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
          "words";

  return (
    <TextInput
      style={{ fontSize: TEXT_SIZE, height: RFPercentage(6.5) }}
      className={`w-[${width ? width : "90%"}] text-white font-rubik-bold px-4 p-2 bg-zinc-800 rounded-lg`}
      placeholder={placeholder}
      placeholderTextColor={"gray"}
      defaultValue={text}
      onChangeText={handleTextChange}
      textContentType={textContentType}
      keyboardType={keyboardType}
      autoComplete={autoComplete}
      autoCapitalize={autoCapitalize}
      autoCorrect={false}
      accessibilityLabel={
        type === "telephoneNumber" ? "Phone Number Input" :
          type === "birthdate" ? "Birthday Input" :
            type === "email" ? "Email Input" :
              "Name Input"
      }
      accessibilityHint={
        type === "telephoneNumber" ? "Enter your Phone Number" :
          type === "birthdate" ? "Enter your birthdate (DD/MM/YYYY)" :
            type === "email" ? "Enter your email address" :
              "Enter your Name"
      }
      maxLength={max ? max : 100}
    />
  )
}

export default LongTextInput;