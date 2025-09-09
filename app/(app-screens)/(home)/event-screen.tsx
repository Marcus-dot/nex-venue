// (app-screens)/(home)/event-screen.tsx
import AgendaFormModal from '@/components/agenda/agenda-form-modal';
import AgendaList from '@/components/agenda/agenda-list';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { chatService } from '@/services/chat';
import type { AgendaItem } from '@/types/agenda';
import type { UserProfile } from '@/types/auth';
import type { Event } from '@/types/events';
import { Feather } from '@expo/vector-icons';
import firestore from '@react-native-firebase/firestore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AttendeeInfo {
  uid: string;
  fullName: string;
  phoneNumber: string;
  avatar: string | null;
}

const EventScreen = () => {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const { user, isAdmin, userProfile } = useAuth();
  const { activeTheme } = useTheme();

  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<AttendeeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const [isAttending, setIsAttending] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [imageRetryCount, setImageRetryCount] = useState(0);

  // Agenda related state
  const [activeTab, setActiveTab] = useState<'details' | 'agenda' | 'attendees' | 'chat'>('details');
  const [showAgendaForm, setShowAgendaForm] = useState(false);
  const [editingAgendaItem, setEditingAgendaItem] = useState<AgendaItem | null>(null);
  const [currentAgendaItem, setCurrentAgendaItem] = useState<string | undefined>();

  const MAX_IMAGE_RETRY = 2;

  // Theme-aware colors
  const themeColors = {
    background: activeTheme === 'light' ? '#D8D9D4' : '#161616',
    surface: activeTheme === 'light' ? '#ffffff' : '#374151',
    surfaceSecondary: activeTheme === 'light' ? '#f3f4f6' : '#1f2937',
    text: activeTheme === 'light' ? '#1f2937' : '#ffffff',
    textSecondary: activeTheme === 'light' ? '#6b7280' : '#d1d5db',
    textTertiary: activeTheme === 'light' ? '#9ca3af' : '#9CA3AF',
    border: activeTheme === 'light' ? '#e5e7eb' : '#374151',
    skeletonBg: activeTheme === 'light' ? '#e5e7eb' : '#374151',
    tabBackground: activeTheme === 'light' ? '#f3f4f6' : '#374151',
    tabBorder: activeTheme === 'light' ? '#e5e7eb' : '#374151',
    imageBackground: activeTheme === 'light' ? '#f3f4f6' : '#374151',
    attendeeCardBg: activeTheme === 'light' ? '#f9fafb' : '#374151',
    locationColor: activeTheme === 'light' ? '#6b7280' : '#9CA3AF',
    // Tab colors
    tabContainerBg: activeTheme === 'light' ? '#ffffff' : '#222551',
    tabContainerBorder: activeTheme === 'light' ? 'rgba(229, 231, 235, 0.6)' : 'rgba(75, 85, 99, 0.6)',
    tabShadow: activeTheme === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.25)',
    tabInactive: activeTheme === 'light' ? '#f8fafc' : '#374151',
    tabInactiveText: activeTheme === 'light' ? '#64748b' : '#94a3b8',
    tabActiveGradientStart: '#e85c29',
    tabActiveGradientEnd: '#dc2626',
    tabHover: activeTheme === 'light' ? '#f1f5f9' : '#475569'
  };

  const fetchEventDetails = async () => {
    if (!eventId || !user) return;

    try {
      const eventDoc = await firestore().collection('events').doc(eventId).get();

      if (!eventDoc.exists) {
        Alert.alert('Error', 'Event not found');
        router.back();
        return;
      }

      const eventData = {
        id: eventDoc.id,
        ...eventDoc.data()
      } as Event & { currentAgendaItem?: string };

      setEvent(eventData);
      setIsAttending(eventData.attendees.includes(user.uid));
      setCurrentAgendaItem(eventData.currentAgendaItem);

      // Reset image states when event changes
      if (eventData.imageUrl) {
        setImageLoading(true);
        setImageError(false);
        setImageRetryCount(0);
      }

      // Fetch attendee details
      if (eventData.attendees.length > 0) {
        await fetchAttendeeDetails(eventData.attendees);
      }

      // Initialize chat room for this event if user is attending
      if (eventData.attendees.includes(user.uid)) {
        await initializeChatRoom(eventData);
      }

      // Set up real-time listener for event updates (for current agenda item)
      const unsubscribe = firestore()
        .collection('events')
        .doc(eventId)
        .onSnapshot((doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setCurrentAgendaItem(data?.currentAgendaItem);
          }
        });

      // Return cleanup function
      return unsubscribe;
    } catch (error) {
      console.error('Error fetching event details:', error);
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const initializeChatRoom = async (eventData: Event) => {
    try {
      await chatService.createOrUpdateChatRoom(
        eventData.id,
        eventData.title,
        eventData.attendees
      );
    } catch (error) {
      console.error('Error initializing chat room:', error);
    }
  };

  const fetchAttendeeDetails = async (attendeeIds: string[]) => {
    setAttendeesLoading(true);
    try {
      const attendeePromises = attendeeIds.map(async (uid) => {
        const userDoc = await firestore().collection('users').doc(uid).get();
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          return {
            uid,
            fullName: userData.fullName || "Anonymous",
            phoneNumber: userData.phoneNumber || 'Anonymous',
            avatar: userData.avatar || null
          };
        }
        return {
          uid,
          fullName: "Unknown User",
          phoneNumber: 'Unknown User',
          avatar: null
        };
      });

      const attendeeDetails = await Promise.all(attendeePromises);
      setAttendees(attendeeDetails);
    } catch (error) {
      console.error('Error fetching attendee details:', error);
    } finally {
      setAttendeesLoading(false);
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupEventDetails = async () => {
      const cleanup = await fetchEventDetails();
      unsubscribe = cleanup;
    };

    setupEventDetails();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [eventId, user]);

  const handleAttendEvent = async () => {
    if (!event || !user || actionLoading) return;

    // Prevent user from attending their own event
    if (event.creatorId === user.uid) {
      Alert.alert('Cannot Attend', 'You cannot attend your own event.');
      return;
    }

    setActionLoading(true);
    try {
      const eventRef = firestore().collection('events').doc(event.id);

      if (isAttending) {
        // Remove from attendees
        await eventRef.update({
          attendees: firestore.FieldValue.arrayRemove(user.uid)
        });

        setIsAttending(false);
        setEvent(prev => prev ? { ...prev, attendees: prev.attendees.filter(id => id !== user.uid) } : null);
        setAttendees(prev => prev.filter(attendee => attendee.uid !== user.uid));

        Alert.alert('Success', 'You are no longer attending this event.');
      } else {
        // Add to attendees
        await eventRef.update({
          attendees: firestore.FieldValue.arrayUnion(user.uid)
        });

        setIsAttending(true);
        const updatedEvent = { ...event, attendees: [...event.attendees, user.uid] };
        setEvent(updatedEvent);

        // Add current user to attendees list
        const userDoc = await firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          setAttendees(prev => [...prev, {
            uid: user.uid,
            fullName: userData.fullName || "You",
            phoneNumber: userData.phoneNumber || 'You',
            avatar: userData.avatar || null
          }]);
        }

        // Initialize chat room now that user is attending
        await initializeChatRoom(updatedEvent);

        Alert.alert('Success', 'You are now attending this event!');
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      Alert.alert('Error', 'Failed to update attendance. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditAgendaItem = (item: AgendaItem) => {
    setEditingAgendaItem(item);
    setShowAgendaForm(true);
  };

  const handleCloseAgendaForm = () => {
    setShowAgendaForm(false);
    setEditingAgendaItem(null);
  };

  const handleOpenChat = () => {
    if (!isAttending && event?.creatorId !== user?.uid) {
      Alert.alert(
        'Join Event First',
        'You need to attend this event to access the chat.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Attend Event', onPress: handleAttendEvent }
        ]
      );
      return;
    }

    router.push({
      pathname: '/(app-screens)/(chat)/event-chat' as any,
      params: {
        eventId: eventId!,
        eventTitle: event?.title || 'Event Chat'
      }
    });
  };

  const handleImageRetry = () => {
    if (imageRetryCount < MAX_IMAGE_RETRY) {
      setImageRetryCount(prev => prev + 1);
      setImageError(false);
      setImageLoading(true);
    }
  };

  const EventImage = ({ event }: { event: Event }) => {
    if (!event.imageUrl) return null;

    return (
      <View
        className="mb-6 rounded-xl overflow-hidden"
        style={{ backgroundColor: themeColors.imageBackground }}
      >
        <View style={{ height: SCREEN_WIDTH * 0.6, position: 'relative' }}>
          {/* Main Image */}
          <Image
            source={{ uri: event.imageUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            onLoadStart={() => {
              setImageLoading(true);
              setImageError(false);
            }}
            onLoad={() => {
              setImageLoading(false);
              setImageError(false);
            }}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
          />

          {/* Loading Overlay */}
          {imageLoading && (
            <View
              className="absolute inset-0 items-center justify-center"
              style={{ backgroundColor: themeColors.imageBackground }}
            >
              <ActivityIndicator size="large" color="#e85c29" />
              <Text
                className="font-rubik text-sm mt-2"
                style={{ color: themeColors.textSecondary }}
              >
                Loading image...
              </Text>
            </View>
          )}

          {/* Error Overlay */}
          {imageError && !imageLoading && (
            <View
              className="absolute inset-0 items-center justify-center p-6"
              style={{ backgroundColor: themeColors.imageBackground }}
            >
              <Feather name="image" size={48} color={themeColors.textTertiary} />
              <Text
                className="font-rubik text-base mt-4 text-center"
                style={{ color: themeColors.textSecondary }}
              >
                Unable to load event image
              </Text>
              {imageRetryCount < MAX_IMAGE_RETRY && (
                <TouchableOpacity
                  onPress={handleImageRetry}
                  className="bg-accent px-4 py-2 rounded-lg mt-4"
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-rubik-medium">Retry</Text>
                </TouchableOpacity>
              )}
              {imageRetryCount >= MAX_IMAGE_RETRY && (
                <Text
                  className="font-rubik text-xs mt-2 text-center"
                  style={{ color: themeColors.textTertiary }}
                >
                  Maximum retry attempts reached
                </Text>
              )}
            </View>
          )}

          {/* Image Description Overlay */}
          {!imageLoading && !imageError && event.imageDescription && (
            <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <View className="flex-row items-start">
                <Feather name="info" size={16} color="white" />
                <Text className="text-white font-rubik text-sm ml-2 flex-1 leading-5">
                  {event.imageDescription}
                </Text>
              </View>
            </View>
          )}

          {/* Image Quality Indicator */}
          {!imageLoading && !imageError && (
            <View className="absolute top-3 right-3">
              <View className="bg-black/50 px-2 py-1 rounded-full flex-row items-center">
                <Feather name="image" size={12} color="white" />
                <Text className="text-white font-rubik text-xs ml-1">HD</Text>
              </View>
            </View>
          )}
        </View>

        {/* Image Actions */}
        {!imageLoading && !imageError && (
          <View
            className="p-3 flex-row justify-between items-center"
            style={{ backgroundColor: themeColors.surface }}
          >
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => {
                Alert.alert(
                  'Event Image',
                  event.imageDescription || 'Featured image for this event',
                  [{ text: 'OK' }]
                );
              }}
            >
              <Feather name="info" size={16} color={themeColors.textTertiary} />
              <Text
                className="font-rubik text-sm ml-2"
                style={{ color: themeColors.textSecondary }}
              >
                Image Info
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => {
                // In a real app, you might implement image sharing or full-screen view
                Alert.alert('Coming Soon', 'Image viewing features will be available in the next update.');
              }}
            >
              <Feather name="maximize-2" size={16} color={themeColors.textTertiary} />
              <Text
                className="font-rubik text-sm ml-2"
                style={{ color: themeColors.textSecondary }}
              >
                View Full
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const AttendeeCard = ({ attendee }: { attendee: AttendeeInfo }) => {
    const handleConnect = (attendee: AttendeeInfo) => {
      Alert.alert(
        `Connect with ${attendee.fullName}`,
        `Choose how you'd like to connect with ${attendee.fullName}:`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'View Contact',
            onPress: () => {
              Alert.alert(
                'Contact Information',
                `Name: ${attendee.fullName}\nPhone: ${attendee.phoneNumber}`,
                [
                  { text: 'Close', style: 'cancel' },
                  {
                    text: 'Start Chat',
                    onPress: () => {
                      router.push({
                        pathname: '/(app-screens)/(chat)/direct-chat' as any,
                        params: {
                          recipientId: attendee.uid,
                          recipientName: attendee.fullName,
                          recipientPhone: attendee.phoneNumber
                        }
                      });
                    }
                  }
                ]
              );
            }
          },
          {
            text: 'Start Direct Chat',
            onPress: () => {
              router.push({
                pathname: '/(app-screens)/(chat)/direct-chat' as any,
                params: {
                  recipientId: attendee.uid,
                  recipientName: attendee.fullName,
                  recipientPhone: attendee.phoneNumber
                }
              });
            }
          },
          {
            text: 'Share My Info',
            onPress: () => {
              Alert.alert(
                'Share Contact Info',
                `Your contact information:\nName: ${userProfile?.fullName || 'Anonymous'}\nPhone: ${userProfile?.phoneNumber || 'Not available'}\n\nNote: Contact sharing notifications will be added in a future update.`,
                [{ text: 'OK' }]
              );
            }
          }
        ]
      );
    };

    return (
      <View
        className="p-3 rounded-lg flex-row items-center mb-2"
        style={{ backgroundColor: themeColors.attendeeCardBg }}
      >
        <View className="w-10 h-10 bg-accent rounded-full items-center justify-center mr-3">
          <Text className="text-white font-rubik-semibold text-sm">
            {attendee.phoneNumber.slice(attendee.phoneNumber.length - 1)}
          </Text>
        </View>
        <View className="flex-1">
          <Text
            className="font-rubik-medium"
            style={{ color: themeColors.text }}
          >
            {attendee.uid === user?.uid ? 'You' : attendee.fullName}
          </Text>
          <Text
            className="font-rubik text-sm"
            style={{ color: themeColors.textSecondary }}
          >
            {attendee.uid === user?.uid ? 'You' : 'Attendee'}
          </Text>
        </View>

        {/* Connect button with functionality */}
        {attendee.uid !== user?.uid && (
          <TouchableOpacity
            onPress={() => handleConnect(attendee)}
            className="bg-accent px-3 py-1 rounded-lg"
          >
            <Text className="text-white font-rubik-medium text-sm">Connect</Text>
          </TouchableOpacity>
        )}
      </View>
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
          Loading event...
        </Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: themeColors.background }}
      >
        <Feather name="alert-circle" size={48} color={themeColors.textTertiary} />
        <Text
          className="font-rubik text-xl mt-4 mb-2"
          style={{ color: themeColors.text }}
        >
          Event not found
        </Text>
        <Text
          className="font-rubik text-center mb-6 px-8"
          style={{ color: themeColors.textSecondary }}
        >
          This event may have been removed or you don't have access to it.
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="bg-accent px-6 py-3 rounded-xl">
          <Text className="text-white font-rubik-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isCreator = event.creatorId === user?.uid;
  const canAccessChat = isAttending || isCreator;

  return (
    <View className="flex-1" style={{ backgroundColor: themeColors.background }}>
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View
          className="flex-row items-center justify-between p-4 border-b"
          style={{ borderBottomColor: themeColors.border }}
        >
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Feather name="arrow-left" size={24} color={themeColors.text} />
          </TouchableOpacity>
          <Text
            className="font-rubik-bold text-xl flex-1"
            style={{ color: themeColors.text }}
          >
            Event Details
          </Text>
          {isAdmin && activeTab === 'agenda' && (
            <TouchableOpacity
              onPress={() => setShowAgendaForm(true)}
              className="bg-accent px-3 py-2 rounded-lg"
            >
              <Text className="text-white font-rubik-medium text-sm">Add Item</Text>
            </TouchableOpacity>
          )}
          {activeTab === 'chat' && canAccessChat && (
            <TouchableOpacity
              onPress={handleOpenChat}
              className="bg-accent px-3 py-2 rounded-lg"
            >
              <Text className="text-white font-rubik-medium text-sm">Open Chat</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tab Navigation - Responsive Container with Scrollable Tabs */}
        <View className="mb-6 mt-4 px-4">
          <View
            className="w-full rounded-2xl p-1.5 border"
            style={{
              backgroundColor: themeColors.tabContainerBg,
              borderColor: themeColors.tabContainerBorder,
              shadowColor: themeColors.tabShadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              bounces={false}
              decelerationRate="fast"
              snapToAlignment="center"
              contentContainerStyle={{
                paddingHorizontal: 4,
                minWidth: '100%', // Ensure content fills the container
                justifyContent: 'space-between'
              }}
            >
              <View className="flex-row justify-between" style={{ minWidth: '100%' }}>
                {[
                  { key: 'details', label: 'Details', icon: 'info' },
                  { key: 'agenda', label: 'Agenda', icon: 'clock' },
                  { key: 'attendees', label: 'Attendees', icon: 'users' },
                  { key: 'chat', label: 'Chat', icon: 'message-circle' }
                ].map((tab, index) => {
                  const isActive = activeTab === tab.key;
                  const isLast = index === 3;

                  return (
                    <TouchableOpacity
                      key={tab.key}
                      onPress={() => setActiveTab(tab.key as any)}
                      className={`py-3 px-3 rounded-xl ${!isLast ? 'mr-1' : ''}`}
                      style={{
                        backgroundColor: isActive
                          ? themeColors.tabActiveGradientStart
                          : themeColors.tabInactive,
                        flex: 1, // Allow equal distribution
                        minWidth: 80, // Minimum width for readability
                        maxWidth: 120, // Maximum width to prevent too much stretching
                        ...(isActive && {
                          shadowColor: '#e85c29',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.3,
                          shadowRadius: 4,
                          elevation: 3,
                        })
                      }}
                      activeOpacity={0.8}
                    >
                      <View className="flex-row items-center justify-center">
                        <Feather
                          name={tab.icon as any}
                          size={14}
                          color={isActive ? 'white' : themeColors.tabInactiveText}
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          className={`font-rubik-semibold text-sm ${isActive ? 'text-white' : ''}`}
                          style={{
                            color: isActive ? 'white' : themeColors.tabInactiveText
                          }}
                          numberOfLines={1}
                          adjustsFontSizeToFit={true} // Auto-adjust font size on small screens
                          minimumFontScale={0.8} // Minimum scale for readability
                        >
                          {tab.label}
                        </Text>
                      </View>

                      {/* Active indicator */}
                      {isActive && (
                        <View
                          className="absolute -bottom-0.5 left-1/2 w-6 h-0.5 rounded-full"
                          style={{
                            backgroundColor: 'white',
                            transform: [{ translateX: -12 }]
                          }}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <ScrollView
            className="flex-1 px-4"
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Enhanced Event Image */}
            <EventImage event={event} />

            {/* Event Info */}
            <View
              className="p-4 rounded-xl mb-6 border"
              style={{
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border
              }}
            >
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1">
                  <Text
                    className="font-rubik-bold text-2xl mb-2 leading-8"
                    style={{ color: themeColors.text }}
                  >
                    {event.title}
                  </Text>
                  <Text
                    className="font-rubik"
                    style={{ color: themeColors.textSecondary }}
                  >
                    Created by {isCreator ? 'You' : event.creatorName}
                  </Text>
                </View>
                {isCreator && (
                  <View className="bg-accent px-3 py-1 rounded-full">
                    <Text className="text-white font-rubik-medium text-xs">Your Event</Text>
                  </View>
                )}
              </View>

              <Text
                className="font-rubik text-base mb-6 leading-6"
                style={{ color: themeColors.textSecondary }}
              >
                {event.description}
              </Text>

              <View className="space-y-4">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-accent/20 rounded-full items-center justify-center mr-3">
                    <Feather name="calendar" size={18} color="#e85c29" />
                  </View>
                  <View>
                    <Text
                      className="font-rubik-medium text-base"
                      style={{ color: themeColors.text }}
                    >
                      {event.date}
                    </Text>
                    <Text
                      className="font-rubik text-sm"
                      style={{ color: themeColors.textSecondary }}
                    >
                      Event Date
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-accent/20 rounded-full items-center justify-center mr-3">
                    <Feather name="clock" size={18} color="#e85c29" />
                  </View>
                  <View>
                    <Text
                      className="font-rubik-medium text-base"
                      style={{ color: themeColors.text }}
                    >
                      {event.time}
                    </Text>
                    <Text
                      className="font-rubik text-sm"
                      style={{ color: themeColors.textSecondary }}
                    >
                      Start Time
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-accent/20 rounded-full items-center justify-center mr-3">
                    <Feather name="map-pin" size={18} color="#e85c29" />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="font-rubik-medium text-base"
                      style={{ color: themeColors.text }}
                    >
                      {event.location}
                    </Text>
                    <Text
                      className="font-rubik text-sm"
                      style={{ color: themeColors.textSecondary }}
                    >
                      Event Location
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-accent/20 rounded-full items-center justify-center mr-3">
                    <Feather name="users" size={18} color="#e85c29" />
                  </View>
                  <View>
                    <Text
                      className="font-rubik-medium text-base"
                      style={{ color: themeColors.text }}
                    >
                      {event.attendees.length} {event.attendees.length === 1 ? 'person' : 'people'}
                    </Text>
                    <Text
                      className="font-rubik text-sm"
                      style={{ color: themeColors.textSecondary }}
                    >
                      Attending
                    </Text>
                  </View>
                </View>

                {event.imageUrl && (
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-accent/20 rounded-full items-center justify-center mr-3">
                      <Feather name="image" size={18} color="#e85c29" />
                    </View>
                    <View>
                      <Text
                        className="font-rubik-medium text-base"
                        style={{ color: themeColors.text }}
                      >
                        Featured Image
                      </Text>
                      <Text
                        className="font-rubik text-sm"
                        style={{ color: themeColors.textSecondary }}
                      >
                        Event has media content
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Attend Button */}
            {!isCreator && (
              <TouchableOpacity
                onPress={handleAttendEvent}
                disabled={actionLoading}
                className={`p-4 rounded-xl mb-6 ${isAttending ? 'bg-gray-600' : 'bg-accent'
                  } ${actionLoading ? 'opacity-50' : ''}`}
              >
                <View className="flex-row items-center justify-center">
                  {actionLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Feather
                        name={isAttending ? "check" : "plus"}
                        size={20}
                        color="white"
                      />
                      <Text className="text-white font-rubik-semibold text-center text-lg ml-2">
                        {isAttending ? 'Leave Event' : 'Attend Event'}
                      </Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}

        {activeTab === 'agenda' && (
          <View className="flex-1 px-4">
            <AgendaList
              eventId={eventId!}
              currentAgendaItem={currentAgendaItem}
              onEditItem={isAdmin ? handleEditAgendaItem : undefined}
            />
          </View>
        )}

        {activeTab === 'attendees' && (
          <View className="flex-1 px-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text
                className="font-rubik-bold text-xl"
                style={{ color: themeColors.text }}
              >
                Attendees ({event.attendees.length})
              </Text>
              <View
                className="px-3 py-1 rounded-full border"
                style={{
                  backgroundColor: themeColors.surface,
                  borderColor: themeColors.border
                }}
              >
                <Text
                  className="font-rubik-medium text-sm"
                  style={{ color: themeColors.textSecondary }}
                >
                  {attendeesLoading ? 'Loading...' : `${attendees.length} loaded`}
                </Text>
              </View>
            </View>

            {attendeesLoading ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#e85c29" />
                <Text
                  className="font-rubik mt-2"
                  style={{ color: themeColors.textSecondary }}
                >
                  Loading attendees...
                </Text>
              </View>
            ) : attendees.length > 0 ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
              >
                {attendees.map((attendee) => (
                  <AttendeeCard key={attendee.uid} attendee={attendee} />
                ))}
              </ScrollView>
            ) : (
              <View
                className="p-6 rounded-xl items-center border"
                style={{
                  backgroundColor: themeColors.surface,
                  borderColor: themeColors.border
                }}
              >
                <Feather name="users" size={48} color={themeColors.textTertiary} />
                <Text
                  className="font-rubik text-lg mb-2 mt-4"
                  style={{ color: themeColors.textSecondary }}
                >
                  No attendees yet
                </Text>
                <Text
                  className="font-rubik text-sm text-center"
                  style={{ color: themeColors.textTertiary }}
                >
                  Be the first to attend this event!
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'chat' && (
          <View className="flex-1 px-4">
            {canAccessChat ? (
              <View className="items-center justify-center flex-1">
                <View
                  className="p-6 rounded-xl items-center max-w-sm border"
                  style={{
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border
                  }}
                >
                  <Feather name="message-circle" size={48} color="#e85c29" />
                  <Text
                    className="font-rubik-bold text-xl mb-4 mt-4"
                    style={{ color: themeColors.text }}
                  >
                    💬 Event Chat
                  </Text>
                  <Text
                    className="font-rubik text-center mb-6"
                    style={{ color: themeColors.textSecondary }}
                  >
                    Connect and chat with other attendees in real-time!
                  </Text>
                  <TouchableOpacity
                    onPress={handleOpenChat}
                    className="bg-accent px-6 py-3 rounded-xl flex-row items-center"
                  >
                    <Feather name="message-circle" size={18} color="white" />
                    <Text className="text-white font-rubik-semibold ml-2">Open Chat Room</Text>
                  </TouchableOpacity>
                  <Text
                    className="font-rubik text-sm mt-3 text-center"
                    style={{ color: themeColors.textTertiary }}
                  >
                    Chat with {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
            ) : (
              <View className="items-center justify-center flex-1">
                <View
                  className="p-6 rounded-xl items-center max-w-sm border"
                  style={{
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border
                  }}
                >
                  <Feather name="lock" size={48} color={themeColors.textTertiary} />
                  <Text
                    className="font-rubik text-xl mb-4 mt-4"
                    style={{ color: themeColors.textSecondary }}
                  >
                    🔒 Chat Unavailable
                  </Text>
                  <Text
                    className="font-rubik text-center mb-6"
                    style={{ color: themeColors.textSecondary }}
                  >
                    You need to attend this event to access the chat room.
                  </Text>
                  <TouchableOpacity
                    onPress={handleAttendEvent}
                    className="bg-accent px-6 py-3 rounded-xl flex-row items-center"
                  >
                    <Feather name="user-plus" size={18} color="white" />
                    <Text className="text-white font-rubik-semibold ml-2">Attend Event</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Agenda Form Modal - No longer needs nextOrder */}
        <AgendaFormModal
          visible={showAgendaForm}
          onClose={handleCloseAgendaForm}
          eventId={eventId!}
          editingItem={editingAgendaItem}
        />
      </SafeAreaView>
    </View>
  );
};

export default EventScreen;