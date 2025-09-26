// app/(app-screens)/(chat)/direct-chat.tsx
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
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
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

    const scrollViewRef = useRef<KeyboardAwareScrollView>(null);

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
        emptyStateText: activeTheme === 'light' ? '#6b7280' : '#9ca3af'
    };

    useEffect(() => {
        if (!recipientId || !user) return;

        // Generate conversation ID using chat service
        const convId = chatService.generateConversationId(user.uid, recipientId);
        setConversationId(convId);

        // Subscribe to direct messages
        const unsubscribe = chatService.subscribeToDirectMessages(convId, (newMessages) => {
            setMessages(newMessages);
            setLoading(false);

            // Scroll to bottom when new messages arrive
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd(true);
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
                recipientName || 'User',
                recipientPhone || '',
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

        const timeDiff = currentMessage.timestamp - previousMessage.timestamp;
        const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

        return (
            currentMessage.senderId === previousMessage.senderId &&
            timeDiff < fiveMinutes
        );
    };

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: themeColors.background }}>
            {/* Header */}
            <View
                className="flex-row items-center justify-between px-6 py-4 border-b"
                style={{ borderBottomColor: themeColors.border }}
            >
                <TouchableOpacity onPress={() => router.back()}>
                    <Feather name="arrow-left" size={24} color={themeColors.text} />
                </TouchableOpacity>
                <View className="flex-1 items-center">
                    <Text
                        className="font-rubik-bold text-lg"
                        style={{ color: themeColors.text }}
                    >
                        {recipientName}
                    </Text>
                    <Text
                        className="font-rubik text-sm"
                        style={{ color: themeColors.textSecondary }}
                    >
                        {recipientPhone}
                    </Text>
                </View>
                <View style={{ width: 24 }} />
            </View>

            {/* Messages and Input - All handled by KeyboardAwareScrollView */}
            <KeyboardAwareScrollView
                ref={scrollViewRef}
                className="flex-1"
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                enableOnAndroid={true}
                enableAutomaticScroll={true}
                extraHeight={150}
                extraScrollHeight={150}
                keyboardOpeningTime={250}
                style={{ flex: 1 }}
            >
                {/* Messages */}
                <View className="flex-1 px-4" style={{ paddingVertical: 16 }}>
                    <View className="space-y-2">
                        {loading ? (
                            <View className="flex-1 items-center justify-center py-12">
                                <ActivityIndicator size="large" color="#e85c29" />
                                <Text
                                    className="font-rubik text-center mt-4"
                                    style={{ color: themeColors.textSecondary }}
                                >
                                    Loading messages...
                                </Text>
                            </View>
                        ) : messages.length === 0 ? (
                            <View className="flex-1 items-center justify-center py-12">
                                <Feather name="message-circle" size={48} color={themeColors.emptyStateText} />
                                <Text
                                    className="font-rubik-medium text-lg text-center mt-4"
                                    style={{ color: themeColors.text }}
                                >
                                    Start your conversation
                                </Text>
                                <Text
                                    className="font-rubik text-center mt-2 px-8"
                                    style={{ color: themeColors.emptyStateText }}
                                >
                                    Send a direct message to {recipientName}
                                </Text>
                            </View>
                        ) : (
                            messages.map((message, index) => (
                                <MessageItem
                                    key={message.id}
                                    message={message}
                                    isConsecutive={isConsecutiveMessage(index)}
                                    showSenderInfo={false}
                                />
                            ))
                        )}
                    </View>
                </View>

                {/* Message Input - Inside KeyboardAwareScrollView */}
                <View
                    className="border-t px-4 py-3"
                    style={{
                        borderTopColor: themeColors.border,
                        backgroundColor: themeColors.background
                    }}
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
                                    borderColor: themeColors.inputBorder,
                                    maxHeight: 100,
                                }}
                                className="px-4 py-3 rounded-2xl font-rubik border"
                                multiline
                                maxLength={500}
                                textAlignVertical="top"
                                onSubmitEditing={sendMessage}
                                blurOnSubmit={false}
                                returnKeyType="send"
                            />
                        </View>

                        <TouchableOpacity
                            onPress={sendMessage}
                            disabled={!inputMessage.trim() || sending}
                            className="w-12 h-12 rounded-full items-center justify-center"
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
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
};

export default DirectChat;