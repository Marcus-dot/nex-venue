import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react'

import { TEXT_SIZE } from '@/constants';
import ActionButton from '@/components/action-button';
import BackNav from '@/components/back-nav';

const Terms = () => {

    const { toggle } = useLocalSearchParams();
    const initialToggle = Array.isArray(toggle) ? toggle[0] : toggle;

    const [toggleView, setToggleView] = useState<'tncs' | 'pps'>(
        initialToggle === 'pps' ? 'pps' : 'tncs'
    );

  return (
    <SafeAreaView className='flex-1 bg-background'>
      <BackNav title='Terms & Conditions' handlePress={() => router.back()} />
      <View className='w-full h-[92%] flex'>
        <View className={`w-full h-[10%] flex flex-row items-center justify-center`}>
            <View className={`w-[80%] h-[60%] rounded-[25px] flex flex-row overflow-hidden shadow-lg border-gray-100 border bg-white`}>
                <TouchableOpacity onPress={() => {setToggleView("tncs")}} className={`w-1/2 h-full ${toggleView === "tncs" ? "bg-accent" : "bg-white"} flex items-center justify-center rounded-[25px]`}>
                    <Text style={{fontSize: TEXT_SIZE * 0.7}} className={`${toggleView === "tncs" ? "text-white" : "text-black"} font-rubik-medium`}>Terms & Conditions</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setToggleView("pps")} className={`w-1/2 h-full ${toggleView === "tncs" ? "bg-white" : "bg-accent"} flex items-center justify-center rounded-[25px]`}>
                    <Text style={{fontSize: TEXT_SIZE * 0.7}} className={`${toggleView === "tncs" ? "text-black" : "text-white"} font-rubik-medium`}>Privacy Policy</Text>
                </TouchableOpacity>
            </View>
        </View>
        <View className='w-full h-[75%] px-5'>
          <ScrollView className={`w-full ${toggleView === "tncs" ? "bg-purple-500" : "bg-green-500"}`}>
            
          </ScrollView>
        </View>
        <View className='w-full h-[15%] flex items-center justify-center'>
          <ActionButton showArrow={false} handlePress={() => router.back()} buttonText={`I understand the ${toggleView === "tncs" ? "T's & C's" : "Privacy Policy"}`} />
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Terms;