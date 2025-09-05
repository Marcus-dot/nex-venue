import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { Event } from '@/types/events';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { memo, useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, ListRenderItemInfo, Text, TouchableOpacity, View } from 'react-native';

interface OptimizedEventListProps {
    events: Event[];
    loading?: boolean;
    onRefresh?: () => void;
    refreshing?: boolean;
    onEndReached?: () => void;
    onEndReachedThreshold?: number;
    showAttendButton?: boolean;
    onAttendEvent?: (event: Event) => Promise<void>;
    attendingEvents?: Set<string>;
    processingAttendance?: Set<string>;
    emptyComponent?: React.ComponentType<any>;
    headerComponent?: React.ComponentType<any>;
    testID?: string;
}

// Memoized Event Card component to prevent unnecessary re-renders
const EventCard = memo<{
    event: Event;
    isAttending: boolean;
    isCreator: boolean;
    isProcessing: boolean;
    showAttendButton: boolean;
    onPress: (eventId: string) => void;
    onAttend?: (event: Event) => void;
    currentUserId?: string;
    activeTheme: 'light' | 'dark';
}>(({
    event,
    isAttending,
    isCreator,
    isProcessing,
    showAttendButton,
    onPress,
    onAttend,
    currentUserId,
    activeTheme
}) => {
    const handlePress = useCallback(() => {
        onPress(event.id);
    }, [event.id, onPress]);

    const handleAttend = useCallback((e: any) => {
        e.stopPropagation();
        onAttend?.(event);
    }, [event, onAttend]);

    const handleViewAttendees = useCallback((e: any) => {
        e.stopPropagation();
        // Could navigate to attendees screen or show modal
    }, []);

    // Theme-aware styles
    const cardBg = activeTheme === 'light' ? 'bg-white' : 'bg-gray-800';
    const cardBorder = activeTheme === 'light' ? 'border-gray-300' : 'border-gray-700';
    const titleColor = activeTheme === 'light' ? 'text-gray-900' : 'text-white';
    const subtitleColor = activeTheme === 'light' ? 'text-gray-600' : 'text-gray-400';
    const descriptionColor = activeTheme === 'light' ? 'text-gray-700' : 'text-gray-300';
    const actionsBg = activeTheme === 'light' ? 'bg-gray-100' : 'bg-gray-700';
    const actionsText = activeTheme === 'light' ? 'text-gray-700' : 'text-white';
    const locationColor = activeTheme === 'light' ? '#6b7280' : '#9CA3AF';

    return (
        <TouchableOpacity
            onPress={handlePress}
            className={`${cardBg} p-4 rounded-xl mb-4 border ${cardBorder}`}
            activeOpacity={0.8}
            testID={`event-card-${event.id}`}
        >
            {/* Header */}
            <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 pr-3">
                    <Text className={`${titleColor} font-rubik-semibold text-lg mb-1 leading-6`} numberOfLines={2}>
                        {event.title}
                    </Text>
                    <Text className={`${subtitleColor} font-rubik text-sm`}>
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
            <Text className={`${descriptionColor} font-rubik text-sm mb-4 leading-5`} numberOfLines={3}>
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
                    <Feather name="map-pin" size={14} color={locationColor} />
                    <Text className={`${subtitleColor} font-rubik text-sm ml-2 flex-1`} numberOfLines={1}>
                        {event.location}
                    </Text>
                </View>
            </View>

            {/* Actions */}
            <View className="flex-row justify-between items-center">
                <TouchableOpacity
                    onPress={handleViewAttendees}
                    className={`flex-row items-center ${actionsBg} px-4 py-2 rounded-lg`}
                    activeOpacity={0.7}
                >
                    <Feather name="users" size={16} color={activeTheme === 'light' ? '#374151' : '#ffffff'} />
                    <Text className={`${actionsText} font-rubik-medium text-sm ml-2`}>
                        {event.attendees.length} attending
                    </Text>
                </TouchableOpacity>

                {showAttendButton && !isCreator && (
                    <TouchableOpacity
                        onPress={handleAttend}
                        className={`px-6 py-2 rounded-lg flex-row items-center ${isAttending
                            ? activeTheme === 'light' ? 'bg-gray-400' : 'bg-gray-600'
                            : isProcessing
                                ? activeTheme === 'light' ? 'bg-gray-400' : 'bg-gray-600'
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
});

EventCard.displayName = 'EventCard';

const OptimizedEventList: React.FC<OptimizedEventListProps> = ({
    events,
    loading = false,
    onRefresh,
    refreshing = false,
    onEndReached,
    onEndReachedThreshold = 0.1,
    showAttendButton = false,
    onAttendEvent,
    attendingEvents = new Set(),
    processingAttendance = new Set(),
    emptyComponent: EmptyComponent,
    headerComponent: HeaderComponent,
    testID = "event-list"
}) => {
    const { user } = useAuth();
    const { activeTheme } = useTheme();

    // Theme-aware colors
    const loadingTextColor = activeTheme === 'light' ? 'text-gray-600' : 'text-gray-400';
    const emptyTitleColor = activeTheme === 'light' ? 'text-gray-900' : 'text-white';
    const emptySubtitleColor = activeTheme === 'light' ? 'text-gray-600' : 'text-gray-500';

    // Memoize event navigation handler
    const handleEventPress = useCallback((eventId: string) => {
        router.push({
            pathname: "/(app-screens)/(home)/event-screen",
            params: { eventId }
        });
    }, []);

    // Memoize attend event handler
    const handleAttendEvent = useCallback(async (event: Event) => {
        if (onAttendEvent) {
            await onAttendEvent(event);
        }
    }, [onAttendEvent]);

    // Optimized keyExtractor
    const keyExtractor = useCallback((item: Event) => item.id, []);

    // Optimized renderItem with proper memoization
    const renderItem = useCallback(({ item }: ListRenderItemInfo<Event>) => {
        const isAttending = attendingEvents.has(item.id);
        const isCreator = item.creatorId === user?.uid;
        const isProcessing = processingAttendance.has(item.id);

        return (
            <EventCard
                event={item}
                isAttending={isAttending}
                isCreator={isCreator}
                isProcessing={isProcessing}
                showAttendButton={showAttendButton}
                onPress={handleEventPress}
                onAttend={showAttendButton ? handleAttendEvent : undefined}
                currentUserId={user?.uid}
                activeTheme={activeTheme}
            />
        );
    }, [
        attendingEvents,
        user?.uid,
        processingAttendance,
        showAttendButton,
        handleEventPress,
        handleAttendEvent,
        activeTheme
    ]);

    // Memoize getItemLayout for better performance
    const getItemLayout = useCallback((_: any, index: number) => ({
        length: 200, // Approximate item height
        offset: 200 * index,
        index,
    }), []);

    // Memoize empty component
    const renderEmptyComponent = useCallback(() => {
        if (loading) {
            return (
                <View className="flex-1 justify-center items-center py-20">
                    <ActivityIndicator size="large" color="#ff4306" />
                    <Text className={`${loadingTextColor} font-rubik mt-4`}>Loading events...</Text>
                </View>
            );
        }

        if (EmptyComponent) {
            return <EmptyComponent />;
        }

        return (
            <View className="flex-1 justify-center items-center py-20">
                <Feather name="calendar" size={48} color="#9CA3AF" />
                <Text className={`${emptyTitleColor} font-rubik text-xl mt-4 mb-2`}>No events found</Text>
                <Text className={`${emptySubtitleColor} font-rubik text-center px-8`}>
                    Check back later or create your own event!
                </Text>
            </View>
        );
    }, [loading, EmptyComponent, loadingTextColor, emptyTitleColor, emptySubtitleColor]);

    // Memoize footer component for loading more
    const renderFooterComponent = useCallback(() => {
        if (!loading || events.length === 0) return null;

        return (
            <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#ff4306" />
                <Text className={`${loadingTextColor} font-rubik text-sm mt-2`}>Loading more events...</Text>
            </View>
        );
    }, [loading, events.length, loadingTextColor]);

    // Memoized FlatList props
    const flatListProps = useMemo(() => ({
        data: events,
        keyExtractor,
        renderItem,
        getItemLayout: events.length > 0 ? getItemLayout : undefined,
        onRefresh,
        refreshing,
        onEndReached,
        onEndReachedThreshold,
        ListEmptyComponent: renderEmptyComponent,
        ListHeaderComponent: HeaderComponent,
        ListFooterComponent: renderFooterComponent,
        showsVerticalScrollIndicator: false,
        removeClippedSubviews: true,
        maxToRenderPerBatch: 10,
        initialNumToRender: 10,
        windowSize: 10,
        updateCellsBatchingPeriod: 100,
        contentContainerStyle: {
            paddingBottom: 100,
            flexGrow: events.length === 0 ? 1 : 0
        },
        testID,
    }), [
        events,
        keyExtractor,
        renderItem,
        getItemLayout,
        onRefresh,
        refreshing,
        onEndReached,
        onEndReachedThreshold,
        renderEmptyComponent,
        HeaderComponent,
        renderFooterComponent,
        testID
    ]);

    return <FlatList {...flatListProps} />;
};

export default memo(OptimizedEventList);