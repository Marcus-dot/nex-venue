import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { logoutUser } from '@/services/auth';
import { Feather } from '@expo/vector-icons';
import firestore from '@react-native-firebase/firestore';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {
  const { user, userProfile, isAdmin } = useAuth();
  const { activeTheme } = useTheme();
  const [stats, setStats] = useState({
    eventsCreated: 0,
    eventsAttending: 0,
    totalAttendees: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Theme-aware colors
  const themeColors = {
    background: activeTheme === 'light' ? '#D8D9D4' : '#161616',
    surface: activeTheme === 'light' ? '#ffffff' : '#374151',
    surfaceSecondary: activeTheme === 'light' ? '#f3f4f6' : '#1f2937',
    text: activeTheme === 'light' ? '#1f2937' : '#ffffff',
    textSecondary: activeTheme === 'light' ? '#6b7280' : '#d1d5db',
    textTertiary: activeTheme === 'light' ? '#9ca3af' : '#9CA3AF',
    border: activeTheme === 'light' ? '#e5e7eb' : '#374151',
    skeletonBg: activeTheme === 'light' ? '#e5e7eb' : '#374151',
    adminBg: activeTheme === 'light' ? 'rgba(255, 67, 6, 0.1)' : 'rgba(255, 67, 6, 0.2)',
    adminBorder: activeTheme === 'light' ? 'rgba(255, 67, 6, 0.3)' : 'rgba(255, 67, 6, 0.5)',
    versionText: activeTheme === 'light' ? '#9ca3af' : '#6b7280'
  };

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
      Alert.alert('Error', 'Failed to load profile stats. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserStats();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              await logoutUser();
              router.replace("/welcome");
            } catch (error) {
              setLoggingOut(false);
              Alert.alert("Sign Out Failed", "Something went wrong. Please try again.");
            }
          },
        },
      ]
    );
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    color = "#ff4306"
  }: {
    title: string;
    value: number;
    subtitle?: string;
    icon: string;
    color?: string;
  }) => (
    <View
      className={`p-4 rounded-xl flex-1 mx-1 border`}
      style={{
        backgroundColor: themeColors.surface,
        borderColor: themeColors.border
      }}
    >
      <View className="items-center">
        <View
          className="w-12 h-12 rounded-full items-center justify-center mb-3"
          style={{ backgroundColor: `${color}20` }}
        >
          <Feather name={icon as any} size={24} color={color} />
        </View>
        <Text
          className="font-rubik-bold text-2xl text-center mb-1"
          style={{ color: themeColors.text }}
        >
          {value}
        </Text>
        <Text
          className="font-rubik-medium text-sm text-center leading-5"
          style={{ color: themeColors.text }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            className="font-rubik text-xs text-center mt-1 leading-4"
            style={{ color: themeColors.textSecondary }}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );

  const ProfileAction = ({
    title,
    subtitle,
    icon,
    onPress,
    showArrow = true,
    danger = false
  }: {
    title: string;
    subtitle: string;
    icon: string;
    onPress: () => void;
    showArrow?: boolean;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`p-4 rounded-xl flex-row items-center mb-3 border`}
      style={{
        backgroundColor: danger
          ? (activeTheme === 'light' ? '#fef2f2' : '#450a0a')
          : themeColors.surface,
        borderColor: danger
          ? (activeTheme === 'light' ? '#fecaca' : '#7f1d1d')
          : themeColors.border
      }}
      activeOpacity={0.8}
    >
      <View
        className={`w-10 h-10 rounded-full items-center justify-center mr-4`}
        style={{
          backgroundColor: danger
            ? (activeTheme === 'light' ? '#fee2e2' : '#7f1d1d')
            : themeColors.surfaceSecondary
        }}
      >
        <Feather
          name={icon as any}
          size={18}
          color={danger ? "#ef4444" : (activeTheme === 'light' ? '#374151' : '#ffffff')}
        />
      </View>
      <View className="flex-1">
        <Text
          className="font-rubik-medium text-base"
          style={{
            color: danger ? "#ef4444" : themeColors.text
          }}
        >
          {title}
        </Text>
        <Text
          className="font-rubik text-sm"
          style={{
            color: danger
              ? (activeTheme === 'light' ? '#dc2626' : '#f87171')
              : themeColors.textSecondary
          }}
        >
          {subtitle}
        </Text>
      </View>
      {showArrow && (
        <Feather
          name="chevron-right"
          size={18}
          color={danger ? "#ef4444" : themeColors.textTertiary}
        />
      )}
    </TouchableOpacity>
  );

  const LoadingSkeleton = () => (
    <View className="px-6 pt-4">
      {/* Profile Header Skeleton */}
      <View className="items-center mb-8">
        <View
          className="w-20 h-20 rounded-full mb-4 animate-pulse"
          style={{ backgroundColor: themeColors.skeletonBg }}
        />
        <View
          className="h-6 rounded w-32 mb-2 animate-pulse"
          style={{ backgroundColor: themeColors.skeletonBg }}
        />
        <View
          className="h-4 rounded w-24 animate-pulse"
          style={{ backgroundColor: themeColors.skeletonBg }}
        />
      </View>

      {/* Stats Skeleton */}
      <View className="mb-8">
        <View
          className="h-5 rounded w-32 mb-4 animate-pulse"
          style={{ backgroundColor: themeColors.skeletonBg }}
        />
        <View className="flex-row">
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              className="p-4 rounded-xl flex-1 mx-1 border"
              style={{
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border
              }}
            >
              <View className="items-center animate-pulse">
                <View
                  className="w-12 h-12 rounded-full mb-3"
                  style={{ backgroundColor: themeColors.skeletonBg }}
                />
                <View
                  className="h-8 rounded w-8 mb-1"
                  style={{ backgroundColor: themeColors.skeletonBg }}
                />
                <View
                  className="h-4 rounded w-16"
                  style={{ backgroundColor: themeColors.skeletonBg }}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Actions Skeleton */}
      {[1, 2, 3, 4].map((i) => (
        <View
          key={i}
          className="p-4 rounded-xl flex-row items-center mb-3 border"
          style={{
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border
          }}
        >
          <View
            className="w-10 h-10 rounded-full mr-4 animate-pulse"
            style={{ backgroundColor: themeColors.skeletonBg }}
          />
          <View className="flex-1">
            <View
              className="h-4 rounded w-24 mb-2 animate-pulse"
              style={{ backgroundColor: themeColors.skeletonBg }}
            />
            <View
              className="h-3 rounded w-32 animate-pulse"
              style={{ backgroundColor: themeColors.skeletonBg }}
            />
          </View>
        </View>
      ))}
    </View>
  );

  const getInitials = () => {
    if (userProfile?.fullName) {
      const names = userProfile.fullName.split(' ');
      if (names.length >= 2) {
        return names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase();
      }
      return names[0].charAt(0).toUpperCase();
    }
    return userProfile?.phoneNumber?.slice(-2) || 'U';
  };

  const getMemberSinceDate = () => {
    if (!userProfile?.createdAt) return 'Recently';

    const date = new Date(userProfile.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return 'This month';
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: themeColors.background }}
        edges={['top']}
      >
        <LoadingSkeleton />
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
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ff4306"
            title="Pull to refresh"
            titleColor={themeColors.text}
          />
        }
      >
        <View className="px-6 pt-4">
          {/* Profile Header */}
          <View className="items-center mb-8">
            <View className="w-24 h-24 bg-accent rounded-full items-center justify-center mb-4 shadow-lg">
              <Text className="text-white font-rubik-bold text-2xl">
                {getInitials()}
              </Text>
            </View>

            <Text
              className="font-rubik-bold text-2xl mb-1"
              style={{ color: themeColors.text }}
            >
              {userProfile?.fullName || 'Welcome'}
            </Text>

            <View className="flex-row items-center mb-2">
              <Feather name="phone" size={14} color={themeColors.textTertiary} />
              <Text
                className="font-rubik text-base ml-2"
                style={{ color: themeColors.textSecondary }}
              >
                {userProfile?.phoneNumber}
              </Text>
            </View>

            {isAdmin && (
              <View className="bg-accent px-4 py-2 rounded-full mb-2">
                <View className="flex-row items-center">
                  <Feather name="shield" size={14} color="white" />
                  <Text className="text-white font-rubik-semibold text-sm ml-1">
                    ADMINISTRATOR
                  </Text>
                </View>
              </View>
            )}

            <View className="flex-row items-center">
              <Feather name="calendar" size={14} color={themeColors.textTertiary} />
              <Text
                className="font-rubik text-sm ml-2"
                style={{ color: themeColors.textSecondary }}
              >
                Member since {getMemberSinceDate()}
              </Text>
            </View>
          </View>

          {/* Admin Privileges Notice */}
          {isAdmin && (
            <View
              className="p-4 rounded-xl mb-6 border"
              style={{
                backgroundColor: themeColors.adminBg,
                borderColor: themeColors.adminBorder
              }}
            >
              <View className="flex-row items-center mb-3">
                <Feather name="shield" size={20} color="#ff4306" />
                <Text className="text-accent font-rubik-bold text-lg ml-2">
                  Admin Privileges
                </Text>
              </View>
              <Text
                className="font-rubik text-sm mb-3 leading-5"
                style={{ color: themeColors.text }}
              >
                You have administrator access with advanced capabilities:
              </Text>
              <View className="space-y-2">
                {[
                  'Create and manage event agendas',
                  'Set live agenda items during events',
                  'Real-time agenda updates for attendees'
                ].map((privilege, index) => (
                  <View key={index} className="flex-row items-center">
                    <Feather name="check-circle" size={14} color="#ff4306" />
                    <Text
                      className="font-rubik text-sm ml-2 flex-1 leading-5"
                      style={{ color: themeColors.textSecondary }}
                    >
                      {privilege}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Stats Section */}
          <View className="mb-8">
            <Text
              className="font-rubik-semibold text-xl mb-4"
              style={{ color: themeColors.text }}
            >
              Your Activity
            </Text>
            <View className="flex-row">
              <StatCard
                icon="calendar"
                title="Events Created"
                value={stats.eventsCreated}
                color="#ff4306"
              />
              <StatCard
                icon="heart"
                title="Events Attending"
                value={stats.eventsAttending}
                color="#10b981"
              />
              <StatCard
                icon="users"
                title="Total Attendees"
                value={stats.totalAttendees}
                subtitle="across your events"
                color="#3b82f6"
              />
            </View>
          </View>

          {/* Profile Actions */}
          <View className="mb-8">
            <Text
              className="font-rubik-semibold text-xl mb-4"
              style={{ color: themeColors.text }}
            >
              Account Settings
            </Text>

            <ProfileAction
              title="Edit Profile"
              subtitle={`Update your information${isAdmin ? ' and admin settings' : ''}`}
              icon="edit"
              onPress={() => router.push('/(app-screens)/(profile)/edit-profile')}
            />

            <ProfileAction
              title="Direct Messages"
              subtitle="View your private conversations"
              icon="message-circle"
              onPress={() => router.push('/(app-screens)/(chat)/messages-list' as any)}
            />

            <ProfileAction
              title="Event History"
              subtitle="View past events and activities"
              icon="clock"
              onPress={() => {
                // TODO: Implement event history
                Alert.alert('Coming Soon', 'Event history feature will be available in the next update.');
              }}
            />

            <ProfileAction
              title="Settings & Preferences"
              subtitle="Theme, notifications and app preferences"
              icon="settings"
              onPress={() => router.push('/(app-screens)/(profile)/settings')}
            />

            <ProfileAction
              title="Help & Support"
              subtitle="Get help or contact our support team"
              icon="help-circle"
              onPress={() => {
                Alert.alert(
                  'Help & Support',
                  'Need assistance? Contact our support team:\n\nEmail: support@nexvenue.com\nPhone: +260 123 456 789',
                  [{ text: 'OK' }]
                );
              }}
            />
          </View>

          {/* Sign Out */}
          <ProfileAction
            title="Sign Out"
            subtitle="Sign out of your account"
            icon="log-out"
            onPress={handleLogout}
            showArrow={false}
            danger
          />

          {/* Version Info */}
          <View className="items-center mt-8 mb-4">
            <Text
              className="font-rubik text-xs"
              style={{ color: themeColors.versionText }}
            >
              NexVenue v1.0.0 • Powered by Gralix
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Loading Overlay for Logout */}
      {loggingOut && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center">
          <View
            className="p-6 rounded-xl items-center border"
            style={{
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border
            }}
          >
            <ActivityIndicator size="large" color="#ff4306" />
            <Text
              className="font-rubik-medium mt-4"
              style={{ color: themeColors.text }}
            >
              Signing out...
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Profile;