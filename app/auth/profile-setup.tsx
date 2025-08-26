import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Keyboard, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ActionButton from '@/components/action-button';
import LongTextInput from '@/components/long-text-input';
import { TEXT_SIZE } from '@/constants';
import { useAuth } from '@/context/auth-context';
import { UserRole } from '@/types/auth';

const ProfileSetup = () => {

  const { updateUserProfile } = useAuth();

  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'prefer_not_to_say' | ''>('');
  const [role, setRole] = useState<UserRole>('user');
  const [adminCode, setAdminCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Admin access code - in a real app, this should be more secure
  const ADMIN_ACCESS_CODE = 'GRALIX2025';

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

    // If user selected admin role, verify admin code
    if (role === 'admin' && adminCode !== ADMIN_ACCESS_CODE) {
      Alert.alert('Invalid Admin Code', 'Please enter a valid admin access code or select "Regular User"');
      return;
    }

    try {
      setLoading(true);

      await updateUserProfile({
        fullName,
        gender,
        role,
        profileComplete: true
      })

      if (role === 'admin') {
        Alert.alert('Admin Access Granted', 'Welcome! You now have admin privileges.', [
          { text: 'OK', onPress: () => router.replace("/(app)/home") }
        ]);
      } else {
        router.replace("/(app)/home")
      }
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
          <Text style={{ fontSize: TEXT_SIZE * 1.1 }} className="text-white font-rubik-bold">Complete Your Profile</Text>
          <Text style={{ fontSize: TEXT_SIZE * 0.8 }} className="text-white font-rubik mt-2">
            Please provide the following information to complete the sign up process
          </Text>
        </View>

        <View className="mb-4 w-full">
          <Text style={{ fontSize: TEXT_SIZE * 0.8 }} className="text-white font-rubik-medium mb-2">Full Name</Text>
          <LongTextInput text={fullName} handleTextChange={setFullName} width='100%' placeholder='Enter your Full Name' />
        </View>

        <View className='mb-6'>
          <Text style={{ fontSize: TEXT_SIZE * 0.8 }} className="text-white font-rubik-medium mb-2">Gender</Text>
          <View className="flex-row flex-wrap gap-2">
            {['male', 'female', 'prefer_not_to_say'].map((option) => (
              <TouchableOpacity
                key={option}
                className={`px-4 py-2 rounded-lg border ${gender === option ? 'bg-accent border-accent' : 'bg-white border-black dark:border-gray-300'
                  }`}
                onPress={() => setGender(option as any)}>
                <Text
                  className={`${gender === option ? "text-white" : "text-black font-rubik"}`} style={{ fontSize: TEXT_SIZE * 0.9 }}
                >
                  {option === 'prefer_not_to_say' ? 'Prefer not to say' :
                    option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Role Selection */}
        <View className='mb-6'>
          <Text style={{ fontSize: TEXT_SIZE * 0.8 }} className="text-white font-rubik-medium mb-2">Account Type</Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              className={`flex-1 px-4 py-3 rounded-lg border ${role === 'user' ? 'bg-accent border-accent' : 'bg-gray-800 border-gray-600'
                }`}
              onPress={() => setRole('user')}
            >
              <Text className={`${role === 'user' ? "text-white" : "text-gray-300"} font-rubik text-center`}>
                Regular User
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 px-4 py-3 rounded-lg border ${role === 'admin' ? 'bg-accent border-accent' : 'bg-gray-800 border-gray-600'
                }`}
              onPress={() => setRole('admin')}
            >
              <Text className={`${role === 'admin' ? "text-white" : "text-gray-300"} font-rubik text-center`}>
                Admin
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Admin Access Code */}
        {role === 'admin' && (
          <View className="mb-6">
            <Text style={{ fontSize: TEXT_SIZE * 0.8 }} className="text-white font-rubik-medium mb-2">
              Admin Access Code
            </Text>
            <LongTextInput
              text={adminCode}
              handleTextChange={setAdminCode}
              width='100%'
              placeholder='Enter admin access code'
            />
            <Text className="text-gray-400 font-rubik text-xs mt-1">
              Contact your organization administrator for the access code
            </Text>
          </View>
        )}

        <View className='flex items-center justify-center'>
          <ActionButton loading={loading} handlePress={handleCompleteProfile} buttonText='Complete Profile' showArrow width={"100%"} />
        </View>

      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

export default ProfileSetup;