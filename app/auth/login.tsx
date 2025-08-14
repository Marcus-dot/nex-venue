import { View, Text, TouchableWithoutFeedback, Keyboard, TouchableOpacity, Alert } from 'react-native'
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import React, { useState } from 'react'
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { ACCENT_COlOR, ICON_SIZE, SCREEN_HEIGHT, TEXT_SIZE } from "@/constants";
import { sendVerificationCode } from '@/services/auth';
import { formatPhoneNumber } from '@/utils/reusable-functions';
import { usePhoneNumber } from "@/context/phone-number-context";
import { useAuth } from '@/context/auth-context';
import LongTextInput from "@/components/long-text-input";
import ActionButton from "@/components/action-button";
import BackNav from "@/components/back-nav";
import { getAuth } from '@react-native-firebase/auth';

const Login = () => {

  const { phoneNumber, setPhoneNumber } = usePhoneNumber();
  const { setVerificationId } = useAuth();

  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    
    Keyboard.dismiss();

    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    const phoneRegex = /^(\+260|0|260)(9|7)[567][0-9]{7}$/;

    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert('Error', 'Invalid Phone Number Format, Accepts (+260..)');
      return;
    }

    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

    try {

      setLoading(true)

      console.log("reached here")

      console.log(formattedPhoneNumber);

      const confirmation = await sendVerificationCode(formattedPhoneNumber);

      console.log("also reached here")

      setVerificationId(confirmation);

      router.push("/auth/verify");

    } catch (error) {
      Alert.alert('Error', 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1, height: SCREEN_HEIGHT }} keyboardShouldPersistTaps="handled" className="bg-background">
      <TouchableWithoutFeedback className='w-full h-full' onPress={() => Keyboard.dismiss()}>
        <SafeAreaView className="w-full h-full bg-background relative">
          <BackNav title="Continue with Phone Number" handlePress={() => router.back()} />
          <View className="w-full h-[92%] flex items-center">
            <View className={`relative mt-6 w-full flex items-center justify-center`}>
              <Text style={{ fontSize: TEXT_SIZE * 0.75}} className={`mb-8 font-rubik-medium max-w-[90%] text-white`}>Enter your Phone Number and we will send you a code</Text>
              <LongTextInput handleTextChange={setPhoneNumber} text={phoneNumber} type="telephoneNumber" placeholder="+26077.." />
            </View>

            <View className="relative mt-1 w-full flex items-center justify-center">
              <ActionButton loading={loading} showArrow handlePress={handleSendCode} buttonText="Send Verication Code" />
            </View>

            <TouchableOpacity onPress={() => {
              router.push("/auth/terms")
            }} className="w-[90%] mt-5 flex-row flex items-center justify-center flex-wrap">
              <Ionicons name="checkmark-circle-outline" size={ICON_SIZE * 0.5} color={ACCENT_COlOR} />
              <Text style={{fontSize: TEXT_SIZE * 0.65}} className={`font-rubik-medium text-white`}> By signing in, you agree to the </Text> 
              <TouchableOpacity onPress={() => {
                  router.push({
                      pathname: "/auth/terms",
                      params: {
                        toggle: "tncs"
                      }
                  });
              }}>
                  <Text style={{fontSize: TEXT_SIZE * 0.65}} className="text-accent font-rubik-semibold">Terms of Service</Text>
              </TouchableOpacity>
              <Text style={{fontSize: TEXT_SIZE * 0.65}} className={`text-white font-rubik-medium`}> and </Text> 
              <TouchableOpacity onPress={() => {
                  router.push({
                      pathname: "/auth/terms",
                      params: {
                        toggle: "pps"
                      }
                  });
              }}>
                  <Text style={{fontSize: TEXT_SIZE * 0.65}} className="text-accent font-rubik-semibold">Privacy Policy</Text>
              </TouchableOpacity>
            </TouchableOpacity>

          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAwareScrollView>
  )
}

export default Login;