import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import firestore from '@react-native-firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { logoutUser } from '@/services/auth';
import { router } from 'expo-router';

const Profile = () => {
  const { user, userProfile } = useAuth();
  const [stats, setStats] = useState({
    eventsCreated: 0,
    eventsAttending: 0,
    totalAttendees: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      // Get events created by user
      const createdSnapshot = await firestore()
        .collection('events')
        .where('creatorId', '==', user.uid)
        .get();

      // Get events user is attending
      const attendingSnapshot = await firestore()
        .collection('events')
        .where('attendees', 'array-contains', user.uid)
        .get();

      // Calculate total attendees across all user's events
      let totalAttendees = 0;
      createdSnapshot.docs.forEach(doc => {
        const eventData = doc.data();
        totalAttendees += eventData.attendees?.length || 0;
      });

      setStats({
        eventsCreated: createdSnapshot.size,
        eventsAttending: attendingSnapshot.size,
        totalAttendees
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, [user]);

  const handleLogout = async () => {
      try {
          await logoutUser(); 
          router.replace("/welcome");
          Alert.alert("Signed out succesfully")
      } catch (error) {
        Alert.alert("Failed to logout. Something went wrong")
      }
  };

  const StatCard = ({ title, value, subtitle }: { title: string; value: number; subtitle?: string }) => (
    <View className="bg-gray-800 p-4 rounded-xl flex-1 mx-1">
      <Text className="text-accent font-rubik-bold text-2xl text-center">{value}</Text>
      <Text className="text-white font-rubik-medium text-sm text-center mt-1">{title}</Text>
      {subtitle && (
        <Text className="text-gray-400 font-rubik text-xs text-center mt-1">{subtitle}</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Text className="text-white font-rubik">Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="bg-background flex-1">
      <SafeAreaView className="p-4 pt-12">
        {/* Profile Header */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-accent rounded-full items-center justify-center mb-4">
            <Text className="text-white font-rubik-bold text-2xl">
              {userProfile?.phoneNumber?.slice(-2) || 'U'}
            </Text>
          </View>
          <Text className="text-white font-rubik-bold text-xl">
            {userProfile?.fullName || 'User'}
          </Text>
          <Text className="text-gray-400 font-rubik text-sm">
            Member since {new Date(userProfile?.createdAt || Date.now()).toLocaleDateString()}
          </Text>
        </View>

        {/* Stats Section */}
        <View className="mb-8">
          <Text className="text-white font-rubik-semibold text-lg mb-4">Your Activity</Text>
          <View className="flex-row">
            <StatCard 
              title="Events Created" 
              value={stats.eventsCreated}
            />
            <StatCard 
              title="Events Attending" 
              value={stats.eventsAttending}
            />
            <StatCard 
              title="Total Attendees" 
              value={stats.totalAttendees}
              subtitle="across your events"
            />
          </View>
        </View>

        {/* Profile Actions */}
        <View className="flex flex-col gap-y-3">
          <TouchableOpacity className="bg-gray-800 p-4 rounded-xl flex-row justify-between items-center">
            <View>
              <Text className="text-white font-rubik-medium">Edit Profile</Text>
              <Text className="text-gray-400 font-rubik text-sm">Update your information</Text>
            </View>
            <Text className="text-gray-400 font-rubik text-lg">›</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-gray-800 p-4 rounded-xl flex-row justify-between items-center">
            <View>
              <Text className="text-white font-rubik-medium">Event History</Text>
              <Text className="text-gray-400 font-rubik text-sm">View past events</Text>
            </View>
            <Text className="text-gray-400 font-rubik text-lg">›</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-gray-800 p-4 rounded-xl flex-row justify-between items-center">
            <View>
              <Text className="text-white font-rubik-medium">Settings</Text>
              <Text className="text-gray-400 font-rubik text-sm">Notifications & preferences</Text>
            </View>
            <Text className="text-gray-400 font-rubik text-lg">›</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-gray-800 p-4 rounded-xl flex-row justify-between items-center">
            <View>
              <Text className="text-white font-rubik-medium">Help & Support</Text>
              <Text className="text-gray-400 font-rubik text-sm">Get help or contact us</Text>
            </View>
            <Text className="text-gray-400 font-rubik text-lg">›</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity onPress={handleLogout} className="bg-red-600 p-4 rounded-xl mt-8">
          <Text className="text-white font-rubik-semibold text-center">Sign Out</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ScrollView>
  );

}

export default Profile;