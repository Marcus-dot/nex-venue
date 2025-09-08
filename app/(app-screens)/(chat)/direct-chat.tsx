import MessageItem from '@/components/chat/message-item';
import { TEXT_SIZE } from '@/constants';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { chatService } from '@/services/chat';
import { ChatMessage } from '@/types/chat';
import { Feather } from '@expo/vector-icons';
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
    const { activeTheme } = useTheme();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [conversationId, setConversationId] = useState<string>('');

    const scrollViewRef = useRef<ScrollView>(null);

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
        sendButton: activeTheme === 'light' ? '#9ca3af' : '#6b7280',
        sendButtonActive: '#e85c29',
        emptyStateText: activeTheme === 'light' ? '#6b7280' : '#9ca3af',
        avatarBackground: '#e85c29'
    };

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
            <View
                className="flex-1 items-center justify-center"
                style={{ backgroundColor: themeColors.background }}
            >
                <ActivityIndicator size="large" color="#e85c29" />
                <Text
                    className="font-rubik mt-4"
                    style={{ color: themeColors.text }}
                >
                    Loading chat...
                </Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            className="flex-1"
            style={{ backgroundColor: themeColors.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View
                    className="flex-row items-center p-4 border-b"
                    style={{ borderBottomColor: themeColors.border }}
                >
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Feather name="arrow-left" size={24} color={themeColors.text} />
                    </TouchableOpacity>

                    {/* Recipient info */}
                    <View className="flex-1 flex-row items-center">
                        <View
                            className="w-10 h-10 rounded-full items-center justify-center mr-3"
                            style={{ backgroundColor: themeColors.avatarBackground }}
                        >
                            <Text className="text-white font-rubik-semibold text-sm">
                                {recipientPhone?.slice(-1) || 'U'}
                            </Text>
                        </View>
                        <View>
                            <Text
                                className="font-rubik-semibold text-lg"
                                style={{ color: themeColors.text }}
                            >
                                {recipientName}
                            </Text>
                            <Text
                                className="font-rubik text-sm"
                                style={{ color: themeColors.textSecondary }}
                            >
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
                                <View
                                    className="w-16 h-16 rounded-full items-center justify-center mb-4"
                                    style={{ backgroundColor: themeColors.avatarBackground }}
                                >
                                    <Text className="text-white font-rubik-bold text-2xl">
                                        {recipientPhone?.slice(-1) || 'U'}
                                    </Text>
                                </View>
                                <Text
                                    className="font-rubik-bold text-lg mb-2"
                                    style={{ color: themeColors.text }}
                                >
                                    Start chatting with {recipientName}
                                </Text>
                                <Text
                                    className="font-rubik text-sm text-center px-8"
                                    style={{ color: themeColors.textSecondary }}
                                >
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
                <View
                    className="border-t p-4"
                    style={{ borderTopColor: themeColors.border }}
                >
                    <View className="flex-row items-end space-x-3">
                        <View className="flex-1">
                            <TextInput
                                value={inputMessage}
                                onChangeText={setInputMessage}
                                placeholder={`Message ${recipientName}...`}
                                placeholderTextColor={themeColors.textTertiary}
                                style={{
                                    fontSize: TEXT_SIZE * 0.9,
                                    backgroundColor: themeColors.input,
                                    color: themeColors.inputText,
                                    borderColor: themeColors.inputBorder
                                }}
                                className="px-4 py-3 rounded-2xl font-rubik border"
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
                                : ''
                                }`}
                            style={{
                                backgroundColor: inputMessage.trim() && !sending
                                    ? themeColors.sendButtonActive
                                    : themeColors.sendButton
                            }}
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