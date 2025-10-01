import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { agendaService } from '@/services/agenda';
import { AgendaItem as AgendaItemType } from '@/types/agenda';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import AgendaItem from './agenda-item';
import { SimultaneousEventSelector } from './simultaneous-event-selector';
import { SimultaneousEventStats } from './simultaneous-event-stats';

interface AgendaListProps {
    eventId: string;
    currentAgendaItem?: string;
    onEditItem?: (item: AgendaItemType) => void;
}

const AgendaList: React.FC<AgendaListProps> = ({ eventId, currentAgendaItem, onEditItem }: AgendaListProps) => {
    const { isAdmin, user } = useAuth();
    const { activeTheme } = useTheme();
    const [agendaItems, setAgendaItems] = useState<AgendaItemType[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // New state for collapsible functionality
    const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
    const [expandAllMode, setExpandAllMode] = useState(false);

    // Theme-aware colors
    const themeColors = {
        background: activeTheme === 'light' ? '#D8D9D4' : '#ffffff',
        surface: activeTheme === 'light' ? '#ffffff' : '#374151',
        surfaceSecondary: activeTheme === 'light' ? '#f3f4f6' : '#1f2937',
        text: activeTheme === 'light' ? '#1f2937' : '#ffffff',
        textSecondary: activeTheme === 'light' ? '#6b7280' : '#d1d5db',
        textTertiary: activeTheme === 'light' ? '#9ca3af' : '#9CA3AF',
        border: activeTheme === 'light' ? '#e5e7eb' : '#374151',
        dividerColor: activeTheme === 'light' ? '#e5e7eb' : '#374151',

        // Enhanced colors for collapsible design
        headerGradientStart: activeTheme === 'light' ? '#ffffff' : '#161616',
        headerGradientEnd: activeTheme === 'light' ? '#f8fafc' : '#1e293b',
        headerBorder: activeTheme === 'light' ? 'rgba(226, 232, 240, 0.8)' : 'rgba(71, 85, 105, 0.6)',
        headerShadow: activeTheme === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(0, 0, 0, 0.25)',

        statsCardBg: activeTheme === 'light' ? 'rgba(248, 250, 252, 0.8)' : 'rgba(30, 41, 59, 0.8)',
        statsCardBorder: activeTheme === 'light' ? 'rgba(226, 232, 240, 0.6)' : 'rgba(71, 85, 105, 0.4)',
        statsAccent: '#e85c29',

        // Day header colors for collapsible design
        dayHeaderBg: activeTheme === 'light' ? '#ffffff' : '#161616',
        dayHeaderBorder: activeTheme === 'light' ? 'rgba(226, 232, 240, 0.8)' : 'rgba(71, 85, 105, 0.6)',
        dayHeaderShadow: activeTheme === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.2)',
        dayHeaderExpanded: activeTheme === 'light' ? 'rgba(232, 92, 41, 0.05)' : 'rgba(232, 92, 41, 0.1)',
        dayHeaderHover: activeTheme === 'light' ? 'rgba(248, 250, 252, 1)' : 'rgba(30, 41, 59, 1)',

        skeletonBg: activeTheme === 'light' ? '#f1f5f9' : '#334155',
        skeletonShimmer: activeTheme === 'light' ? '#e2e8f0' : '#475569',

        emptyStateBg: activeTheme === 'light' ? '#ffffff' : '#161616',
        emptyStateIcon: activeTheme === 'light' ? '#cbd5e1' : '#64748b',
        emptyStateAccent: '#e85c29',

        // Control buttons
        controlButtonBg: activeTheme === 'light' ? 'rgba(248, 250, 252, 0.9)' : 'rgba(30, 41, 59, 0.8)',
        controlButtonBorder: activeTheme === 'light' ? 'rgba(226, 232, 240, 0.8)' : 'rgba(71, 85, 105, 0.6)',
        controlButtonText: activeTheme === 'light' ? '#374151' : '#e2e8f0',
    };

    useEffect(() => {
        if (!eventId) return;

        // Set up real-time listener - items will come back already sorted by date/time
        const unsubscribe = agendaService.subscribeToAgenda(eventId, (items) => {
            setAgendaItems(items); // Items are already sorted chronologically by the service

            // Auto-expand first day and any day with current agenda item on initial load
            if (items.length > 0 && expandedDays.size === 0) {
                const newExpandedDays = new Set<string>();
                const groupedItems = groupItemsByDate(items);

                // Always expand first day
                if (groupedItems.length > 0) {
                    newExpandedDays.add(groupedItems[0][0]);
                }

                // Also expand day with current agenda item
                if (currentAgendaItem) {
                    const currentItem = items.find(item => item.id === currentAgendaItem);
                    if (currentItem) {
                        newExpandedDays.add(currentItem.date);
                    }
                }

                setExpandedDays(newExpandedDays);
            }

            setLoading(false);
            setRefreshing(false);
        });

        return () => unsubscribe();
    }, [eventId]);

    // Update expanded days when currentAgendaItem changes
    useEffect(() => {
        if (currentAgendaItem && agendaItems.length > 0) {
            const currentItem = agendaItems.find(item => item.id === currentAgendaItem);
            if (currentItem && !expandedDays.has(currentItem.date)) {
                setExpandedDays(prev => new Set([...prev, currentItem.date]));
            }
        }
    }, [currentAgendaItem, agendaItems]);

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

    // Enhanced date formatting with day number
    const formatDate = (dateString: string, dayIndex: number) => {
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

            return { formatted: baseFormat, dayNumber: dayIndex + 1 };
        } catch (error) {
            return { formatted: dateString, dayNumber: dayIndex + 1 };
        }
    };

    // Toggle day expansion
    const toggleDayExpansion = (date: string) => {
        setExpandedDays(prev => {
            const newSet = new Set(prev);
            if (newSet.has(date)) {
                newSet.delete(date);
            } else {
                newSet.add(date);
            }
            return newSet;
        });
    };

    // Expand/Collapse all days
    const toggleExpandAll = () => {
        const groupedItems = groupItemsByDate(agendaItems);
        if (expandAllMode) {
            // Collapse all
            setExpandedDays(new Set());
            setExpandAllMode(false);
        } else {
            // Expand all
            const allDates = groupedItems.map(([date]) => date);
            setExpandedDays(new Set(allDates));
            setExpandAllMode(true);
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

    // 🆕 NEW: Render agenda item with simultaneous event handling
    const renderAgendaItem = (item: AgendaItemType, dateItems: AgendaItemType[]) => {
        // Check if this item is part of a simultaneous group
        const simultaneousGroup = item.simultaneousGroupId
            ? dateItems.filter(i => i.simultaneousGroupId === item.simultaneousGroupId)
            : null;

        // If part of simultaneous group and this is the first item in the group
        if (simultaneousGroup && simultaneousGroup.length > 1) {
            const isFirstInGroup = simultaneousGroup[0].id === item.id;

            if (isFirstInGroup) {
                return (
                    <View key={`simultaneous-${item.simultaneousGroupId}`} className="mb-6">
                        {/* Show stats for admins */}
                        {isAdmin && (
                            <SimultaneousEventStats
                                simultaneousGroupId={item.simultaneousGroupId!}
                                groupTitle={`${item.startTime} - ${item.endTime}`}
                                onEditItem={onEditItem}
                                onDeleteItem={handleDeleteItem}
                                onSetCurrent={handleSetCurrentItem}
                            />
                        )}

                        {/* Show selector for regular attendees */}
                        {!isAdmin && (
                            <SimultaneousEventSelector
                                events={simultaneousGroup}
                                simultaneousGroupId={item.simultaneousGroupId!}
                                onSelectionChange={handleRefresh}
                            />
                        )}
                    </View>
                );
            } else {
                // Don't render individual items that are part of a simultaneous group
                return null;
            }
        }

        // Regular item rendering (not part of simultaneous group)
        return (
            <View key={item.id} className="mb-6">
                <AgendaItem
                    item={item}
                    isCurrentItem={currentAgendaItem === item.id}
                    onEdit={isAdmin ? onEditItem : undefined}
                    onDelete={isAdmin ? handleDeleteItem : undefined}
                    onSetCurrent={isAdmin ? handleSetCurrentItem : undefined}
                />
            </View>
        );
    };

    // Loading component
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

            {/* Day skeletons */}
            {[1, 2, 3].map((i) => (
                <View key={i} className="space-y-4">
                    <View
                        className="p-4 rounded-xl border"
                        style={{
                            backgroundColor: themeColors.surface,
                            borderColor: themeColors.border
                        }}
                    >
                        <View className="flex-row justify-between items-center">
                            <View className="space-y-2 flex-1">
                                <View
                                    className="h-6 w-48 rounded-lg"
                                    style={{ backgroundColor: themeColors.skeletonBg }}
                                />
                                <View
                                    className="h-4 w-32 rounded-lg"
                                    style={{ backgroundColor: themeColors.skeletonShimmer }}
                                />
                            </View>
                            <View
                                className="h-6 w-6 rounded-full"
                                style={{ backgroundColor: themeColors.skeletonBg }}
                            />
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );

    // Empty state component
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
            {/* Agenda Stats Header */}
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
                            {stats.dates > 1 ? `${stats.dates}-day schedule` : 'Daily schedule'} • Real-time updates
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

                {/* Stats Cards */}
                <View className="flex-row space-x-3 mb-4">
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

                {/* Expand/Collapse All Control */}
                {stats.dates > 1 && (
                    <View className="flex-row space-x-3">
                        <TouchableOpacity
                            onPress={toggleExpandAll}
                            className="flex-1 p-3 rounded-lg border flex-row items-center justify-center"
                            style={{
                                backgroundColor: themeColors.controlButtonBg,
                                borderColor: themeColors.controlButtonBorder
                            }}
                            activeOpacity={0.7}
                        >
                            <Feather
                                name={expandAllMode ? "minimize-2" : "maximize-2"}
                                size={16}
                                color={themeColors.statsAccent}
                            />
                            <Text
                                className="font-rubik-medium text-sm ml-2"
                                style={{ color: themeColors.statsAccent }}
                            >
                                {expandAllMode ? 'Collapse All Days' : 'Expand All Days'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Collapsible Date Groups */}
            {groupedItems.map(([date, items], groupIndex) => {
                const isExpanded = expandedDays.has(date);
                const { formatted: formattedDate, dayNumber } = formatDate(date, groupIndex);
                const hasCurrentItem = items.some(item => item.id === currentAgendaItem);

                return (
                    <View key={date} className="mb-6">
                        {/* Enhanced Collapsible Day Header */}
                        <TouchableOpacity
                            onPress={() => toggleDayExpansion(date)}
                            className="p-5 rounded-xl border mb-4"
                            style={{
                                backgroundColor: isExpanded ? themeColors.dayHeaderExpanded : themeColors.dayHeaderBg,
                                borderColor: themeColors.dayHeaderBorder,
                                shadowColor: themeColors.dayHeaderShadow,
                                shadowOffset: { width: 0, height: isExpanded ? 4 : 2 },
                                shadowOpacity: isExpanded ? 0.15 : 0.08,
                                shadowRadius: isExpanded ? 12 : 6,
                                elevation: isExpanded ? 6 : 3,
                            }}
                            activeOpacity={0.8}
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-1 flex-row items-center">
                                    {/* Day Number Badge */}
                                    <View
                                        className="w-12 h-12 rounded-full items-center justify-center mr-4"
                                        style={{
                                            backgroundColor: hasCurrentItem
                                                ? themeColors.statsAccent
                                                : `${themeColors.statsAccent}20`
                                        }}
                                    >
                                        <Text
                                            className="font-rubik-bold text-lg"
                                            style={{
                                                color: hasCurrentItem ? 'white' : themeColors.statsAccent
                                            }}
                                        >
                                            {dayNumber}
                                        </Text>
                                    </View>

                                    <View className="flex-1">
                                        <View className="flex-row items-center mb-1">
                                            <Text
                                                className="font-rubik-bold text-xl"
                                                style={{ color: themeColors.text }}
                                            >
                                                Day {dayNumber}
                                            </Text>
                                            {hasCurrentItem && (
                                                <View
                                                    className="ml-3 px-3 py-1 rounded-full"
                                                    style={{ backgroundColor: themeColors.statsAccent }}
                                                >
                                                    <Text className="text-white font-rubik-bold text-xs">
                                                        LIVE
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text
                                            className="font-rubik text-base mb-2"
                                            style={{ color: themeColors.text }}
                                        >
                                            {formattedDate}
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
                                </View>

                                {/* Expand/Collapse Icon */}
                                <View
                                    className="w-10 h-10 rounded-full items-center justify-center"
                                    style={{
                                        backgroundColor: isExpanded
                                            ? `${themeColors.statsAccent}15`
                                            : themeColors.controlButtonBg
                                    }}
                                >
                                    <Feather
                                        name={isExpanded ? "chevron-up" : "chevron-down"}
                                        size={20}
                                        color={isExpanded ? themeColors.statsAccent : themeColors.textSecondary}
                                    />
                                </View>
                            </View>

                            {/* Progress bar for expanded day */}
                            {isExpanded && (
                                <View className="mt-4">
                                    <View
                                        className="h-1 rounded-full"
                                        style={{
                                            backgroundColor: `${themeColors.statsAccent}20`,
                                        }}
                                    >
                                        <View
                                            className="h-1 rounded-full"
                                            style={{
                                                backgroundColor: themeColors.statsAccent,
                                                width: '100%', // You could calculate actual progress based on time
                                                opacity: 0.6
                                            }}
                                        />
                                    </View>
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Collapsible Agenda Items */}
                        {isExpanded && (
                            <View>
                                {items.map((item) => renderAgendaItem(item, items))}
                            </View>
                        )}
                    </View>
                );
            })}

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
                        {stats.totalItems} items across {stats.dates} day{stats.dates !== 1 ? 's' : ''} • Auto-synchronized
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