export interface ChatMessage {
    id: string;
    eventId: string;
    senderId: string;
    senderName: string;
    senderPhone: string;
    message: string;
    timestamp: number;
    type: 'text' | 'system';
    edited?: boolean;
    editedAt?: number;
}

export interface ChatRoom {
    id: string; // This will be the eventId
    eventId: string;
    eventTitle: string;
    participants: string[]; // Array of user IDs
    lastMessage?: ChatMessage;
    lastActivity: number;
    isActive: boolean;
}

export interface ChatParticipant {
    uid: string;
    name: string;
    phone: string;
    isOnline: boolean;
    lastSeen: number;
    isTyping?: boolean;
}