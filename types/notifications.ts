export type NotificationType =
    | 'event_message'
    | 'direct_message'
    | 'new_event'
    | 'event_update'
    | 'event_reminder'
    | 'new_attendee';

export interface NotificationPayload {
    type: NotificationType;
    title: string;
    body: string;
    data: {
        type: NotificationType;
        eventId?: string;
        conversationId?: string;
        messageId?: string;
        senderId?: string;
        senderName?: string;
    };
}

export interface SendNotificationRequest {
    userId: string;
    payload: NotificationPayload;
}

// NEW: Added.. these types
export interface StoredNotification {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    data: {
        type: NotificationType;
        eventId?: string;
        conversationId?: string;
        messageId?: string;
        senderId?: string;
        senderName?: string;
    };
    timestamp: number;
    read: boolean;
}