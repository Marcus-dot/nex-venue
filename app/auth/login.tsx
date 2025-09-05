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
import { useTheme } from '@/context/theme-context';
import { sendVerificationCode } from '@/services/auth';
import { formatPhoneNumber } from '@/utils/reusable-functions';

const Login = () => {
  const { phoneNumber, setPhoneNumber } = usePhoneNumber();
  const { setVerificationId } = useAuth();
  const { activeTheme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const [retryAttempts, setRetryAttempts] = useState(0);

  // Theme-aware colors
  const themeColors = {
    background: activeTheme === 'light' ? '#D8D9D4' : '#222551', // Updated to use your blue
    surface: activeTheme === 'light' ? '#ffffff' : '#374151',
    text: activeTheme === 'light' ? '#1f2937' : '#ffffff',
    textSecondary: activeTheme === 'light' ? '#6b7280' : '#d1d5db',
    textTertiary: activeTheme === 'light' ? '#9ca3af' : '#9CA3AF',
    accent: '#e85c29', // Updated from '#ff4306'
    icon: activeTheme === 'light' ? '#374151' : '#ffffff',
    iconSecondary: activeTheme === 'light' ? '#6b7280' : '#9ca3af',
    border: activeTheme === 'light' ? '#e5e7eb' : '#374151',
    error: '#ef4444',
    warning: '#f59e0b',
    warningBackground: activeTheme === 'light' ? '#fef3c7' : '#78350f',
    warningBorder: activeTheme === 'light' ? '#fbbf24' : '#f59e0b',
    warningText: activeTheme === 'light' ? '#92400e' : '#fbbf24',
    retryBackground: activeTheme === 'light' ? '#fef2f2' : '#450a0a',
    retryBorder: activeTheme === 'light' ? '#fecaca' : '#7f1d1d',
    retryText: activeTheme === 'light' ? '#dc2626' : '#f87171',
    supportBackground: activeTheme === 'light' ? '#f0f9ff' : '#0c4a6e',
    supportText: activeTheme === 'light' ? '#0369a1' : '#7dd3fc'
  };

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
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1, height: SCREEN_HEIGHT }}
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: themeColors.background }}
    >
      <TouchableWithoutFeedback className='w-full h-full' onPress={() => Keyboard.dismiss()}>
        <SafeAreaView className="w-full h-full relative" style={{ backgroundColor: themeColors.background }}>

          {/* Network Status */}
          {!isConnected && (
            <View
              className="px-4 py-3 flex-row items-center"
              style={{ backgroundColor: themeColors.error }}
            >
              <Feather name="wifi-off" size={16} color="white" />
              <Text className="text-white font-rubik-medium text-sm ml-2">No internet connection</Text>
            </View>
          )}

          <BackNav
            title="Continue with Phone Number"
            handlePress={() => router.back()}
            backgroundColor={themeColors.background}
            textColor={themeColors.text}
            iconColor={themeColors.icon}
          />

          <View className="w-full h-[92%] flex items-center">
            {/* Enhanced Header */}
            <View className="items-center mb-8 mt-6">
              <View
                className="w-20 h-20 rounded-full items-center justify-center mb-6"
                style={{ backgroundColor: themeColors.accent }}
              >
                <Feather name="phone" size={32} color="white" />
              </View>
              <Text
                className="font-rubik-bold text-2xl mb-2 text-center"
                style={{ color: themeColors.text }}
              >
                Enter Your Phone Number
              </Text>
              <Text
                style={{ fontSize: TEXT_SIZE * 0.75, color: themeColors.textSecondary }}
                className="font-rubik text-center leading-6 max-w-[90%]"
              >
                We'll send you a verification code to confirm your phone number and get you started.
              </Text>
            </View>

            {/* Phone Input with Error Display */}
            <View className="w-full flex items-center">
              <LongTextInput
                handleTextChange={(text) => {
                  setPhoneNumber(text);
                  if (phoneError) setPhoneError(''); // Clear error on typing
                }}
                text={phoneNumber}
                type="telephoneNumber"
                placeholder="+260 77..."
                error={!!phoneError}
              />

              {phoneError ? (
                <View className="flex-row items-center mt-2 px-6">
                  <Feather name="alert-circle" size={16} color={themeColors.error} />
                  <Text
                    className="font-rubik text-sm ml-2"
                    style={{ color: themeColors.error }}
                  >
                    {phoneError}
                  </Text>
                </View>
              ) : null}

              <View className="px-6 mt-2">
                <Text
                  className="font-rubik text-xs"
                  style={{ color: themeColors.textTertiary }}
                >
                  Accepted formats: +260771234567, 0771234567, or 260771234567
                </Text>
              </View>
            </View>

            {/* Retry Attempts Info */}
            {retryAttempts > 0 && (
              <View
                className="mx-6 p-3 rounded-lg mt-4 border"
                style={{
                  backgroundColor: themeColors.retryBackground,
                  borderColor: themeColors.retryBorder
                }}
              >
                <View className="flex-row items-center">
                  <Feather name="alert-triangle" size={16} color={themeColors.retryText} />
                  <Text
                    className="font-rubik-medium text-sm ml-2"
                    style={{ color: themeColors.retryText }}
                  >
                    Attempt {retryAttempts}/3
                  </Text>
                </View>
              </View>
            )}

            <View className="relative mt-1 w-full flex items-center justify-center">
              <ActionButton
                loading={loading}
                showArrow
                handlePress={handleSendCode}
                buttonText="Send Verification Code"
              />
            </View>

            <TouchableOpacity
              onPress={() => {
                router.push("/auth/terms")
              }}
              className="w-[90%] mt-5 flex-row flex items-center justify-center flex-wrap"
            >
              <Ionicons name="checkmark-circle-outline" size={ICON_SIZE * 0.5} color={ACCENT_COlOR} />
              <Text
                style={{ fontSize: TEXT_SIZE * 0.65, color: themeColors.textSecondary }}
                className="font-rubik-medium"
              >
                By continuing, you agree to our
              </Text>
              <TouchableOpacity onPress={() => {
                router.push({
                  pathname: "/auth/terms",
                  params: {
                    toggle: "tncs"
                  }
                });
              }}>
                <Text
                  style={{ fontSize: TEXT_SIZE * 0.65, color: themeColors.accent }}
                  className="font-rubik-semibold"
                >
                  Terms of Service
                </Text>
              </TouchableOpacity>
              <Text
                style={{ fontSize: TEXT_SIZE * 0.65, color: themeColors.textSecondary }}
                className="font-rubik-medium"
              >
                and
              </Text>
              <TouchableOpacity onPress={() => {
                router.push({
                  pathname: "/auth/terms",
                  params: {
                    toggle: "pps"
                  }
                });
              }}>
                <Text
                  style={{ fontSize: TEXT_SIZE * 0.65, color: themeColors.accent }}
                  className="font-rubik-semibold"
                >
                  Privacy Policy
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Support Contact */}
            <View className="items-center mt-8">
              <Text
                className="font-rubik text-xs mb-2"
                style={{ color: themeColors.textTertiary }}
              >
                Having trouble?
              </Text>
              <TouchableOpacity onPress={() => {
                Alert.alert(
                  'Contact Support',
                  'Need help? Reach out to our support team:\n\nEmail: support@nexvenue.com\nPhone: +260 123 456 789',
                  [{ text: 'OK' }]
                );
              }}>
                <Text
                  className="font-rubik-medium text-sm"
                  style={{ color: themeColors.accent }}
                >
                  Contact Support
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAwareScrollView>
  )
}

export default Login;