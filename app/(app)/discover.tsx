import { useAuth } from '@/context/auth-context';
import { Feather } from '@expo/vector-icons';
import firestore from '@react-native-firebase/firestore';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Event } from "../../types/events";

const Discover = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [attendingEvents, setAttendingEvents] = useState<Set<string>>(new Set());
  const [processingAttendance, setProcessingAttendance] = useState<Set<string>>(new Set());

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
        className="bg-gray-800 p-4 rounded-xl mb-4 border border-gray-700 active:bg-gray-750"
        activeOpacity={0.8}
      >
        {/* Header */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 pr-3">
            <Text className="text-white font-rubik-semibold text-lg mb-1 leading-6">
              {event.title}
            </Text>
            <Text className="text-gray-400 font-rubik text-sm">
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
        <Text className="text-gray-300 font-rubik text-sm mb-4 leading-5" numberOfLines={3}>
          {event.description}
        </Text>

        {/* Event Details */}
        <View className="space-y-2 mb-4">
          <View className="flex-row items-center">
            <Feather name="calendar" size={14} color="#ff4306" />
            <Text className="text-accent font-rubik-medium text-sm ml-2">
              {event.date} at {event.time}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Feather name="map-pin" size={14} color="#9CA3AF" />
            <Text className="text-gray-400 font-rubik text-sm ml-2 flex-1" numberOfLines={1}>
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
            className="flex-row items-center bg-gray-700 px-4 py-2 rounded-lg"
            activeOpacity={0.7}
          >
            <Feather name="users" size={16} color="#ffffff" />
            <Text className="text-white font-rubik-medium text-sm ml-2">
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
                  ? 'bg-gray-600'
                  : isProcessing
                    ? 'bg-gray-600'
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
        <View key={i} className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <View className="animate-pulse">
            <View className="flex-row justify-between mb-3">
              <View className="flex-1">
                <View className="h-5 bg-gray-700 rounded w-3/4 mb-2"></View>
                <View className="h-4 bg-gray-700 rounded w-1/2"></View>
              </View>
              <View className="h-6 bg-gray-700 rounded-full w-16"></View>
            </View>
            <View className="space-y-2 mb-4">
              <View className="h-4 bg-gray-700 rounded w-full"></View>
              <View className="h-4 bg-gray-700 rounded w-4/5"></View>
              <View className="h-4 bg-gray-700 rounded w-2/3"></View>
            </View>
            <View className="space-y-2 mb-4">
              <View className="h-4 bg-gray-700 rounded w-3/5"></View>
              <View className="h-4 bg-gray-700 rounded w-4/5"></View>
            </View>
            <View className="flex-row justify-between">
              <View className="h-8 bg-gray-700 rounded w-24"></View>
              <View className="h-8 bg-gray-700 rounded w-20"></View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const EmptyState = () => (
    <View className="flex-1 justify-center items-center px-8 py-16">
      <Text className="text-6xl mb-6">🎯</Text>
      <Text className="text-white font-rubik-bold text-2xl mb-4 text-center">
        No Events Yet
      </Text>
      <Text className="text-gray-400 font-rubik text-base text-center mb-8 leading-6">
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
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="px-6 pt-4">
          <Text className="text-white font-rubik-bold text-2xl mb-6">Discover Events</Text>
          <LoadingSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: events.length === 0 ? 0 : 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ff4306"
            title="Pull to refresh"
            titleColor="#ffffff"
          />
        }
      >
        {events.length > 0 ? (
          <View className="px-6 pt-4">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-white font-rubik-bold text-2xl">Discover Events</Text>
              <View className="bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
                <Text className="text-gray-400 font-rubik-medium text-sm">
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