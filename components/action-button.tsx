import { ActivityIndicator, DimensionValue, Text, TouchableOpacity } from 'react-native'
import { Entypo } from '@expo/vector-icons';

import { ICON_SIZE, SCREEN_HEIGHT, TEXT_SIZE } from '@/constants';

interface actionButtonProps {
    handlePress: () => void;
    buttonText: string;
    loading?: boolean;
    showArrow: boolean
    width?: DimensionValue
}

const ActionButton = ({ handlePress, width, buttonText, loading, showArrow }: actionButtonProps) => {
  return (
    <TouchableOpacity disabled={loading} style={{ height: SCREEN_HEIGHT * 0.075, width: width ? width: "90%"}} className={`bg-accent mt-6 pr-2 pl-3 rounded-2xl flex flex-row items-center ${loading ? "opacity-50 justify-center" : "opacity-100 justify-between"}`} onPress={handlePress}>
        {loading ? 
            <ActivityIndicator size={"large"} />
        :
            <>
                <Text style={{ fontSize: TEXT_SIZE * 0.95}} className='text-white font-rubik-extrabold'>{buttonText}</Text>
                {showArrow && 
                    <Entypo name='chevron-right' size={ICON_SIZE} color={"white"} />
                }
            </>
        }
    </TouchableOpacity>
  )
}

export default ActionButton;