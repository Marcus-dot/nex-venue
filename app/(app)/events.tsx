import { useAuth } from '@/context/auth-context';
import { Feather } from '@expo/vector-icons';
import firestore from '@react-native-firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Event } from "../../types/events";

const Events = () => {
  const { toggle } = useLocalSearchParams();
  let initialToggle: string | null = Array.isArray(toggle) ? toggle[0] : toggle;

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
  const [imageUrl, setImageUrl] = useState('');
  const [imageDescription, setImageDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useFocusEffect(
    useCallback(() => {
      if (initialToggle === "create-event") {
        setShowCreateModal(true);
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

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!title.trim()) errors.title = 'Title is required';
    if (!description.trim()) errors.description = 'Description is required';
    if (!date.trim()) errors.date = 'Date is required';
    if (!time.trim()) errors.time = 'Time is required';
    if (!location.trim()) errors.location = 'Location is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setLocation('');
    setImageUrl('');
    setImageDescription('');
    setFormErrors({});
  };

  const createEvent = async () => {
    if (!user || !userProfile) return;

    if (!validateForm()) {
      Alert.alert('Incomplete Form', 'Please fill in all required fields.');
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
        imageUrl: imageUrl.trim() || undefined,
        imageDescription: imageDescription.trim() || undefined,
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
      resetForm();
      setShowCreateModal(false);

      Alert.alert(
        'Success! 🎉',
        `"${eventData.title}" has been created successfully!`,
        [
          {
            text: 'View Event', onPress: () => router.push({
              pathname: "/(app-screens)/(home)/event-screen",
              params: { eventId: docRef.id }
            })
          },
          { text: 'OK', style: 'cancel' }
        ]
      );
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

  const EventCard = ({ event, showCreatorBadge = false }: { event: Event; showCreatorBadge?: boolean }) => (
    <TouchableOpacity
      onPress={() => router.push({
        pathname: "/(app-screens)/(home)/event-screen",
        params: { eventId: event.id }
      })}
      className="bg-gray-800 p-4 rounded-xl mb-4 border border-gray-700 active:bg-gray-750"
      activeOpacity={0.8}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 pr-3">
          <Text className="text-white font-rubik-semibold text-lg mb-1 leading-6">
            {event.title}
          </Text>
          <Text className="text-gray-400 font-rubik text-sm">
            by {event.creatorId === user?.uid ? 'You' : event.creatorName}
          </Text>
        </View>
        {showCreatorBadge && (
          <View className="bg-accent px-3 py-1 rounded-full">
            <Text className="text-white font-rubik-medium text-xs">Your Event</Text>
          </View>
        )}
      </View>

      <Text className="text-gray-300 font-rubik text-sm mb-4 leading-5" numberOfLines={3}>
        {event.description}
      </Text>

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

      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          viewAttendees(event);
        }}
        className="bg-gray-700 px-4 py-2 rounded-lg self-start flex-row items-center"
        activeOpacity={0.7}
      >
        <Feather name="users" size={16} color="#ffffff" />
        <Text className="text-white font-rubik-medium text-sm ml-2">
          {event.attendees.length} attending
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const LoadingSkeleton = () => (
    <View className="space-y-4">
      {[1, 2, 3].map((i) => (
        <View key={i} className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <View className="animate-pulse">
            <View className="flex-row justify-between mb-3">
              <View className="flex-1">
                <View className="h-5 bg-gray-700 rounded w-3/4 mb-2"></View>
                <View className="h-4 bg-gray-700 rounded w-1/2"></View>
              </View>
              <View className="h-6 bg-gray-700 rounded-full w-20"></View>
            </View>
            <View className="space-y-2 mb-4">
              <View className="h-4 bg-gray-700 rounded w-full"></View>
              <View className="h-4 bg-gray-700 rounded w-4/5"></View>
              <View className="h-4 bg-gray-700 rounded w-3/5"></View>
            </View>
            <View className="space-y-2 mb-4">
              <View className="h-4 bg-gray-700 rounded w-3/5"></View>
              <View className="h-4 bg-gray-700 rounded w-4/5"></View>
            </View>
            <View className="h-8 bg-gray-700 rounded w-24"></View>
          </View>
        </View>
      ))}
    </View>
  );

  const EmptyState = ({ tab }: { tab: 'created' | 'attending' }) => {
    if (tab === 'created') {
      return (
        <View className="flex-1 justify-center items-center px-8 py-16">
          <Text className="text-6xl mb-6">🚀</Text>
          <Text className="text-white font-rubik-bold text-2xl mb-4 text-center">
            No Events Created Yet
          </Text>
          <Text className="text-gray-400 font-rubik text-base text-center mb-8 leading-6">
            Ready to bring people together? Create your first event and start building an amazing community experience.
          </Text>
          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            className="bg-accent px-8 py-4 rounded-xl flex-row items-center"
            activeOpacity={0.8}
          >
            <Feather name="plus" size={18} color="white" />
            <Text className="text-white font-rubik-semibold ml-2 text-base">
              Create Your First Event
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="flex-1 justify-center items-center px-8 py-16">
        <Text className="text-6xl mb-6">🎯</Text>
        <Text className="text-white font-rubik-bold text-2xl mb-4 text-center">
          Not Attending Any Events
        </Text>
        <Text className="text-gray-400 font-rubik text-base text-center mb-8 leading-6">
          Discover exciting events happening around you and connect with like-minded people in your community.
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(app)/discover')}
          className="bg-accent px-8 py-4 rounded-xl flex-row items-center"
          activeOpacity={0.8}
        >
          <Feather name="compass" size={18} color="white" />
          <Text className="text-white font-rubik-semibold ml-2 text-base">
            Discover Events
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const FormInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    multiline = false,
    error,
    required = false
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    multiline?: boolean;
    error?: string;
    required?: boolean;
  }) => (
    <View className="mb-4">
      <View className="flex-row items-center mb-2">
        <Text className="text-white font-rubik-medium text-base">{label}</Text>
        {required && <Text className="text-accent ml-1">*</Text>}
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        className={`bg-gray-800 text-white p-4 rounded-xl font-rubik border ${error ? 'border-red-500' : 'border-gray-700'
          } ${multiline ? 'h-24' : 'h-12'}`}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
      />
      {error && (
        <View className="flex-row items-center mt-2">
          <Feather name="alert-circle" size={14} color="#ef4444" />
          <Text className="text-red-400 font-rubik text-sm ml-1">{error}</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="px-6 pt-4">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white font-rubik-bold text-2xl">Your Events</Text>
            <View className="bg-gray-800 px-4 py-2 rounded-lg">
              <ActivityIndicator size="small" color="#ff4306" />
            </View>
          </View>
          <LoadingSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  const currentEvents = activeTab === 'created' ? createdEvents : attendingEvents;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: currentEvents.length === 0 ? 0 : 100 }}
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
        {/* Header */}
        <View className="px-6 pt-4">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white font-rubik-bold text-2xl">Your Events</Text>
            <TouchableOpacity
              onPress={() => setShowCreateModal(true)}
              className="bg-accent px-4 py-2 rounded-lg flex-row items-center"
              activeOpacity={0.8}
            >
              <Feather name="plus" size={16} color="white" />
              <Text className="text-white font-rubik-medium ml-1">Create Event</Text>
            </TouchableOpacity>
          </View>

          {/* Tab Selector */}
          <View className="flex-row bg-gray-800 rounded-xl p-1 mb-6 border border-gray-700">
            <TouchableOpacity
              onPress={() => setActiveTab('created')}
              className={`flex-1 py-3 px-4 rounded-lg ${activeTab === 'created' ? 'bg-accent' : ''
                }`}
              activeOpacity={0.8}
            >
              <Text className={`text-center font-rubik-medium ${activeTab === 'created' ? 'text-white' : 'text-gray-400'
                }`}>
                Created ({createdEvents.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('attending')}
              className={`flex-1 py-3 px-4 rounded-lg ${activeTab === 'attending' ? 'bg-accent' : ''
                }`}
              activeOpacity={0.8}
            >
              <Text className={`text-center font-rubik-medium ${activeTab === 'attending' ? 'text-white' : 'text-gray-400'
                }`}>
                Attending ({attendingEvents.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Events List */}
          {currentEvents.length > 0 ? (
            currentEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                showCreatorBadge={activeTab === 'created'}
              />
            ))
          ) : (
            <EmptyState tab={activeTab} />
          )}
        </View>
      </ScrollView>

      {/* Create Event Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <KeyboardAvoidingView
          className="flex-1 bg-background"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <SafeAreaView className="flex-1" edges={['top']}>
            {/* Modal Header */}
            <View className="flex-row justify-between items-center p-6 border-b border-gray-700">
              <Text className="text-white font-rubik-bold text-xl">Create New Event</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                activeOpacity={0.7}
              >
                <Feather name="x" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView
              className="flex-1 px-6"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View className="py-4">
                <FormInput
                  label="Event Title"
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Enter a compelling event title"
                  error={formErrors.title}
                  required
                />

                <FormInput
                  label="Description"
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe what makes this event special"
                  multiline
                  error={formErrors.description}
                  required
                />

                <View className="flex-row space-x-4 mb-4">
                  <View className="flex-1">
                    <FormInput
                      label="Date"
                      value={date}
                      onChangeText={setDate}
                      placeholder="e.g., Jan 25, 2024"
                      error={formErrors.date}
                      required
                    />
                  </View>
                  <View className="flex-1">
                    <FormInput
                      label="Time"
                      value={time}
                      onChangeText={setTime}
                      placeholder="e.g., 7:00 PM"
                      error={formErrors.time}
                      required
                    />
                  </View>
                </View>

                <FormInput
                  label="Location"
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Where will this event take place?"
                  error={formErrors.location}
                  required
                />

                <FormInput
                  label="Event Image URL"
                  value={imageUrl}
                  onChangeText={setImageUrl}
                  placeholder="https://... (optional)"
                />

                {imageUrl.trim() && (
                  <FormInput
                    label="Image Description"
                    value={imageDescription}
                    onChangeText={setImageDescription}
                    placeholder="Describe the image for accessibility"
                  />
                )}

                {/* Create Button */}
                <TouchableOpacity
                  onPress={createEvent}
                  disabled={creating}
                  className={`py-4 rounded-xl mt-6 mb-8 flex-row items-center justify-center ${creating ? 'bg-gray-600' : 'bg-accent'
                    }`}
                  activeOpacity={0.8}
                >
                  {creating ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Feather name="plus" size={18} color="white" />
                      <Text className="text-white font-rubik-semibold text-base ml-2">
                        Create Event
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default Events;