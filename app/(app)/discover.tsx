import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { Feather } from '@expo/vector-icons';
import firestore from '@react-native-firebase/firestore';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Event } from "../../types/events";

const Discover = () => {
  const { user } = useAuth();
  const { activeTheme } = useTheme();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [attendingEvents, setAttendingEvents] = useState<Set<string>>(new Set());
  const [processingAttendance, setProcessingAttendance] = useState<Set<string>>(new Set());

  // Colors that change based on light/dark mode
  const themeColors = {
    background: activeTheme === 'light' ? '#D8D9D4' : '#161616',
    surface: activeTheme === 'light' ? '#ffffff' : '#374151',
    surfaceSecondary: activeTheme === 'light' ? '#f3f4f6' : '#1f2937',
    text: activeTheme === 'light' ? '#1f2937' : '#ffffff',
    textSecondary: activeTheme === 'light' ? '#6b7280' : '#d1d5db',
    textTertiary: activeTheme === 'light' ? '#9ca3af' : '#9CA3AF',
    border: activeTheme === 'light' ? '#e5e7eb' : '#374151',
    skeletonBg: activeTheme === 'light' ? '#e5e7eb' : '#374151'
  };

  const fetchEvents = async () => {
    if (!user) return;

    try {
      const snapshot = await firestore()
        .collection('events')
        .orderBy('createdAt', 'desc')
        .get();

      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];

      // Create a set of events the user is attending
      const attending = new Set<string>();
      eventsData.forEach(event => {
        if (event.attendees.includes(user.uid)) {
          attending.add(event.id);
        }
      });

      setEvents(eventsData);
      setAttendingEvents(attending);
    } catch (error) {
      console.error('Error fetching events:', error);
      Alert.alert('Error', 'Failed to load events. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const handleAttendEvent = async (event: Event) => {
    if (!user) return;

    // Prevent user from attending their own event
    if (event.creatorId === user.uid) {
      Alert.alert('Cannot Attend', 'You cannot attend your own event.');
      return;
    }

    // Check if already attending
    if (attendingEvents.has(event.id)) {
      Alert.alert('Already Attending', 'You are already attending this event.');
      return;
    }

    // Prevent double-tap
    if (processingAttendance.has(event.id)) return;

    setProcessingAttendance(prev => new Set([...prev, event.id]));

    try {
      const eventRef = firestore().collection('events').doc(event.id);

      await eventRef.update({
        attendees: firestore.FieldValue.arrayUnion(user.uid)
      });

      // Update local state
      setAttendingEvents(prev => new Set([...prev, event.id]));
      setEvents(prevEvents =>
        prevEvents.map(e =>
          e.id === event.id
            ? { ...e, attendees: [...e.attendees, user.uid] }
            : e
        )
      );

      Alert.alert(
        'Success! 🎉',
        `You're now attending "${event.title}". Check your Events tab for details.`,
        [
          {
            text: 'View Event', onPress: () => router.push({
              pathname: "/(app-screens)/(home)/event-screen",
              params: { eventId: event.id }
            })
          },
          { text: 'OK', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('Error attending event:', error);
      Alert.alert('Error', 'Failed to attend event. Please try again.');
    } finally {
      setProcessingAttendance(prev => {
        const newSet = new Set(prev);
        newSet.delete(event.id);
        return newSet;
      });
    }
  };

  const viewAttendees = (event: Event) => {
    if (event.attendees.length === 0) {
      Alert.alert('No Attendees', 'No one is attending this event yet. Be the first!');
      return;
    }

    Alert.alert(
      'Event Attendees',
      `${event.attendees.length} ${event.attendees.length === 1 ? 'person is' : 'people are'} attending this event.`,
      [
        {
          text: 'View Event Details', onPress: () => router.push({
            pathname: "/(app-screens)/(home)/event-screen",
            params: { eventId: event.id }
          })
        },
        { text: 'OK', style: 'cancel' }
      ]
    );
  };

  const EventCard = ({ event }: { event: Event }) => {
    const isAttending = attendingEvents.has(event.id);
    const isCreator = event.creatorId === user?.uid;
    const isProcessing = processingAttendance.has(event.id);

    return (
      <TouchableOpacity
        onPress={() => router.push({
          pathname: "/(app-screens)/(home)/event-screen",
          params: { eventId: event.id }
        })}
        className="p-4 rounded-xl mb-4 border"
        style={{
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border
        }}
        activeOpacity={0.8}
      >
        {/* Header */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 pr-3">
            <Text
              className="font-rubik-semibold text-lg mb-1 leading-6"
              style={{ color: themeColors.text }}
              numberOfLines={2}
            >
              {event.title}
            </Text>
            <Text
              className="font-rubik text-sm"
              style={{ color: themeColors.textSecondary }}
            >
              by {isCreator ? 'You' : event.creatorName}
            </Text>
          </View>
          {isCreator && (
            <View className="bg-accent px-3 py-1 rounded-full">
              <Text className="text-white font-rubik-medium text-xs">Your Event</Text>
            </View>
          )}
        </View>

        {/* Description */}
        <Text
          className="font-rubik text-sm mb-4 leading-5"
          style={{ color: themeColors.textSecondary }}
          numberOfLines={3}
        >
          {event.description}
        </Text>

        {/* Event Details */}
        <View className="space-y-2 mb-4">
          <View className="flex-row items-center">
            <Feather name="calendar" size={14} color="#e85c29" />
            <Text className="text-accent font-rubik-medium text-sm ml-2">
              {event.date} at {event.time}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Feather name="map-pin" size={14} color={themeColors.textTertiary} />
            <Text
              className="font-rubik text-sm ml-2 flex-1"
              style={{ color: themeColors.textSecondary }}
              numberOfLines={1}
            >
              {event.location}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              viewAttendees(event);
            }}
            className="flex-row items-center px-4 py-2 rounded-lg"
            style={{ backgroundColor: themeColors.surfaceSecondary }}
            activeOpacity={0.7}
          >
            <Feather
              name="users"
              size={16}
              color={activeTheme === 'light' ? '#374151' : '#ffffff'}
            />
            <Text
              className="font-rubik-medium text-sm ml-2"
              style={{ color: themeColors.text }}
            >
              {event.attendees.length} attending
            </Text>
          </TouchableOpacity>

          {!isCreator && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleAttendEvent(event);
              }}
              className={`px-6 py-2 rounded-lg flex-row items-center ${isAttending
                ? (activeTheme === 'light' ? 'bg-gray-400' : 'bg-gray-600')
                : isProcessing
                  ? (activeTheme === 'light' ? 'bg-gray-400' : 'bg-gray-600')
                  : 'bg-accent'
                }`}
              disabled={isAttending || isProcessing}
              activeOpacity={0.8}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Feather
                    name={isAttending ? "check" : "plus"}
                    size={14}
                    color="white"
                  />
                  <Text className="text-white font-rubik-medium ml-1">
                    {isAttending ? 'Attending' : 'Attend'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const LoadingSkeleton = () => (
    <View className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <View
          key={i}
          className="p-4 rounded-xl border"
          style={{
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border
          }}
        >
          <View className="animate-pulse">
            <View className="flex-row justify-between mb-3">
              <View className="flex-1">
                <View
                  className="h-5 rounded w-3/4 mb-2"
                  style={{ backgroundColor: themeColors.skeletonBg }}
                />
                <View
                  className="h-4 rounded w-1/2"
                  style={{ backgroundColor: themeColors.skeletonBg }}
                />
              </View>
              <View
                className="h-6 rounded-full w-16"
                style={{ backgroundColor: themeColors.skeletonBg }}
              />
            </View>
            <View className="space-y-2 mb-4">
              <View
                className="h-4 rounded w-full"
                style={{ backgroundColor: themeColors.skeletonBg }}
              />
              <View
                className="h-4 rounded w-4/5"
                style={{ backgroundColor: themeColors.skeletonBg }}
              />
              <View
                className="h-4 rounded w-2/3"
                style={{ backgroundColor: themeColors.skeletonBg }}
              />
            </View>
            <View className="space-y-2 mb-4">
              <View
                className="h-4 rounded w-3/5"
                style={{ backgroundColor: themeColors.skeletonBg }}
              />
              <View
                className="h-4 rounded w-4/5"
                style={{ backgroundColor: themeColors.skeletonBg }}
              />
            </View>
            <View className="flex-row justify-between">
              <View
                className="h-8 rounded w-24"
                style={{ backgroundColor: themeColors.skeletonBg }}
              />
              <View
                className="h-8 rounded w-20"
                style={{ backgroundColor: themeColors.skeletonBg }}
              />
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const EmptyState = () => (
    <View className="flex-1 justify-center items-center px-8 py-16">
      <Text className="text-6xl mb-6">🎯</Text>
      <Text
        className="font-rubik-bold text-2xl mb-4 text-center"
        style={{ color: themeColors.text }}
      >
        No Events Yet
      </Text>
      <Text
        className="font-rubik text-base text-center mb-8 leading-6"
        style={{ color: themeColors.textSecondary }}
      >
        Be the pioneer! Create the first event and start building an amazing community of engaged participants.
      </Text>
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: "/(app)/events",
            params: {
              toggle: "create-event",
              t: Date.now()
            }
          });
        }}
        className="bg-accent px-8 py-4 rounded-xl flex-row items-center"
        activeOpacity={0.8}
      >
        <Feather name="plus" size={18} color="white" />
        <Text className="text-white font-rubik-semibold ml-2 text-base">
          Create First Event
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: themeColors.background }}
        edges={['top']}
      >
        <View className="px-6 pt-4">
          <Text
            className="font-rubik-bold text-2xl mb-6"
            style={{ color: themeColors.text }}
          >
            Discover Events
          </Text>
          <LoadingSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: themeColors.background }}
      edges={['top']}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: events.length === 0 ? 0 : 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#e85c29"
            title="Pull to refresh"
            titleColor={themeColors.text}
          />
        }
      >
        {events.length > 0 ? (
          <View className="px-6 pt-4">
            <View className="flex-row items-center justify-between mb-6">
              <Text
                className="font-rubik-bold text-2xl"
                style={{ color: themeColors.text }}
              >
                Discover Events
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
                  {events.length} events
                </Text>
              </View>
            </View>

            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </View>
        ) : (
          <EmptyState />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Discover;