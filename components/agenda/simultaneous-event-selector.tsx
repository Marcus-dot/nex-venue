import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { agendaService } from '@/services/agenda';
import { AgendaItem } from '@/types/agenda';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';

interface SimultaneousEventSelectorProps {
    events: AgendaItem[];
    simultaneousGroupId: string;
    onSelectionChange?: () => void;
}

export const SimultaneousEventSelector: React.FC<SimultaneousEventSelectorProps> = ({
    events,
    simultaneousGroupId,
    onSelectionChange
}) => {
    const { user } = useAuth();
    const { activeTheme } = useTheme();
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [selecting, setSelecting] = useState(false);

    const themeColors = {
        background: activeTheme === 'light' ? '#ffffff' : '#1f2937',
        text: activeTheme === 'light' ? '#1f2937' : '#ffffff',
        textSecondary: activeTheme === 'light' ? '#6b7280' : '#9ca3af',
        border: activeTheme === 'light' ? '#e5e7eb' : '#374151',
        selected: '#e85c29',
        unselected: activeTheme === 'light' ? '#f3f4f6' : '#374151',
        warningBg: activeTheme === 'light' ? '#fef3c7' : '#78350f',
        warningText: activeTheme === 'light' ? '#92400e' : '#fde68a',
        warningBorder: activeTheme === 'light' ? '#fbbf24' : '#f59e0b',
    };

    // Load user's current selection
    useEffect(() => {
        loadSelection();
    }, [simultaneousGroupId, user?.uid]);

    const loadSelection = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const selection = await agendaService.getAttendeeSelection(
                simultaneousGroupId,
                user.uid
            );
            setSelectedEventId(selection);
        } catch (error) {
            console.error('Error loading selection:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async (eventId: string) => {
        if (!user) {
            Alert.alert('Sign In Required', 'Please sign in to select an event.');
            return;
        }

        if (selecting) return;

        setSelecting(true);
        try {
            await agendaService.selectSimultaneousEvent(
                eventId,
                user.uid,
                simultaneousGroupId
            );
            setSelectedEventId(eventId);
            onSelectionChange?.();
            Alert.alert('Success', 'Your selection has been saved!');
        } catch (error) {
            console.error('Error selecting event:', error);
            Alert.alert('Error', 'Failed to save your selection. Please try again.');
        } finally {
            setSelecting(false);
        }
    };

    if (loading) {
        return (
            <View className="p-4">
                <ActivityIndicator size="small" color="#e85c29" />
            </View>
        );
    }

    return (
        <View
            className="mb-6 p-4 rounded-xl border"
            style={{
                backgroundColor: themeColors.warningBg,
                borderColor: themeColors.warningBorder
            }}
        >
            {/* Header */}
            <View className="flex-row items-center mb-3">
                <Feather
                    name="alert-circle"
                    size={20}
                    color={themeColors.warningText}
                    style={{ marginRight: 8 }}
                />
                <Text
                    className="font-rubik-semibold text-sm flex-1"
                    style={{ color: themeColors.warningText }}
                >
                    Simultaneous Events - Choose One
                </Text>
            </View>

            <Text
                className="font-rubik text-xs mb-4"
                style={{ color: themeColors.warningText }}
            >
                These events are happening at the same time. Please select which one you'd like to attend:
            </Text>

            {/* Event Options */}
            <View className="space-y-3">
                {events.map((event, index) => {
                    const isSelected = selectedEventId === event.id;
                    const selectionCount = event.attendeeSelections?.length || 0;
                    const isAtCapacity = event.maxAttendees && selectionCount >= event.maxAttendees;

                    return (
                        <TouchableOpacity
                            key={event.id}
                            onPress={() => handleSelect(event.id)}
                            disabled={selecting || Boolean(isAtCapacity && !isSelected)}
                            className="p-4 rounded-lg border"
                            style={{
                                backgroundColor: isSelected
                                    ? `${themeColors.selected}15`
                                    : themeColors.background,
                                borderColor: isSelected
                                    ? themeColors.selected
                                    : themeColors.border,
                                borderWidth: isSelected ? 2 : 1,
                                opacity: (isAtCapacity && !isSelected) ? 0.5 : 1
                            }}
                        >
                            <View className="flex-row items-start">
                                {/* Radio Button */}
                                <View
                                    className="w-5 h-5 rounded-full border-2 items-center justify-center mt-0.5"
                                    style={{
                                        borderColor: isSelected ? themeColors.selected : themeColors.border
                                    }}
                                >
                                    {isSelected && (
                                        <View
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: themeColors.selected }}
                                        />
                                    )}
                                </View>

                                {/* Event Info */}
                                <View className="flex-1 ml-3">
                                    <Text
                                        className="font-rubik-semibold text-base mb-1"
                                        style={{ color: themeColors.text }}
                                    >
                                        {event.title}
                                    </Text>

                                    {event.description && (
                                        <Text
                                            className="font-rubik text-sm mb-2"
                                            style={{ color: themeColors.textSecondary }}
                                        >
                                            {event.description}
                                        </Text>
                                    )}

                                    {event.speaker && (
                                        <View className="flex-row items-center mb-1">
                                            <Feather
                                                name="user"
                                                size={14}
                                                color={themeColors.textSecondary}
                                            />
                                            <Text
                                                className="font-rubik text-xs ml-1"
                                                style={{ color: themeColors.textSecondary }}
                                            >
                                                {event.speaker}
                                            </Text>
                                        </View>
                                    )}

                                    {event.location && (
                                        <View className="flex-row items-center">
                                            <Feather
                                                name="map-pin"
                                                size={14}
                                                color={themeColors.textSecondary}
                                            />
                                            <Text
                                                className="font-rubik text-xs ml-1"
                                                style={{ color: themeColors.textSecondary }}
                                            >
                                                {event.location}
                                            </Text>
                                        </View>
                                    )}

                                    {/* Selection Count */}
                                    <View className="flex-row items-center mt-2">
                                        <Feather
                                            name="users"
                                            size={12}
                                            color={themeColors.textSecondary}
                                        />
                                        <Text
                                            className="font-rubik text-xs ml-1"
                                            style={{ color: themeColors.textSecondary }}
                                        >
                                            {selectionCount} {selectionCount === 1 ? 'attendee' : 'attendees'}
                                            {event.maxAttendees && ` / ${event.maxAttendees} max`}
                                        </Text>
                                    </View>

                                    {isAtCapacity && !isSelected && (
                                        <Text
                                            className="font-rubik-medium text-xs mt-2"
                                            style={{ color: '#dc2626' }}
                                        >
                                            ⚠️ Event is at capacity
                                        </Text>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {selecting && (
                <View className="mt-3 items-center">
                    <ActivityIndicator size="small" color={themeColors.selected} />
                </View>
            )}
        </View>
    );
};