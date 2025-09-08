import BackNav from '@/components/back-nav';
import MessageItem from '@/components/chat/message-item';
import { TEXT_SIZE } from '@/constants';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
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

const EventChat = () => {
    const { eventId, eventTitle } = useLocalSearchParams<{
        eventId: string;
        eventTitle: string;
    }>();
    const router = useRouter();
    const { user, userProfile } = useAuth();
    const { activeTheme } = useTheme();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

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
        emptyStateText: activeTheme === 'light' ? '#6b7280' : '#9ca3af'
    };

    useEffect(() => {
        if (!eventId || !user) return;

        // Subscribe to real-time messages
        const unsubscribe = chatService.subscribeToMessages(eventId, (newMessages) => {
            setMessages(newMessages);
            setLoading(false);

            // Scroll to bottom when new messages arrive
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        });

        // Initialize chat room (this will create it if it doesn't exist)
        initializeChatRoom();

        // Update user's online status
        chatService.updateUserPresence(user.uid, true);

        return () => {
            unsubscribe();
            // Update offline status when leaving
            chatService.updateUserPresence(user.uid, false);
        };
    }, [eventId, user]);

    const initializeChatRoom = async () => {
        if (!eventId || !user) return;

        try {
            // Create or update chat room with current user as participant
            // Note: In a real app, you'd get the full participants list from the event
            await chatService.createOrUpdateChatRoom(
                eventId,
                eventTitle || 'Event Chat',
                [user.uid]
            );
        } catch (error) {
            console.error('Error initializing chat room:', error);
        }
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || !user || !userProfile || sending) return;

        const messageText = inputMessage.trim();
        setInputMessage('');
        setSending(true);

        try {
            await chatService.sendMessage(
                eventId!,
                user.uid,
                userProfile.fullName || 'Anonymous',
                userProfile.phoneNumber || '',
                messageText
            );
        } catch (error) {
            console.error('Error sending message:', error);
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
                <BackNav
                    title={eventTitle || 'Event Chat'}
                    handlePress={() => router.back()}
                    backgroundColor={themeColors.background}
                    textColor={themeColors.text}
                    iconColor={themeColors.text}
                    elevation={true}
                />

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
                                <Text
                                    className="font-rubik text-lg mb-2"
                                    style={{ color: themeColors.emptyStateText }}
                                >
                                    No messages yet
                                </Text>
                                <Text
                                    className="font-rubik text-sm text-center px-8"
                                    style={{ color: themeColors.textTertiary }}
                                >
                                    Start a conversation with other event attendees!
                                </Text>
                            </View>
                        ) : (
                            messages.map((message, index) => (
                                <MessageItem
                                    key={message.id}
                                    message={message}
                                    isConsecutive={isConsecutiveMessage(index)}
                                    showSenderInfo={true}
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
                                placeholder="Type your message..."
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

export default EventChat;