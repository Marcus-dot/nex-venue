import { LinearGradient } from "expo-linear-gradient";
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';

import { TEXT_SIZE } from '@/constants';
import ActionButton from '@/components/action-button';

const Welcome = () => {

  const router = useRouter();

  const handlePhoneLogin = () => {
    router.push("/auth/login")
  }

  return (
    <View className={'h-full w-full bg-background flex flex-col items-center relative'}>
      <View className="w-full h-[30%] flex flex-row justify-center items-end relative">
        {/* <Text className='absolute bottom-10 text-6xl text-white font-bold z-10'>NexVenue</Text> */}
        <LinearGradient
          colors={ [ 'rgba(255,67,6,1)', 'rgba(22,22,22,1)'] }
          locations={[0, 1]}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
        />
      </View>

      <ActionButton showArrow handlePress={handlePhoneLogin} buttonText='Continue with Phone Number' />

      <Text style={{ fontSize: TEXT_SIZE * 0.6}} className={`text-white font-rubik-medium absolute bottom-10 opacity-80`}>© {new Date().getFullYear()} All Rights Reserved</Text>

    </View>
  )
}

export default Welcome;