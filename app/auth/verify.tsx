import { View, Text, TouchableWithoutFeedback, Keyboard, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { confirmVerificationCode, sendVerificationCode } from '@/services/auth';
import { formatCountdownTime, formatPhoneNumber } from '@/utils/reusable-functions';
import { ACCENT_COlOR, SCREEN_HEIGHT, TEXT_SIZE } from '@/constants';
import { usePhoneNumber } from '@/context/phone-number-context';
import { useAuth } from '@/context/auth-context';

import LongTextInput from '@/components/long-text-input';
import ActionButton from '@/components/action-button';
import BackNav from '@/components/back-nav';

import type { User } from '@/types/auth';

const COUNTDOWN_DURATION = 120;

const Verify = () => {

  const { verificationId, fetchUserProfile, setVerificationId } = useAuth();
  const { setPhoneNumber, phoneNumber } = usePhoneNumber();

  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION);
  const [resendLoading, setResendLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerifyCode = async () => {

    Keyboard.dismiss()

    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    try {

      setLoading(true);

      const loggedUser = await confirmVerificationCode(verificationId, verificationCode);

      if(loggedUser) {

        const userObj: User = {
          uid: loggedUser.uid,
          phoneNumber: loggedUser.phoneNumber,
        };

        const userProf = await fetchUserProfile(userObj)

        setPhoneNumber("");

        if(!userProf?.profileComplete) {
          router.replace("/auth/profile-setup");
        } else {
          router.replace("/(app)/home")
        }

      } else {
        throw new Error("Something went wrong. Please try again")
      }
    } catch (error) {
      console.error(error)
      Alert.alert('Error', 'Failed to verify code. Please try again.');
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

      setCountdown(COUNTDOWN_DURATION);
      setCanResend(false);

      Alert.alert('Success', 'Verification code sent successfully');

    } catch (error) {
      Alert.alert('Error', 'Failed to resend verification code. Please try again.');
    } finally {
      setResendLoading(false)
    }
  }

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if(countdown > 0 && !canResend) {
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
      if(interval) clearInterval(interval);
    }
  }, [countdown, canResend])

  return (
    <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1, height: SCREEN_HEIGHT }} keyboardShouldPersistTaps="handled" className="bg-background">
      <TouchableWithoutFeedback className='w-full h-full' onPress={() => Keyboard.dismiss()}>
        <SafeAreaView className="w-full h-full bg-background relative">
          <BackNav title="Verify Phone Number" handlePress={() => router.back()} />
          <View className='w-full h-[92%] flex items-center'>

            <View className={`relative mt-6 w-full flex items-center justify-center`}>
              <Text style={{ fontSize: TEXT_SIZE * 0.75}} className={`mb-8 font-rubik-medium max-w-[90%] text-white`}>Enter the 6-digit code sent to your phone</Text>
              <LongTextInput handleTextChange={setVerificationCode} text={verificationCode} max={6} type='code' placeholder='Enter OTP' />
            </View>

            <View className="relative mt-1 w-full flex items-center justify-center">
              <ActionButton loading={loading} handlePress={handleVerifyCode} showArrow buttonText='Verify Code' />
            </View>

            <View className='w-[90%] mt-6 flex items-center'>
              {!canResend ? (
                <Text style={{ fontSize: TEXT_SIZE * 0.75}} className='text-white font-rubik-medium text-center'>
                  Resend Code in {formatCountdownTime(countdown)}
                </Text>
              ) : (
                <TouchableOpacity
                  onPress={handleResendCode}
                  className={`${resendLoading && "opacity-70"}`}
                  disabled={resendLoading}
                >
                  {resendLoading ? (
                    <ActivityIndicator size={"small"} color={ACCENT_COlOR} />
                  ) : (
                    <Text style={{fontSize: TEXT_SIZE * 0.75}} className='text-white font-rubik-semibold'>
                      Haven't Received Code? <Text className='text-accent'>Resend</Text>
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAwareScrollView>
  )
}

export default Verify;