import { useNotifications } from '@/context/notification-context';
import { useTheme } from '@/context/theme-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export const NotificationBell: React.FC = () => {
    const { unreadCount } = useNotifications();
    const { activeTheme } = useTheme();

    const themeColors = {
        icon: activeTheme === 'light' ? '#1f2937' : '#ffffff',
        badge: '#ef4444',
        badgeText: '#ffffff',
    };

    const handlePress = () => {
        router.push('/(app-screens)/(notifications)/notification-list' as any);
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            style={{
                marginRight: 16,
                position: 'relative',
            }}
            accessibilityLabel="Notifications"
            accessibilityHint={`You have ${unreadCount} unread notifications`}
        >
            <Feather name="bell" size={24} color={themeColors.icon} />

            {unreadCount > 0 && (
                <View
                    style={{
                        position: 'absolute',
                        top: -6,
                        right: -6,
                        backgroundColor: themeColors.badge,
                        borderRadius: 10,
                        minWidth: 20,
                        height: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: 4,
                    }}
                >
                    <Text
                        style={{
                            color: themeColors.badgeText,
                            fontSize: 12,
                            fontWeight: 'bold',
                        }}
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};