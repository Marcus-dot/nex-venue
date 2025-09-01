import { useAuth } from '@/context/auth-context';
import { agendaService } from '@/services/agenda';
import { AgendaItem as AgendaItemType } from '@/types/agenda';
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
    const [agendaItems, setAgendaItems] = useState<AgendaItemType[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center p-4">
                <Text className="text-white font-rubik">Loading agenda...</Text>
            </View>
        );
    }

    if (agendaItems.length === 0) {
        return (
            <View className="flex-1 justify-center items-center p-4">
                <Text className="text-gray-400 font-rubik text-lg mb-2">No agenda items yet</Text>
                {isAdmin ? (
                    <Text className="text-gray-500 font-rubik text-sm text-center">
                        Add agenda items to help attendees follow the event schedule.{'\n'}
                        Items will automatically appear in chronological order.
                    </Text>
                ) : (
                    <Text className="text-gray-500 font-rubik text-sm text-center">
                        The event agenda will appear here once published
                    </Text>
                )}
            </View>
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
                    tintColor="#ff4306"
                />
            }
        >
            {/* Agenda Stats Header */}
            <View className="mb-4 bg-gray-800 p-4 rounded-xl border border-gray-700">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-white font-rubik-bold text-lg">Event Agenda</Text>
                        <Text className="text-gray-400 font-rubik text-sm">
                            {stats.sessions} sessions • {stats.breaks} breaks • {stats.dates} day{stats.dates !== 1 ? 's' : ''}
                        </Text>
                    </View>
                    <View className="bg-accent/20 px-3 py-1 rounded-full">
                        <Text className="text-accent font-rubik-medium text-sm">
                            📅 Chronological Order
                        </Text>
                    </View>
                </View>
            </View>

            {groupedItems.map(([date, items]) => (
                <View key={date} className="mb-6">
                    {/* Enhanced Date Header */}
                    <View className="mb-4">
                        <Text className="text-white font-rubik-bold text-xl">
                            {formatDate(date)}
                        </Text>
                        <Text className="text-gray-400 font-rubik text-sm mt-1">
                            {items.length} agenda item{items.length !== 1 ? 's' : ''} • {items.filter(i => !i.isBreak).length} session{items.filter(i => !i.isBreak).length !== 1 ? 's' : ''}
                        </Text>
                        <View className="w-full h-0.5 bg-accent mt-2" />
                    </View>

                    {/* Items for this date - already sorted by time */}
                    {items.map((item, index) => (
                        <View key={item.id}>
                            <AgendaItem
                                item={item}
                                isCurrentItem={currentAgendaItem === item.id}
                                onEdit={isAdmin ? onEditItem : undefined}
                                onDelete={isAdmin ? handleDeleteItem : undefined}
                                onSetCurrent={isAdmin ? handleSetCurrentItem : undefined}
                            />

                            {/* Show time gap indicator between items */}
                            {index < items.length - 1 && (
                                <View className="flex-row items-center justify-center my-2">
                                    <View className="flex-1 h-px bg-gray-700" />
                                    <Text className="text-gray-500 font-rubik text-xs mx-3">
                                        {/* Calculate time gap */}
                                        {(() => {
                                            const currentEnd = item.endTime;
                                            const nextStart = items[index + 1].startTime;

                                            // Simple gap indicator
                                            if (currentEnd !== nextStart) {
                                                return `${currentEnd} → ${nextStart}`;
                                            }
                                            return '•';
                                        })()}
                                    </Text>
                                    <View className="flex-1 h-px bg-gray-700" />
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            ))}

            {/* Enhanced last updated indicator */}
            {agendaItems.length > 0 && (
                <View className="items-center py-4 bg-gray-800/50 rounded-lg">
                    <Text className="text-gray-500 font-rubik text-xs">
                        📊 {stats.totalItems} total items automatically sorted by date & time
                    </Text>
                    <Text className="text-gray-500 font-rubik text-xs mt-1">
                        Last updated: {new Date().toLocaleTimeString()}
                    </Text>
                </View>
            )}
        </ScrollView>
    );
};

export default AgendaList;