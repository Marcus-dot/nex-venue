import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { agendaService } from '@/services/agenda';
import { AgendaItem as AgendaItemType } from '@/types/agenda';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, View } from 'react-native';
import AgendaItem from './agenda-item';

interface AgendaListProps {
    eventId: string;
    currentAgendaItem?: string;
    onEditItem?: (item: AgendaItemType) => void;
}

const AgendaList: React.FC<AgendaListProps> = ({ eventId, currentAgendaItem, onEditItem }) => {
    const { isAdmin, user } = useAuth();
    const { activeTheme } = useTheme();
    const [agendaItems, setAgendaItems] = useState<AgendaItemType[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Theme-aware colors
    const themeColors = {
        background: activeTheme === 'light' ? '#D8D9D4' : '#161616',
        surface: activeTheme === 'light' ? '#ffffff' : '#374151',
        surfaceSecondary: activeTheme === 'light' ? '#f3f4f6' : '#1f2937',
        text: activeTheme === 'light' ? '#1f2937' : '#ffffff',
        textSecondary: activeTheme === 'light' ? '#6b7280' : '#d1d5db',
        textTertiary: activeTheme === 'light' ? '#9ca3af' : '#9CA3AF',
        border: activeTheme === 'light' ? '#e5e7eb' : '#374151',
        dividerColor: activeTheme === 'light' ? '#e5e7eb' : '#374151',

        // Premium colors
        headerGradientStart: activeTheme === 'light' ? '#ffffff' : '#222551',
        headerGradientEnd: activeTheme === 'light' ? '#f8fafc' : '#1e293b',
        headerBorder: activeTheme === 'light' ? 'rgba(226, 232, 240, 0.8)' : 'rgba(71, 85, 105, 0.6)',
        headerShadow: activeTheme === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(0, 0, 0, 0.25)',

        statsCardBg: activeTheme === 'light' ? 'rgba(248, 250, 252, 0.8)' : 'rgba(30, 41, 59, 0.8)',
        statsCardBorder: activeTheme === 'light' ? 'rgba(226, 232, 240, 0.6)' : 'rgba(71, 85, 105, 0.4)',
        statsAccent: '#e85c29',

        dateHeaderBg: activeTheme === 'light' ? '#ffffff' : '#222551',
        dateHeaderBorder: activeTheme === 'light' ? 'rgba(226, 232, 240, 0.8)' : 'rgba(71, 85, 105, 0.6)',
        dateGradient: activeTheme === 'light'
            ? 'linear-gradient(90deg, rgba(232, 92, 41, 0.1) 0%, rgba(248, 113, 113, 0.05) 100%)'
            : 'linear-gradient(90deg, rgba(232, 92, 41, 0.2) 0%, rgba(248, 113, 113, 0.1) 100%)',

        timelineColor: activeTheme === 'light' ? '#e2e8f0' : '#475569',
        timelineAccent: '#e85c29',

        skeletonBg: activeTheme === 'light' ? '#f1f5f9' : '#334155',
        skeletonShimmer: activeTheme === 'light' ? '#e2e8f0' : '#475569',

        emptyStateBg: activeTheme === 'light' ? '#ffffff' : '#222551',
        emptyStateIcon: activeTheme === 'light' ? '#cbd5e1' : '#64748b',
        emptyStateAccent: '#e85c29',
    };

    useEffect(() => {
        if (!eventId) return;

        // Set up real-time listener - items will come back already sorted by date/time
        const unsubscribe = agendaService.subscribeToAgenda(eventId, (items) => {
            setAgendaItems(items); // Items are already sorted chronologically by the service
            setLoading(false);
            setRefreshing(false);
        });

        // Cleanup listener on unmount
        return () => unsubscribe();
    }, [eventId]);

    const handleRefresh = () => {
        setRefreshing(true);
        // The real-time listener will automatically update the data
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!isAdmin) return;

        Alert.alert(
            'Delete Agenda Item',
            'Are you sure you want to delete this agenda item?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await agendaService.deleteAgendaItem(itemId);
                            Alert.alert('Success', 'Agenda item deleted successfully');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete agenda item');
                        }
                    },
                },
            ]
        );
    };

    const handleSetCurrentItem = async (itemId: string) => {
        if (!isAdmin) return;

        try {
            await agendaService.setCurrentAgendaItem(eventId, itemId);
            Alert.alert('Success', 'Current agenda item updated');
        } catch (error) {
            Alert.alert('Error', 'Failed to set current agenda item');
        }
    };

    // Enhanced grouping function that sorts dates properly
    const groupItemsByDate = (items: AgendaItemType[]) => {
        const grouped = items.reduce((acc, item) => {
            if (!acc[item.date]) {
                acc[item.date] = [];
            }
            acc[item.date].push(item);
            return acc;
        }, {} as Record<string, AgendaItemType[]>);

        // Sort dates chronologically
        return Object.entries(grouped).sort(([dateA], [dateB]) => {
            const timeA = new Date(dateA).getTime();
            const timeB = new Date(dateB).getTime();
            return timeA - timeB;
        });
    };

    // Enhanced date formatting
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);

            const isToday = date.toDateString() === today.toDateString();
            const isTomorrow = date.toDateString() === tomorrow.toDateString();

            let baseFormat = date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            if (isToday) {
                baseFormat += ' (Today)';
            } else if (isTomorrow) {
                baseFormat += ' (Tomorrow)';
            }

            return baseFormat;
        } catch (error) {
            // Fallback for invalid dates
            return dateString;
        }
    };

    // Calculate agenda stats for display
    const getAgendaStats = () => {
        const totalItems = agendaItems.length;
        const breaks = agendaItems.filter(item => item.isBreak).length;
        const sessions = totalItems - breaks;
        const dates = new Set(agendaItems.map(item => item.date)).size;

        return { totalItems, sessions, breaks, dates };
    };

    // Premium loading skeleton component
    const LoadingSkeleton = () => (
        <View className="space-y-6">
            {/* Header skeleton */}
            <View
                className="p-6 rounded-2xl border"
                style={{
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border
                }}
            >
                <View className="flex-row justify-between items-center mb-4">
                    <View className="space-y-2">
                        <View
                            className="h-6 w-32 rounded-lg"
                            style={{ backgroundColor: themeColors.skeletonBg }}
                        />
                        <View
                            className="h-4 w-24 rounded-lg"
                            style={{ backgroundColor: themeColors.skeletonShimmer }}
                        />
                    </View>
                    <View
                        className="h-8 w-20 rounded-full"
                        style={{ backgroundColor: themeColors.skeletonBg }}
                    />
                </View>
            </View>

            {/* Items skeleton */}
            {[1, 2, 3].map((i) => (
                <View key={i} className="space-y-4">
                    {/* Date header skeleton */}
                    <View className="space-y-2">
                        <View
                            className="h-6 w-48 rounded-lg"
                            style={{ backgroundColor: themeColors.skeletonBg }}
                        />
                        <View
                            className="h-4 w-32 rounded-lg"
                            style={{ backgroundColor: themeColors.skeletonShimmer }}
                        />
                    </View>

                    {/* Item skeleton */}
                    <View
                        className="p-4 rounded-xl border space-y-3"
                        style={{
                            backgroundColor: themeColors.surface,
                            borderColor: themeColors.border
                        }}
                    >
                        <View className="flex-row justify-between">
                            <View className="space-y-2 flex-1">
                                <View
                                    className="h-5 w-3/4 rounded-lg"
                                    style={{ backgroundColor: themeColors.skeletonBg }}
                                />
                                <View
                                    className="h-4 w-1/2 rounded-lg"
                                    style={{ backgroundColor: themeColors.skeletonShimmer }}
                                />
                            </View>
                            <View
                                className="h-6 w-16 rounded-full"
                                style={{ backgroundColor: themeColors.skeletonBg }}
                            />
                        </View>

                        <View className="space-y-2">
                            <View
                                className="h-4 w-full rounded-lg"
                                style={{ backgroundColor: themeColors.skeletonShimmer }}
                            />
                            <View
                                className="h-4 w-4/5 rounded-lg"
                                style={{ backgroundColor: themeColors.skeletonShimmer }}
                            />
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );

    // Premium empty state component
    const EmptyState = () => (
        <View className="items-center py-16 px-6">
            <View
                className="w-24 h-24 rounded-full items-center justify-center mb-6"
                style={{ backgroundColor: `${themeColors.emptyStateAccent}20` }}
            >
                <Feather name="calendar" size={48} color={themeColors.emptyStateIcon} />
            </View>

            <Text
                className="font-rubik-bold text-2xl mb-3 text-center"
                style={{ color: themeColors.text }}
            >
                No Agenda Items Yet
            </Text>

            {isAdmin ? (
                <Text
                    className="font-rubik text-base text-center mb-8 leading-6 max-w-sm"
                    style={{ color: themeColors.textSecondary }}
                >
                    Create agenda items to help attendees follow the event schedule. Items will automatically appear in chronological order.
                </Text>
            ) : (
                <Text
                    className="font-rubik text-base text-center mb-8 leading-6 max-w-sm"
                    style={{ color: themeColors.textSecondary }}
                >
                    The event agenda will appear here once published by the organizers.
                </Text>
            )}

            <View
                className="px-6 py-3 rounded-xl flex-row items-center"
                style={{ backgroundColor: `${themeColors.emptyStateAccent}15` }}
            >
                <Feather name="clock" size={16} color={themeColors.emptyStateAccent} />
                <Text
                    className="font-rubik-medium text-sm ml-2"
                    style={{ color: themeColors.emptyStateAccent }}
                >
                    Stay tuned for updates
                </Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16 }}
            >
                <LoadingSkeleton />
            </ScrollView>
        );
    }

    if (agendaItems.length === 0) {
        return (
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor="#e85c29"
                    />
                }
            >
                <EmptyState />
            </ScrollView>
        );
    }

    const groupedItems = groupItemsByDate(agendaItems);
    const stats = getAgendaStats();

    return (
        <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    tintColor="#e85c29"
                    title="Pull to refresh"
                    titleColor={themeColors.text}
                />
            }
        >
            {/* Premium Agenda Stats Header */}
            <View
                className="mb-6 p-6 rounded-2xl border"
                style={{
                    backgroundColor: themeColors.headerGradientStart,
                    borderColor: themeColors.headerBorder,
                    shadowColor: themeColors.headerShadow,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 1,
                    shadowRadius: 8,
                    elevation: 4,
                }}
            >
                {/* Header Title */}
                <View className="flex-row items-center justify-between mb-6">
                    <View className="flex-1">
                        <Text
                            className="font-rubik-bold text-2xl mb-1"
                            style={{ color: themeColors.text }}
                        >
                            Event Agenda
                        </Text>
                        <Text
                            className="font-rubik text-sm"
                            style={{ color: themeColors.textSecondary }}
                        >
                            Real-time schedule updates
                        </Text>
                    </View>

                    <View
                        className="px-4 py-2 rounded-full border"
                        style={{
                            backgroundColor: `${themeColors.statsAccent}15`,
                            borderColor: `${themeColors.statsAccent}30`
                        }}
                    >
                        <View className="flex-row items-center">
                            <View
                                className="w-2 h-2 rounded-full mr-2"
                                style={{ backgroundColor: themeColors.statsAccent }}
                            />
                            <Text
                                className="font-rubik-semibold text-sm"
                                style={{ color: themeColors.statsAccent }}
                            >
                                Live Schedule
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Premium Stats Cards */}
                <View className="flex-row space-x-3">
                    {[
                        { label: 'Sessions', value: stats.sessions, icon: 'play-circle', color: '#3b82f6' },
                        { label: 'Breaks', value: stats.breaks, icon: 'coffee', color: '#8b5cf6' },
                        { label: 'Days', value: stats.dates, icon: 'calendar', color: '#10b981' },
                    ].map((stat, index) => (
                        <View
                            key={stat.label}
                            className="flex-1 p-4 rounded-xl border"
                            style={{
                                backgroundColor: themeColors.statsCardBg,
                                borderColor: themeColors.statsCardBorder,
                            }}
                        >
                            <View className="items-center">
                                <View
                                    className="w-10 h-10 rounded-full items-center justify-center mb-2"
                                    style={{ backgroundColor: `${stat.color}20` }}
                                >
                                    <Feather name={stat.icon as any} size={18} color={stat.color} />
                                </View>
                                <Text
                                    className="font-rubik-bold text-xl"
                                    style={{ color: themeColors.text }}
                                >
                                    {stat.value}
                                </Text>
                                <Text
                                    className="font-rubik-medium text-xs text-center"
                                    style={{ color: themeColors.textSecondary }}
                                >
                                    {stat.label}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Chronological Order Indicator */}
                <View
                    className="mt-4 p-3 rounded-lg flex-row items-center"
                    style={{ backgroundColor: `${themeColors.statsAccent}10` }}
                >
                    <Feather name="trending-up" size={16} color={themeColors.statsAccent} />
                    <Text
                        className="font-rubik-medium text-sm ml-2"
                        style={{ color: themeColors.statsAccent }}
                    >
                        Items automatically sorted by date & time
                    </Text>
                </View>
            </View>

            {/* Premium Date Groups */}
            {groupedItems.map(([date, items], groupIndex) => (
                <View key={date} className="mb-8">
                    {/* Enhanced Date Header */}
                    <View
                        className="mb-6 p-4 rounded-xl border"
                        style={{
                            backgroundColor: themeColors.dateHeaderBg,
                            borderColor: themeColors.dateHeaderBorder,
                        }}
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                                <Text
                                    className="font-rubik-bold text-xl mb-1"
                                    style={{ color: themeColors.text }}
                                >
                                    {formatDate(date)}
                                </Text>
                                <View className="flex-row items-center">
                                    <Feather name="clock" size={14} color={themeColors.textSecondary} />
                                    <Text
                                        className="font-rubik text-sm ml-1"
                                        style={{ color: themeColors.textSecondary }}
                                    >
                                        {items.length} item{items.length !== 1 ? 's' : ''} • {items.filter(i => !i.isBreak).length} session{items.filter(i => !i.isBreak).length !== 1 ? 's' : ''}
                                    </Text>
                                </View>
                            </View>

                            <View
                                className="px-3 py-1 rounded-full"
                                style={{ backgroundColor: `${themeColors.timelineAccent}20` }}
                            >
                                <Text
                                    className="font-rubik-semibold text-xs"
                                    style={{ color: themeColors.timelineAccent }}
                                >
                                    Day {groupIndex + 1}
                                </Text>
                            </View>
                        </View>

                        {/* Elegant divider line */}
                        <View className="mt-3">
                            <View
                                className="h-0.5 rounded-full"
                                style={{
                                    backgroundColor: themeColors.timelineAccent,
                                    opacity: 0.3
                                }}
                            />
                        </View>
                    </View>

                    {/* Premium Timeline Items */}
                    <View className="relative">
                        {/* Timeline line */}
                        <View
                            className="absolute left-6 top-0 bottom-0 w-0.5 rounded-full"
                            style={{ backgroundColor: themeColors.timelineColor }}
                        />

                        {items.map((item, index) => (
                            <View key={item.id} className="relative">
                                {/* Timeline dot */}
                                <View
                                    className="absolute left-4 top-6 w-4 h-4 rounded-full border-2 z-10"
                                    style={{
                                        backgroundColor: currentAgendaItem === item.id
                                            ? themeColors.timelineAccent
                                            : themeColors.surface,
                                        borderColor: currentAgendaItem === item.id
                                            ? themeColors.timelineAccent
                                            : themeColors.timelineColor,
                                    }}
                                >
                                    {currentAgendaItem === item.id && (
                                        <View
                                            className="w-2 h-2 rounded-full absolute top-1 left-1"
                                            style={{ backgroundColor: 'white' }}
                                        />
                                    )}
                                </View>

                                {/* Agenda Item with enhanced spacing */}
                                <View className="ml-12 mb-6">
                                    <AgendaItem
                                        item={item}
                                        isCurrentItem={currentAgendaItem === item.id}
                                        onEdit={isAdmin ? onEditItem : undefined}
                                        onDelete={isAdmin ? handleDeleteItem : undefined}
                                        onSetCurrent={isAdmin ? handleSetCurrentItem : undefined}
                                    />
                                </View>

                                {/* Premium time gap indicator */}
                                {index < items.length - 1 && (
                                    <View className="ml-12 mb-4 flex-row items-center">
                                        <View
                                            className="flex-1 h-px"
                                            style={{ backgroundColor: themeColors.timelineColor, opacity: 0.3 }}
                                        />
                                        <View
                                            className="px-3 py-1 rounded-full mx-3"
                                            style={{ backgroundColor: themeColors.surface }}
                                        >
                                            <Text
                                                className="font-rubik text-xs"
                                                style={{ color: themeColors.textTertiary }}
                                            >
                                                {(() => {
                                                    const currentEnd = item.endTime;
                                                    const nextStart = items[index + 1].startTime;
                                                    return `${currentEnd} → ${nextStart}`;
                                                })()}
                                            </Text>
                                        </View>
                                        <View
                                            className="flex-1 h-px"
                                            style={{ backgroundColor: themeColors.timelineColor, opacity: 0.3 }}
                                        />
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                </View>
            ))}

            {/* Enhanced Footer */}
            <View
                className="items-center py-6 mb-4 rounded-xl border"
                style={{
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border
                }}
            >
                <View className="flex-row items-center mb-2">
                    <Feather name="check-circle" size={16} color="#10b981" />
                    <Text
                        className="font-rubik-medium text-sm ml-2"
                        style={{ color: themeColors.textSecondary }}
                    >
                        {stats.totalItems} items automatically synchronized
                    </Text>
                </View>
                <Text
                    className="font-rubik text-xs"
                    style={{ color: themeColors.textTertiary }}
                >
                    Last updated: {new Date().toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    })}
                </Text>
            </View>
        </ScrollView>
    );
};

export default AgendaList;