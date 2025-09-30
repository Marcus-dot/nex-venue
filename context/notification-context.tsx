import { notificationService } from '@/services/notifications';
import { NotificationType, StoredNotification } from '@/types/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './auth-context';

interface NotificationContextType {
    hasPermission: boolean;
    fcmToken: string | null;
    requestPermission: () => Promise<boolean>;
    isLoading: boolean;
    notifications: StoredNotification[];
    unreadCount: number;
    markAsRead: (notificationId: string) => Promise<void>;
    clearAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [hasPermission, setHasPermission] = useState(false);
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notifications, setNotifications] = useState<StoredNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Load notifications from storage
    const loadNotifications = async () => {
        try {
            const stored = await AsyncStorage.getItem('notifications');
            if (stored) {
                const parsed: StoredNotification[] = JSON.parse(stored);
                setNotifications(parsed);
                setUnreadCount(parsed.filter(n => !n.read).length);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    // Save notification to storage
    const saveNotification = async (notification: Omit<StoredNotification, 'id' | 'timestamp' | 'read'>) => {
        try {
            const newNotification: StoredNotification = {
                ...notification,
                id: Date.now().toString(),
                timestamp: Date.now(),
                read: false,
            };

            const updated = [newNotification, ...notifications].slice(0, 50); // Keep last 50
            setNotifications(updated);
            setUnreadCount(updated.filter(n => !n.read).length);
            await AsyncStorage.setItem('notifications', JSON.stringify(updated));
        } catch (error) {
            console.error('Error saving notification:', error);
        }
    };

    // Mark notification as read
    const markAsRead = async (notificationId: string) => {
        try {
            const updated = notifications.map(n =>
                n.id === notificationId ? { ...n, read: true } : n
            );
            setNotifications(updated);
            setUnreadCount(updated.filter(n => !n.read).length);
            await AsyncStorage.setItem('notifications', JSON.stringify(updated));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    // Clear all notifications
    const clearAllNotifications = async () => {
        try {
            setNotifications([]);
            setUnreadCount(0);
            await AsyncStorage.removeItem('notifications');
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    };

    // Initialize notifications on mount
    useEffect(() => {
        initializeNotifications();
        loadNotifications();
    }, []);

    // Save token when user logs in
    useEffect(() => {
        if (user && fcmToken) {
            notificationService.saveTokenToFirestore(user.uid, fcmToken);
        }
    }, [user, fcmToken]);

    const initializeNotifications = async () => {
        try {
            // Check existing permission
            const permissionGranted = await notificationService.checkPermission();
            setHasPermission(permissionGranted);

            if (permissionGranted) {
                // Get FCM token
                const token = await notificationService.getToken();
                setFcmToken(token);
            }
        } catch (error) {
            console.error('Error initializing notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const requestPermission = async (): Promise<boolean> => {
        try {
            const granted = await notificationService.requestPermission();
            setHasPermission(granted);

            if (granted) {
                const token = await notificationService.getToken();
                setFcmToken(token);

                // Save to Firestore if user is logged in
                if (user && token) {
                    await notificationService.saveTokenToFirestore(user.uid, token);
                }
            }

            return granted;
        } catch (error) {
            console.error('Error requesting permission:', error);
            return false;
        }
    };

    // Handle navigation based on notification data
    const handleNotificationNavigation = (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        if (!remoteMessage.data) return;

        const { type, eventId, conversationId } = remoteMessage.data;

        // Convert to strings (FCM data comes as string or object)
        const eventIdStr = typeof eventId === 'string' ? eventId : undefined;
        const conversationIdStr = typeof conversationId === 'string' ? conversationId : undefined;

        console.log('Navigating based on notification:', { type, eventIdStr, conversationIdStr });

        try {
            switch (type) {
                case 'event_message':
                    if (eventIdStr) {
                        router.push({
                            pathname: '/(app-screens)/(chat)/event-chat',
                            params: { eventId: eventIdStr }
                        });
                    }
                    break;

                case 'direct_message':
                    if (conversationIdStr) {
                        router.push({
                            pathname: '/(app-screens)/(chat)/direct-chat',
                            params: { conversationId: conversationIdStr }
                        });
                    }
                    break;

                case 'new_event':
                case 'event_update':
                case 'event_reminder':
                case 'new_attendee':
                    if (eventIdStr) {
                        router.push({
                            pathname: '/(app-screens)/(home)/event-screen',
                            params: { eventId: eventIdStr }
                        });
                    }
                    break;

                default:
                    router.push('/(app-screens)/(chat)/messages-list');
                    break;
            }
        } catch (error) {
            console.error('Error navigating from notification:', error);
        }
    };

    // Handle foreground notifications
    useEffect(() => {
        const unsubscribe = messaging().onMessage(async (remoteMessage) => {
            console.log('Foreground notification received:', remoteMessage);

            // Save to local storage
            if (remoteMessage.notification && remoteMessage.data) {
                await saveNotification({
                    type: (remoteMessage.data.type as NotificationType) || 'direct_message',
                    title: remoteMessage.notification.title || 'Notification',
                    body: remoteMessage.notification.body || '',
                    data: remoteMessage.data as any,
                });
            }

            if (remoteMessage.notification) {
                Alert.alert(
                    remoteMessage.notification.title || 'New Notification',
                    remoteMessage.notification.body || '',
                    [
                        {
                            text: 'Dismiss',
                            style: 'cancel',
                        },
                        {
                            text: 'View',
                            onPress: () => handleNotificationNavigation(remoteMessage),
                        },
                    ]
                );
            }
        });

        return unsubscribe;
    }, [notifications]);

    // Handle notification tap when app is in background
    useEffect(() => {
        const unsubscribe = messaging().onNotificationOpenedApp((remoteMessage) => {
            console.log('Notification caused app to open from background:', remoteMessage);
            handleNotificationNavigation(remoteMessage);
        });

        return unsubscribe;
    }, []);

    // Handle notification tap when app was quit
    useEffect(() => {
        messaging()
            .getInitialNotification()
            .then((remoteMessage) => {
                if (remoteMessage) {
                    console.log('Notification caused app to open from quit state:', remoteMessage);
                    handleNotificationNavigation(remoteMessage);
                }
            });
    }, []);

    // Handle token refresh
    useEffect(() => {
        const unsubscribe = messaging().onTokenRefresh(async (token) => {
            console.log('FCM token refreshed:', token);
            setFcmToken(token);

            if (user) {
                await notificationService.saveTokenToFirestore(user.uid, token);
            }
        });

        return unsubscribe;
    }, [user]);

    return (
        <NotificationContext.Provider
            value={{
                hasPermission,
                fcmToken,
                requestPermission,
                isLoading,
                notifications,
                unreadCount,
                markAsRead,
                clearAllNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};