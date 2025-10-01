import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v1';

admin.initializeApp();

// Helper function to send notification to a user
async function sendNotificationToUser(
    userId: string,
    title: string,
    body: string,
    data: { [key: string]: string }
): Promise<void> {
    try {
        const tokenDoc = await admin.firestore()
            .collection('fcmTokens')
            .doc(userId)
            .get();

        if (!tokenDoc.exists) {
            console.log('No FCM token found for user:', userId);
            return;
        }

        const token = tokenDoc.data()?.token;

        await admin.messaging().send({
            notification: { title, body },
            data,
            token,
        });

        console.log('Notification sent to user:', userId);
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

// Trigger on new message in event chat
export const onEventMessageCreated = functions.firestore
    .document('messages/{messageId}')
    .onCreate(async (snap) => {
        const message = snap.data();

        // Only process event messages, not direct messages
        if (!message.eventId || message.senderId === 'system') {
            return null;
        }

        try {
            // Get chat room to find participants
            const chatRoomDoc = await admin.firestore()
                .collection('chatRooms')
                .doc(message.eventId)
                .get();

            if (!chatRoomDoc.exists) {
                console.log('Chat room not found');
                return null;
            }

            const chatRoom = chatRoomDoc.data();
            const participants = chatRoom?.participants || [];

            // Get event details
            const eventDoc = await admin.firestore()
                .collection('events')
                .doc(message.eventId)
                .get();

            const eventTitle = eventDoc.data()?.title || 'Event';

            // Send notification to all participants except sender
            const notificationPromises = participants
                .filter((userId: string) => userId !== message.senderId)
                .map((userId: string) =>
                    sendNotificationToUser(
                        userId,
                        eventTitle,
                        `${message.senderName}: ${message.message.substring(0, 100)}`,
                        {
                            type: 'event_message',
                            eventId: message.eventId,
                            senderName: message.senderName,
                        }
                    )
                );

            await Promise.all(notificationPromises);
            console.log('Event message notifications sent');
            return null;
        } catch (error) {
            console.error('Error sending event message notifications:', error);
            return null;
        }
    });

// Trigger on new direct message
export const onDirectMessageCreated = functions.firestore
    .document('messages/{messageId}')
    .onCreate(async (snap) => {
        const message = snap.data();

        // Only process direct messages (have conversationId but no eventId)
        if (message.eventId || !message.conversationId || message.senderId === 'system') {
            return null;
        }

        try {
            // Get conversation to find recipient
            const conversationDoc = await admin.firestore()
                .collection('directConversations')
                .doc(message.conversationId)
                .get();

            if (!conversationDoc.exists) {
                console.log('Conversation not found');
                return null;
            }

            const conversation = conversationDoc.data();
            const participants = conversation?.participants || [];

            // Find recipient (the participant who is not the sender)
            const recipientId = participants.find((id: string) => id !== message.senderId);

            if (!recipientId) {
                console.log('Recipient not found');
                return null;
            }

            // Send notification to recipient
            await sendNotificationToUser(
                recipientId,
                message.senderName,
                message.message.substring(0, 100),
                {
                    type: 'direct_message',
                    conversationId: message.conversationId,
                    senderName: message.senderName,
                }
            );

            console.log('Direct message notification sent');
            return null;
        } catch (error) {
            console.error('Error sending direct message notification:', error);
            return null;
        }
    });

// Trigger on new event attendee
export const onEventAttendeeAdded = functions.firestore
    .document('events/{eventId}')
    .onUpdate(async (change) => {
        const beforeData = change.before.data();
        const afterData = change.after.data();
        const eventId = change.after.id;

        // Check if attendees array changed
        const beforeAttendees = beforeData.attendees || [];
        const afterAttendees = afterData.attendees || [];

        if (afterAttendees.length <= beforeAttendees.length) {
            return null;
        }

        // Find new attendees
        const newAttendees = afterAttendees.filter(
            (id: string) => !beforeAttendees.includes(id)
        );

        if (newAttendees.length === 0) {
            return null;
        }

        try {
            // Get new attendee's name
            const attendeeDoc = await admin.firestore()
                .collection('users')
                .doc(newAttendees[0])
                .get();

            const attendeeName = attendeeDoc.data()?.fullName || 'Someone';

            // Send notification to event creator
            await sendNotificationToUser(
                afterData.creatorId,
                `New Attendee for ${afterData.title}`,
                `${attendeeName} is now attending your event`,
                {
                    type: 'new_attendee',
                    eventId: eventId,
                    attendeeName: attendeeName,
                }
            );

            console.log('New attendee notification sent');
            return null;
        } catch (error) {
            console.error('Error sending new attendee notification:', error);
            return null;
        }
    });