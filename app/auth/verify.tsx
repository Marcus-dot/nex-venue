import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ACCENT_COlOR, SCREEN_HEIGHT, TEXT_SIZE } from '@/constants';
import { useAuth } from '@/context/auth-context';
import { usePhoneNumber } from '@/context/phone-number-context';
import { confirmVerificationCode, sendVerificationCode } from '@/services/auth';
import { formatCountdownTime, formatPhoneNumber } from '@/utils/reusable-functions';

import ActionButton from '@/components/action-button';
import BackNav from '@/components/back-nav';
import LongTextInput from '@/components/long-text-input';

import type { User } from '@/types/auth';

const COUNTDOWN_DURATION = 120;
const MAX_VERIFICATION_ATTEMPTS = 5;

const Verify = () => {

  const { verificationId, fetchUserProfile, setVerificationId } = useAuth();
  const { setPhoneNumber, phoneNumber } = usePhoneNumber();

  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION);
  const [resendLoading, setResendLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [verificationAttempts, setVerificationAttempts] = useState(0);

  const validateCode = (code: string): boolean => {
    setCodeError('');

    if (!code.trim()) {
      setCodeError('Please enter the verification code');
      return false;
    }

    if (code.length !== 6) {
      setCodeError('Verification code must be 6 digits');
      return false;
    }

    if (!/^\d{6}$/.test(code)) {
      setCodeError('Code must contain only numbers');
      return false;
    }

    return true;
  };

  const handleVerifyCode = async () => {

    Keyboard.dismiss()

    if (!validateCode(verificationCode)) {
      return;
    }

    if (verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
      Alert.alert(
        'Too Many Attempts',
        'Please request a new verification code.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {

      setLoading(true);
      setVerificationAttempts(prev => prev + 1);

      const loggedUser = await confirmVerificationCode(verificationId, verificationCode);

      if (loggedUser) {

        const userObj: User = {
          uid: loggedUser.uid,
          phoneNumber: loggedUser.phoneNumber,
        };

        const userProf = await fetchUserProfile(userObj)

        setPhoneNumber("");

        if (!userProf?.profileComplete) {
          router.replace("/auth/profile-setup");
        } else {
          router.replace("/(app)/home")
        }

      } else {
        throw new Error("Something went wrong. Please try again")
      }
    } catch (error: any) {
      console.error(error)

      let errorMessage = 'Failed to verify code. Please try again.';

      if (error.code === 'auth/invalid-verification-code') {
        setCodeError('Invalid verification code');
        errorMessage = 'The verification code is incorrect. Please check and try again.';
      } else if (error.code === 'auth/session-expired') {
        setCodeError('Code expired');
        errorMessage = 'Your verification code has expired. Please request a new one.';
      }

      Alert.alert('Verification Failed', errorMessage);
    } finally {
      setLoading(false);
    }

  }

  const handleResendCode = async () => {
    if (!canResend || resendLoading) return;

    try {

      setResendLoading(true)

      const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
      const confirmation = await sendVerificationCode(formattedPhoneNumber);

      setVerificationId(confirmation);

      setVerificationCode('');
      setCodeError('');
      setVerificationAttempts(0);
      setCountdown(COUNTDOWN_DURATION);
      setCanResend(false);

      Alert.alert('New Code Sent', 'A new verification code has been sent to your phone.');

    } catch (error) {
      Alert.alert('Error', 'Failed to resend verification code. Please try again.');
    } finally {
      setResendLoading(false)
    }
  }

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (countdown > 0 && !canResend) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    }
  }, [countdown, canResend])

  // Auto-verify when 6 digits entered (keeping your keyboard behavior)
  useEffect(() => {
    if (verificationCode.length === 6) {
      handleVerifyCode();
    }
    if (codeError && verificationCode.length > 0) {
      setCodeError('');
    }
  }, [verificationCode]);

  return (
    <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1, height: SCREEN_HEIGHT }} keyboardShouldPersistTaps="handled" className="bg-background">
      <TouchableWithoutFeedback className='w-full h-full' onPress={() => Keyboard.dismiss()}>
        <SafeAreaView className="w-full h-full bg-background relative">
          <BackNav title="Verify Phone Number" handlePress={() => router.back()} />
          <View className='w-full h-[92%] flex items-center'>

            {/* Enhanced Header */}
            <View className="items-center mt-6">
              <View className="w-20 h-20 bg-accent rounded-full items-center justify-center mb-6">
                <Feather name="shield" size={32} color="white" />
              </View>
              <Text className="text-white font-rubik-bold text-2xl mb-2 text-center">
                Enter Verification Code
              </Text>
              <Text style={{ fontSize: TEXT_SIZE * 0.75 }} className="text-gray-400 font-rubik text-center leading-6 max-w-[90%]">
                We've sent a 6-digit verification code to {phoneNumber}
              </Text>
            </View>

            {/* Code Input with Error Display */}
            <View className="w-full flex items-center mt-4">
              <LongTextInput handleTextChange={(text) => {
                setVerificationCode(text);
                if (codeError) setCodeError('');
              }} text={verificationCode} max={6} type='code' placeholder='Enter 6-digit code' />

              {codeError ? (
                <View className="flex-row items-center mt-2 px-6">
                  <Feather name="alert-circle" size={16} color="#ef4444" />
                  <Text className="text-red-400 font-rubik text-sm ml-2">{codeError}</Text>
                </View>
              ) : null}
            </View>

            {/* Attempt Info */}
            {verificationAttempts > 0 && (
              <View className="bg-blue-900/20 border border-blue-600 mx-6 p-3 rounded-lg mt-4">
                <View className="flex-row items-center">
                  <Feather name="info" size={16} color="#60a5fa" />
                  <Text className="text-blue-400 font-rubik-medium text-sm ml-2">
                    Attempt {verificationAttempts}/{MAX_VERIFICATION_ATTEMPTS}
                  </Text>
                </View>
              </View>
            )}

            <View className="relative mt-1 w-full flex items-center justify-center">
              <ActionButton loading={loading} handlePress={handleVerifyCode} showArrow buttonText='Verify Code' />
            </View>

            {/* Enhanced Resend Section */}
            <View className='w-[90%] mt-6 flex items-center'>
              {!canResend ? (
                <View className="items-center">
                  <View className="flex-row items-center mb-2">
                    <Feather name="clock" size={16} color="#9CA3AF" />
                    <Text style={{ fontSize: TEXT_SIZE * 0.75 }} className='text-gray-400 font-rubik-medium ml-2'>
                      Request new code in {formatCountdownTime(countdown)}
                    </Text>
                  </View>
                  <Text className="text-gray-500 font-rubik text-xs text-center">
                    Didn't receive a code? Check your SMS or wait for the timer.
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleResendCode}
                  className={`px-6 py-3 rounded-xl border-2 border-accent bg-accent/10 ${resendLoading && "opacity-70"}`}
                  disabled={resendLoading}
                >
                  <View className="flex-row items-center">
                    {resendLoading ? (
                      <ActivityIndicator size={"small"} color={ACCENT_COlOR} />
                    ) : (
                      <Feather name="refresh-cw" size={16} color={ACCENT_COlOR} />
                    )}
                    <Text className="text-accent font-rubik-medium ml-2">
                      {resendLoading ? 'Sending...' : 'Resend Code'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Support Contact */}
            <View className="items-center mt-8">
              <Text className="text-gray-500 font-rubik text-xs mb-2">Still having trouble?</Text>
              <TouchableOpacity onPress={() => {
                Alert.alert(
                  'Contact Support',
                  'Need help? Our support team is here to help:\n\nEmail: support@nexvenue.com\nPhone: +260 123 456 789',
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

export default Verify;