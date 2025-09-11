import ImagePickerComponent from '@/components/image-picker';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { Feather } from '@expo/vector-icons';
import firestore from '@react-native-firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Event } from "../../types/events";

// ✅ FIXED: FormInput component moved OUTSIDE of Events component
const FormInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  error,
  required = false,
  themeColors // Pass theme colors as props
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  multiline?: boolean;
  error?: string;
  required?: boolean;
  themeColors: any;
}) => (
  <View className="mb-4">
    <View className="flex-row items-center mb-2">
      <Text
        className="font-rubik-medium text-base"
        style={{ color: themeColors.text }}
      >
        {label}
      </Text>
      {required && <Text className="text-accent ml-1">*</Text>}
    </View>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={themeColors.textTertiary}
      style={{
        fontSize: 16,
        height: multiline ? 80 : 50,
        textAlignVertical: multiline ? 'top' : 'center',
        fontFamily: 'Rubik-Regular',
        backgroundColor: themeColors.input,
        color: themeColors.text,
        borderColor: error ? '#ef4444' : themeColors.inputBorder
      }}
      className={`px-4 py-3 rounded-lg border ${error ? 'border-red-500' : ''}`}
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
      autoCorrect={true}
      autoCapitalize="sentences"
      returnKeyType={multiline ? "default" : "next"}
      blurOnSubmit={false}
      keyboardType="default"
      clearButtonMode="while-editing"
      selectTextOnFocus={false}
      contextMenuHidden={false}
    />
    {error && (
      <View className="flex-row items-center mt-2">
        <Feather name="alert-circle" size={14} color="#ef4444" />
        <Text className="text-red-400 font-rubik text-sm ml-1">{error}</Text>
      </View>
    )}
  </View>
);

