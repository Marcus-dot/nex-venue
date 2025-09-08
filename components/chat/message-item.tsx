import { useAuth } from '@/context/auth-context';
import { chatService } from '@/services/chat';
import { ChatMessage } from '@/types/chat';
import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

interface MessageItemProps {
    message: ChatMessage;
    isConsecutive?: boolean; // If previous message was from same sender
    showSenderInfo?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({
    message,
    isConsecutive = false,
    showSenderInfo = true
}) => {
    const { user } = useAuth();

    const isOwnMessage = message.senderId === user?.uid;
    const isSystemMessage = message.type === 'system';

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
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        }
    };

    const handleLongPress = () => {
        if (isOwnMessage && !isSystemMessage) {
            Alert.alert(
                'Message Options',
                'What would you like to do?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delete Message',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                await chatService.deleteMessage(message.id, user!.uid);
                            } catch (error) {
                                Alert.alert('Error', 'Failed to delete message');
                            }
                        }
                    }
                ]
            );
        }
    };

    if (isSystemMessage) {
        return (
            <View className="items-center my-2 px-4">
                <View className="bg-gray-700 px-3 py-2 rounded-full">
                    <Text className="text-gray-300 font-rubik text-xs text-center">
                        {message.message}
                    </Text>
                </View>
                <Text className="text-gray-500 font-rubik text-xs mt-1">
                    {formatTime(message.timestamp)}
                </Text>
            </View>
        );
    }

    return (
        <View className={`px-4 mb-3 ${isConsecutive ? 'mt-1' : 'mt-3'}`}>
            <View className={`flex-row ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <View className={`max-w-[80%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                    {/* Sender name (only if not consecutive and showing sender info) */}
                    {!isConsecutive && showSenderInfo && !isOwnMessage && (
                        <Text className="text-gray-400 font-rubik text-xs mb-1 ml-2">
                            {message.senderName}
                        </Text>
                    )}

                    {/* Message bubble */}
                    <TouchableOpacity
                        onLongPress={handleLongPress}
                        activeOpacity={0.8}
                        className={`px-4 py-3 rounded-2xl ${isOwnMessage
                            ? '' // Will use style prop for background
                            : 'bg-gray-800 border border-gray-700'
                            } ${isConsecutive
                                ? isOwnMessage
                                    ? 'rounded-tr-md'
                                    : 'rounded-tl-md'
                                : ''
                            }`}
                        style={isOwnMessage ? { backgroundColor: '#e85c29' } : {}}
                    >
                        <Text className={`font-rubik ${isOwnMessage ? 'text-white' : 'text-white'}`}>
                            {message.message}
                        </Text>

                        {/* Time and edited indicator */}
                        <View className="flex-row items-center justify-end mt-1">
                            {message.edited && (
                                <Text className={`font-rubik text-xs mr-2 ${isOwnMessage ? 'text-white/70' : 'text-gray-400'
                                    }`}>
                                    edited
                                </Text>
                            )}
                            <Text className={`font-rubik text-xs ${isOwnMessage ? 'text-white/70' : 'text-gray-400'
                                }`}>
                                {formatTime(message.timestamp)}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default MessageItem;