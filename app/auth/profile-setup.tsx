import { View, Text, TouchableWithoutFeedback, Keyboard, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { TEXT_SIZE } from '@/constants';
import { useAuth } from '@/context/auth-context';
import LongTextInput from '@/components/long-text-input';
import ActionButton from '@/components/action-button';

const ProfileSetup = () => {

  const { updateUserProfile } = useAuth();

  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'prefer_not_to_say' | ''>('');
  const [loading, setLoading] = useState(false);

  const handleCompleteProfile = async () => {

    Keyboard.dismiss();

    if (!fullName.trim()) {
      Alert.alert('Required', 'Please enter your full name');
      return;
    }

    if (!gender) {
      Alert.alert('Required', 'Please select your gender');
      return;
    }

    try {
      setLoading(true);

      await updateUserProfile({
        fullName,
        gender,
        profileComplete: true
      })

      router.replace("/(app)/home")
    } catch (error) {
      console.error(error)
      Alert.alert('Error', 'Failed to save profile information');
    } finally {
      setLoading(false);
    }

  }

  return (
    <TouchableWithoutFeedback className='flex-1' onPress={() => Keyboard.dismiss()}>
      <SafeAreaView className='flex-1 bg-background p-4'>

        <View className="mb-6">
            <Text style={{ fontSize: TEXT_SIZE * 1.1}} className="text-white font-rubik-bold">Complete Your Profile</Text>
            <Text style={{ fontSize: TEXT_SIZE * 0.8}} className="text-white font-rubik mt-2">
                Please provide the following information to complete the sign up process
            </Text>
        </View>

        <View className="mb-4 w-full">
            <Text style={{ fontSize: TEXT_SIZE * 0.8}} className="text-white font-rubik-medium mb-2">Full Name</Text>
            <LongTextInput text={fullName} handleTextChange={setFullName} width='100%' placeholder='Enter your Full Name' />
        </View>

        <View className='mb-6'>
          <Text style={{ fontSize: TEXT_SIZE * 0.8}} className="text-white font-rubik-medium mb-2">Gender</Text>
            <View className="flex-row flex-wrap gap-2">
              {['male', 'female', 'prefer_not_to_say'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    className={`px-4 py-2 rounded-lg border ${
                        gender === option ? 'bg-accent border-accent' : 'bg-white border-black dark:border-gray-300'
                    }`}
                    onPress={() => setGender(option as any)}>
                      <Text
                        className={`${gender === option ? "text-white" : "text-black font-rubik"}`} style={{ fontSize: TEXT_SIZE * 0.9}}
                      >
                          {option === 'prefer_not_to_say' ? 'Prefer not to say' : 
                          option.charAt(0).toUpperCase() + option.slice(1)}
                      </Text>
                  </TouchableOpacity>
              ))}
            </View>
        </View>

        <View className='flex items-center justify-center'>
          <ActionButton loading={loading} handlePress={handleCompleteProfile} buttonText='Complete Profile' showArrow width={"100%"} />
        </View>

      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

export default ProfileSetup;