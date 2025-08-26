import BackNav from '@/components/back-nav';
import { useAuth } from '@/context/auth-context';
import { chatService } from '@/services/chat';
import { DirectConversation } from '@/types/chat';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MessagesList = () => {
    const router = useRouter();
    const { user } = useAuth();

    const [conversations, setConversations] = useState<DirectConversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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
                className="bg-gray-800 p-4 rounded-xl mb-3 border border-gray-700"
            >
                <View className="flex-row items-start">
                    <View className="w-12 h-12 bg-accent rounded-full items-center justify-center mr-3">
                        <Text className="text-white font-rubik-semibold">
                            {otherParticipantPhone?.slice(-1) || 'U'}
                        </Text>
                    </View>

                    <View className="flex-1">
                        <View className="flex-row justify-between items-center mb-1">
                            <Text className="text-white font-rubik-semibold text-lg">
                                {otherParticipantName}
                            </Text>
                            {lastMessage && (
                                <Text className="text-gray-400 font-rubik text-xs">
                                    {formatTime(lastMessage.timestamp)}
                                </Text>
                            )}
                        </View>

                        {lastMessage ? (
                            <Text
                                className="text-gray-400 font-rubik text-sm"
                                numberOfLines={2}
                            >
                                {lastMessage.senderId === user.uid ? 'You: ' : ''}{lastMessage.message}
                            </Text>
                        ) : (
                            <Text className="text-gray-500 font-rubik text-sm italic">
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
            <View className="bg-background flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#ff4306" />
                <Text className="text-white font-rubik mt-4">Loading messages...</Text>
            </View>
        );
    }

    return (
        <View className="bg-background flex-1">
            <SafeAreaView className="flex-1">
                <BackNav title="Direct Messages" handlePress={() => router.back()} />

                <ScrollView
                    className="flex-1 px-4"
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor="#ff4306"
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
                                <Text className="text-gray-400 font-rubik text-xl mb-4">
                                    💬 No conversations yet
                                </Text>
                                <Text className="text-gray-500 font-rubik text-center px-8">
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