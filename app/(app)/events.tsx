import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import firestore from '@react-native-firebase/firestore';
import type { Event } from "../../types/events";
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

const Events = () => {

  const { toggle } = useLocalSearchParams();
  let initialToggle: string | null = Array.isArray(toggle) ? toggle[0] : toggle;

  console.log(toggle)

  const { user, userProfile } = useAuth();
  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
  const [attendingEvents, setAttendingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'created' | 'attending'>('created');
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [creating, setCreating] = useState(false);

  useFocusEffect(
    useCallback(() => {
      console.log(initialToggle);
      if (initialToggle === "create-event") {
        console.log(initialToggle);
        setShowCreateModal(true);
        // Optional: Clear the parameter after handling it
        router.setParams({ toggle: undefined });
      }
    }, [initialToggle])
  );

  const fetchEvents = async () => {
    if (!user) return;

    try {
      // Fetch created events
      const createdSnapshot = await firestore()
        .collection('events')
        .where('creatorId', '==', user.uid)
        .orderBy('createdAt', 'desc')
        .get();

      const created = createdSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];

      // Fetch attending events
      const attendingSnapshot = await firestore()
        .collection('events')
        .where('attendees', 'array-contains', user.uid)
        .orderBy('createdAt', 'desc')
        .get();

      const attending = attendingSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];

      setCreatedEvents(created);
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

  const createEvent = async () => {
    if (!user || !userProfile) return;

    if (!title.trim() || !description.trim() || !date.trim() || !time.trim() || !location.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setCreating(true);
    try {
      const eventData = {
        title: title.trim(),
        description: description.trim(),
        date: date.trim(),
        time: time.trim(),
        location: location.trim(),
        creatorId: user.uid,
        creatorName: userProfile.phoneNumber || 'Anonymous',
        attendees: [],
        createdAt: Date.now(),
      };

      const docRef = await firestore().collection('events').add(eventData);
      
      const newEvent: Event = {
        id: docRef.id,
        ...eventData
      };

      setCreatedEvents(prev => [newEvent, ...prev]);
      
      // Reset form
      setTitle('');
      setDescription('');
      setDate('');
      setTime('');
      setLocation('');
      setShowCreateModal(false);
      
      Alert.alert('Success', 'Event created successfully!');
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event. Please try again.');
    } finally {
      setCreating(false);
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

  const EventCard = ({ event, showCreatorBadge = false }: { event: Event; showCreatorBadge?: boolean }) => (
    <View className="bg-gray-800 p-4 rounded-xl mb-4 border border-gray-700">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-white font-rubik-semibold text-lg mb-1">{event.title}</Text>
          <Text className="text-gray-400 font-rubik text-sm">
            by {event.creatorId === user?.uid ? 'You' : event.creatorName}
          </Text>
        </View>
        {showCreatorBadge && (
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

      <TouchableOpacity 
        onPress={() => viewAttendees(event)}
        className="bg-gray-700 px-3 py-2 rounded-lg self-start"
      >
        <Text className="text-white font-rubik-medium text-sm">
          {event.attendees.length} attending
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Text className="text-white font-rubik">Loading events...</Text>
      </View>
    );
  }

  return (
    <View className="bg-background flex-1">
      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <SafeAreaView className="p-4 pt-12">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white font-rubik-bold text-2xl">Your Events</Text>
            <TouchableOpacity 
              onPress={() => setShowCreateModal(true)}
              className="bg-accent px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-rubik-medium">Create Event</Text>
            </TouchableOpacity>
          </View>

          {/* Tab Selector */}
          <View className="flex-row bg-gray-800 rounded-lg p-1 mb-6">
            <TouchableOpacity
              onPress={() => setActiveTab('created')}
              className={`flex-1 py-2 px-4 rounded-lg ${activeTab === 'created' ? 'bg-accent' : ''}`}
            >
              <Text className={`text-center font-rubik-medium ${activeTab === 'created' ? 'text-white' : 'text-gray-400'}`}>
                Created ({createdEvents.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('attending')}
              className={`flex-1 py-2 px-4 rounded-lg ${activeTab === 'attending' ? 'bg-accent' : ''}`}
            >
              <Text className={`text-center font-rubik-medium ${activeTab === 'attending' ? 'text-white' : 'text-gray-400'}`}>
                Attending ({attendingEvents.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Events List */}
          {activeTab === 'created' ? (
            createdEvents.length > 0 ? (
              createdEvents.map((event) => (
                <EventCard key={event.id} event={event} showCreatorBadge />
              ))
            ) : (
              <View className="bg-gray-800 p-6 rounded-xl items-center">
                <Text className="text-gray-400 font-rubik text-lg mb-2">No events created yet</Text>
                <TouchableOpacity 
                  onPress={() => setShowCreateModal(true)}
                  className="bg-accent px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-rubik-medium">Create Your First Event</Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            attendingEvents.length > 0 ? (
              attendingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))
            ) : (
              <View className="bg-gray-800 p-6 rounded-xl items-center">
                <Text className="text-gray-400 font-rubik text-lg mb-2">Not attending any events</Text>
                <Text className="text-gray-500 font-rubik text-sm text-center">
                  Check out the Discover tab to find events to attend!
                </Text>
              </View>
            )
          )}
        </SafeAreaView>
      </ScrollView>

      {/* Create Event Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="bg-background flex-1">
          <View className="p-4 pt-12">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white font-rubik-bold text-xl">Create Event</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Text className="text-gray-400 font-rubik">Cancel</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="space-y-4">
                <View>
                  <Text className="text-white font-rubik-medium mb-2">Title</Text>
                  <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Enter event title"
                    placeholderTextColor="#9CA3AF"
                    className="bg-gray-800 text-white p-3 rounded-lg font-rubik"
                  />
                </View>

                <View>
                  <Text className="text-white font-rubik-medium mb-2">Description</Text>
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Enter event description"
                    placeholderTextColor="#9CA3AF"
                    className="bg-gray-800 text-white p-3 rounded-lg font-rubik h-24"
                    multiline
                    textAlignVertical="top"
                  />
                </View>

                <View>
                  <Text className="text-white font-rubik-medium mb-2">Date</Text>
                  <TextInput
                    value={date}
                    onChangeText={setDate}
                    placeholder="e.g., Jan 25, 2024"
                    placeholderTextColor="#9CA3AF"
                    className="bg-gray-800 text-white p-3 rounded-lg font-rubik"
                  />
                </View>

                <View>
                  <Text className="text-white font-rubik-medium mb-2">Time</Text>
                  <TextInput
                    value={time}
                    onChangeText={setTime}
                    placeholder="e.g., 7:00 PM"
                    placeholderTextColor="#9CA3AF"
                    className="bg-gray-800 text-white p-3 rounded-lg font-rubik"
                  />
                </View>

                <View>
                  <Text className="text-white font-rubik-medium mb-2">Location</Text>
                  <TextInput
                    value={location}
                    onChangeText={setLocation}
                    placeholder="Enter event location"
                    placeholderTextColor="#9CA3AF"
                    className="bg-gray-800 text-white p-3 rounded-lg font-rubik"
                  />
                </View>

                <TouchableOpacity
                  onPress={createEvent}
                  disabled={creating}
                  className={`py-3 rounded-lg mt-6 ${creating ? 'bg-gray-600' : 'bg-accent'}`}
                >
                  <Text className="text-white font-rubik-semibold text-center">
                    {creating ? 'Creating...' : 'Create Event'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Events;
