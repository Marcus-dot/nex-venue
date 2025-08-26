import ActionButton from '@/components/action-button';
import BackNav from '@/components/back-nav';
import LongTextInput from '@/components/long-text-input';
import { TEXT_SIZE } from '@/constants';
import { useAuth } from '@/context/auth-context';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const EditProfile = () => {
    const { userProfile, updateUserProfile, isAdmin } = useAuth();

    const [fullName, setFullName] = useState(userProfile?.fullName || '');
    const [email, setEmail] = useState(userProfile?.email || '');
    const [gender, setGender] = useState<'male' | 'female' | 'other' | 'prefer_not_to_say' | ''>(
        userProfile?.gender || ''
    );
    const [loading, setLoading] = useState(false);

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

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-background"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <SafeAreaView className="flex-1">
                <BackNav title="Edit Profile" handlePress={() => router.back()} />

                <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                    {/* Profile Picture Section */}
                    <View className="items-center mb-8 mt-4">
                        <View className="w-24 h-24 bg-accent rounded-full items-center justify-center mb-4">
                            <Text className="text-white font-rubik-bold text-3xl">
                                {fullName ? fullName.charAt(0).toUpperCase() : userProfile?.phoneNumber?.slice(-2) || 'U'}
                            </Text>
                        </View>
                        <TouchableOpacity className="bg-gray-800 px-4 py-2 rounded-lg">
                            <Text className="text-white font-rubik-medium">Change Photo</Text>
                        </TouchableOpacity>
                        <Text className="text-gray-500 font-rubik text-sm mt-2">Coming Soon</Text>
                    </View>

                    {/* Role Badge */}
                    {isAdmin && (
                        <View className="bg-accent/20 border border-accent p-3 rounded-lg mb-6 flex-row items-center justify-center">
                            <Text className="text-accent font-rubik-semibold">🛡️ Administrator Account</Text>
                        </View>
                    )}

                    {/* Form Fields */}
                    <View className="space-y-6">
                        {/* Full Name */}
                        <View>
                            <Text style={{ fontSize: TEXT_SIZE * 0.8 }} className="text-white font-rubik-medium mb-2">
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
                        <View>
                            <Text style={{ fontSize: TEXT_SIZE * 0.8 }} className="text-white font-rubik-medium mb-2">
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
                        <View>
                            <Text style={{ fontSize: TEXT_SIZE * 0.8 }} className="text-white font-rubik-medium mb-2">
                                Phone Number
                            </Text>
                            <View className="bg-gray-700 p-4 rounded-lg">
                                <Text className="text-gray-400 font-rubik">
                                    {userProfile?.phoneNumber || 'No phone number'}
                                </Text>
                            </View>
                            <Text className="text-gray-500 font-rubik text-xs mt-1">
                                Phone number cannot be changed
                            </Text>
                        </View>

                        {/* Account Type (Read Only) */}
                        <View>
                            <Text style={{ fontSize: TEXT_SIZE * 0.8 }} className="text-white font-rubik-medium mb-2">
                                Account Type
                            </Text>
                            <View className={`p-4 rounded-lg border ${isAdmin ? 'bg-accent/10 border-accent' : 'bg-gray-700 border-gray-600'}`}>
                                <Text className={`font-rubik ${isAdmin ? 'text-accent' : 'text-gray-400'}`}>
                                    {isAdmin ? '🛡️ Administrator' : '👤 Regular User'}
                                </Text>
                            </View>
                            <Text className="text-gray-500 font-rubik text-xs mt-1">
                                {isAdmin
                                    ? 'You have administrative privileges for managing events and agendas'
                                    : 'Contact your organization administrator to request admin access'
                                }
                            </Text>
                        </View>

                        {/* Gender */}
                        <View>
                            <Text style={{ fontSize: TEXT_SIZE * 0.8 }} className="text-white font-rubik-medium mb-2">
                                Gender *
                            </Text>
                            <View className="flex-row flex-wrap gap-2">
                                {['male', 'female', 'prefer_not_to_say'].map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        className={`px-4 py-2 rounded-lg border ${gender === option ? 'bg-accent border-accent' : 'bg-gray-800 border-gray-600'
                                            }`}
                                        onPress={() => setGender(option as any)}
                                    >
                                        <Text
                                            className={`${gender === option ? "text-white" : "text-gray-300"
                                                } font-rubik`}
                                            style={{ fontSize: TEXT_SIZE * 0.8 }}
                                        >
                                            {option === 'prefer_not_to_say' ? 'Prefer not to say' :
                                                option.charAt(0).toUpperCase() + option.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Member Since */}
                        <View>
                            <Text style={{ fontSize: TEXT_SIZE * 0.8 }} className="text-white font-rubik-medium mb-2">
                                Member Since
                            </Text>
                            <View className="bg-gray-700 p-4 rounded-lg">
                                <Text className="text-gray-400 font-rubik">
                                    {new Date(userProfile?.createdAt || Date.now()).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </Text>
                            </View>
                        </View>
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