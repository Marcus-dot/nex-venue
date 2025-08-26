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

        // Set up real-time listener
        const unsubscribe = agendaService.subscribeToAgenda(eventId, (items) => {
            setAgendaItems(items);
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

    const groupItemsByDate = (items: AgendaItemType[]) => {
        const grouped = items.reduce((acc, item) => {
            if (!acc[item.date]) {
                acc[item.date] = [];
            }
            acc[item.date].push(item);
            return acc;
        }, {} as Record<string, AgendaItemType[]>);

        return Object.entries(grouped).sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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
                        Add agenda items to help attendees follow the event schedule
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
            {groupedItems.map(([date, items]) => (
                <View key={date} className="mb-6">
                    {/* Date Header */}
                    <View className="mb-4">
                        <Text className="text-white font-rubik-bold text-xl">
                            {formatDate(date)}
                        </Text>
                        <View className="w-full h-0.5 bg-accent mt-2" />
                    </View>

                    {/* Items for this date */}
                    {items.map((item) => (
                        <AgendaItem
                            key={item.id}
                            item={item}
                            isCurrentItem={currentAgendaItem === item.id}
                            onEdit={isAdmin ? onEditItem : undefined}
                            onDelete={isAdmin ? handleDeleteItem : undefined}
                            onSetCurrent={isAdmin ? handleSetCurrentItem : undefined}
                        />
                    ))}
                </View>
            ))}

            {/* Last updated indicator */}
            {agendaItems.length > 0 && (
                <View className="items-center py-4">
                    <Text className="text-gray-500 font-rubik text-xs">
                        Last updated: {new Date().toLocaleTimeString()}
                    </Text>
                </View>
            )}
        </ScrollView>
    );
};

export default AgendaList;