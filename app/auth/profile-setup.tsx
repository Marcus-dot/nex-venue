import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ActionButton from '@/components/action-button';
import LongTextInput from '@/components/long-text-input';
import { TEXT_SIZE } from '@/constants';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { UserRole } from '@/types/auth';

const ProfileSetup = () => {
  const { updateUserProfile } = useAuth();
  const { activeTheme } = useTheme();

  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'prefer_not_to_say' | ''>('');
  const [role, setRole] = useState<UserRole>('user');
  const [adminCode, setAdminCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [saveAttempts, setSaveAttempts] = useState(0);

  // Theme-aware colors
  const themeColors = {
    background: activeTheme === 'light' ? '#D8D9D4' : '#161616',
    surface: activeTheme === 'light' ? '#ffffff' : '#374151',
    surfaceSecondary: activeTheme === 'light' ? '#f3f4f6' : '#1f2937',
    text: activeTheme === 'light' ? '#1f2937' : '#ffffff',
    textSecondary: activeTheme === 'light' ? '#6b7280' : '#d1d5db',
    textTertiary: activeTheme === 'light' ? '#9ca3af' : '#9CA3AF',
    accent: '#ff4306',
    icon: activeTheme === 'light' ? '#374151' : '#ffffff',
    border: activeTheme === 'light' ? '#e5e7eb' : '#374151',
    input: activeTheme === 'light' ? '#f9fafb' : '#374151',
    inputBorder: activeTheme === 'light' ? '#d1d5db' : '#6b7280',
    inputText: activeTheme === 'light' ? '#1f2937' : '#ffffff',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    adminBackground: activeTheme === 'light' ? '#fef3c7' : '#78350f',
    adminBorder: activeTheme === 'light' ? '#fbbf24' : '#f59e0b',
    adminText: activeTheme === 'light' ? '#92400e' : '#fbbf24',
    adminIcon: activeTheme === 'light' ? '#f59e0b' : '#fbbf24',
    attemptBackground: activeTheme === 'light' ? '#fed7aa' : '#9a3412',
    attemptBorder: activeTheme === 'light' ? '#fb923c' : '#ea580c',
    attemptText: activeTheme === 'light' ? '#c2410c' : '#fb923c',
    genderSelected: activeTheme === 'light' ? '#dbeafe' : '#1e3a8a',
    genderSelectedBorder: activeTheme === 'light' ? '#3b82f6' : '#2563eb',
    genderSelectedText: activeTheme === 'light' ? '#1e40af' : '#60a5fa',
    roleSelected: activeTheme === 'light' ? '#dcfce7' : '#14532d',
    roleSelectedBorder: activeTheme === 'light' ? '#22c55e' : '#16a34a',
    roleSelectedText: activeTheme === 'light' ? '#15803d' : '#4ade80'
  };

  // Admin access code - in a real app, this should be more secure
  const ADMIN_ACCESS_CODE = 'GRALIX2025';
  const MAX_SAVE_ATTEMPTS = 3;

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    // Name validation
    if (!fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      errors.fullName = 'Name must be at least 2 characters';
    } else if (fullName.trim().length > 50) {
      errors.fullName = 'Name must be less than 50 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(fullName.trim())) {
      errors.fullName = 'Name can only contain letters, spaces, hyphens and apostrophes';
    }

    // Gender validation
    if (!gender) {
      errors.gender = 'Please select your gender';
    }

    // Admin code validation
    if (role === 'admin') {
      if (!adminCode.trim()) {
        errors.adminCode = 'Admin code is required for administrator access';
      } else if (adminCode !== ADMIN_ACCESS_CODE) {
        errors.adminCode = 'Invalid admin access code';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCompleteProfile = async () => {
    Keyboard.dismiss();

    if (!validateForm()) {
      Alert.alert(
        'Incomplete Information',
        'Please fix the highlighted errors and try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (saveAttempts >= MAX_SAVE_ATTEMPTS) {
      Alert.alert(
        'Too Many Attempts',
        'Multiple save attempts failed. Please restart the app or contact support.',
        [
          { text: 'Contact Support', onPress: showSupportInfo },
          { text: 'Try Again', onPress: () => setSaveAttempts(0) }
        ]
      );
      return;
    }

    try {
      setLoading(true);
      setSaveAttempts(prev => prev + 1);

      await updateUserProfile({
        fullName: fullName.trim(),
        gender: gender || undefined, // Convert empty string to undefined
        role,
        profileComplete: true
      });

      // Clear attempts on success
      setSaveAttempts(0);

      if (role === 'admin') {
        Alert.alert(
          'Admin Access Granted! 🛡️',
          'Welcome to NexVenue! You now have administrator privileges to create and manage event agendas.',
          [{ text: 'Get Started', onPress: () => router.replace("/(app)/home") }]
        );
      } else {
        Alert.alert(
          'Profile Complete! 🎉',
          'Welcome to NexVenue! You can now discover events and connect with your community.',
          [{ text: 'Get Started', onPress: () => router.replace("/(app)/home") }]
        );
      }
    } catch (error: any) {
      console.error('Profile setup error:', error);

      let errorTitle = 'Profile Setup Failed';
      let errorMessage = 'Failed to save your profile information. Please try again.';
      let showRetry = true;

      if (error.code) {
        switch (error.code) {
          case 'auth/network-request-failed':
            errorTitle = 'Connection Error';
            errorMessage = 'Network error occurred. Please check your connection and try again.';
            break;
          case 'permission-denied':
          case 'auth/insufficient-permission':
            errorTitle = 'Permission Error';
            errorMessage = 'Unable to save profile due to permission issues. Please try again or contact support.';
            break;
          case 'unavailable':
            errorTitle = 'Service Unavailable';
            errorMessage = 'Service is temporarily unavailable. Please try again in a moment.';
            break;
          default:
            if (saveAttempts >= MAX_SAVE_ATTEMPTS - 1) {
              errorTitle = 'Multiple Save Failures';
              errorMessage = 'Unable to save profile after multiple attempts. Please contact support for assistance.';
              showRetry = false;
            }
            break;
        }
      }

      const alertButtons: Array<{ text: string; onPress?: () => void }> = [];

      if (!showRetry || saveAttempts >= MAX_SAVE_ATTEMPTS - 1) {
        alertButtons.push({ text: 'Contact Support', onPress: showSupportInfo });
      }

      alertButtons.push({ text: 'OK' });

      if (showRetry && saveAttempts < MAX_SAVE_ATTEMPTS - 1) {
        alertButtons.unshift({ text: 'Retry', onPress: handleCompleteProfile });
      }

      Alert.alert(errorTitle, errorMessage, alertButtons);
    } finally {
      setLoading(false);
    }
  };

  const showSupportInfo = () => {
    Alert.alert(
      'Contact Support',
      'Need assistance with your profile setup?\n\nEmail: support@nexvenue.com\nPhone: +260 123 456 789\n\nPlease include details about the error you encountered.',
      [{ text: 'OK' }]
    );
  };

  const FormInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    error,
    required = false,
    maxLength = 50
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    error?: string;
    required?: boolean;
    maxLength?: number;
  }) => (
    <View className="mb-4">
      <View className="flex-row items-center mb-2">
        <Text
          style={{ fontSize: TEXT_SIZE * 0.9, color: themeColors.text }}
          className="font-rubik-medium"
        >
          {label}
        </Text>
        {required && <Text style={{ color: themeColors.accent }} className="ml-1">*</Text>}
      </View>
      <LongTextInput
        text={value}
        handleTextChange={(text) => {
          onChangeText(text);
          // Clear error when user starts typing
          if (error) {
            const newErrors = { ...formErrors };
            const errorKey = label.toLowerCase().replace(/\s+/g, '');
            delete newErrors[errorKey];
            setFormErrors(newErrors);
          }
        }}
        width='100%'
        placeholder={placeholder}
        max={maxLength}
        error={!!error}
      />
      {error && (
        <View className="flex-row items-center mt-2">
          <Feather name="alert-circle" size={14} color={themeColors.error} />
          <Text
            className="font-rubik text-sm ml-1"
            style={{ color: themeColors.error }}
          >
            {error}
          </Text>
        </View>
      )}
      {maxLength && value.length > maxLength * 0.8 && (
        <Text
          className="font-rubik text-xs mt-1"
          style={{ color: themeColors.textTertiary }}
        >
          {value.length}/{maxLength} characters
        </Text>
      )}
    </View>
  );

  const GenderSelector = () => (
    <View className="mb-6">
      <View className="flex-row items-center mb-3">
        <Text
          style={{ fontSize: TEXT_SIZE * 0.9, color: themeColors.text }}
          className="font-rubik-medium"
        >
          Gender
        </Text>
        <Text style={{ color: themeColors.accent }} className="ml-1">*</Text>
      </View>
      <View className="flex-row flex-wrap gap-3">
        {[
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'prefer_not_to_say', label: 'Prefer not to say' }
        ].map((option) => (
          <TouchableOpacity
            key={option.value}
            className={`px-4 py-3 rounded-xl border-2 min-w-[100px]`}
            style={{
              backgroundColor: gender === option.value
                ? themeColors.genderSelected
                : themeColors.surface,
              borderColor: gender === option.value
                ? themeColors.genderSelectedBorder
                : themeColors.border
            }}
            onPress={() => {
              setGender(option.value as any);
              // Clear gender error
              const newErrors = { ...formErrors };
              delete newErrors.gender;
              setFormErrors(newErrors);
            }}
            activeOpacity={0.8}
          >
            <Text
              className="font-rubik text-center"
              style={{
                fontSize: TEXT_SIZE * 0.85,
                color: gender === option.value
                  ? themeColors.genderSelectedText
                  : themeColors.text
              }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {formErrors.gender && (
        <View className="flex-row items-center mt-2">
          <Feather name="alert-circle" size={14} color={themeColors.error} />
          <Text
            className="font-rubik text-sm ml-1"
            style={{ color: themeColors.error }}
          >
            {formErrors.gender}
          </Text>
        </View>
      )}
    </View>
  );

  const RoleSelector = () => (
    <View className="mb-6">
      <Text
        style={{ fontSize: TEXT_SIZE * 0.9, color: themeColors.text }}
        className="font-rubik-medium mb-3"
      >
        Account Type
      </Text>
      <View className="flex-row gap-3">
        <TouchableOpacity
          className={`flex-1 px-4 py-4 rounded-xl border-2`}
          style={{
            backgroundColor: role === 'user'
              ? themeColors.roleSelected
              : themeColors.surface,
            borderColor: role === 'user'
              ? themeColors.roleSelectedBorder
              : themeColors.border
          }}
          onPress={() => setRole('user')}
          activeOpacity={0.8}
        >
          <View className="items-center">
            <Feather
              name="user"
              size={24}
              color={role === 'user'
                ? themeColors.roleSelectedText
                : themeColors.textTertiary
              }
            />
            <Text
              className="font-rubik text-center mt-2"
              style={{
                color: role === 'user'
                  ? themeColors.roleSelectedText
                  : themeColors.text
              }}
            >
              Regular User
            </Text>
            <Text
              className="font-rubik text-xs text-center mt-1"
              style={{
                color: role === 'user'
                  ? themeColors.roleSelectedText
                  : themeColors.textSecondary
              }}
            >
              Discover & attend events
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 px-4 py-4 rounded-xl border-2`}
          style={{
            backgroundColor: role === 'admin'
              ? themeColors.accent
              : themeColors.surface,
            borderColor: role === 'admin'
              ? themeColors.accent
              : themeColors.border
          }}
          onPress={() => setRole('admin')}
          activeOpacity={0.8}
        >
          <View className="items-center">
            <Feather
              name="shield"
              size={24}
              color={role === 'admin' ? "white" : themeColors.textTertiary}
            />
            <Text
              className="font-rubik text-center mt-2"
              style={{
                color: role === 'admin' ? "white" : themeColors.text
              }}
            >
              Admin
            </Text>
            <Text
              className="font-rubik text-xs text-center mt-1"
              style={{
                color: role === 'admin' ? "white" : themeColors.textSecondary
              }}
            >
              Manage events & agendas
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const AdminCodeInput = () => {
    if (role !== 'admin') return null;

    return (
      <View className="mb-6">
        <View
          className="p-4 rounded-xl mb-4 border"
          style={{
            backgroundColor: themeColors.adminBackground,
            borderColor: themeColors.adminBorder
          }}
        >
          <View className="flex-row items-center mb-2">
            <Feather name="shield" size={16} color={themeColors.adminIcon} />
            <Text
              className="font-rubik-medium text-sm ml-2"
              style={{ color: themeColors.adminText }}
            >
              Administrator Access
            </Text>
          </View>
          <Text
            className="font-rubik text-xs"
            style={{ color: themeColors.adminText }}
          >
            Admin privileges include creating event agendas, managing live agenda items, and advanced event administration features.
          </Text>
        </View>

        <FormInput
          label="Admin Access Code"
          value={adminCode}
          onChangeText={setAdminCode}
          placeholder="Enter your admin access code"
          error={formErrors.adminCode}
          required
          maxLength={20}
        />
        <Text
          className="font-rubik text-xs mt-1"
          style={{ color: themeColors.textSecondary }}
        >
          Contact your organization administrator for the access code
        </Text>
      </View>
    );
  };

  const AttemptWarning = () => {
    if (saveAttempts === 0) return null;

    return (
      <View
        className="p-3 rounded-xl mb-4 border"
        style={{
          backgroundColor: themeColors.attemptBackground,
          borderColor: themeColors.attemptBorder
        }}
      >
        <View className="flex-row items-center">
          <Feather name="alert-triangle" size={16} color={themeColors.attemptText} />
          <Text
            className="font-rubik-medium text-sm ml-2"
            style={{ color: themeColors.attemptText }}
          >
            Save attempt {saveAttempts}/{MAX_SAVE_ATTEMPTS}
          </Text>
        </View>
        {saveAttempts >= 2 && (
          <Text
            className="font-rubik text-xs mt-1"
            style={{ color: themeColors.attemptText }}
          >
            If you continue to have issues, please contact support for assistance.
          </Text>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: themeColors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView className='flex-1' edges={['top']}>
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
          {/* Header */}
          <View className="items-center mb-8 mt-8">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-6"
              style={{ backgroundColor: themeColors.accent }}
            >
              <Feather name="user-plus" size={32} color="white" />
            </View>
            <Text
              style={{ fontSize: TEXT_SIZE * 1.3, color: themeColors.text }}
              className="font-rubik-bold text-center mb-2"
            >
              Complete Your Profile
            </Text>
            <Text
              style={{ fontSize: TEXT_SIZE * 0.85, color: themeColors.textSecondary }}
              className="font-rubik text-center max-w-sm leading-6"
            >
              Tell us a bit about yourself to personalize your NexVenue experience
            </Text>
          </View>

          {/* Attempt Warning */}
          <AttemptWarning />

          {/* Form */}
          <FormInput
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            error={formErrors.fullName}
            required
            maxLength={50}
          />

          <GenderSelector />

          <RoleSelector />

          <AdminCodeInput />

          {/* Complete Button */}
          <ActionButton
            loading={loading}
            handlePress={handleCompleteProfile}
            buttonText='Complete Profile'
            showArrow
            width="100%"
          />

          {/* Support Link */}
          <View className="items-center mt-6 mb-8">
            <Text
              className="font-rubik text-xs mb-2"
              style={{ color: themeColors.textTertiary }}
            >
              Need help setting up your profile?
            </Text>
            <TouchableOpacity onPress={showSupportInfo} activeOpacity={0.7}>
              <Text
                className="font-rubik-medium text-sm"
                style={{ color: themeColors.accent }}
              >
                Contact Support
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default ProfileSetup;