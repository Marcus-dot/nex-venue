import { useTheme } from '@/context/theme-context';
import { agendaService } from '@/services/agenda';
import { AgendaItem } from '@/types/agenda';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';

interface SimultaneousEventStatsProps {
    simultaneousGroupId: string;
    groupTitle?: string;
    onEditItem?: (item: AgendaItem) => void;
    onDeleteItem?: (itemId: string) => void;
    onSetCurrent?: (itemId: string) => void;
}

export const SimultaneousEventStats: React.FC<SimultaneousEventStatsProps> = ({
    simultaneousGroupId,
    groupTitle,
    onEditItem,
    onDeleteItem,
    onSetCurrent
}) => {
    const { activeTheme } = useTheme();
    const [stats, setStats] = useState<Array<{ id: string; title: string; selectionCount: number; item: AgendaItem }>>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    const themeColors = {
        background: activeTheme === 'light' ? '#ffffff' : '#1f2937',
        text: activeTheme === 'light' ? '#1f2937' : '#ffffff',
        textSecondary: activeTheme === 'light' ? '#6b7280' : '#9ca3af',
        border: activeTheme === 'light' ? '#e5e7eb' : '#374151',
        primary: '#e85c29',
        primaryBg: activeTheme === 'light' ? '#fef2ee' : '#4a1c11',
        statBg: activeTheme === 'light' ? '#f9fafb' : '#374151',
        actionButton: activeTheme === 'light' ? '#f3f4f6' : '#374151',
    };

    useEffect(() => {
        loadStats();
    }, [simultaneousGroupId]);

    const loadStats = async () => {
        setLoading(true);
        try {
            // Get all items in the group with full data
            const groupItems = await agendaService.getEventAgenda(''); // We'll get them differently

            // Better approach: query directly
            const firestore = (await import('@react-native-firebase/firestore')).default;
            const snapshot = await firestore()
                .collection('agendas')
                .where('simultaneousGroupId', '==', simultaneousGroupId)
                .get();

            const itemsWithStats = snapshot.docs.map(doc => {
                const data = doc.data() as AgendaItem;
                return {
                    id: doc.id,
                    title: data.title,
                    selectionCount: data.attendeeSelections?.length || 0,
                    item: { ...data, id: doc.id } as AgendaItem
                };
            });

            setStats(itemsWithStats);
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item: AgendaItem) => {
        onEditItem?.(item);
    };

    const handleDelete = (itemId: string, title: string) => {
        Alert.alert(
            'Delete Event',
            `Are you sure you want to delete "${title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => onDeleteItem?.(itemId)
                }
            ]
        );
    };

    const handleSetLive = (itemId: string, title: string) => {
        Alert.alert(
            'Set as Current',
            `Set "${title}" as the current live agenda item?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Set Live',
                    onPress: () => onSetCurrent?.(itemId)
                }
            ]
        );
    };

    const totalSelections = stats.reduce((sum, stat) => sum + stat.selectionCount, 0);

    if (loading) {
        return (
            <View className="p-4 items-center">
                <ActivityIndicator size="small" color={themeColors.primary} />
            </View>
        );
    }

    return (
        <View
            className="mb-4 p-4 rounded-xl border"
            style={{
                backgroundColor: themeColors.primaryBg,
                borderColor: themeColors.primary
            }}
        >
            {/* Header */}
            <TouchableOpacity
                onPress={() => setExpanded(!expanded)}
                className="flex-row items-center justify-between"
            >
                <View className="flex-row items-center flex-1">
                    <Feather
                        name="bar-chart-2"
                        size={20}
                        color={themeColors.primary}
                        style={{ marginRight: 8 }}
                    />
                    <View className="flex-1">
                        <Text
                            className="font-rubik-semibold text-sm"
                            style={{ color: themeColors.primary }}
                        >
                            {groupTitle || 'Simultaneous Event Stats'}
                        </Text>
                        <Text
                            className="font-rubik text-xs mt-0.5"
                            style={{ color: themeColors.textSecondary }}
                        >
                            {totalSelections} total {totalSelections === 1 ? 'selection' : 'selections'}
                        </Text>
                    </View>
                </View>
                <Feather
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={themeColors.primary}
                />
            </TouchableOpacity>

            {/* Expandable Stats */}
            {expanded && (
                <View className="mt-4 space-y-2">
                    {stats.map((stat) => {
                        const percentage = totalSelections > 0
                            ? Math.round((stat.selectionCount / totalSelections) * 100)
                            : 0;

                        return (
                            <View
                                key={stat.id}
                                className="p-3 rounded-lg"
                                style={{ backgroundColor: themeColors.statBg }}
                            >
                                {/* Title and Count */}
                                <View className="flex-row justify-between items-center mb-2">
                                    <Text
                                        className="font-rubik-medium text-sm flex-1"
                                        style={{ color: themeColors.text }}
                                        numberOfLines={2}
                                    >
                                        {stat.title}
                                    </Text>
                                    <Text
                                        className="font-rubik-bold text-base ml-2"
                                        style={{ color: themeColors.primary }}
                                    >
                                        {stat.selectionCount}
                                    </Text>
                                </View>

                                {/* Progress Bar */}
                                <View
                                    className="h-2 rounded-full overflow-hidden mb-2"
                                    style={{ backgroundColor: themeColors.border }}
                                >
                                    <View
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${percentage}%`,
                                            backgroundColor: themeColors.primary
                                        }}
                                    />
                                </View>

                                <Text
                                    className="font-rubik text-xs mb-3"
                                    style={{ color: themeColors.textSecondary }}
                                >
                                    {percentage}% of selections
                                </Text>

                                {/* Admin Action Buttons */}
                                <View className="flex-row space-x-2">
                                    <TouchableOpacity
                                        onPress={() => handleEdit(stat.item)}
                                        className="flex-1 flex-row items-center justify-center p-2 rounded-lg"
                                        style={{ backgroundColor: themeColors.actionButton }}
                                    >
                                        <Feather name="edit-2" size={14} color={themeColors.text} />
                                        <Text
                                            className="font-rubik-medium text-xs ml-1"
                                            style={{ color: themeColors.text }}
                                        >
                                            Edit
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => handleSetLive(stat.id, stat.title)}
                                        className="flex-1 flex-row items-center justify-center p-2 rounded-lg"
                                        style={{ backgroundColor: themeColors.actionButton }}
                                    >
                                        <Feather name="radio" size={14} color={themeColors.primary} />
                                        <Text
                                            className="font-rubik-medium text-xs ml-1"
                                            style={{ color: themeColors.primary }}
                                        >
                                            Set Live
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => handleDelete(stat.id, stat.title)}
                                        className="flex-row items-center justify-center p-2 rounded-lg"
                                        style={{ backgroundColor: themeColors.actionButton }}
                                    >
                                        <Feather name="trash-2" size={14} color="#dc2626" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}

                    {stats.length === 0 && (
                        <Text
                            className="font-rubik text-sm text-center py-4"
                            style={{ color: themeColors.textSecondary }}
                        >
                            No selections yet
                        </Text>
                    )}
                </View>
            )}

            {/* Refresh Button */}
            <TouchableOpacity
                onPress={loadStats}
                className="mt-3 flex-row items-center justify-center p-2 rounded-lg"
                style={{ backgroundColor: themeColors.background }}
            >
                <Feather name="refresh-cw" size={14} color={themeColors.primary} />
                <Text
                    className="font-rubik-medium text-xs ml-2"
                    style={{ color: themeColors.primary }}
                >
                    Refresh Stats
                </Text>
            </TouchableOpacity>
        </View>
    );
};