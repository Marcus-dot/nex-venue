import ActionButton from '@/components/action-button';
import BackNav from '@/components/back-nav';
import LongTextInput from '@/components/long-text-input';
import { TEXT_SIZE } from '@/constants';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const EditProfile = () => {
    const { userProfile, updateUserProfile, isAdmin } = useAuth();
    const { activeTheme } = useTheme();

    const [fullName, setFullName] = useState(userProfile?.fullName || '');
    const [email, setEmail] = useState(userProfile?.email || '');
    const [gender, setGender] = useState<'male' | 'female' | 'other' | 'prefer_not_to_say' | ''>(
        userProfile?.gender || ''
    );
    const [loading, setLoading] = useState(false);

    // Theme-aware colors
    const themeColors = {
        background: activeTheme === 'light' ? '#D8D9D4' : '#161616',
        surface: activeTheme === 'light' ? '#ffffff' : '#374151',
        surfaceSecondary: activeTheme === 'light' ? '#f3f4f6' : '#1f2937',
        text: activeTheme === 'light' ? '#1f2937' : '#ffffff',
        textSecondary: activeTheme === 'light' ? '#6b7280' : '#d1d5db',
        textTertiary: activeTheme === 'light' ? '#9ca3af' : '#9CA3AF',
        border: activeTheme === 'light' ? '#e5e7eb' : '#374151',
        input: activeTheme === 'light' ? '#f9fafb' : '#374151',
        inputBorder: activeTheme === 'light' ? '#d1d5db' : '#6b7280',
        inputText: activeTheme === 'light' ? '#1f2937' : '#ffffff',
        adminBackground: activeTheme === 'light' ? 'rgba(255, 67, 6, 0.1)' : 'rgba(255, 67, 6, 0.2)',
        adminBorder: activeTheme === 'light' ? 'rgba(255, 67, 6, 0.3)' : '#e85c29',
        adminText: activeTheme === 'light' ? '#e85c29' : '#e85c29',
        disabledBackground: activeTheme === 'light' ? '#f3f4f6' : '#374151',
        disabledText: activeTheme === 'light' ? '#9ca3af' : '#6b7280',
        genderSelected: activeTheme === 'light' ? '#dbeafe' : '#1e3a8a',
        genderSelectedBorder: activeTheme === 'light' ? '#3b82f6' : '#2563eb',
        genderSelectedText: activeTheme === 'light' ? '#1e40af' : '#60a5fa',
        genderUnselected: activeTheme === 'light' ? '#f9fafb' : '#374151',
        genderUnselectedBorder: activeTheme === 'light' ? '#d1d5db' : '#6b7280'
    };

    const handleSaveProfile = async () => {
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
                fullName: fullName.trim(),
                email: email.trim() || undefined,
                gender,
            });

            Alert.alert('Success', 'Profile updated successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const FormInput = ({
        label,
        value,
        onChangeText,
        placeholder,
        keyboardType = 'default',
        maxLength = 50
    }: {
        label: string;
        value: string;
        onChangeText: (text: string) => void;
        placeholder: string;
        keyboardType?: 'default' | 'email-address';
        maxLength?: number;
    }) => (
        <View className="mb-4">
            <Text
                style={{
                    fontSize: TEXT_SIZE * 0.8,
                    color: themeColors.text
                }}
                className="font-rubik-medium mb-2"
            >
                {label}
            </Text>
            <View
                className="px-4 py-3 rounded-lg border"
                style={{
                    backgroundColor: themeColors.input,
                    borderColor: themeColors.inputBorder
                }}
            >
                <Text
                    style={{
                        fontSize: TEXT_SIZE,
                        color: themeColors.inputText
                    }}
                    className="font-rubik"
                >
                    {value || placeholder}
                </Text>
            </View>
        </View>
    );

    const ReadOnlyField = ({
        label,
        value,
        note
    }: {
        label: string;
        value: string;
        note?: string;
    }) => (
        <View className="mb-4">
            <Text
                style={{
                    fontSize: TEXT_SIZE * 0.8,
                    color: themeColors.text
                }}
                className="font-rubik-medium mb-2"
            >
                {label}
            </Text>
            <View
                className="px-4 py-3 rounded-lg border"
                style={{
                    backgroundColor: themeColors.disabledBackground,
                    borderColor: themeColors.border
                }}
            >
                <Text
                    style={{
                        fontSize: TEXT_SIZE,
                        color: themeColors.disabledText
                    }}
                    className="font-rubik"
                >
                    {value}
                </Text>
            </View>
            {note && (
                <Text
                    style={{ color: themeColors.textTertiary }}
                    className="font-rubik text-xs mt-1"
                >
                    {note}
                </Text>
            )}
        </View>
    );

    return (
        <KeyboardAvoidingView
            className="flex-1"
            style={{ backgroundColor: themeColors.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <SafeAreaView className="flex-1">
                <BackNav
                    title="Edit Profile"
                    handlePress={() => router.back()}
                    backgroundColor={themeColors.background}
                    textColor={themeColors.text}
                    iconColor={themeColors.text}
                />

                <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                    {/* Profile Picture Section */}
                    <View className="items-center mb-8 mt-4">
                        <View className="w-24 h-24 bg-accent rounded-full items-center justify-center mb-4">
                            <Text className="text-white font-rubik-bold text-3xl">
                                {fullName ? fullName.charAt(0).toUpperCase() : userProfile?.phoneNumber?.slice(-2) || 'U'}
                            </Text>
                        </View>
                        <TouchableOpacity
                            className="px-4 py-2 rounded-lg border"
                            style={{
                                backgroundColor: themeColors.surface,
                                borderColor: themeColors.border
                            }}
                        >
                            <Text
                                style={{ color: themeColors.text }}
                                className="font-rubik-medium"
                            >
                                Change Photo
                            </Text>
                        </TouchableOpacity>
                        <Text
                            style={{ color: themeColors.textTertiary }}
                            className="font-rubik text-sm mt-2"
                        >
                            Coming Soon
                        </Text>
                    </View>

                    {/* Role Badge */}
                    {isAdmin && (
                        <View
                            className="p-3 rounded-lg mb-6 flex-row items-center justify-center border"
                            style={{
                                backgroundColor: themeColors.adminBackground,
                                borderColor: themeColors.adminBorder
                            }}
                        >
                            <Text
                                style={{ color: themeColors.adminText }}
                                className="font-rubik-semibold"
                            >
                                🛡️ Administrator Account
                            </Text>
                        </View>
                    )}

                    {/* Form Fields */}
                    <View className="space-y-6">
                        {/* Full Name */}
                        <View className="mb-4">
                            <Text
                                style={{
                                    fontSize: TEXT_SIZE * 0.8,
                                    color: themeColors.text
                                }}
                                className="font-rubik-medium mb-2"
                            >
                                Full Name *
                            </Text>
                            <LongTextInput
                                text={fullName}
                                handleTextChange={setFullName}
                                width="100%"
                                placeholder="Enter your full name"
                            />
                        </View>

                        {/* Email */}
                        <View className="mb-4">
                            <Text
                                style={{
                                    fontSize: TEXT_SIZE * 0.8,
                                    color: themeColors.text
                                }}
                                className="font-rubik-medium mb-2"
                            >
                                Email (Optional)
                            </Text>
                            <LongTextInput
                                text={email}
                                handleTextChange={setEmail}
                                width="100%"
                                placeholder="Enter your email address"
                                type="email"
                            />
                        </View>

                        {/* Phone Number (Read Only) */}
                        <ReadOnlyField
                            label="Phone Number"
                            value={userProfile?.phoneNumber || 'No phone number'}
                            note="Phone number cannot be changed"
                        />

                        {/* Account Type (Read Only) */}
                        <View className="mb-4">
                            <Text
                                style={{
                                    fontSize: TEXT_SIZE * 0.8,
                                    color: themeColors.text
                                }}
                                className="font-rubik-medium mb-2"
                            >
                                Account Type
                            </Text>
                            <View
                                className={`p-4 rounded-lg border ${isAdmin ? '' : ''}`}
                                style={{
                                    backgroundColor: isAdmin ? themeColors.adminBackground : themeColors.disabledBackground,
                                    borderColor: isAdmin ? themeColors.adminBorder : themeColors.border
                                }}
                            >
                                <Text
                                    style={{
                                        color: isAdmin ? themeColors.adminText : themeColors.disabledText
                                    }}
                                    className="font-rubik"
                                >
                                    {isAdmin ? '🛡️ Administrator' : '👤 Regular User'}
                                </Text>
                            </View>
                            <Text
                                style={{ color: themeColors.textTertiary }}
                                className="font-rubik text-xs mt-1"
                            >
                                {isAdmin
                                    ? 'You have administrative privileges for managing events and agendas'
                                    : 'Contact your organization administrator to request admin access'
                                }
                            </Text>
                        </View>

                        {/* Gender */}
                        <View className="mb-4">
                            <Text
                                style={{
                                    fontSize: TEXT_SIZE * 0.8,
                                    color: themeColors.text
                                }}
                                className="font-rubik-medium mb-2"
                            >
                                Gender *
                            </Text>
                            <View className="flex-row flex-wrap gap-2">
                                {['male', 'female', 'prefer_not_to_say'].map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        className={`px-4 py-2 rounded-lg border-2`}
                                        style={{
                                            backgroundColor: gender === option
                                                ? themeColors.genderSelected
                                                : themeColors.genderUnselected,
                                            borderColor: gender === option
                                                ? themeColors.genderSelectedBorder
                                                : themeColors.genderUnselectedBorder
                                        }}
                                        onPress={() => setGender(option as any)}
                                    >
                                        <Text
                                            className="font-rubik"
                                            style={{
                                                fontSize: TEXT_SIZE * 0.8,
                                                color: gender === option
                                                    ? themeColors.genderSelectedText
                                                    : themeColors.text
                                            }}
                                        >
                                            {option === 'prefer_not_to_say' ? 'Prefer not to say' :
                                                option.charAt(0).toUpperCase() + option.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Member Since */}
                        <ReadOnlyField
                            label="Member Since"
                            value={new Date(userProfile?.createdAt || Date.now()).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        />
                    </View>

                    {/* Save Button */}
                    <View className="mt-8 mb-6">
                        <ActionButton
                            loading={loading}
                            handlePress={handleSaveProfile}
                            buttonText="Save Changes"
                            showArrow={false}
                            width="100%"
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};

export default EditProfile;