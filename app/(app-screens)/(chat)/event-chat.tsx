// app/(app-screens)/(chat)/event-chat.tsx
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
    Dimensions,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
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

    // Dynamic screen dimensions
    const [screenData, setScreenData] = useState(Dimensions.get('window'));

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

    // Listen for dimension changes
    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setScreenData(window);
        });

        return () => subscription?.remove();
    }, []);

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

        const timeDiff = currentMessage.timestamp - previousMessage.timestamp;
        const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

        return (
            currentMessage.senderId === previousMessage.senderId &&
            timeDiff < fiveMinutes
        );
    };

    // Calculate dynamic keyboard spacing based on screen height
    const dynamicExtraHeight = Math.max(150, screenData.height * 0.2); // 20% of screen height, minimum 150
    const dynamicExtraScrollHeight = Math.max(120, screenData.height * 0.15); // 15% of screen height, minimum 120

    return (
        <KeyboardAwareScrollView
            contentContainerStyle={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid={true}
            enableAutomaticScroll={true}
            extraHeight={dynamicExtraHeight}
            extraScrollHeight={dynamicExtraScrollHeight}
            keyboardOpeningTime={250}
            style={{ height: screenData.height, backgroundColor: themeColors.background }}
        >
            <SafeAreaView style={{ width: '100%', height: '100%', backgroundColor: themeColors.background }}>
                {/* Header */}
                <View
                    className="flex-row items-center justify-between px-6 py-4 border-b"
                    style={{ borderBottomColor: themeColors.border }}
                >
                    <TouchableOpacity onPress={() => router.back()}>
                        <Feather name="arrow-left" size={24} color={themeColors.text} />
                    </TouchableOpacity>
                    <Text
                        className="font-rubik-bold text-lg"
                        style={{ color: themeColors.text }}
                    >
                        {eventTitle || 'Event Chat'}
                    </Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Messages */}
                <View className="flex-1">
                    <ScrollView
                        ref={scrollViewRef}
                        className="flex-1 px-4"
                        contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
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
                                        Start the conversation!
                                    </Text>
                                    <Text
                                        className="font-rubik text-center mt-2"
                                        style={{ color: themeColors.emptyStateText }}
                                    >
                                        Be the first to send a message in this chat.
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
                </View>

                {/* Message Input */}
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
                                placeholder="Type your message..."
                                placeholderTextColor={themeColors.textTertiary}
                                style={{
                                    fontSize: TEXT_SIZE * 0.9,
                                    backgroundColor: themeColors.input,
                                    color: themeColors.inputText,
                                    borderColor: themeColors.inputBorder,
                                    maxHeight: Math.min(100, screenData.height * 0.12), // Dynamic max height: 12% of screen or 100px max
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
            </SafeAreaView>
        </KeyboardAwareScrollView>
    );
};

export default EventChat;