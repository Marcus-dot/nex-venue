import MessageItem from '@/components/chat/message-item';
import { TEXT_SIZE } from '@/constants';
import { useAuth } from '@/context/auth-context';
import { chatService } from '@/services/chat';
import { ChatMessage } from '@/types/chat';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DirectChat = () => {
    const {
        recipientId,
        recipientName,
        recipientPhone
    } = useLocalSearchParams<{
        recipientId: string;
        recipientName: string;
        recipientPhone: string;
    }>();

    const router = useRouter();
    const { user, userProfile } = useAuth();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [conversationId, setConversationId] = useState<string>('');

    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        if (!recipientId || !user) return;

        // Generate conversation ID
        const convId = chatService.generateConversationId(user.uid, recipientId);
        setConversationId(convId);

        // Subscribe to real-time messages
        const unsubscribe = chatService.subscribeToDirectMessages(convId, (newMessages) => {
            setMessages(newMessages);
            setLoading(false);

            // Scroll to bottom when new messages arrive
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        });

        // Update user's online status
        chatService.updateUserPresence(user.uid, true);

        return () => {
            unsubscribe();
            // Update offline status when leaving
            chatService.updateUserPresence(user.uid, false);
        };
    }, [recipientId, user]);

    const sendMessage = async () => {
        if (!inputMessage.trim() || !user || !userProfile || sending) return;

        const messageText = inputMessage.trim();
        setInputMessage('');
        setSending(true);

        try {
            await chatService.sendDirectMessage(
                recipientId!,
                user.uid,
                userProfile.fullName || 'Anonymous',
                userProfile.phoneNumber || '',
                recipientName!,
                recipientPhone!,
                messageText
            );
        } catch (error) {
            console.error('Error sending direct message:', error);
            Alert.alert('Error', 'Failed to send message. Please try again.');
            setInputMessage(messageText); // Restore message on error
        } finally {
            setSending(false);
        }
    };

    const isConsecutiveMessage = (index: number): boolean => {
        if (index === 0) return false;
        const currentMessage = messages[index];
        const previousMessage = messages[index - 1];

        // Check if same sender and messages are within 5 minutes of each other
        return (
            currentMessage.senderId === previousMessage.senderId &&
            currentMessage.timestamp - previousMessage.timestamp < 5 * 60 * 1000 &&
            currentMessage.type !== 'system' &&
            previousMessage.type !== 'system'
        );
    };

    if (loading) {
        return (
            <View className="bg-background flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#ff4306" />
                <Text className="text-white font-rubik mt-4">Loading chat...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            className="bg-background flex-1"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="flex-row items-center p-4 border-b border-gray-700">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Text className="text-white font-rubik text-lg">←</Text>
                    </TouchableOpacity>

                    {/* Recipient info */}
                    <View className="flex-1 flex-row items-center">
                        <View className="w-10 h-10 bg-accent rounded-full items-center justify-center mr-3">
                            <Text className="text-white font-rubik-semibold text-sm">
                                {recipientPhone?.slice(-1) || 'U'}
                            </Text>
                        </View>
                        <View>
                            <Text className="text-white font-rubik-semibold text-lg">
                                {recipientName}
                            </Text>
                            <Text className="text-gray-400 font-rubik text-sm">
                                Direct Message
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Messages */}
                <ScrollView
                    ref={scrollViewRef}
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
                >
                    <View className="py-4">
                        {messages.length === 0 ? (
                            <View className="items-center justify-center py-20">
                                <View className="w-16 h-16 bg-accent rounded-full items-center justify-center mb-4">
                                    <Text className="text-white font-rubik-bold text-2xl">
                                        {recipientPhone?.slice(-1) || 'U'}
                                    </Text>
                                </View>
                                <Text className="text-white font-rubik-bold text-lg mb-2">
                                    Start chatting with {recipientName}
                                </Text>
                                <Text className="text-gray-400 font-rubik text-sm text-center px-8">
                                    This is the beginning of your direct message conversation.
                                </Text>
                            </View>
                        ) : (
                            messages.map((message, index) => (
                                <MessageItem
                                    key={message.id}
                                    message={message}
                                    isConsecutive={isConsecutiveMessage(index)}
                                    showSenderInfo={false} // Don't show sender names in DMs
                                />
                            ))
                        )}
                    </View>
                </ScrollView>

                {/* Message Input */}
                <View className="border-t border-gray-700 p-4">
                    <View className="flex-row items-end space-x-3">
                        <View className="flex-1">
                            <TextInput
                                value={inputMessage}
                                onChangeText={setInputMessage}
                                placeholder={`Message ${recipientName}...`}
                                placeholderTextColor="#9CA3AF"
                                className="bg-gray-800 text-white px-4 py-3 rounded-2xl font-rubik"
                                style={{ fontSize: TEXT_SIZE * 0.9 }}
                                multiline
                                maxLength={500}
                                textAlignVertical="center"
                                onSubmitEditing={sendMessage}
                                blurOnSubmit={false}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={sendMessage}
                            disabled={!inputMessage.trim() || sending}
                            className={`w-12 h-12 rounded-full items-center justify-center ${inputMessage.trim() && !sending
                                    ? 'bg-accent'
                                    : 'bg-gray-600'
                                }`}
                        >
                            {sending ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text className="text-white font-rubik-bold text-lg">→</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};

export default DirectChat;