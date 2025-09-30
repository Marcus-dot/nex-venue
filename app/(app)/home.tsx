import AccessibleTouchable from '@/components/accessible-touchable';
import { NotificationBell } from '@/components/notification-bell';
import OptimizedEventList from '@/components/optimized-event-list';
import PageTransition from '@/components/page-transition';
import PlatformStatusBar from '@/components/platform-status-bar';
import { ScreenReaderAnnouncement } from '@/components/screen-reader-helper';
import { useAuth } from '@/context/auth-context';
import { useNotifications } from '@/context/notification-context';
import { useTheme } from '@/context/theme-context';
import { useOptimizedFirestore } from '@/hooks/useOptimizedFirestore';
import { useDebounce, useExpensiveOperation } from '@/hooks/usePerformance';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TEXT_SIZE } from '@/constants';
import type { Event } from '@/types/events';

const Home = () => {
  const { user, userProfile } = useAuth();
  const { hasPermission, fcmToken, requestPermission } = useNotifications();
  const { activeTheme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [attendingEvents, setAttendingEvents] = useState<Set<string>>(new Set());
  const [processingAttendance, setProcessingAttendance] = useState<Set<string>>(new Set());
  const [announcement, setAnnouncement] = useState('');

  const isReady = useExpensiveOperation();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Check if user is admin
  const isAdmin = userProfile?.role === 'admin';

  // Theme-aware colors
  const themeColors = {
    background: activeTheme === 'light' ? '#D8D9D4' : '#161616',
    surface: activeTheme === 'light' ? '#ffffff' : '#374151',
    surfaceSecondary: activeTheme === 'light' ? '#f3f4f6' : '#1f2937',
    text: activeTheme === 'light' ? '#1f2937' : '#ffffff',
    textSecondary: activeTheme === 'light' ? '#6b7280' : '#d1d5db',
    border: activeTheme === 'light' ? '#e5e7eb' : '#374151',
    input: activeTheme === 'light' ? '#f9fafb' : '#374151',
    inputBorder: activeTheme === 'light' ? '#d1d5db' : '#6b7280'
  };

  // Optimized Firestore query with caching
  const {
    data: events,
    loading: eventsLoading,
    error: eventsError,
    refresh: refreshEvents
  } = useOptimizedFirestore<Event>(
    'events',
    undefined, // No additional query constraints for now
    {
      enabled: isReady && !!user,
      cacheFirst: true,
      refetchOnAppFocus: true,
      debounceMs: 200
    }
  );

  // Filter events based on search query (memoized for performance)
  const filteredEvents = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return events;

    const query = debouncedSearchQuery.toLowerCase();
    return events.filter(event =>
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query) ||
      event.creatorName.toLowerCase().includes(query)
    );
  }, [events, debouncedSearchQuery]);

  // Separate events into categories (memoized)
  const categorizedEvents = useMemo(() => {
    const myEvents = filteredEvents.filter(event => event.creatorId === user?.uid);
    const attendingEventsData = filteredEvents.filter(event =>
      event.attendees.includes(user?.uid || '') && event.creatorId !== user?.uid
    );
    const otherEvents = filteredEvents.filter(event =>
      !event.attendees.includes(user?.uid || '') && event.creatorId !== user?.uid
    );

    // Update attending events set
    const newAttendingSet = new Set(
      filteredEvents
        .filter(event => event.attendees.includes(user?.uid || ''))
        .map(event => event.id)
    );

    if (newAttendingSet.size !== attendingEvents.size ||
      ![...newAttendingSet].every(id => attendingEvents.has(id))) {
      setAttendingEvents(newAttendingSet);
    }

    return { myEvents, attendingEventsData, otherEvents };
  }, [filteredEvents, user?.uid, attendingEvents]);

  // Optimized refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshEvents();
      setAnnouncement('Events refreshed successfully');
    } catch (error) {
      setAnnouncement('Failed to refresh events');
    } finally {
      setRefreshing(false);
    }
  }, [refreshEvents]);

  // Optimized attend event handler
  const handleAttendEvent = useCallback(async (event: Event) => {
    if (processingAttendance.has(event.id)) return;

    setProcessingAttendance(prev => new Set([...prev, event.id]));

    try {
      const isCurrentlyAttending = event.attendees.includes(user?.uid || '');

      // Here you would typically call your event service
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local state optimistically
      const newAttendingSet = new Set(attendingEvents);
      if (isCurrentlyAttending) {
        newAttendingSet.delete(event.id);
        setAnnouncement(`You are no longer attending ${event.title}`);
      } else {
        newAttendingSet.add(event.id);
        setAnnouncement(`You are now attending ${event.title}`);
      }
      setAttendingEvents(newAttendingSet);

    } catch (error) {
      console.error('Error updating attendance:', error);
      setAnnouncement('Failed to update event attendance');
    } finally {
      setProcessingAttendance(prev => {
        const newSet = new Set(prev);
        newSet.delete(event.id);
        return newSet;
      });
    }
  }, [user?.uid, attendingEvents, processingAttendance]);

  // Optimized navigation handlers
  const handleCreateEvent = useCallback(() => {
    router.push("/(app)/events");
  }, []);

  const handleSearch = useCallback(() => {
    // For now, we'll implement search inline
  }, []);

  const handleViewProfile = useCallback(() => {
    router.push("/(app)/profile");
  }, []);

  // Memoized header component as a function (not JSX element)
  const HeaderComponent = useCallback(() => (
    <View className="px-4 mb-6">
      {/* Welcome Section */}
      <View className="flex-row justify-between items-center mb-6">
        <View className="flex-1">
          <Text
            className={`${activeTheme === 'light' ? 'text-gray-900' : 'text-white'} font-rubik text-xl mb-1`}
          >
            Welcome back!
          </Text>
          <Text
            style={{ fontSize: TEXT_SIZE * 0.9 }}
            className={`${activeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'} font-rubik`}
            numberOfLines={1}
          >
            {userProfile?.fullName || 'Event Explorer'}
          </Text>
        </View>

        {/* Notification Bell and Profile */}
        <View className="flex-row items-center gap-3">
          <NotificationBell />
          <AccessibleTouchable
            onPress={handleViewProfile}
            accessibilityLabel="View profile"
            accessibilityHint="Navigate to your profile settings"
            className="w-12 h-12 bg-accent rounded-full items-center justify-center"
          >
            <Feather name="user" size={20} color="white" />
          </AccessibleTouchable>
        </View>
      </View>

      {/* Quick Actions - Admin Only Create Event */}
      <View className="flex-row gap-3 mb-6">
        {isAdmin ? (
          <AccessibleTouchable
            onPress={handleCreateEvent}
            accessibilityLabel="Create new event"
            accessibilityHint="Navigate to create a new event"
            className="flex-1 bg-accent p-4 rounded-xl flex-row items-center justify-center"
          >
            <Feather name="plus" size={20} color="white" />
            <Text className="text-white font-rubik-semibold ml-2">Create Event</Text>
          </AccessibleTouchable>
        ) : (
          <View
            className={`flex-1 p-4 rounded-xl flex-row items-center justify-center border ${activeTheme === 'light'
              ? 'bg-gray-100 border-gray-300'
              : 'bg-gray-800 border-gray-700'
              }`}
          >
            <Feather name="calendar" size={20} color="#9CA3AF" />
            <Text className={`${activeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'} font-rubik-medium ml-2`}>
              Discover Events
            </Text>
          </View>
        )}

        <AccessibleTouchable
          onPress={() => router.push("/(app)/discover")}
          accessibilityLabel="Search events"
          accessibilityHint="Browse and discover events"
          className={`p-4 rounded-xl border ${activeTheme === 'light'
            ? 'bg-gray-100 border-gray-300'
            : 'bg-gray-800 border-gray-700'
            }`}
        >
          <Feather name="compass" size={20} color={activeTheme === 'light' ? '#374151' : 'white'} />
        </AccessibleTouchable>
      </View>

      {/* Simple Search Input */}
      <View className="mb-4">
        <View
          className={`rounded-xl p-4 border ${activeTheme === 'light'
            ? 'bg-white border-gray-300'
            : 'bg-gray-800 border-gray-700'
            }`}
        >
          <Text className={`${activeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'} font-rubik text-sm mb-2`}>
            Search Events
          </Text>
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => {
              // Simulate search input - in real app you'd use TextInput
              setSearchQuery(searchQuery ? '' : 'music'); // Toggle example search
            }}
            activeOpacity={0.7}
          >
            <Feather name="search" size={16} color="#9CA3AF" />
            <Text className={`${activeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'} font-rubik ml-2`}>
              {searchQuery || 'Try searching for "music", "tech", or location...'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Results Info */}
      {debouncedSearchQuery && (
        <View
          className={`p-3 rounded-lg mb-4 border ${activeTheme === 'light'
            ? 'bg-blue-50 border-blue-200'
            : 'bg-gray-800 border-gray-700'
            }`}
        >
          <Text className={`${activeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'} font-rubik text-sm`}>
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found for "{debouncedSearchQuery}"
          </Text>
          <AccessibleTouchable
            onPress={() => setSearchQuery('')}
            accessibilityLabel="Clear search"
            accessibilityHint="Clear the current search query"
            className="mt-2"
          >
            <Text className="text-accent font-rubik-medium text-sm">Clear search</Text>
          </AccessibleTouchable>
        </View>
      )}
    </View>
  ), [userProfile?.fullName, debouncedSearchQuery, filteredEvents.length, searchQuery, handleCreateEvent, handleSearch, handleViewProfile, isAdmin, activeTheme]);

  // Memoized empty component as a function (not JSX element)
  const EmptyComponent = useCallback(() => (
    <View className="items-center py-20 px-6">
      <Feather name="calendar" size={64} color="#9CA3AF" />
      <Text className={`${activeTheme === 'light' ? 'text-gray-900' : 'text-white'} font-rubik-bold text-xl mt-6 mb-3 text-center`}>
        No Events Found
      </Text>
      <Text className={`${activeTheme === 'light' ? 'text-gray-600' : 'text-gray-500'} font-rubik text-center mb-8 leading-6`}>
        {debouncedSearchQuery
          ? `No events match your search for "${debouncedSearchQuery}". Try different keywords or browse all events.`
          : "There are no events available right now. Check back later for new events!"
        }
      </Text>
      {isAdmin ? (
        <AccessibleTouchable
          onPress={debouncedSearchQuery ? () => setSearchQuery('') : handleCreateEvent}
          accessibilityLabel={debouncedSearchQuery ? "Clear search" : "Create first event"}
          accessibilityHint={debouncedSearchQuery ? "Clear search and view all events" : "Navigate to create your first event"}
          className="bg-accent px-6 py-3 rounded-xl"
        >
          <View className="flex-row items-center">
            <Feather
              name={debouncedSearchQuery ? "x" : "plus"}
              size={18}
              color="white"
            />
            <Text className="text-white font-rubik-semibold ml-2">
              {debouncedSearchQuery ? 'Clear Search' : 'Create Event'}
            </Text>
          </View>
        </AccessibleTouchable>
      ) : (
        <AccessibleTouchable
          onPress={() => setSearchQuery('')}
          accessibilityLabel="Clear search"
          className={`px-6 py-3 rounded-xl ${activeTheme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
            }`}
        >
          <Text className={`${activeTheme === 'light' ? 'text-gray-900' : 'text-white'} font-rubik-semibold`}>
            Clear Search
          </Text>
        </AccessibleTouchable>
      )}
    </View>
  ), [debouncedSearchQuery, handleCreateEvent, isAdmin, activeTheme]);

  if (!isReady) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: themeColors.background }}
      >
        <Text className={`${activeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'} font-rubik`}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <PageTransition type="fade">
      <View className="flex-1" style={{ backgroundColor: themeColors.background }}>
        <PlatformStatusBar />
        <SafeAreaView className="flex-1" edges={['top']}>
          {/* Screen Reader Announcements */}
          {announcement && (
            <ScreenReaderAnnouncement
              message={announcement}
              priority="low"
            />
          )}

          {/* Main Content */}
          <View className="flex-1">
            {/* My Events Section - Only show if user has events or is admin */}
            {(categorizedEvents.myEvents.length > 0 || isAdmin) && (
              <View className="mb-6">
                <View className="px-4 mb-3">
                  <Text className={`${activeTheme === 'light' ? 'text-gray-900' : 'text-white'} font-rubik-bold text-lg`}>
                    My Events ({categorizedEvents.myEvents.length})
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                >
                  {/* Horizontal scrolling list for my events */}
                  <View className="flex-row gap-3">
                    {categorizedEvents.myEvents.slice(0, 5).map((event) => (
                      <TouchableOpacity
                        key={event.id}
                        onPress={() => router.push({
                          pathname: "/(app-screens)/(home)/event-screen" as any,
                          params: { eventId: event.id }
                        })}
                        className={`w-72 p-4 rounded-xl border ${activeTheme === 'light'
                          ? 'bg-white border-gray-300'
                          : 'bg-gray-800 border-gray-700'
                          }`}
                        activeOpacity={0.8}
                      >
                        <Text
                          className={`${activeTheme === 'light' ? 'text-gray-900' : 'text-white'} font-rubik-semibold text-base mb-2`}
                          numberOfLines={1}
                        >
                          {event.title}
                        </Text>
                        <Text
                          className={`${activeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'} font-rubik text-sm mb-3`}
                          numberOfLines={2}
                        >
                          {event.description}
                        </Text>
                        <View className="flex-row items-center justify-between">
                          <Text className="text-accent font-rubik-medium text-sm">
                            {event.date}
                          </Text>
                          <View className="bg-accent px-2 py-1 rounded-full">
                            <Text className="text-white font-rubik-medium text-xs">
                              Your Event
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Attending Events Section */}
            {categorizedEvents.attendingEventsData.length > 0 && (
              <View className="mb-6">
                <View className="px-4 mb-3">
                  <Text className={`${activeTheme === 'light' ? 'text-gray-900' : 'text-white'} font-rubik-bold text-lg`}>
                    Attending ({categorizedEvents.attendingEventsData.length})
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                >
                  <View className="flex-row gap-3">
                    {categorizedEvents.attendingEventsData.slice(0, 5).map((event) => (
                      <TouchableOpacity
                        key={event.id}
                        onPress={() => router.push({
                          pathname: "/(app-screens)/(home)/event-screen" as any,
                          params: { eventId: event.id }
                        })}
                        className={`w-72 p-4 rounded-xl border ${activeTheme === 'light'
                          ? 'bg-white border-gray-300'
                          : 'bg-gray-800 border-gray-700'
                          }`}
                        activeOpacity={0.8}
                      >
                        <Text
                          className={`${activeTheme === 'light' ? 'text-gray-900' : 'text-white'} font-rubik-semibold text-base mb-2`}
                          numberOfLines={1}
                        >
                          {event.title}
                        </Text>
                        <Text
                          className={`${activeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'} font-rubik text-sm mb-3`}
                          numberOfLines={2}
                        >
                          by {event.creatorName}
                        </Text>
                        <View className="flex-row items-center justify-between">
                          <Text className="text-accent font-rubik-medium text-sm">
                            {event.date}
                          </Text>
                          <View className="bg-green-600 px-2 py-1 rounded-full">
                            <Text className="text-white font-rubik-medium text-xs">
                              Attending
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* All Events List */}
            <View className="flex-1">
              <View className="px-4 mb-3">
                <Text className={`${activeTheme === 'light' ? 'text-gray-900' : 'text-white'} font-rubik-bold text-lg`}>
                  {debouncedSearchQuery ? 'Search Results' : 'Discover Events'}
                  {!debouncedSearchQuery && ` (${categorizedEvents.otherEvents.length})`}
                </Text>
              </View>

              <OptimizedEventList
                events={debouncedSearchQuery ? filteredEvents : categorizedEvents.otherEvents}
                loading={eventsLoading}
                onRefresh={handleRefresh}
                refreshing={refreshing}
                showAttendButton={true}
                onAttendEvent={handleAttendEvent}
                attendingEvents={attendingEvents}
                processingAttendance={processingAttendance}
                emptyComponent={EmptyComponent}
                headerComponent={!debouncedSearchQuery ? HeaderComponent : undefined}
                testID="home-events-list"
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    </PageTransition>
  );
};

export default Home;