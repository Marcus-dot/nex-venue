// File: components/agenda/agenda-item.tsx

import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { AgendaItem as AgendaItemType } from '@/types/agenda';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface AgendaItemProps {
    item: AgendaItemType;
    isCurrentItem?: boolean;
    onEdit?: (item: AgendaItemType) => void;
    onDelete?: (itemId: string) => void;
    onSetCurrent?: (itemId: string) => void;
}

const AgendaItem: React.FC<AgendaItemProps> = ({
    item,
    isCurrentItem = false,
    onEdit,
    onDelete,
    onSetCurrent
}) => {
    const { isAdmin } = useAuth();
    const { activeTheme } = useTheme();

    // Theme-aware colors
    const themeColors = {
        background: activeTheme === 'light' ? '#D8D9D4' : '#222551',
        surface: activeTheme === 'light' ? '#ffffff' : '#374151',
        surfaceSecondary: activeTheme === 'light' ? '#f3f4f6' : '#1f2937',
        text: activeTheme === 'light' ? '#1f2937' : '#ffffff',
        textSecondary: activeTheme === 'light' ? '#6b7280' : '#d1d5db',
        textTertiary: activeTheme === 'light' ? '#9ca3af' : '#9CA3AF',
        border: activeTheme === 'light' ? '#e5e7eb' : '#374151',
        breakBackground: activeTheme === 'light' ? '#f9fafb' : '#374151',
        breakBorder: activeTheme === 'light' ? '#e5e7eb' : '#4b5563',
        currentBackground: activeTheme === 'light' ? 'rgba(232, 92, 41, 0.1)' : 'rgba(232, 92, 41, 0.2)',
        currentBorder: activeTheme === 'light' ? 'rgba(232, 92, 41, 0.3)' : '#e85c29'
    };

    const getCategoryColor = (category?: string) => {
        switch (category) {
            case 'keynote': return 'bg-purple-600';
            case 'presentation': return 'bg-blue-600';
            case 'panel': return 'bg-green-600';
            case 'workshop': return 'bg-yellow-600';
            case 'networking': return 'bg-pink-600';
            case 'break': return 'bg-gray-600';
            default: return 'bg-[#e85c29]'; // Using the new orange color
        }
    };

    const formatTime = (time: string) => {
        // Assuming time is in HH:MM format
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const getItemStyles = () => {
        if (isCurrentItem) {
            return {
                backgroundColor: themeColors.currentBackground,
                borderColor: themeColors.currentBorder,
                borderWidth: 2
            };
        }

        if (item.isBreak) {
            return {
                backgroundColor: themeColors.breakBackground,
                borderColor: themeColors.breakBorder,
                borderWidth: 1
            };
        }

        return {
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
            borderWidth: 1
        };
    };

    return (
        <View
            className="p-4 rounded-xl mb-3"
            style={getItemStyles()}
        >
            {/* Header */}
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                        {item.category && (
                            <View className={`px-2 py-1 rounded-full mr-2 ${getCategoryColor(item.category)}`}>
                                <Text className="text-white font-rubik-medium text-xs">
                                    {item.category.toUpperCase()}
                                </Text>
                            </View>
                        )}
                        {isCurrentItem && (
                            <View style={{ backgroundColor: '#e85c29' }} className="px-2 py-1 rounded-full">
                                <Text className="text-white font-rubik-medium text-xs">LIVE</Text>
                            </View>
                        )}
                    </View>
                    <Text
                        className="font-rubik-semibold text-lg"
                        style={{ color: themeColors.text }}
                    >
                        {item.title}
                    </Text>
                </View>

                {/* Admin Controls */}
                {isAdmin && (
                    <View className="flex-row ml-2">
                        {onSetCurrent && !isCurrentItem && (
                            <TouchableOpacity
                                onPress={() => onSetCurrent(item.id)}
                                style={{ backgroundColor: '#e85c29' }}
                                className="px-2 py-1 rounded mr-1"
                            >
                                <Text className="text-white font-rubik-medium text-xs">SET LIVE</Text>
                            </TouchableOpacity>
                        )}
                        {onEdit && (
                            <TouchableOpacity
                                onPress={() => onEdit(item)}
                                className="bg-blue-600 px-2 py-1 rounded mr-1"
                            >
                                <Text className="text-white font-rubik-medium text-xs">EDIT</Text>
                            </TouchableOpacity>
                        )}
                        {onDelete && (
                            <TouchableOpacity
                                onPress={() => onDelete(item.id)}
                                className="bg-red-600 px-2 py-1 rounded"
                            >
                                <Text className="text-white font-rubik-medium text-xs">DEL</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>

            {/* Time and Location */}
            <View className="flex-row justify-between items-center mb-2">
                <Text style={{ color: '#e85c29' }} className="font-rubik-semibold">
                    {formatTime(item.startTime)} - {formatTime(item.endTime)}
                </Text>
                {item.location && (
                    <Text
                        className="font-rubik text-sm"
                        style={{ color: themeColors.textSecondary }}
                    >
                        📍 {item.location}
                    </Text>
                )}
            </View>

            {/* Description */}
            {item.description && (
                <Text
                    className="font-rubik text-sm mb-2"
                    style={{ color: themeColors.textSecondary }}
                >
                    {item.description}
                </Text>
            )}

            {/* Speaker */}
            {item.speaker && (
                <Text
                    className="font-rubik text-sm"
                    style={{ color: themeColors.textSecondary }}
                >
                    🎤 {item.speaker}
                </Text>
            )}

            {/* Break indicator */}
            {item.isBreak && (
                <View className="mt-2 flex-row items-center">
                    <Text
                        className="font-rubik text-sm"
                        style={{ color: themeColors.textTertiary }}
                    >
                        ☕ Break Time
                    </Text>
                </View>
            )}
        </View>
    );
};

export default AgendaItem;