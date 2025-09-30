import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

export interface NotificationToken {
    token: string;
    userId: string;
    platform: string;
    updatedAt: number;
}

export const notificationService = {
    // Request notification permissions
    requestPermission: async (): Promise<boolean> => {
        try {
            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            console.log('Notification permission status:', authStatus);
            return enabled;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    },

    // Get FCM token
    getToken: async (): Promise<string | null> => {
        try {
            const token = await messaging().getToken();
            console.log('FCM Token:', token);
            return token;
        } catch (error) {
            console.error('Error getting FCM token:', error);
            return null;
        }
    },

    // Save token to Firestore
    saveTokenToFirestore: async (userId: string, token: string): Promise<void> => {
        try {
            const tokenData: NotificationToken = {
                token,
                userId,
                platform: Platform.OS,
                updatedAt: Date.now(),
            };

            await firestore()
                .collection('fcmTokens')
                .doc(userId)
                .set(tokenData, { merge: true });

            console.log('Token saved to Firestore for user:', userId);
        } catch (error) {
            console.error('Error saving token to Firestore:', error);
            throw error;
        }
    },

    // Delete token from Firestore (on logout)
    deleteTokenFromFirestore: async (userId: string): Promise<void> => {
        try {
            await firestore().collection('fcmTokens').doc(userId).delete();
            console.log('Token deleted from Firestore for user:', userId);
        } catch (error) {
            console.error('Error deleting token from Firestore:', error);
        }
    },

    // Check if notifications are enabled
    checkPermission: async (): Promise<boolean> => {
        const authStatus = await messaging().hasPermission();
        return (
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL
        );
    },
};