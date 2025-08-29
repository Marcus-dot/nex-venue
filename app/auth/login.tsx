import { Feather, Ionicons } from "@expo/vector-icons";
import NetInfo from '@react-native-community/netinfo';
import { router } from "expo-router";
import React, { useEffect, useState } from 'react';
import { Alert, Keyboard, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

import ActionButton from "@/components/action-button";
import BackNav from "@/components/back-nav";
import LongTextInput from "@/components/long-text-input";
import { ACCENT_COlOR, ICON_SIZE, SCREEN_HEIGHT, TEXT_SIZE } from "@/constants";
import { useAuth } from '@/context/auth-context';
import { usePhoneNumber } from "@/context/phone-number-context";
import { sendVerificationCode } from '@/services/auth';
import { formatPhoneNumber } from '@/utils/reusable-functions';

const Login = () => {

  const { phoneNumber, setPhoneNumber } = usePhoneNumber();
  const { setVerificationId } = useAuth();

  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const [retryAttempts, setRetryAttempts] = useState(0);

  // Network monitoring
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true);
    });

    return () => unsubscribe();
  }, []);

  const validatePhone = (phone: string): boolean => {
    setPhoneError('');

    if (!phone.trim()) {
      setPhoneError('Please enter your phone number');
      return false;
    }

    const phoneRegex = /^(\+260|0|260)(9|7)[567][0-9]{7}$/;
    if (!phoneRegex.test(phone)) {
      setPhoneError('Please enter a valid Zambian phone number (+260...)');
      return false;
    }

    return true;
  };

  const handleSendCode = async () => {

    Keyboard.dismiss();

    if (!validatePhone(phoneNumber)) {
      return;
    }

    if (!isConnected) {
      Alert.alert(
        'No Internet Connection',
        'Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

    try {

      setLoading(true)
      setRetryAttempts(prev => prev + 1);

      console.log("reached here")
      console.log(formattedPhoneNumber);

      const confirmation = await sendVerificationCode(formattedPhoneNumber);

      console.log("also reached here")

      setVerificationId(confirmation);
      setRetryAttempts(0); // Reset on success

      router.push("/auth/verify");

    } catch (error: any) {
      console.error('Send code error:', error);

      let errorMessage = 'Failed to send verification code. Please try again.';

      if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please wait before trying again.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      }

      Alert.alert('Verification Failed', errorMessage);
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1, height: SCREEN_HEIGHT }} keyboardShouldPersistTaps="handled" className="bg-background">
      <TouchableWithoutFeedback className='w-full h-full' onPress={() => Keyboard.dismiss()}>
        <SafeAreaView className="w-full h-full bg-background relative">

          {/* Network Status */}
          {!isConnected && (
            <View className="bg-red-600 px-4 py-3 flex-row items-center">
              <Feather name="wifi-off" size={16} color="white" />
              <Text className="text-white font-rubik-medium text-sm ml-2">No internet connection</Text>
            </View>
          )}

          <BackNav title="Continue with Phone Number" handlePress={() => router.back()} />

          <View className="w-full h-[92%] flex items-center">
            {/* Enhanced Header */}
            <View className="items-center mb-8 mt-6">
              <View className="w-20 h-20 bg-accent rounded-full items-center justify-center mb-6">
                <Feather name="phone" size={32} color="white" />
              </View>
              <Text className="text-white font-rubik-bold text-2xl mb-2 text-center">
                Enter Your Phone Number
              </Text>
              <Text style={{ fontSize: TEXT_SIZE * 0.75 }} className="text-gray-400 font-rubik text-center leading-6 max-w-[90%]">
                We'll send you a verification code to confirm your phone number and get you started.
              </Text>
            </View>

            {/* Phone Input with Error Display */}
            <View className="w-full flex items-center">
              <LongTextInput handleTextChange={(text) => {
                setPhoneNumber(text);
                if (phoneError) setPhoneError(''); // Clear error on typing
              }} text={phoneNumber} type="telephoneNumber" placeholder="+260 77..." />

              {phoneError ? (
                <View className="flex-row items-center mt-2 px-6">
                  <Feather name="alert-circle" size={16} color="#ef4444" />
                  <Text className="text-red-400 font-rubik text-sm ml-2">{phoneError}</Text>
                </View>
              ) : null}

              <View className="px-6 mt-2">
                <Text className="text-gray-500 font-rubik text-xs">
                  Accepted formats: +260771234567, 0771234567, or 260771234567
                </Text>
              </View>
            </View>

            {/* Retry Attempts Info */}
            {retryAttempts > 0 && (
              <View className="bg-yellow-900/20 border border-yellow-600 mx-6 p-3 rounded-lg mt-4">
                <View className="flex-row items-center">
                  <Feather name="alert-triangle" size={16} color="#fbbf24" />
                  <Text className="text-yellow-400 font-rubik-medium text-sm ml-2">
                    Attempt {retryAttempts}/3
                  </Text>
                </View>
              </View>
            )}

            <View className="relative mt-1 w-full flex items-center justify-center">
              <ActionButton loading={loading} showArrow handlePress={handleSendCode} buttonText="Send Verification Code" />
            </View>

            <TouchableOpacity onPress={() => {
              router.push("/auth/terms")
            }} className="w-[90%] mt-5 flex-row flex items-center justify-center flex-wrap">
              <Ionicons name="checkmark-circle-outline" size={ICON_SIZE * 0.5} color={ACCENT_COlOR} />
              <Text style={{ fontSize: TEXT_SIZE * 0.65 }} className={`font-rubik-medium text-gray-300`}> By continuing, you agree to our </Text>
              <TouchableOpacity onPress={() => {
                router.push({
                  pathname: "/auth/terms",
                  params: {
                    toggle: "tncs"
                  }
                });
              }}>
                <Text style={{ fontSize: TEXT_SIZE * 0.65 }} className="text-accent font-rubik-semibold">Terms of Service</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: TEXT_SIZE * 0.65 }} className={`text-gray-300 font-rubik-medium`}> and </Text>
              <TouchableOpacity onPress={() => {
                router.push({
                  pathname: "/auth/terms",
                  params: {
                    toggle: "pps"
                  }
                });
              }}>
                <Text style={{ fontSize: TEXT_SIZE * 0.65 }} className="text-accent font-rubik-semibold">Privacy Policy</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Support Contact */}
            <View className="items-center mt-8">
              <Text className="text-gray-500 font-rubik text-xs mb-2">Having trouble?</Text>
              <TouchableOpacity onPress={() => {
                Alert.alert(
                  'Contact Support',
                  'Need help? Reach out to our support team:\n\nEmail: support@nexvenue.com\nPhone: +260 123 456 789',
                  [{ text: 'OK' }]
                );
              }}>
                <Text className="text-accent font-rubik-medium text-sm">Contact Support</Text>
              </TouchableOpacity>
            </View>

          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAwareScrollView>
  )
}

export default Login;