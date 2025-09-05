import BackNav from '@/components/back-nav';
import { TEXT_SIZE } from '@/constants';
import { useTheme } from '@/context/theme-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ThemeOption = {
    value: 'light' | 'dark' | 'system';
    label: string;
    description: string;
    icon: string;
};

const Settings = () => {
    const { theme, activeTheme, setTheme } = useTheme();
    const [changingTheme, setChangingTheme] = useState(false);

    const themeOptions: ThemeOption[] = [
        {
            value: 'light',
            label: 'Light Mode',
            description: 'Clean and bright interface',
            icon: 'sun'
        },
        {
            value: 'dark',
            label: 'Dark Mode',
            description: 'Easy on the eyes in low light',
            icon: 'moon'
        },
        {
            value: 'system',
            label: 'System Default',
            description: 'Matches your device setting',
            icon: 'smartphone'
        }
    ];

    const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
        if (changingTheme || theme === newTheme) return;

        setChangingTheme(true);
        try {
            await setTheme(newTheme);
        } catch (error) {
            Alert.alert('Error', 'Failed to change theme. Please try again.');
        } finally {
            setChangingTheme(false);
        }
    };

    const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <View className="mb-8">
            <Text style={{ fontSize: TEXT_SIZE * 0.9 }} className="text-white font-rubik-semibold mb-4 px-2">
                {title}
            </Text>
            {children}
        </View>
    );

    const ThemeOption = ({ option }: { option: ThemeOption }) => {
        const isSelected = theme === option.value;
        const isActive = activeTheme === (option.value === 'system' ? activeTheme : option.value);

        return (
            <TouchableOpacity
                onPress={() => handleThemeChange(option.value)}
                disabled={changingTheme}
                className={`p-4 rounded-xl mb-3 border-2 ${isSelected
                        ? 'bg-accent border-accent'
                        : 'bg-gray-800 border-gray-700'
                    } ${changingTheme ? 'opacity-60' : ''}`}
                activeOpacity={0.8}
            >
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                        <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${isSelected ? 'bg-white/20' : 'bg-gray-700'
                            }`}>
                            <Feather
                                name={option.icon as any}
                                size={20}
                                color={isSelected ? 'white' : '#9CA3AF'}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className={`font-rubik-medium text-base ${isSelected ? 'text-white' : 'text-white'
                                }`}>
                                {option.label}
                            </Text>
                            <Text className={`font-rubik text-sm mt-1 ${isSelected ? 'text-white/80' : 'text-gray-400'
                                }`}>
                                {option.description}
                            </Text>
                            {option.value === 'system' && (
                                <Text className={`font-rubik text-xs mt-1 ${isSelected ? 'text-white/60' : 'text-gray-500'
                                    }`}>
                                    Currently: {activeTheme === 'light' ? 'Light' : 'Dark'}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Selection Indicator */}
                    <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isSelected ? 'border-white' : 'border-gray-500'
                        }`}>
                        {isSelected && (
                            <View className="w-3 h-3 rounded-full bg-white" />
                        )}
                    </View>
                </View>

                {/* Preview indicator for active theme */}
                {isActive && (
                    <View className="mt-3 pt-3 border-t border-white/20">
                        <View className="flex-row items-center">
                            <Feather name="eye" size={14} color="white" />
                            <Text className="text-white/80 font-rubik text-xs ml-2">
                                Currently active
                            </Text>
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const ComingSoonSetting = ({ title, description, icon }: {
        title: string;
        description: string;
        icon: string;
    }) => (
        <TouchableOpacity
            onPress={() => Alert.alert('Coming Soon', `${title} will be available in a future update.`)}
            className="p-4 rounded-xl mb-3 bg-gray-800 border border-gray-700 opacity-60"
            activeOpacity={0.7}
        >
            <View className="flex-row items-center">
                <View className="w-12 h-12 bg-gray-700 rounded-full items-center justify-center mr-4">
                    <Feather name={icon as any} size={20} color="#9CA3AF" />
                </View>
                <View className="flex-1">
                    <Text className="text-white font-rubik-medium text-base">
                        {title}
                    </Text>
                    <Text className="text-gray-400 font-rubik text-sm mt-1">
                        {description}
                    </Text>
                </View>
                <View className="bg-gray-700 px-3 py-1 rounded-full">
                    <Text className="text-gray-400 font-rubik text-xs">Soon</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-background">
            <BackNav title="Settings & Preferences" handlePress={() => router.back()} />

            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                <View className="py-4">
                    {/* Header */}
                    <View className="items-center mb-8 mt-4">
                        <View className="w-20 h-20 bg-accent rounded-full items-center justify-center mb-4">
                            <Feather name="settings" size={32} color="white" />
                        </View>
                        <Text style={{ fontSize: TEXT_SIZE * 1.3 }} className="text-white font-rubik-bold text-center mb-2">
                            App Settings
                        </Text>
                        <Text style={{ fontSize: TEXT_SIZE * 0.85 }} className="text-gray-400 font-rubik text-center max-w-sm leading-6">
                            Customize your NexVenue experience
                        </Text>
                    </View>

                    {/* Theme Settings */}
                    <SettingSection title="Appearance">
                        <View className="bg-gray-800/50 p-4 rounded-xl mb-4 border border-gray-700">
                            <View className="flex-row items-center mb-3">
                                <Feather name="monitor" size={18} color="#ff4306" />
                                <Text className="text-white font-rubik-medium ml-2">
                                    Theme Preference
                                </Text>
                            </View>
                            <Text className="text-gray-400 font-rubik text-sm leading-5">
                                Choose how NexVenue looks. System default follows your device's theme setting.
                            </Text>
                        </View>

                        {themeOptions.map((option) => (
                            <ThemeOption key={option.value} option={option} />
                        ))}
                    </SettingSection>

                    {/* Notifications Settings */}
                    <SettingSection title="Notifications">
                        <ComingSoonSetting
                            title="Push Notifications"
                            description="Event updates and reminders"
                            icon="bell"
                        />
                        <ComingSoonSetting
                            title="Email Notifications"
                            description="Weekly event digest and announcements"
                            icon="mail"
                        />
                    </SettingSection>

                    {/* Privacy & Security */}
                    <SettingSection title="Privacy & Security">
                        <ComingSoonSetting
                            title="Privacy Settings"
                            description="Control your profile visibility"
                            icon="shield"
                        />
                        <ComingSoonSetting
                            title="Data Management"
                            description="Download or delete your data"
                            icon="database"
                        />
                    </SettingSection>

                    {/* App Settings */}
                    <SettingSection title="App Preferences">
                        <ComingSoonSetting
                            title="Language"
                            description="Choose your preferred language"
                            icon="globe"
                        />
                        <ComingSoonSetting
                            title="Default Event View"
                            description="Set your preferred event layout"
                            icon="layout"
                        />
                    </SettingSection>

                    {/* About Section */}
                    <View className="items-center py-8 bg-gray-800/30 rounded-xl border border-gray-700">
                        <Text className="text-gray-500 font-rubik text-xs mb-2">
                            NexVenue v1.0.0
                        </Text>
                        <Text className="text-gray-500 font-rubik text-xs">
                            Powered by Gralix
                        </Text>
                    </View>

                    <View className="h-8" />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Settings;