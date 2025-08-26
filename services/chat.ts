import { ChatMessage, ChatRoom, DirectConversation } from '@/types/chat';
import firestore from '@react-native-firebase/firestore';

export const chatService = {
    // Generate conversation ID for direct messages (consistent regardless of order)
    generateConversationId: (userId1: string, userId2: string): string => {
        const sortedIds = [userId1, userId2].sort();
        return `dm_${sortedIds[0]}_${sortedIds[1]}`;
    },

    // Send a message to an event chat room
    sendMessage: async (
        eventId: string,
        senderId: string,
        senderName: string,
        senderPhone: string,
        message: string
    ): Promise<string> => {
        try {
            const messageData: Omit<ChatMessage, 'id'> = {
                eventId,
                conversationId: eventId, // For group chats, conversationId = eventId
                senderId,
                senderName,
                senderPhone,
                message: message.trim(),
                timestamp: Date.now(),
                type: 'text'
            };

            const docRef = await firestore()
                .collection('messages')
                .add(messageData);

            // Update chat room's last activity
            await chatService.updateChatRoomActivity(eventId, messageData);

            return docRef.id;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    // Send a direct message
    sendDirectMessage: async (
        recipientId: string,
        senderId: string,
        senderName: string,
        senderPhone: string,
        recipientName: string,
        recipientPhone: string,
        message: string
    ): Promise<string> => {
        try {
            const conversationId = chatService.generateConversationId(senderId, recipientId);

            const messageData: Omit<ChatMessage, 'id'> = {
                conversationId,
                senderId,
                senderName,
                senderPhone,
                message: message.trim(),
                timestamp: Date.now(),
                type: 'text'
            };

            const docRef = await firestore()
                .collection('messages')
                .add(messageData);

            // Create or update direct conversation
            await chatService.createOrUpdateDirectConversation(
                conversationId,
                [senderId, recipientId],
                {
                    [senderId]: senderName,
                    [recipientId]: recipientName
                },
                {
                    [senderId]: senderPhone,
                    [recipientId]: recipientPhone
                },
                messageData
            );

            return docRef.id;
        } catch (error) {
            console.error('Error sending direct message:', error);
            throw error;
        }
    },

    // Listen to real-time messages for an event
    subscribeToMessages: (eventId: string, callback: (messages: ChatMessage[]) => void) => {
        return firestore()
            .collection('messages')
            .where('eventId', '==', eventId)
            .orderBy('timestamp', 'asc')
            .onSnapshot(
                (snapshot) => {
                    const messages = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as ChatMessage[];
                    callback(messages);
                },
                (error) => {
                    console.error('Error listening to messages:', error);
                }
            );
    },

    // Listen to real-time direct messages
    subscribeToDirectMessages: (conversationId: string, callback: (messages: ChatMessage[]) => void) => {
        return firestore()
            .collection('messages')
            .where('conversationId', '==', conversationId)
            .orderBy('timestamp', 'asc')
            .onSnapshot(
                (snapshot) => {
                    const messages = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as ChatMessage[];
                    callback(messages);
                },
                (error) => {
                    console.error('Error listening to direct messages:', error);
                }
            );
    },

    // Create or update direct conversation
    createOrUpdateDirectConversation: async (
        conversationId: string,
        participants: string[],
        participantNames: { [userId: string]: string },
        participantPhones: { [userId: string]: string },
        lastMessage?: Omit<ChatMessage, 'id'>
    ): Promise<void> => {
        try {
            const conversationRef = firestore().collection('directConversations').doc(conversationId);
            const conversation = await conversationRef.get();

            const conversationData: Omit<DirectConversation, 'id' | 'lastMessage'> = {
                participants,
                participantNames,
                participantPhones,
                lastActivity: Date.now(),
                isActive: true,
                createdAt: conversation.exists() ? conversation.data()?.createdAt : Date.now()
            };

            if (conversation.exists()) {
                // Update existing conversation
                await conversationRef.update({
                    ...conversationData,
                    ...(lastMessage && { lastMessage })
                });
            } else {
                // Create new conversation
                await conversationRef.set({
                    ...conversationData,
                    ...(lastMessage && { lastMessage })
                });
            }
        } catch (error) {
            console.error('Error creating/updating direct conversation:', error);
            throw error;
        }
    },

    // Get user's direct conversations
    getUserDirectConversations: async (userId: string): Promise<DirectConversation[]> => {
        try {
            const snapshot = await firestore()
                .collection('directConversations')
                .where('participants', 'array-contains', userId)
                .where('isActive', '==', true)
                .orderBy('lastActivity', 'desc')
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as DirectConversation[];
        } catch (error) {
            console.error('Error fetching direct conversations:', error);
            return [];
        }
    },

    // Listen to user's direct conversations
    subscribeToUserDirectConversations: (userId: string, callback: (conversations: DirectConversation[]) => void) => {
        return firestore()
            .collection('directConversations')
            .where('participants', 'array-contains', userId)
            .where('isActive', '==', true)
            .orderBy('lastActivity', 'desc')
            .onSnapshot(
                (snapshot) => {
                    const conversations = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as DirectConversation[];
                    callback(conversations);
                },
                (error) => {
                    console.error('Error listening to direct conversations:', error);
                }
            );
    },

    // Create or update chat room for an event
    createOrUpdateChatRoom: async (
        eventId: string,
        eventTitle: string,
        participants: string[]
    ): Promise<void> => {
        try {
            const chatRoomRef = firestore().collection('chatRooms').doc(eventId);
            const chatRoom = await chatRoomRef.get();

            const chatRoomData: Omit<ChatRoom, 'id' | 'lastMessage'> = {
                eventId,
                eventTitle,
                participants,
                lastActivity: Date.now(),
                isActive: true
            };

            if (chatRoom.exists()) {
                // Update existing chat room
                await chatRoomRef.update({
                    participants,
                    lastActivity: Date.now()
                });
            } else {
                // Create new chat room
                await chatRoomRef.set(chatRoomData);

                // Send welcome message
                await chatService.sendSystemMessage(
                    eventId,
                    `Welcome to the ${eventTitle} chat! Connect with other attendees here.`
                );
            }
        } catch (error) {
            console.error('Error creating/updating chat room:', error);
            throw error;
        }
    },

    // Send system message
    sendSystemMessage: async (eventId: string, message: string): Promise<void> => {
        try {
            const messageData: Omit<ChatMessage, 'id'> = {
                eventId,
                conversationId: eventId,
                senderId: 'system',
                senderName: 'System',
                senderPhone: '',
                message,
                timestamp: Date.now(),
                type: 'system'
            };

            await firestore()
                .collection('messages')
                .add(messageData);
        } catch (error) {
            console.error('Error sending system message:', error);
            throw error;
        }
    },

    // Update chat room activity
    updateChatRoomActivity: async (eventId: string, lastMessage: Omit<ChatMessage, 'id'>): Promise<void> => {
        try {
            await firestore()
                .collection('chatRooms')
                .doc(eventId)
                .update({
                    lastActivity: Date.now(),
                    lastMessage: lastMessage
                });
        } catch (error) {
            console.error('Error updating chat room activity:', error);
        }
    },

    // Get chat rooms for user (events they're attending)
    getUserChatRooms: async (userId: string): Promise<ChatRoom[]> => {
        try {
            const snapshot = await firestore()
                .collection('chatRooms')
                .where('participants', 'array-contains', userId)
                .where('isActive', '==', true)
                .orderBy('lastActivity', 'desc')
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ChatRoom[];
        } catch (error) {
            console.error('Error fetching chat rooms:', error);
            return [];
        }
    },

    // Delete message (sender only)
    deleteMessage: async (messageId: string, senderId: string): Promise<void> => {
        try {
            const messageRef = firestore().collection('messages').doc(messageId);
            const message = await messageRef.get();

            if (!message.exists()) {
                throw new Error('Message not found');
            }

            const messageData = message.data() as ChatMessage;
            if (messageData.senderId !== senderId) {
                throw new Error('You can only delete your own messages');
            }

            await messageRef.delete();
        } catch (error) {
            console.error('Error deleting message:', error);
            throw error;
        }
    },

    // Update user's online status
    updateUserPresence: async (userId: string, isOnline: boolean): Promise<void> => {
        try {
            await firestore()
                .collection('users')
                .doc(userId)
                .update({
                    isOnline,
                    lastSeen: Date.now()
                });
        } catch (error) {
            console.error('Error updating user presence:', error);
        }
    }
};