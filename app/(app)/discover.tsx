import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import firestore from '@react-native-firebase/firestore';
import type { Event } from "../../types/events";
import { SafeAreaView } from 'react-native-safe-area-context';

const Discover = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [attendingEvents, setAttendingEvents] = useState<Set<string>>(new Set());

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

      Alert.alert('Success', 'You are now attending this event!');
    } catch (error) {
      console.error('Error attending event:', error);
      Alert.alert('Error', 'Failed to attend event. Please try again.');
    }
  };

  const viewAttendees = (event: Event) => {
    if (event.attendees.length === 0) {
      Alert.alert('No Attendees', 'No one is attending this event yet.');
      return;
    }

    Alert.alert(
      'Attendees',
      `${event.attendees.length} people are attending this event.`,
      [{ text: 'OK' }]
    );
  };

  const EventCard = ({ event }: { event: Event }) => {
    const isCreator = event.creatorId === user?.uid;
    const isAttending = attendingEvents.has(event.id);

    return (
      <View className="bg-gray-800 p-4 rounded-xl mb-4 border border-gray-700">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-white font-rubik-semibold text-lg mb-1">{event.title}</Text>
            <Text className="text-gray-400 font-rubik text-sm">by {isCreator ? 'You' : event.creatorName}</Text>
          </View>
          {isCreator && (
            <View className="bg-accent px-2 py-1 rounded-full">
              <Text className="text-white font-rubik-medium text-xs">Your Event</Text>
            </View>
          )}
        </View>
        
        <Text className="text-gray-300 font-rubik text-sm mb-3">{event.description}</Text>
        
        <View className="mb-4">
          <Text className="text-accent font-rubik-medium text-sm">{event.date} at {event.time}</Text>
          <Text className="text-gray-400 font-rubik text-sm">{event.location}</Text>
        </View>

        <View className="flex-row justify-between items-center">
          <TouchableOpacity 
            onPress={() => viewAttendees(event)}
            className="flex-row items-center"
          >
            <View className="bg-gray-700 px-3 py-2 rounded-lg">
              <Text className="text-white font-rubik-medium text-sm">
                {event.attendees.length} attending
              </Text>
            </View>
          </TouchableOpacity>

          {!isCreator && (
            <TouchableOpacity
              onPress={() => handleAttendEvent(event)}
              className={`px-4 py-2 rounded-lg ${isAttending ? 'bg-gray-600' : 'bg-accent'}`}
              disabled={isAttending}
            >
              <Text className="text-white font-rubik-medium">
                {isAttending ? 'Attending' : 'Attend'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Text className="text-white font-rubik">Loading events...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      className="bg-background flex-1"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <SafeAreaView className="p-4 pt-12">
        <Text className="text-white font-rubik-bold text-2xl mb-6">Discover Events</Text>
        
        {events.length > 0 ? (
          events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <View className="bg-gray-800 p-6 rounded-xl items-center">
            <Text className="text-gray-400 font-rubik text-lg mb-2">No events available</Text>
            <Text className="text-gray-500 font-rubik text-sm text-center">
              Be the first to create an event!
            </Text>
          </View>
        )}
      </SafeAreaView>
    </ScrollView>
  );
};

export default Discover;