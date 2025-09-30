import { TEXT_SIZE } from '@/constants';
import { useNotifications } from '@/context/notification-context';
import { useTheme } from '@/context/theme-context';
import { StoredNotification } from '@/types/notifications';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationList() {
    const { notifications, unreadCount, markAsRead, clearAllNotifications } = useNotifications();
    const { activeTheme } = useTheme();

    const themeColors = {
        background: activeTheme === 'light' ? '#D8D9D4' : '#161616',
        surface: activeTheme === 'light' ? '#ffffff' : '#1f2937',
        text: activeTheme === 'light' ? '#1f2937' : '#ffffff',
        textSecondary: activeTheme === 'light' ? '#6b7280' : '#9ca3af',
        border: activeTheme === 'light' ? '#e5e7eb' : '#374151',
        unreadBg: activeTheme === 'light' ? '#eff6ff' : '#1e3a8a',
        accent: '#3b82f6',
    };

    const handleNotificationPress = (notification: StoredNotification) => {
        // Mark as read
        markAsRead(notification.id);

        // Navigate based on type
        const { type, eventId, conversationId } = notification.data;

        switch (type) {
            case 'event_message':
                if (eventId) {
                    router.push({
                        pathname: '/(app-screens)/(chat)/event-chat',
                        params: { eventId }
                    });
                }
                break;
            case 'direct_message':
                if (conversationId) {
                    router.push({
                        pathname: '/(app-screens)/(chat)/direct-chat',
                        params: { conversationId }
                    });
                }
                break;
            case 'new_event':
            case 'event_update':
            case 'event_reminder':
            case 'new_attendee':
                if (eventId) {
                    router.push({
                        pathname: '/(app-screens)/(home)/event-screen',
                        params: { eventId }
                    });
                }
                break;
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'event_message':
            case 'direct_message':
                return 'message-circle';
            case 'new_event':
                return 'calendar';
            case 'event_update':
                return 'edit';
            case 'event_reminder':
                return 'clock';
            case 'new_attendee':
                return 'user-plus';
            default:
                return 'bell';
        }
    };

    const formatTimestamp = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    const renderNotification = ({ item }: { item: StoredNotification }) => (
        <TouchableOpacity
            onPress={() => handleNotificationPress(item)}
            style={{
                backgroundColor: item.read ? themeColors.surface : themeColors.unreadBg,
                padding: 16,
                marginHorizontal: 16,
                marginBottom: 8,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: themeColors.border,
            }}
        >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: themeColors.accent + '20',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 12,
                    }}
                >
                    <Feather
                        name={getNotificationIcon(item.type) as any}
                        size={20}
                        color={themeColors.accent}
                    />
                </View>

                <View style={{ flex: 1 }}>
                    <Text
                        style={{
                            fontSize: TEXT_SIZE * 0.9,
                            fontFamily: 'Rubik-SemiBold',
                            color: themeColors.text,
                            marginBottom: 4,
                        }}
                    >
                        {item.title}
                    </Text>
                    <Text
                        style={{
                            fontSize: TEXT_SIZE * 0.85,
                            fontFamily: 'Rubik-Regular',
                            color: themeColors.textSecondary,
                            marginBottom: 8,
                        }}
                        numberOfLines={2}
                    >
                        {item.body}
                    </Text>
                    <Text
                        style={{
                            fontSize: TEXT_SIZE * 0.75,
                            fontFamily: 'Rubik-Regular',
                            color: themeColors.textSecondary,
                        }}
                    >
                        {formatTimestamp(item.timestamp)}
                    </Text>
                </View>

                {!item.read && (
                    <View
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: themeColors.accent,
                            marginLeft: 8,
                            marginTop: 6,
                        }}
                    />
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
            {/* Header */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 16,
                    backgroundColor: themeColors.surface,
                    borderBottomWidth: 1,
                    borderBottomColor: themeColors.border,
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
                        <Feather name="arrow-left" size={24} color={themeColors.text} />
                    </TouchableOpacity>
                    <Text
                        style={{
                            fontSize: TEXT_SIZE * 1.2,
                            fontFamily: 'Rubik-SemiBold',
                            color: themeColors.text,
                        }}
                    >
                        Notifications
                    </Text>
                </View>

                {notifications.length > 0 && (
                    <TouchableOpacity onPress={clearAllNotifications}>
                        <Text
                            style={{
                                fontSize: TEXT_SIZE * 0.85,
                                fontFamily: 'Rubik-Medium',
                                color: themeColors.accent,
                            }}
                        >
                            Clear All
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Notifications List */}
            {notifications.length === 0 ? (
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 32,
                    }}
                >
                    <Feather name="bell-off" size={64} color={themeColors.textSecondary} />
                    <Text
                        style={{
                            fontSize: TEXT_SIZE,
                            fontFamily: 'Rubik-Medium',
                            color: themeColors.text,
                            marginTop: 16,
                            textAlign: 'center',
                        }}
                    >
                        No Notifications
                    </Text>
                    <Text
                        style={{
                            fontSize: TEXT_SIZE * 0.85,
                            fontFamily: 'Rubik-Regular',
                            color: themeColors.textSecondary,
                            marginTop: 8,
                            textAlign: 'center',
                        }}
                    >
                        You're all caught up!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderNotification}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingVertical: 8 }}
                />
            )}
        </SafeAreaView>
    );
}