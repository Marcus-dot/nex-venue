// (app-screens)/(home)/event-screen.tsx
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import firestore from '@react-native-firebase/firestore';
import type { Event } from '@/types/events';
import type { UserProfile } from '@/types/auth';
import BackNav from '@/components/back-nav';

interface AttendeeInfo {
  uid: string;
  fullName: string;
  phoneNumber: string;
  avatar: string | null;
}

const EventScreen = () => {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<AttendeeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const [isAttending, setIsAttending] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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
      } as Event;

      setEvent(eventData);
      setIsAttending(eventData.attendees.includes(user.uid));
      
      // Fetch attendee details
      if (eventData.attendees.length > 0) {
        await fetchAttendeeDetails(eventData.attendees);
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setLoading(false);
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
          fullName: "Unkwown User",
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
    fetchEventDetails();
  }, [eventId, user]);

  console.log(attendees)

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
        setEvent(prev => prev ? { ...prev, attendees: [...prev.attendees, user.uid] } : null);
        
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
        
        Alert.alert('Success', 'You are now attending this event!');

      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      Alert.alert('Error', 'Failed to update attendance. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const AttendeeCard = ({ attendee }: { attendee: AttendeeInfo }) => (
    <View className="bg-gray-800 p-3 rounded-lg flex-row items-center mb-2">
      <View className="w-10 h-10 bg-accent rounded-full items-center justify-center mr-3">
        <Text className="text-white font-rubik-semibold text-sm">
          {attendee.phoneNumber.slice(attendee.phoneNumber.length - 1)}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-white font-rubik-medium">
          {attendee.uid === user?.uid ? 'You' : attendee.fullName}
        </Text>
        <Text className="text-gray-400 font-rubik text-sm">Attendee</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#ff4306" />
        <Text className="text-white font-rubik mt-4">Loading event...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Text className="text-white font-rubik">Event not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="bg-accent px-4 py-2 rounded-lg mt-4">
          <Text className="text-white font-rubik-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isCreator = event.creatorId === user?.uid;

  return (
    <ScrollView className="bg-background flex-1">
      <View className="p-4 pt-12">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Text className="text-white font-rubik text-lg">←</Text>
          </TouchableOpacity>
          <Text className="text-white font-rubik-bold text-xl flex-1">Event Details</Text>
        </View>

        {/* Event Info */}
        <View className="bg-gray-800 p-4 rounded-xl mb-6">
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1">
              <Text className="text-white font-rubik-bold text-2xl mb-2">{event.title}</Text>
              <Text className="text-gray-400 font-rubik">
                Created by {isCreator ? 'You' : event.creatorName}
              </Text>
            </View>
            {isCreator && (
              <View className="bg-accent px-3 py-1 rounded-full">
                <Text className="text-white font-rubik-medium text-xs">Your Event</Text>
              </View>
            )}
          </View>

          <Text className="text-gray-300 font-rubik text-base mb-4 leading-6">{event.description}</Text>

          <View className="space-y-3">
            <View className="flex-row items-center">
              <View className="w-6 h-6 bg-accent rounded-full items-center justify-center mr-3">
                <Text className="text-white font-rubik-bold text-xs">📅</Text>
              </View>
              <Text className="text-white font-rubik-medium">{event.date} at {event.time}</Text>
            </View>

            <View className="flex-row items-center">
              <View className="w-6 h-6 bg-accent rounded-full items-center justify-center mr-3">
                <Text className="text-white font-rubik-bold text-xs">📍</Text>
              </View>
              <Text className="text-white font-rubik-medium flex-1">{event.location}</Text>
            </View>

            <View className="flex-row items-center">
              <View className="w-6 h-6 bg-accent rounded-full items-center justify-center mr-3">
                <Text className="text-white font-rubik-bold text-xs">👥</Text>
              </View>
              <Text className="text-white font-rubik-medium">
                {event.attendees.length} {event.attendees.length === 1 ? 'person' : 'people'} attending
              </Text>
            </View>
          </View>
        </View>

        {/* Attend Button */}
        {!isCreator && (
          <TouchableOpacity
            onPress={handleAttendEvent}
            disabled={actionLoading}
            className={`p-4 rounded-xl mb-6 ${isAttending ? 'bg-gray-600' : 'bg-accent'} ${actionLoading ? 'opacity-50' : ''}`}
          >
            {actionLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-rubik-semibold text-center text-lg">
                {isAttending ? 'Leave Event' : 'Attend Event'}
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Attendees Section */}
        <View className="mb-6">
          <Text className="text-white font-rubik-bold text-xl mb-4">
            Attendees ({event.attendees.length})
          </Text>

          {attendeesLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#ff4306" />
              <Text className="text-gray-400 font-rubik mt-2">Loading attendees...</Text>
            </View>
          ) : attendees.length > 0 ? (
            <View>
              {attendees.map((attendee) => (
                <AttendeeCard key={attendee.uid} attendee={attendee} />
              ))}
            </View>
          ) : (
            <View className="bg-gray-800 p-6 rounded-xl items-center">
              <Text className="text-gray-400 font-rubik text-lg mb-2">No attendees yet</Text>
              <Text className="text-gray-500 font-rubik text-sm text-center">
                Be the first to attend this event!
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default EventScreen;