const Events = () => {
  const { toggle } = useLocalSearchParams();
  let initialToggle: string | null = Array.isArray(toggle) ? toggle[0] : toggle;

  const { user, userProfile, isAdmin } = useAuth();
  const { activeTheme } = useTheme();
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
  const [creating, setCreating] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Theme-aware colors
  const themeColors = {
    background: activeTheme === 'light' ? '#D8D9D4' : '#161616',
    surface: activeTheme === 'light' ? '#ffffff' : '#374151',
    surfaceSecondary: activeTheme === 'light' ? '#f3f4f6' : '#1f2937',
    text: activeTheme === 'light' ? '#1f2937' : '#ffffff',
    textSecondary: activeTheme === 'light' ? '#6b7280' : '#d1d5db',
    textTertiary: activeTheme === 'light' ? '#9ca3af' : '#9CA3AF',
    border: activeTheme === 'light' ? '#e5e7eb' : '#374151',
    input: activeTheme === 'light' ? '#f9fafb' : '#374151',
    inputBorder: activeTheme === 'light' ? '#d1d5db' : '#6b7280',
    skeletonBg: activeTheme === 'light' ? '#e5e7eb' : '#374151',
    tabBackground: activeTheme === 'light' ? '#f3f4f6' : '#374151',
    tabBorder: activeTheme === 'light' ? '#e5e7eb' : '#374151'
  };

  useFocusEffect(
    useCallback(() => {
      // Only allow admins to trigger create event modal
      if (initialToggle === "create-event" && isAdmin) {
        setShowCreateModal(true);
        router.setParams({ toggle: undefined });
      }
    }, [initialToggle, isAdmin])
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
    setFormErrors({});
  };

  const createEvent = async () => {
    if (!user || !userProfile || !isAdmin) {
      Alert.alert('Permission Denied', 'Only administrators can create events.');
      return;
    }

    if (!validateForm()) {
      Alert.alert('Incomplete Form', 'Please fill in all required fields.');
      return;
    }

    setCreating(true);
    try {
      // Base event data (required fields)
      const eventData: any = {
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

      // Only add image URL if it has a value
      if (imageUrl.trim()) {
        eventData.imageUrl = imageUrl.trim();
      }

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
      className="p-4 rounded-xl mb-4 border"
      style={{
        backgroundColor: themeColors.surface,
        borderColor: themeColors.border
      }}
      activeOpacity={0.8}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 pr-3">
          <Text
            className="font-rubik-semibold text-lg mb-1 leading-6"
            style={{ color: themeColors.text }}
          >
            {event.title}
          </Text>
          <Text
            className="font-rubik text-sm"
            style={{ color: themeColors.textSecondary }}
          >
            by {event.creatorId === user?.uid ? 'You' : event.creatorName}
          </Text>
        </View>
        {showCreatorBadge && (
          <View className="bg-accent px-3 py-1 rounded-full">
            <Text className="text-white font-rubik-medium text-xs">Your Event</Text>
          </View>
        )}
      </View>

      <Text
        className="font-rubik text-sm mb-4 leading-5"
        style={{ color: themeColors.textSecondary }}
        numberOfLines={3}
      >
        {event.description}
      </Text>

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

      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          viewAttendees(event);
        }}
        className="px-4 py-2 rounded-lg self-start flex-row items-center"
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
    </TouchableOpacity>
  );

  const LoadingSkeleton = () => (
    <View className="space-y-4">
      {[1, 2, 3].map((i) => (
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
                className="h-6 rounded-full w-20"
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
                className="h-4 rounded w-3/5"
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
            <View
              className="h-8 rounded w-24"
              style={{ backgroundColor: themeColors.skeletonBg }}
            />
          </View>
        </View>
      ))}
    </View>
  );

  const EmptyState = ({ tab }: { tab: 'created' | 'attending' }) => {
    if (tab === 'created') {
      return (
        <View className="flex-1 justify-center items-center px-8 py-16">
          {isAdmin ? (
            // Admin version - with create event option
            <>
              <Text className="text-6xl mb-6">🚀</Text>
              <Text
                className="font-rubik-bold text-2xl mb-4 text-center"
                style={{ color: themeColors.text }}
              >
                No Events Created Yet
              </Text>
              <Text
                className="font-rubik text-base text-center mb-8 leading-6"
                style={{ color: themeColors.textSecondary }}
              >
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
            </>
          ) : (
            // Regular user version - no create option
            <>
              <Text className="text-6xl mb-6">👤</Text>
              <Text
                className="font-rubik-bold text-2xl mb-4 text-center"
                style={{ color: themeColors.text }}
              >
                You Haven't Created Any Events
              </Text>
              <Text
                className="font-rubik text-base text-center mb-8 leading-6"
                style={{ color: themeColors.textSecondary }}
              >
                Only administrators can create events. Check out the discover tab to find events to attend!
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
            </>
          )}
        </View>
      );
    }

    return (
      <View className="flex-1 justify-center items-center px-8 py-16">
        <Text className="text-6xl mb-6">🎯</Text>
        <Text
          className="font-rubik-bold text-2xl mb-4 text-center"
          style={{ color: themeColors.text }}
        >
          Not Attending Any Events
        </Text>
        <Text
          className="font-rubik text-base text-center mb-8 leading-6"
          style={{ color: themeColors.textSecondary }}
        >
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

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: themeColors.background }}
        edges={['top']}
      >
        <View className="px-6 pt-4">
          <View className="flex-row justify-between items-center mb-6">
            <Text
              className="font-rubik-bold text-2xl"
              style={{ color: themeColors.text }}
            >
              Your Events
            </Text>
            <View
              className="px-4 py-2 rounded-lg"
              style={{ backgroundColor: themeColors.surface }}
            >
              <ActivityIndicator size="small" color="#e85c29" />
            </View>
          </View>
          <LoadingSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  const currentEvents = activeTab === 'created' ? createdEvents : attendingEvents;

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: themeColors.background }}
      edges={['top']}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: currentEvents.length === 0 ? 0 : 100 }}
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
        {/* Header */}
        <View className="px-6 pt-4">
          <View className="flex-row justify-between items-center mb-6">
            <Text
              className="font-rubik-bold text-2xl"
              style={{ color: themeColors.text }}
            >
              Your Events
            </Text>
            {/* Only show Create Event button for admins */}
            {isAdmin && (
              <TouchableOpacity
                onPress={() => setShowCreateModal(true)}
                className="bg-accent px-4 py-2 rounded-lg flex-row items-center"
                activeOpacity={0.8}
              >
                <Feather name="plus" size={16} color="white" />
                <Text className="text-white font-rubik-medium ml-1">Create Event</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Tab Selector */}
          <View
            className="flex-row rounded-xl p-1 mb-6 border"
            style={{
              backgroundColor: themeColors.tabBackground,
              borderColor: themeColors.tabBorder
            }}
          >
            <TouchableOpacity
              onPress={() => setActiveTab('created')}
              className={`flex-1 py-3 px-4 rounded-lg ${activeTab === 'created' ? 'bg-accent' : ''}`}
              activeOpacity={0.8}
            >
              <Text
                className={`text-center font-rubik-medium ${activeTab === 'created' ? 'text-white' : ''
                  }`}
                style={{
                  color: activeTab === 'created' ? 'white' : themeColors.textSecondary
                }}
              >
                Created ({createdEvents.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('attending')}
              className={`flex-1 py-3 px-4 rounded-lg ${activeTab === 'attending' ? 'bg-accent' : ''}`}
              activeOpacity={0.8}
            >
              <Text
                className={`text-center font-rubik-medium ${activeTab === 'attending' ? 'text-white' : ''
                  }`}
                style={{
                  color: activeTab === 'attending' ? 'white' : themeColors.textSecondary
                }}
              >
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

      {/* Create Event Modal - Only accessible by admins */}
      {isAdmin && (
        <Modal
          visible={showCreateModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowCreateModal(false)}
        >
          <KeyboardAvoidingView
            className="flex-1"
            style={{ backgroundColor: themeColors.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <SafeAreaView className="flex-1" edges={['top']}>
              {/* Modal Header */}
              <View
                className="flex-row justify-between items-center p-6 border-b"
                style={{ borderBottomColor: themeColors.border }}
              >
                <Text
                  className="font-rubik-bold text-xl"
                  style={{ color: themeColors.text }}
                >
                  Create New Event
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  activeOpacity={0.7}
                >
                  <Feather name="x" size={24} color={themeColors.textTertiary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                className="flex-1 px-6"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="none"
                scrollEventThrottle={16}
              >
                <View className="py-4">
                  <FormInput
                    label="Event Title"
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Enter a compelling event title"
                    error={formErrors.title}
                    required
                    themeColors={themeColors}
                  />

                  <FormInput
                    label="Description"
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Describe what makes this event special"
                    multiline
                    error={formErrors.description}
                    required
                    themeColors={themeColors}
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
                        themeColors={themeColors}
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
                        themeColors={themeColors}
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
                    themeColors={themeColors}
                  />

                  {/* New Image Picker Component */}
                  <ImagePickerComponent
                    onImageUploaded={(uploadedImageUrl) => {
                      setImageUrl(uploadedImageUrl);
                    }}
                    onImageRemoved={() => {
                      setImageUrl('');
                    }}
                    currentImageUrl={imageUrl}
                    disabled={creating}
                  />

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
      )}
    </SafeAreaView>
  );
};

export default Events;