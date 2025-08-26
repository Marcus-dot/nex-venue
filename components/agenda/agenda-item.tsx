import { useAuth } from '@/context/auth-context';
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

    const getCategoryColor = (category?: string) => {
        switch (category) {
            case 'keynote': return 'bg-purple-600';
            case 'presentation': return 'bg-blue-600';
            case 'panel': return 'bg-green-600';
            case 'workshop': return 'bg-yellow-600';
            case 'networking': return 'bg-pink-600';
            case 'break': return 'bg-gray-600';
            default: return 'bg-accent';
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

    return (
        <View className={`p-4 rounded-xl mb-3 border-2 ${isCurrentItem
                ? 'bg-accent/20 border-accent'
                : item.isBreak
                    ? 'bg-gray-800/50 border-gray-700'
                    : 'bg-gray-800 border-gray-700'
            }`}>
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
                            <View className="bg-accent px-2 py-1 rounded-full">
                                <Text className="text-white font-rubik-medium text-xs">LIVE</Text>
                            </View>
                        )}
                    </View>
                    <Text className="text-white font-rubik-semibold text-lg">
                        {item.title}
                    </Text>
                </View>

                {/* Admin Controls */}
                {isAdmin && (
                    <View className="flex-row ml-2">
                        {onSetCurrent && !isCurrentItem && (
                            <TouchableOpacity
                                onPress={() => onSetCurrent(item.id)}
                                className="bg-accent px-2 py-1 rounded mr-1"
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
                <Text className="text-accent font-rubik-semibold">
                    {formatTime(item.startTime)} - {formatTime(item.endTime)}
                </Text>
                {item.location && (
                    <Text className="text-gray-400 font-rubik text-sm">
                        📍 {item.location}
                    </Text>
                )}
            </View>

            {/* Description */}
            {item.description && (
                <Text className="text-gray-300 font-rubik text-sm mb-2">
                    {item.description}
                </Text>
            )}

            {/* Speaker */}
            {item.speaker && (
                <Text className="text-gray-400 font-rubik text-sm">
                    🎤 {item.speaker}
                </Text>
            )}

            {/* Break indicator */}
            {item.isBreak && (
                <View className="mt-2 flex-row items-center">
                    <Text className="text-gray-500 font-rubik text-sm">☕ Break Time</Text>
                </View>
            )}
        </View>
    );
};

export default AgendaItem;