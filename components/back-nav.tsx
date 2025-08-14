import { View, Text, TouchableOpacity } from 'react-native';
import { Entypo } from '@expo/vector-icons';

import { ICON_SIZE, TEXT_SIZE } from '@/constants';

interface BackNavProps {
    title?: string;
    handlePress: () => void;
}

const BackNav = ({ title, handlePress}: BackNavProps) => {
  return (
    <View className='w-full h-[8%] px-4 flex flex-row items-center'>
        <TouchableOpacity onPress={handlePress} className='flex flex-row gap-1 items-center'>
            <Entypo name="chevron-left" size={ICON_SIZE} color={"white"} />
            {title && 
                <Text style={{fontSize: TEXT_SIZE * 0.95}} className='font-rubik-semibold text-white'>{title}</Text>
            }
        </TouchableOpacity>
    </View>
  )
}

export default BackNav;