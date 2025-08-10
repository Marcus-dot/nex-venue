import { View, Text, TouchableOpacity } from 'react-native';
import { Entypo } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { RFPercentage } from 'react-native-responsive-fontsize';
import { LinearGradient } from "expo-linear-gradient";

import { ICON_SIZE, TEXT_SIZE } from '@/constants';
import { useRouter } from 'expo-router';

const Welcome = () => {

  const { colorScheme } = useColorScheme();

  const router = useRouter();

  const handlePhoneLogin = () => {
    router.push("/auth/login")
  }

  return (
    <View className={'h-full w-full dark:bg-dark flex flex-col items-center relative'}>
      <View className="w-full h-[30%] bg-red-500 flex justify-start items-center relative">
        {/* <LinearGradient
          colors={ colorScheme === "dark" ? [ 'rgba(0,0,0,0)', 'rgba(0,0,0,1)'] : [ 'rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
          locations={[0, 1]}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
        /> */}
      </View>

      <TouchableOpacity className='bg-accent w-[90%] mt-6 pr-2 pl-3 py-5 rounded-2xl flex flex-row items-center justify-between' onPress={handlePhoneLogin}>
        <Text style={{ fontSize: TEXT_SIZE * 0.93}} className='text-white font-rubik-extrabold'>Continue with Phone Number</Text>
        <Entypo name='chevron-right' size={ICON_SIZE} color={"white"} />
      </TouchableOpacity>

      <Text style={{ fontSize: TEXT_SIZE * 0.6}} className={`text-neutral-800 dark:text-white font-rubik-medium absolute bottom-10 opacity-80`}>© {new Date().getFullYear()} All Rights Reserved</Text>

    </View>
  )
}

export default Welcome;