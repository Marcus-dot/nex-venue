import { RFPercentage } from 'react-native-responsive-fontsize'
import { TextInput } from 'react-native'

import { TEXT_SIZE } from '@/constants'

interface LongTextInputProps {
    placeholder: string
    text: string | undefined
    type?: string
    handleTextChange: (text: string) => void
    max?: number
}

const LongTextInput = ({placeholder, text, type, handleTextChange, max} : LongTextInputProps) => {

        const textContentType = 
            type === "telephoneNumber" ? "telephoneNumber" : type === "birthdate" ? "birthdate" : "name";

  return (
    <TextInput
        style={{ fontSize: TEXT_SIZE, height: RFPercentage(6.5)}}
        className={`w-[90%] text-white font-rubik-bold px-4 p-2 bg-zinc-800 rounded-lg`}
        placeholder={placeholder}
        placeholderTextColor={"gray"}
        defaultValue={text}
        onChangeText={handleTextChange}
        textContentType={textContentType}
        keyboardType={type === "telephoneNumber" ? "phone-pad" : type === "code" ? "number-pad" : "default"}
        autoComplete={type === "telephoneNumber" ? "tel" : type === "birthdate" ? "birthdate-full" : type === "code" ? "one-time-code" : "name"}
        autoCapitalize={type === "telephoneNumber" ? "none" : type === "birthdate" ? "none" : "words"}
        autoCorrect={false} 
        accessibilityLabel={type === "telephoneNumber" ? "Phone Number Input" : type === "birthdate" ? "Birthday Input" : "Name Input"}
        accessibilityHint={type === "telephoneNumber" ? "Enter your Phone Number" : type === "birthdate" ? "Enter your birthdate (DD/MM/YYYY)" : "Enter your Name"}
        maxLength={max ? max : 100}
    />
  )
}

export default LongTextInput;