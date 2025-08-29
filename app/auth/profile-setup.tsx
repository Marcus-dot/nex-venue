import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [saveAttempts, setSaveAttempts] = useState(0);

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
        <Text style={{ fontSize: TEXT_SIZE * 0.9 }} className="text-white font-rubik-medium">
          {label}
        </Text>
        {required && <Text className="text-accent ml-1">*</Text>}
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
      />
      {error && (
        <View className="flex-row items-center mt-2">
          <Feather name="alert-circle" size={14} color="#ef4444" />
          <Text className="text-red-400 font-rubik text-sm ml-1">{error}</Text>
        </View>
      )}
      {maxLength && value.length > maxLength * 0.8 && (
        <Text className="text-gray-500 font-rubik text-xs mt-1">
          {value.length}/{maxLength} characters
        </Text>
      )}
    </View>
  );

  const GenderSelector = () => (
    <View className="mb-6">
      <View className="flex-row items-center mb-3">
        <Text style={{ fontSize: TEXT_SIZE * 0.9 }} className="text-white font-rubik-medium">
          Gender
        </Text>
        <Text className="text-accent ml-1">*</Text>
      </View>
      <View className="flex-row flex-wrap gap-3">
        {[
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'prefer_not_to_say', label: 'Prefer not to say' }
        ].map((option) => (
          <TouchableOpacity
            key={option.value}
            className={`px-4 py-3 rounded-xl border-2 min-w-[100px] ${gender === option.value
                ? 'bg-accent border-accent'
                : 'bg-gray-800 border-gray-600'
              }`}
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
              className={`${gender === option.value ? "text-white" : "text-gray-300"
                } font-rubik text-center`}
              style={{ fontSize: TEXT_SIZE * 0.85 }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {formErrors.gender && (
        <View className="flex-row items-center mt-2">
          <Feather name="alert-circle" size={14} color="#ef4444" />
          <Text className="text-red-400 font-rubik text-sm ml-1">{formErrors.gender}</Text>
        </View>
      )}
    </View>
  );

  const RoleSelector = () => (
    <View className="mb-6">
      <Text style={{ fontSize: TEXT_SIZE * 0.9 }} className="text-white font-rubik-medium mb-3">
        Account Type
      </Text>
      <View className="flex-row gap-3">
        <TouchableOpacity
          className={`flex-1 px-4 py-4 rounded-xl border-2 ${role === 'user' ? 'bg-accent border-accent' : 'bg-gray-800 border-gray-600'
            }`}
          onPress={() => setRole('user')}
          activeOpacity={0.8}
        >
          <View className="items-center">
            <Feather
              name="user"
              size={24}
              color={role === 'user' ? "white" : "#9CA3AF"}
            />
            <Text className={`${role === 'user' ? "text-white" : "text-gray-300"} font-rubik text-center mt-2`}>
              Regular User
            </Text>
            <Text className={`${role === 'user' ? "text-white" : "text-gray-400"} font-rubik text-xs text-center mt-1`}>
              Discover & attend events
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 px-4 py-4 rounded-xl border-2 ${role === 'admin' ? 'bg-accent border-accent' : 'bg-gray-800 border-gray-600'
            }`}
          onPress={() => setRole('admin')}
          activeOpacity={0.8}
        >
          <View className="items-center">
            <Feather
              name="shield"
              size={24}
              color={role === 'admin' ? "white" : "#9CA3AF"}
            />
            <Text className={`${role === 'admin' ? "text-white" : "text-gray-300"} font-rubik text-center mt-2`}>
              Admin
            </Text>
            <Text className={`${role === 'admin' ? "text-white" : "text-gray-400"} font-rubik text-xs text-center mt-1`}>
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
        <View className="bg-yellow-900/20 border border-yellow-600 p-4 rounded-xl mb-4">
          <View className="flex-row items-center mb-2">
            <Feather name="shield" size={16} color="#fbbf24" />
            <Text className="text-yellow-400 font-rubik-medium text-sm ml-2">
              Administrator Access
            </Text>
          </View>
          <Text className="text-yellow-300 font-rubik text-xs">
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
        <Text className="text-gray-400 font-rubik text-xs mt-1">
          Contact your organization administrator for the access code
        </Text>
      </View>
    );
  };

  const AttemptWarning = () => {
    if (saveAttempts === 0) return null;

    return (
      <View className="bg-orange-900/20 border border-orange-600 p-3 rounded-xl mb-4">
        <View className="flex-row items-center">
          <Feather name="alert-triangle" size={16} color="#fb923c" />
          <Text className="text-orange-400 font-rubik-medium text-sm ml-2">
            Save attempt {saveAttempts}/{MAX_SAVE_ATTEMPTS}
          </Text>
        </View>
        {saveAttempts >= 2 && (
          <Text className="text-orange-300 font-rubik text-xs mt-1">
            If you continue to have issues, please contact support for assistance.
          </Text>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
        <SafeAreaView className='flex-1 bg-background' edges={['top']}>
          <ScrollView
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
          >
            {/* Header */}
            <View className="items-center mb-8 mt-8">
              <View className="w-20 h-20 bg-accent rounded-full items-center justify-center mb-6">
                <Feather name="user-plus" size={32} color="white" />
              </View>
              <Text style={{ fontSize: TEXT_SIZE * 1.3 }} className="text-white font-rubik-bold text-center mb-2">
                Complete Your Profile
              </Text>
              <Text style={{ fontSize: TEXT_SIZE * 0.85 }} className="text-gray-400 font-rubik text-center max-w-sm leading-6">
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
              <Text className="text-gray-500 font-rubik text-xs mb-2">
                Need help setting up your profile?
              </Text>
              <TouchableOpacity onPress={showSupportInfo} activeOpacity={0.7}>
                <Text className="text-accent font-rubik-medium text-sm">Contact Support</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default ProfileSetup;