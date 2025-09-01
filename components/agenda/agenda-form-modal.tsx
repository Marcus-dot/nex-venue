import ActionButton from '@/components/action-button';
import { TEXT_SIZE } from '@/constants';
import { useAuth } from '@/context/auth-context';
import { agendaService } from '@/services/agenda';
import { AgendaItem } from '@/types/agenda';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AgendaFormModalProps {
    visible: boolean;
    onClose: () => void;
    eventId: string;
    editingItem?: AgendaItem | null;
    // Removed nextOrder - no longer needed since we auto-sort by time
}

const AgendaFormModal: React.FC<AgendaFormModalProps> = ({
    visible,
    onClose,
    eventId,
    editingItem
}) => {
    const { user } = useAuth();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [date, setDate] = useState('');
    const [speaker, setSpeaker] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState<AgendaItem['category']>('presentation');
    const [isBreak, setIsBreak] = useState(false);
    const [loading, setLoading] = useState(false);

    const categories: Array<{ value: AgendaItem['category']; label: string }> = [
        { value: 'keynote', label: 'Keynote' },
        { value: 'presentation', label: 'Presentation' },
        { value: 'panel', label: 'Panel Discussion' },
        { value: 'workshop', label: 'Workshop' },
        { value: 'networking', label: 'Networking' },
        { value: 'break', label: 'Break' },
        { value: 'other', label: 'Other' },
    ];

    useEffect(() => {
        if (editingItem) {
            setTitle(editingItem.title);
            setDescription(editingItem.description || '');
            setStartTime(editingItem.startTime);
            setEndTime(editingItem.endTime);
            setDate(editingItem.date);
            setSpeaker(editingItem.speaker || '');
            setLocation(editingItem.location || '');
            setCategory(editingItem.category || 'presentation');
            setIsBreak(editingItem.isBreak || false);
        } else {
            // Reset form for new item
            setTitle('');
            setDescription('');
            setStartTime('');
            setEndTime('');
            setDate('');
            setSpeaker('');
            setLocation('');
            setCategory('presentation');
            setIsBreak(false);
        }
    }, [editingItem, visible]);

    const validateForm = () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Title is required');
            return false;
        }
        if (!startTime.trim()) {
            Alert.alert('Error', 'Start time is required');
            return false;
        }
        if (!endTime.trim()) {
            Alert.alert('Error', 'End time is required');
            return false;
        }
        if (!date.trim()) {
            Alert.alert('Error', 'Date is required');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm() || !user) return;

        setLoading(true);
        try {
            const itemData: Omit<AgendaItem, 'id' | 'eventId' | 'createdAt' | 'updatedAt'> = {
                title: title.trim(),
                description: description.trim() || undefined,
                startTime: startTime.trim(),
                endTime: endTime.trim(),
                date: date.trim(),
                speaker: speaker.trim() || undefined,
                location: location.trim() || undefined,
                category,
                isBreak,
                // Order will be auto-calculated in the service
                order: editingItem?.order || 1, // Placeholder - will be calculated correctly
                createdBy: editingItem?.createdBy || user.uid,
                lastEditedBy: user.uid,
            };

            if (editingItem) {
                await agendaService.updateAgendaItem(editingItem.id, itemData, user.uid);
                Alert.alert('Success', 'Agenda item updated successfully');
            } else {
                await agendaService.createAgendaItem(eventId, itemData, user.uid);
                Alert.alert('Success', 'Agenda item created and positioned chronologically');
            }

            onClose();
        } catch (error) {
            console.error('Error saving agenda item:', error);
            Alert.alert('Error', 'Failed to save agenda item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <KeyboardAvoidingView
                className="flex-1 bg-background"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <SafeAreaView className="flex-1">
                    {/* Header */}
                    <View className="flex-row justify-between items-center p-4 border-b border-gray-700">
                        <Text className="text-white font-rubik-bold text-xl">
                            {editingItem ? 'Edit Agenda Item' : 'Add Agenda Item'}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text className="text-gray-400 font-rubik-semibold">Cancel</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                        {/* Title */}
                        <View className="mb-4">
                            <Text style={{ fontSize: TEXT_SIZE * 0.8 }} className="text-white font-rubik-medium mb-2">
                                Title *
                            </Text>
                            <TextInput
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Enter agenda item title"
                                placeholderTextColor="#9CA3AF"
                                className="bg-gray-800 text-white p-3 rounded-lg font-rubik"
                                style={{ fontSize: TEXT_SIZE }}
                            />
                        </View>

                        {/* Description */}
                        <View className="mb-4">
                            <Text style={{ fontSize: TEXT_SIZE * 0.8 }} className="text-white font-rubik-medium mb-2">
                                Description
                            </Text>
                            <TextInput
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Enter description (optional)"
                                placeholderTextColor="#9CA3AF"
                                className="bg-gray-800 text-white p-3 rounded-lg font-rubik"
                                style={{ fontSize: TEXT_SIZE, minHeight: 80 }}
                                multiline
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Date - Updated with better placeholder */}
                        <View className="mb-4">
                            <Text style={{ fontSize: TEXT_SIZE * 0.8 }} className="text-white font-rubik-medium mb-2">
                                Date *
                            </Text>
                            <TextInput
                                value={date}
                                onChangeText={setDate}
                                placeholder="e.g., 2025-10-02 or Oct 2, 2025"
                                placeholderTextColor="#9CA3AF"
                                className="bg-gray-800 text-white p-3 rounded-lg font-rubik"
                                style={{ fontSize: TEXT_SIZE }}
                            />
                            <Text className="text-gray-400 font-rubik text-xs mt-1">
                                Supports: 2025-10-02, Oct 2 2025, October 2 2025
                            </Text>
                        </View>

                        {/* Time Fields - Updated with better placeholders */}
                        <View className="flex-row gap-4 mb-4">
                            <View className="flex-1">
                                <Text style={{ fontSize: TEXT_SIZE * 0.8 }} className="text-white font-rubik-medium mb-2">
                                    Start Time *
                                </Text>
                                <TextInput
                                    value={startTime}
                                    onChangeText={setStartTime}
                                    placeholder="e.g., 09:00 or 9:00 AM"
                                    placeholderTextColor="#9CA3AF"
                                    className="bg-gray-800 text-white p-3 rounded-lg font-rubik"
                                    style={{ fontSize: TEXT_SIZE }}
                                />
                            </View>
                            <View className="flex-1">
                                <Text style={{ fontSize: TEXT_SIZE * 0.8 }} className="text-white font-rubik-medium mb-2">
                                    End Time *
                                </Text>
                                <TextInput
                                    value={endTime}
                                    onChangeText={setEndTime}
                                    placeholder="e.g., 10:00 or 10:00 AM"
                                    placeholderTextColor="#9CA3AF"
                                    className="bg-gray-800 text-white p-3 rounded-lg font-rubik"
                                    style={{ fontSize: TEXT_SIZE }}
                                />
                            </View>
                        </View>

                        {/* Helper text for time formats */}
                        <View className="mb-4 bg-blue-900/20 border border-blue-600 p-3 rounded-lg">
                            <Text className="text-blue-400 font-rubik text-xs">
                                ℹ️ Time formats supported: 24-hour (14:30) or 12-hour (2:30 PM)
                            </Text>
                        </View>

                        {/* Speaker */}
                        <View className="mb-4">
                            <Text style={{ fontSize: TEXT_SIZE * 0.8 }} className="text-white font-rubik-medium mb-2">
                                Speaker
                            </Text>
                            <TextInput
                                value={speaker}
                                onChangeText={setSpeaker}
                                placeholder="Speaker name (optional)"
                                placeholderTextColor="#9CA3AF"
                                className="bg-gray-800 text-white p-3 rounded-lg font-rubik"
                                style={{ fontSize: TEXT_SIZE }}
                            />
                        </View>

                        {/* Location */}
                        <View className="mb-4">
                            <Text style={{ fontSize: TEXT_SIZE * 0.8 }} className="text-white font-rubik-medium mb-2">
                                Location
                            </Text>
                            <TextInput
                                value={location}
                                onChangeText={setLocation}
                                placeholder="Room/venue (optional)"
                                placeholderTextColor="#9CA3AF"
                                className="bg-gray-800 text-white p-3 rounded-lg font-rubik"
                                style={{ fontSize: TEXT_SIZE }}
                            />
                        </View>

                        {/* Category */}
                        <View className="mb-4">
                            <Text style={{ fontSize: TEXT_SIZE * 0.8 }} className="text-white font-rubik-medium mb-2">
                                Category
                            </Text>
                            <View className="flex-row flex-wrap gap-2">
                                {categories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.value}
                                        onPress={() => setCategory(cat.value)}
                                        className={`px-3 py-2 rounded-lg border ${category === cat.value
                                            ? 'bg-accent border-accent'
                                            : 'bg-gray-800 border-gray-600'
                                            }`}
                                    >
                                        <Text
                                            className={`font-rubik ${category === cat.value ? 'text-white' : 'text-gray-300'
                                                }`}
                                            style={{ fontSize: TEXT_SIZE * 0.8 }}
                                        >
                                            {cat.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Break Toggle */}
                        <View className="mb-6">
                            <TouchableOpacity
                                onPress={() => setIsBreak(!isBreak)}
                                className={`p-3 rounded-lg border flex-row justify-between items-center ${isBreak
                                    ? 'bg-accent border-accent'
                                    : 'bg-gray-800 border-gray-600'
                                    }`}
                            >
                                <Text className={`font-rubik ${isBreak ? 'text-white' : 'text-gray-300'}`}>
                                    This is a break/intermission
                                </Text>
                                <Text className={`font-rubik-bold ${isBreak ? 'text-white' : 'text-gray-300'}`}>
                                    {isBreak ? '✓' : '○'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Save Button */}
                        <ActionButton
                            loading={loading}
                            handlePress={handleSave}
                            buttonText={editingItem ? 'Update Item' : 'Create Item'}
                            showArrow={false}
                            width="100%"
                        />

                        {/* Info about automatic positioning */}
                        <View className="mt-4 bg-green-900/20 border border-green-600 p-3 rounded-lg">
                            <Text className="text-green-400 font-rubik text-xs">
                                ✨ Items are automatically positioned based on date and time
                            </Text>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default AgendaFormModal;