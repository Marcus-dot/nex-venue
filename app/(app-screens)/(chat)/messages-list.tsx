import BackNav from '@/components/back-nav';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { chatService } from '@/services/chat';
import { DirectConversation } from '@/types/chat';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MessagesList = () => {
    const router = useRouter();
    const { user } = useAuth();
    const { activeTheme } = useTheme();

    const [conversations, setConversations] = useState<DirectConversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Theme-aware colors
    const themeColors = {
        background: activeTheme === 'light' ? '#D8D9D4' : '#161616',
        surface: activeTheme === 'light' ? '#ffffff' : '#374151',
        surfaceSecondary: activeTheme === 'light' ? '#f3f4f6' : '#1f2937',
        text: activeTheme === 'light' ? '#1f2937' : '#ffffff',
        textSecondary: activeTheme === 'light' ? '#6b7280' : '#d1d5db',
        textTertiary: activeTheme === 'light' ? '#9ca3af' : '#9CA3AF',
        border: activeTheme === 'light' ? '#e5e7eb' : '#374151',
        emptyStateText: activeTheme === 'light' ? '#6b7280' : '#9ca3af',
        avatarBackground: '#e85c29'
    };

    useEffect(() => {
        if (!user) return;

        // Subscribe to real-time conversation updates
        const unsubscribe = chatService.subscribeToUserDirectConversations(user.uid, (convos) => {
            setConversations(convos);
            setLoading(false);
            setRefreshing(false);
        });

        return unsubscribe;
    }, [user]);

    const handleRefresh = () => {
        setRefreshing(true);
        // The real-time listener will automatically update the data
    };

    const openDirectChat = (conversation: DirectConversation) => {
        if (!user) return;

        // Find the other participant
        const otherParticipantId = conversation.participants.find(id => id !== user.uid);
        if (!otherParticipantId) return;

        const otherParticipantName = conversation.participantNames[otherParticipantId];
        const otherParticipantPhone = conversation.participantPhones[otherParticipantId];

        router.push({
            pathname: '/(app-screens)/(chat)/direct-chat' as any,
            params: {
                recipientId: otherParticipantId,
                recipientName: otherParticipantName,
                recipientPhone: otherParticipantPhone
            }
        });
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    };

    const ConversationCard = ({ conversation }: { conversation: DirectConversation }) => {
        if (!user) return null;

        const otherParticipantId = conversation.participants.find(id => id !== user.uid);
        if (!otherParticipantId) return null;

        const otherParticipantName = conversation.participantNames[otherParticipantId];
        const otherParticipantPhone = conversation.participantPhones[otherParticipantId];
        const lastMessage = conversation.lastMessage;

        return (
            <TouchableOpacity
                onPress={() => openDirectChat(conversation)}
                className="p-4 rounded-xl mb-3 border"
                style={{
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border
                }}
                activeOpacity={0.8}
            >
                <View className="flex-row items-start">
                    <View
                        className="w-12 h-12 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: themeColors.avatarBackground }}
                    >
                        <Text className="text-white font-rubik-semibold">
                            {otherParticipantPhone?.slice(-1) || 'U'}
                        </Text>
                    </View>

                    <View className="flex-1">
                        <View className="flex-row justify-between items-center mb-1">
                            <Text
                                className="font-rubik-semibold text-lg"
                                style={{ color: themeColors.text }}
                            >
                                {otherParticipantName}
                            </Text>
                            {lastMessage && (
                                <Text
                                    className="font-rubik text-xs"
                                    style={{ color: themeColors.textTertiary }}
                                >
                                    {formatTime(lastMessage.timestamp)}
                                </Text>
                            )}
                        </View>

                        {lastMessage ? (
                            <Text
                                className="font-rubik text-sm"
                                style={{ color: themeColors.textSecondary }}
                                numberOfLines={2}
                            >
                                {lastMessage.senderId === user.uid ? 'You: ' : ''}{lastMessage.message}
                            </Text>
                        ) : (
                            <Text
                                className="font-rubik text-sm italic"
                                style={{ color: themeColors.textTertiary }}
                            >
                                Start a conversation...
                            </Text>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View
                className="flex-1 items-center justify-center"
                style={{ backgroundColor: themeColors.background }}
            >
                <SafeAreaView className="flex-1" edges={['top']}>
                    <BackNav
                        title="Direct Messages"
                        handlePress={() => router.back()}
                        backgroundColor={themeColors.background}
                        textColor={themeColors.text}
                        iconColor={themeColors.text}
                    />
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#e85c29" />
                        <Text
                            className="font-rubik mt-4"
                            style={{ color: themeColors.text }}
                        >
                            Loading messages...
                        </Text>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View className="flex-1" style={{ backgroundColor: themeColors.background }}>
            <SafeAreaView className="flex-1" edges={['top']}>
                <BackNav
                    title="Direct Messages"
                    handlePress={() => router.back()}
                    backgroundColor={themeColors.background}
                    textColor={themeColors.text}
                    iconColor={themeColors.text}
                />

                <ScrollView
                    className="flex-1 px-4"
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor="#e85c29"
                            title="Pull to refresh"
                            titleColor={themeColors.text}
                        />
                    }
                >
                    <View className="py-4">
                        {conversations.length > 0 ? (
                            conversations.map((conversation) => (
                                <ConversationCard key={conversation.id} conversation={conversation} />
                            ))
                        ) : (
                            <View className="items-center justify-center py-20">
                                <Text
                                    className="font-rubik text-xl mb-4"
                                    style={{ color: themeColors.emptyStateText }}
                                >
                                    💬 No conversations yet
                                </Text>
                                <Text
                                    className="font-rubik text-center px-8"
                                    style={{ color: themeColors.textTertiary }}
                                >
                                    Start connecting with event attendees to begin private conversations!
                                </Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default MessagesList;