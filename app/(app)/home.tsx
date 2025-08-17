import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import firestore from '@react-native-firebase/firestore';
import type { Event } from "../../types/events";
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const Home = () => {
  const { user } = useAuth();
  const [latestEvents, setLatestEvents] = useState<Event[]>([]);
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async () => {
    if (!user) return;

    try {
      // Fetch latest events (limit to 3 for preview)
      const latestSnapshot = await firestore()
        .collection('events')
        .orderBy('createdAt', 'desc')
        .limit(3)
        .get();

      const latest = latestSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];

      // Fetch user's events (limit to 3 for preview)
      const userSnapshot = await firestore()
        .collection('events')
        .where('creatorId', '==', user.uid)
        .orderBy('createdAt', 'desc')
        .limit(3)
        .get();

      const userEventsData = userSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];

      setLatestEvents(latest);
      setUserEvents(userEventsData);
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

  const EventCard = ({ event, isPreview = false }: { event: Event; isPreview?: boolean }) => (
    <TouchableOpacity className="bg-gray-800 p-4 rounded-xl mb-3 border border-gray-700">
      <Text className="text-white font-rubik-semibold text-lg mb-2">{event.title}</Text>
      <Text className="text-gray-300 font-rubik text-sm mb-2" numberOfLines={isPreview ? 2 : undefined}>
        {event.description}
      </Text>
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-accent font-rubik-medium text-sm">{event.date} at {event.time}</Text>
          <Text className="text-gray-400 font-rubik text-sm">{event.location}</Text>
        </View>
        <View className="bg-accent px-3 py-1 rounded-full">
          <Text className="text-white font-rubik-medium text-xs">{event.attendees.length} attending</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Text className="text-white font-rubik">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      className="bg-background flex-1"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <SafeAreaView className="p-4 pt-12">
        <Text className="text-white font-rubik-bold text-2xl mb-6">Welcome back!</Text>
        
        {/* Latest Events Section */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white font-rubik-semibold text-xl">Latest Events</Text>
            <TouchableOpacity>
              <Text className="text-accent font-rubik-medium">See All</Text>
            </TouchableOpacity>
          </View>
          
          {latestEvents.length > 0 ? (
            latestEvents.map((event) => (
              <EventCard key={event.id} event={event} isPreview />
            ))
          ) : (
            <View className="bg-gray-800 p-6 rounded-xl items-center">
              <Text className="text-gray-400 font-rubik">No events available</Text>
            </View>
          )}
        </View>

        {/* Your Events Section */}
        <View>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white font-rubik-semibold text-xl">Your Events</Text>
            <TouchableOpacity>
              <Text className="text-accent font-rubik-medium">View All</Text>
            </TouchableOpacity>
          </View>
          
          {userEvents.length > 0 ? (
            userEvents.map((event) => (
              <EventCard key={event.id} event={event} isPreview />
            ))
          ) : (
            <View className="bg-gray-800 p-6 rounded-xl items-center">
              <Text className="text-gray-400 font-rubik mb-2">You haven't created any events yet</Text>
              <TouchableOpacity onPress={() => {
                router.push({
                  pathname: "/(app)/events",
                  params: {
                    toggle: "create-event", t: Date.now()
                  }
                })
              }} className="bg-accent px-4 py-2 rounded-lg">
                <Text className="text-white font-rubik-medium">Create Event</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default Home;