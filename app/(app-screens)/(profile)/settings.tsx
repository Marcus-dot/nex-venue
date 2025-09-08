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

    // Theme-aware colors
    const themeColors = {
        background: activeTheme === 'light' ? '#D8D9D4' : '#161616',
        surface: activeTheme === 'light' ? '#ffffff' : '#374151',
        surfaceSecondary: activeTheme === 'light' ? '#f3f4f6' : '#1f2937',
        text: activeTheme === 'light' ? '#1f2937' : '#ffffff',
        textSecondary: activeTheme === 'light' ? '#6b7280' : '#d1d5db',
        textTertiary: activeTheme === 'light' ? '#9ca3af' : '#9CA3AF',
        border: activeTheme === 'light' ? '#e5e7eb' : '#374151',
        toggleBackground: activeTheme === 'light' ? '#ffffff' : '#374151',
        toggleBorder: activeTheme === 'light' ? '#e5e7eb' : '#4b5563',
        toggleShadow: activeTheme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.3)',
        contentBackground: activeTheme === 'light' ? '#ffffff' : '#1f2937',
        sectionBackground: activeTheme === 'light' ? '#f8fafc' : '#111827',
        sectionBorder: activeTheme === 'light' ? '#e2e8f0' : '#374151',
        comingSoonBackground: activeTheme === 'light' ? '#f3f4f6' : '#374151',
        comingSoonBorder: activeTheme === 'light' ? '#d1d5db' : '#6b7280',
        comingSoonText: activeTheme === 'light' ? '#6b7280' : '#9ca3af',
        selectedBackground: activeTheme === 'light' ? '#e85c29' : '#e85c29',
        selectedBorder: activeTheme === 'light' ? '#e85c29' : '#e85c29',
        unselectedBackground: activeTheme === 'light' ? '#f9fafb' : '#374151',
        unselectedBorder: activeTheme === 'light' ? '#e5e7eb' : '#6b7280',
        iconBackground: activeTheme === 'light' ? '#f3f4f6' : '#4b5563',
        iconColor: activeTheme === 'light' ? '#6b7280' : '#9ca3af',
        versionText: activeTheme === 'light' ? '#9ca3af' : '#6b7280'
    };

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
            <Text
                style={{
                    fontSize: TEXT_SIZE * 0.9,
                    color: themeColors.text
                }}
                className="font-rubik-semibold mb-4 px-2"
            >
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
                className={`p-4 rounded-xl mb-3 border-2 ${changingTheme ? 'opacity-60' : ''}`}
                style={{
                    backgroundColor: isSelected
                        ? themeColors.selectedBackground
                        : themeColors.unselectedBackground,
                    borderColor: isSelected
                        ? themeColors.selectedBorder
                        : themeColors.unselectedBorder
                }}
                activeOpacity={0.8}
            >
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                        <View
                            className={`w-12 h-12 rounded-full items-center justify-center mr-4`}
                            style={{
                                backgroundColor: isSelected
                                    ? 'rgba(255, 255, 255, 0.2)'
                                    : themeColors.iconBackground
                            }}
                        >
                            <Feather
                                name={option.icon as any}
                                size={20}
                                color={isSelected ? 'white' : themeColors.iconColor}
                            />
                        </View>
                        <View className="flex-1">
                            <Text
                                className="font-rubik-medium text-base"
                                style={{
                                    color: isSelected ? 'white' : themeColors.text
                                }}
                            >
                                {option.label}
                            </Text>
                            <Text
                                className="font-rubik text-sm mt-1"
                                style={{
                                    color: isSelected
                                        ? 'rgba(255, 255, 255, 0.8)'
                                        : themeColors.textSecondary
                                }}
                            >
                                {option.description}
                            </Text>
                            {option.value === 'system' && (
                                <Text
                                    className="font-rubik text-xs mt-1"
                                    style={{
                                        color: isSelected
                                            ? 'rgba(255, 255, 255, 0.6)'
                                            : themeColors.textTertiary
                                    }}
                                >
                                    Currently: {activeTheme === 'light' ? 'Light' : 'Dark'}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Selection Indicator */}
                    <View
                        className={`w-6 h-6 rounded-full border-2 items-center justify-center`}
                        style={{
                            borderColor: isSelected ? 'white' : themeColors.iconColor
                        }}
                    >
                        {isSelected && (
                            <View className="w-3 h-3 rounded-full bg-white" />
                        )}
                    </View>
                </View>

                {/* Preview indicator for active theme */}
                {isActive && (
                    <View
                        className="mt-3 pt-3"
                        style={{ borderTopColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : themeColors.border }}
                    >
                        <View className="flex-row items-center">
                            <Feather name="eye" size={14} color={isSelected ? 'white' : themeColors.textSecondary} />
                            <Text
                                className="font-rubik text-xs ml-2"
                                style={{
                                    color: isSelected
                                        ? 'rgba(255, 255, 255, 0.8)'
                                        : themeColors.textSecondary
                                }}
                            >
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
            className="p-4 rounded-xl mb-3 opacity-60 border"
            style={{
                backgroundColor: themeColors.comingSoonBackground,
                borderColor: themeColors.comingSoonBorder
            }}
            activeOpacity={0.7}
        >
            <View className="flex-row items-center">
                <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: themeColors.iconBackground }}
                >
                    <Feather name={icon as any} size={20} color={themeColors.iconColor} />
                </View>
                <View className="flex-1">
                    <Text
                        className="font-rubik-medium text-base"
                        style={{ color: themeColors.text }}
                    >
                        {title}
                    </Text>
                    <Text
                        className="font-rubik text-sm mt-1"
                        style={{ color: themeColors.textSecondary }}
                    >
                        {description}
                    </Text>
                </View>
                <View
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: themeColors.iconBackground }}
                >
                    <Text
                        className="font-rubik text-xs"
                        style={{ color: themeColors.comingSoonText }}
                    >
                        Soon
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView
            className="flex-1"
            style={{ backgroundColor: themeColors.background }}
        >
            <BackNav
                title="Settings & Preferences"
                handlePress={() => router.back()}
                backgroundColor={themeColors.background}
                textColor={themeColors.text}
                iconColor={themeColors.text}
            />

            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                <View className="py-4">
                    {/* Header */}
                    <View className="items-center mb-8 mt-4">
                        <View className="w-20 h-20 bg-accent rounded-full items-center justify-center mb-4">
                            <Feather name="settings" size={32} color="white" />
                        </View>
                        <Text
                            style={{
                                fontSize: TEXT_SIZE * 1.3,
                                color: themeColors.text
                            }}
                            className="font-rubik-bold text-center mb-2"
                        >
                            App Settings
                        </Text>
                        <Text
                            style={{
                                fontSize: TEXT_SIZE * 0.85,
                                color: themeColors.textSecondary
                            }}
                            className="font-rubik text-center max-w-sm leading-6"
                        >
                            Customize your NexVenue experience
                        </Text>
                    </View>

                    {/* Theme Settings */}
                    <SettingSection title="Appearance">
                        <View
                            className="p-4 rounded-xl mb-4 border"
                            style={{
                                backgroundColor: themeColors.sectionBackground,
                                borderColor: themeColors.sectionBorder
                            }}
                        >
                            <View className="flex-row items-center mb-3">
                                <Feather name="monitor" size={18} color="#e85c29" />
                                <Text
                                    className="font-rubik-medium ml-2"
                                    style={{ color: themeColors.text }}
                                >
                                    Theme Preference
                                </Text>
                            </View>
                            <Text
                                className="font-rubik text-sm leading-5"
                                style={{ color: themeColors.textSecondary }}
                            >
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
                    <View
                        className="items-center py-8 rounded-xl border"
                        style={{
                            backgroundColor: themeColors.sectionBackground,
                            borderColor: themeColors.sectionBorder
                        }}
                    >
                        <Text
                            className="font-rubik text-xs mb-2"
                            style={{ color: themeColors.versionText }}
                        >
                            NexVenue v1.0.0
                        </Text>
                        <Text
                            className="font-rubik text-xs"
                            style={{ color: themeColors.versionText }}
                        >
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