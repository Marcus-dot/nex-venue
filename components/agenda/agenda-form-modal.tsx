import MultiImagePicker from './multi-image-picker';
import ActionButton from '@/components/action-button';
import { TEXT_SIZE } from '@/constants';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { agendaService } from '@/services/agenda';
import { AgendaItem } from '@/types/agenda';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AgendaFormModalProps {
    visible: boolean;
    onClose: () => void;
    eventId: string;
    editingItem?: AgendaItem | null;
}

const AgendaFormModal: React.FC<AgendaFormModalProps> = ({
    visible,
    onClose,
    eventId,
    editingItem
}) => {
    const { user } = useAuth();
    const { activeTheme } = useTheme();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [date, setDate] = useState('');
    const [speaker, setSpeaker] = useState('');
    const [speakerBio, setSpeakerBio] = useState('');
    const [speakerImages, setSpeakerImages] = useState<string[]>([]);
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState<AgendaItem['category']>('presentation');
    const [isBreak, setIsBreak] = useState(false);
    const [loading, setLoading] = useState(false);

    // Theme-aware colors
    const themeColors = {
        background: activeTheme === 'light' ? '#D8D9D4' : '#161616',
        surface: activeTheme === 'light' ? '#ffffff' : '#374151',
        surfaceSecondary: activeTheme === 'light' ? '#f3f4f6' : '#1f2937',
        text: activeTheme === 'light' ? '#1f2937' : '#ffffff',
        textSecondary: activeTheme === 'light' ? '#6b7280' : '#d1d5db',
        textTertiary: activeTheme === 'light' ? '#9ca3af' : '#9CA3AF',
        border: activeTheme === 'light' ? '#e5e7eb' : '#374151',
        input: activeTheme === 'light' ? '#f9fafb' : '#374151',
        inputBorder: activeTheme === 'light' ? '#d1d5db' : '#6b7280',
        inputText: activeTheme === 'light' ? '#1f2937' : '#ffffff',
        modalOverlay: activeTheme === 'light' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.7)',
        helperBackground: activeTheme === 'light' ? '#dbeafe' : '#1e3a8a',
        helperBorder: activeTheme === 'light' ? '#93c5fd' : '#3b82f6',
        helperText: activeTheme === 'light' ? '#1e40af' : '#93c5fd',
        successBackground: activeTheme === 'light' ? '#dcfce7' : '#14532d',
        successBorder: activeTheme === 'light' ? '#22c55e' : '#16a34a',
        successText: activeTheme === 'light' ? '#15803d' : '#4ade80'
    };

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
            setSpeakerBio(editingItem.speakerBio || '');
            
            // Load speaker images - prioritize array, fallback to single image
            if (editingItem.speakerImages && editingItem.speakerImages.length > 0) {
                setSpeakerImages(editingItem.speakerImages);
            } else if (editingItem.speakerImage) {
                setSpeakerImages([editingItem.speakerImage]);
            } else {
                setSpeakerImages([]);
            }
            
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
            setSpeakerBio('');
            setSpeakerImages([]);
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
            const itemData: any = {
                title: title.trim(),
                startTime: startTime.trim(),
                endTime: endTime.trim(),
                date: date.trim(),
                category,
                isBreak,
                order: editingItem?.order || 1,
                createdBy: editingItem?.createdBy || user.uid,
                lastEditedBy: user.uid,
            };

            if (description.trim()) {
                itemData.description = description.trim();
            }

            if (speaker.trim()) {
                itemData.speaker = speaker.trim();
            }

            if (speakerBio.trim()) {
                itemData.speakerBio = speakerBio.trim();
            }

            // Save speaker images array
            if (speakerImages.length > 0) {
                itemData.speakerImages = speakerImages;
                // Also save the first image as speakerImage for backwards compatibility
                itemData.speakerImage = speakerImages[0];
            }

            if (location.trim()) {
                itemData.location = location.trim();
            }

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
                className="flex-1"
                style={{ backgroundColor: themeColors.background }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                    {/* Header */}
                    <View
                        className="flex-row items-center justify-between px-6 py-4 border-b"
                        style={{ borderColor: themeColors.border }}
                    >
                        <TouchableOpacity onPress={onClose}>
                            <Text
                                style={{ fontSize: TEXT_SIZE, color: themeColors.textSecondary }}
                                className="font-rubik"
                            >
                                Cancel
                            </Text>
                        </TouchableOpacity>
                        <Text
                            style={{ fontSize: TEXT_SIZE * 1.1, color: themeColors.text }}
                            className="font-rubik-bold"
                        >
                            {editingItem ? 'Edit Agenda Item' : 'Add Agenda Item'}
                        </Text>
                        <View style={{ width: 60 }} />
                    </View>

                    <ScrollView className="flex-1 px-6 py-6">
                        {/* Title */}
                        <View className="mb-4">
                            <Text
                                style={{ fontSize: TEXT_SIZE * 0.8, color: themeColors.text }}
                                className="font-rubik-medium mb-2"
                            >
                                Title *
                            </Text>
                            <TextInput
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Session title"
                                placeholderTextColor={themeColors.textTertiary}
                                style={{
                                    fontSize: TEXT_SIZE,
                                    backgroundColor: themeColors.input,
                                    color: themeColors.inputText,
                                    borderColor: themeColors.inputBorder
                                }}
                                className="p-3 rounded-lg font-rubik border"
                            />
                        </View>

                        {/* Description */}
                        <View className="mb-4">
                            <Text
                                style={{ fontSize: TEXT_SIZE * 0.8, color: themeColors.text }}
                                className="font-rubik-medium mb-2"
                            >
                                Description
                            </Text>
                            <TextInput
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Brief description (optional)"
                                placeholderTextColor={themeColors.textTertiary}
                                style={{
                                    fontSize: TEXT_SIZE,
                                    minHeight: 80,
                                    backgroundColor: themeColors.input,
                                    color: themeColors.inputText,
                                    borderColor: themeColors.inputBorder,
                                }}
                                className="p-3 rounded-lg font-rubik border"
                                multiline
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Time Row */}
                        <View className="flex-row mb-4 space-x-3">
                            <View className="flex-1">
                                <Text
                                    style={{ fontSize: TEXT_SIZE * 0.8, color: themeColors.text }}
                                    className="font-rubik-medium mb-2"
                                >
                                    Start Time *
                                </Text>
                                <TextInput
                                    value={startTime}
                                    onChangeText={setStartTime}
                                    placeholder="e.g. 09:00 AM"
                                    placeholderTextColor={themeColors.textTertiary}
                                    style={{
                                        fontSize: TEXT_SIZE,
                                        backgroundColor: themeColors.input,
                                        color: themeColors.inputText,
                                        borderColor: themeColors.inputBorder
                                    }}
                                    className="p-3 rounded-lg font-rubik border"
                                />
                            </View>
                            <View className="flex-1">
                                <Text
                                    style={{ fontSize: TEXT_SIZE * 0.8, color: themeColors.text }}
                                    className="font-rubik-medium mb-2"
                                >
                                    End Time *
                                </Text>
                                <TextInput
                                    value={endTime}
                                    onChangeText={setEndTime}
                                    placeholder="e.g. 10:30 AM"
                                    placeholderTextColor={themeColors.textTertiary}
                                    style={{
                                        fontSize: TEXT_SIZE,
                                        backgroundColor: themeColors.input,
                                        color: themeColors.inputText,
                                        borderColor: themeColors.inputBorder
                                    }}
                                    className="p-3 rounded-lg font-rubik border"
                                />
                            </View>
                        </View>

                        {/* Date */}
                        <View className="mb-4">
                            <Text
                                style={{ fontSize: TEXT_SIZE * 0.8, color: themeColors.text }}
                                className="font-rubik-medium mb-2"
                            >
                                Date *
                            </Text>
                            <TextInput
                                value={date}
                                onChangeText={setDate}
                                placeholder="e.g. 2025-01-15"
                                placeholderTextColor={themeColors.textTertiary}
                                style={{
                                    fontSize: TEXT_SIZE,
                                    backgroundColor: themeColors.input,
                                    color: themeColors.inputText,
                                    borderColor: themeColors.inputBorder
                                }}
                                className="p-3 rounded-lg font-rubik border"
                            />
                        </View>

                        {/* Speaker */}
                        <View className="mb-4">
                            <Text
                                style={{ fontSize: TEXT_SIZE * 0.8, color: themeColors.text }}
                                className="font-rubik-medium mb-2"
                            >
                                Speaker
                            </Text>
                            <TextInput
                                value={speaker}
                                onChangeText={setSpeaker}
                                placeholder="Speaker name (optional)"
                                placeholderTextColor={themeColors.textTertiary}
                                style={{
                                    fontSize: TEXT_SIZE,
                                    backgroundColor: themeColors.input,
                                    color: themeColors.inputText,
                                    borderColor: themeColors.inputBorder
                                }}
                                className="p-3 rounded-lg font-rubik border"
                            />
                        </View>

                        {/* Speaker Bio */}
                        <View className="mb-4">
                            <Text
                                style={{ fontSize: TEXT_SIZE * 0.8, color: themeColors.text }}
                                className="font-rubik-medium mb-2"
                            >
                                Speaker Bio
                            </Text>
                            <TextInput
                                value={speakerBio}
                                onChangeText={setSpeakerBio}
                                placeholder="Add speaker background / bio (optional)"
                                placeholderTextColor={themeColors.textTertiary}
                                style={{
                                    fontSize: TEXT_SIZE,
                                    minHeight: 80,
                                    backgroundColor: themeColors.input,
                                    color: themeColors.inputText,
                                    borderColor: themeColors.inputBorder,
                                }}
                                className="p-3 rounded-lg font-rubik border"
                                multiline
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Multiple Speaker Images (for panels) */}
                        {speaker.trim() && (
                            <View className="mb-4">
                                <MultiImagePicker
                                    images={speakerImages}
                                    onImagesChange={setSpeakerImages}
                                    maxImages={10}
                                    disabled={loading}
                                />
                                
                                {/* Info helper for panels */}
                                {category === 'panel' && (
                                    <View
                                        className="mt-2 p-3 rounded-lg border flex-row items-start"
                                        style={{
                                            backgroundColor: themeColors.helperBackground,
                                            borderColor: themeColors.helperBorder
                                        }}
                                    >
                                        <Feather 
                                            name="info" 
                                            size={16} 
                                            color={themeColors.helperText}
                                            style={{ marginRight: 8, marginTop: 2 }}
                                        />
                                        <Text
                                            className="font-rubik text-xs flex-1"
                                            style={{ color: themeColors.helperText }}
                                        >
                                            For panel discussions, add multiple speaker images. They'll appear as a carousel.
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Location */}
                        <View className="mb-4">
                            <Text
                                style={{ fontSize: TEXT_SIZE * 0.8, color: themeColors.text }}
                                className="font-rubik-medium mb-2"
                            >
                                Location
                            </Text>
                            <TextInput
                                value={location}
                                onChangeText={setLocation}
                                placeholder="Venue or room (optional)"
                                placeholderTextColor={themeColors.textTertiary}
                                style={{
                                    fontSize: TEXT_SIZE,
                                    backgroundColor: themeColors.input,
                                    color: themeColors.inputText,
                                    borderColor: themeColors.inputBorder
                                }}
                                className="p-3 rounded-lg font-rubik border"
                            />
                        </View>

                        {/* Category */}
                        <View className="mb-4">
                            <Text
                                style={{ fontSize: TEXT_SIZE * 0.8, color: themeColors.text }}
                                className="font-rubik-medium mb-2"
                            >
                                Category
                            </Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                className="flex-row space-x-2"
                            >
                                {categories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.value}
                                        onPress={() => setCategory(cat.value)}
                                        style={{
                                            backgroundColor: category === cat.value
                                                ? '#e85c29'
                                                : themeColors.surface,
                                            borderColor: category === cat.value
                                                ? '#e85c29'
                                                : themeColors.border,
                                        }}
                                        className="px-3 py-2 rounded-lg border mr-2"
                                    >
                                        <Text
                                            style={{
                                                fontSize: TEXT_SIZE * 0.8,
                                                color: category === cat.value
                                                    ? 'white'
                                                    : themeColors.text
                                            }}
                                            className="font-rubik"
                                        >
                                            {cat.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Break Toggle */}
                        <View className="mb-6">
                            <TouchableOpacity
                                onPress={() => setIsBreak(!isBreak)}
                                className="flex-row items-center"
                            >
                                <View
                                    style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: 10,
                                        borderWidth: 2,
                                        borderColor: isBreak ? '#e85c29' : themeColors.border,
                                        backgroundColor: isBreak ? '#e85c29' : 'transparent',
                                        marginRight: 12,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 'bold',
                                            color: isBreak ? 'white' : themeColors.text
                                        }}
                                    >
                                        {isBreak ? '✓' : '○'}
                                    </Text>
                                </View>
                                <Text
                                    style={{ fontSize: TEXT_SIZE * 0.85, color: themeColors.text }}
                                    className="font-rubik"
                                >
                                    Mark as break (coffee, lunch, etc.)
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
                        <View
                            className="mt-4 p-3 rounded-lg border"
                            style={{
                                backgroundColor: themeColors.successBackground,
                                borderColor: themeColors.successBorder
                            }}
                        >
                            <Text
                                className="font-rubik text-xs"
                                style={{ color: themeColors.successText }}
                            >
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