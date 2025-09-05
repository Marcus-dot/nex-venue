import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ACCENT_COlOR, SCREEN_HEIGHT, TEXT_SIZE } from '@/constants';
import { useAuth } from '@/context/auth-context';
import { usePhoneNumber } from '@/context/phone-number-context';
import { useTheme } from '@/context/theme-context';
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
  const { activeTheme } = useTheme();

  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION);
  const [resendLoading, setResendLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [verificationAttempts, setVerificationAttempts] = useState(0);

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
    success: '#10b981',
    infoBackground: activeTheme === 'light' ? '#dbeafe' : '#1e3a8a',
    infoBorder: activeTheme === 'light' ? '#93c5fd' : '#3b82f6',
    infoText: activeTheme === 'light' ? '#1e40af' : '#60a5fa',
    attemptBackground: activeTheme === 'light' ? '#dbeafe' : '#1e3a8a',
    attemptBorder: activeTheme === 'light' ? '#60a5fa' : '#3b82f6',
    attemptText: activeTheme === 'light' ? '#1e40af' : '#60a5fa',
    resendBackground: activeTheme === 'light' ? '#f0f9ff' : '#0c4a6e',
    resendBorder: activeTheme === 'light' ? '#0ea5e9' : '#0284c7',
    resendText: activeTheme === 'light' ? '#0369a1' : '#7dd3fc',
    supportText: activeTheme === 'light' ? '#059669' : '#34d399'
  };

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
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1, height: SCREEN_HEIGHT }}
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: themeColors.background }}
    >
      <TouchableWithoutFeedback className='w-full h-full' onPress={() => Keyboard.dismiss()}>
        <SafeAreaView className="w-full h-full relative" style={{ backgroundColor: themeColors.background }}>
          <BackNav
            title="Verify Phone Number"
            handlePress={() => router.back()}
            backgroundColor={themeColors.background}
            textColor={themeColors.text}
            iconColor={themeColors.icon}
          />
          <View className='w-full h-[92%] flex items-center'>

            {/* Enhanced Header */}
            <View className="items-center mt-6">
              <View
                className="w-20 h-20 rounded-full items-center justify-center mb-6"
                style={{ backgroundColor: themeColors.accent }}
              >
                <Feather name="shield" size={32} color="white" />
              </View>
              <Text
                className="font-rubik-bold text-2xl mb-2 text-center"
                style={{ color: themeColors.text }}
              >
                Enter Verification Code
              </Text>
              <Text
                style={{ fontSize: TEXT_SIZE * 0.75, color: themeColors.textSecondary }}
                className="font-rubik text-center leading-6 max-w-[90%]"
              >
                We've sent a 6-digit verification code to {phoneNumber}
              </Text>
            </View>

            {/* Code Input with Error Display */}
            <View className="w-full flex items-center mt-4">
              <LongTextInput
                handleTextChange={(text) => {
                  setVerificationCode(text);
                  if (codeError) setCodeError('');
                }}
                text={verificationCode}
                max={6}
                type='code'
                placeholder='Enter 6-digit code'
                error={!!codeError}
              />

              {codeError ? (
                <View className="flex-row items-center mt-2 px-6">
                  <Feather name="alert-circle" size={16} color={themeColors.error} />
                  <Text
                    className="font-rubik text-sm ml-2"
                    style={{ color: themeColors.error }}
                  >
                    {codeError}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Attempt Info */}
            {verificationAttempts > 0 && (
              <View
                className="mx-6 p-3 rounded-lg mt-4 border"
                style={{
                  backgroundColor: themeColors.attemptBackground,
                  borderColor: themeColors.attemptBorder
                }}
              >
                <View className="flex-row items-center">
                  <Feather name="info" size={16} color={themeColors.attemptText} />
                  <Text
                    className="font-rubik-medium text-sm ml-2"
                    style={{ color: themeColors.attemptText }}
                  >
                    Attempt {verificationAttempts}/{MAX_VERIFICATION_ATTEMPTS}
                  </Text>
                </View>
              </View>
            )}

            <View className="relative mt-1 w-full flex items-center justify-center">
              <ActionButton
                loading={loading}
                handlePress={handleVerifyCode}
                showArrow
                buttonText='Verify Code'
              />
            </View>

            {/* Enhanced Resend Section */}
            <View className='w-[90%] mt-6 flex items-center'>
              {!canResend ? (
                <View className="items-center">
                  <View className="flex-row items-center mb-2">
                    <Feather name="clock" size={16} color={themeColors.iconSecondary} />
                    <Text
                      style={{ fontSize: TEXT_SIZE * 0.75, color: themeColors.textSecondary }}
                      className='font-rubik-medium ml-2'
                    >
                      Request new code in {formatCountdownTime(countdown)}
                    </Text>
                  </View>
                  <Text
                    className="font-rubik text-xs text-center"
                    style={{ color: themeColors.textTertiary }}
                  >
                    Didn't receive a code? Check your SMS or wait for the timer.
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleResendCode}
                  className={`px-6 py-3 rounded-xl border-2 ${resendLoading && "opacity-70"}`}
                  style={{
                    backgroundColor: themeColors.resendBackground,
                    borderColor: themeColors.resendBorder
                  }}
                  disabled={resendLoading}
                >
                  <View className="flex-row items-center">
                    {resendLoading ? (
                      <ActivityIndicator size={"small"} color={ACCENT_COlOR} />
                    ) : (
                      <Feather name="refresh-cw" size={16} color={themeColors.resendText} />
                    )}
                    <Text
                      className="font-rubik-medium ml-2"
                      style={{ color: themeColors.resendText }}
                    >
                      {resendLoading ? 'Sending...' : 'Resend Code'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Support Contact */}
            <View className="items-center mt-8">
              <Text
                className="font-rubik text-xs mb-2"
                style={{ color: themeColors.textTertiary }}
              >
                Still having trouble?
              </Text>
              <TouchableOpacity onPress={() => {
                Alert.alert(
                  'Contact Support',
                  'Need help? Our support team is here to help:\n\nEmail: support@nexvenue.com\nPhone: +260 123 456 789',
                  [{ text: 'OK' }]
                );
              }}>
                <Text
                  className="font-rubik-medium text-sm"
                  style={{ color: themeColors.supportText }}
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

export default Verify;