// components/agenda/multi-image-picker.tsx

import { useTheme } from '@/context/theme-context';
import { imageUploadService, UploadProgress } from '@/services/imageUpload';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface MultiImagePickerProps {
    images: string[];
    onImagesChange: (images: string[]) => void;
    maxImages?: number;
    disabled?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = (SCREEN_WIDTH - 64) / 3; // 3 images per row with padding

const MultiImagePicker: React.FC<MultiImagePickerProps> = ({
    images,
    onImagesChange,
    maxImages = 10,
    disabled = false
}) => {
    const { activeTheme } = useTheme();
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const themeColors = {
        background: activeTheme === 'light' ? '#f9fafb' : '#374151',
        border: activeTheme === 'light' ? '#d1d5db' : '#6b7280',
        text: activeTheme === 'light' ? '#1f2937' : '#ffffff',
        textSecondary: activeTheme === 'light' ? '#6b7280' : '#d1d5db',
        textTertiary: activeTheme === 'light' ? '#9ca3af' : '#9CA3AF',
        accent: '#e85c29',
        overlayBg: 'rgba(0, 0, 0, 0.5)',
        progressBg: activeTheme === 'light' ? '#e5e7eb' : '#4b5563',
    };

    const handleImagePick = async () => {
        if (disabled || uploading || images.length >= maxImages) return;

        try {
            setUploading(true);
            setUploadProgress(0);

            const imageUrl = await imageUploadService.pickAndUploadImage({
                folder: 'speakers',
                onProgress: (progress: UploadProgress) => {
                    setUploadProgress(progress.percentage);
                }
            });

            onImagesChange([...images, imageUrl]);
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleImageRemove = (index: number) => {
        if (disabled) return;

        Alert.alert(
            'Remove Image',
            'Are you sure you want to remove this image?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        const newImages = images.filter((_, i) => i !== index);
                        onImagesChange(newImages);
                    }
                }
            ]
        );
    };

    const canAddMore = images.length < maxImages;

    return (
        <View className="mb-4">
            <View className="flex-row items-center justify-between mb-2">
                <Text
                    className="font-rubik-medium text-base"
                    style={{ color: themeColors.text }}
                >
                    Speaker Images {images.length > 0 && `(${images.length}/${maxImages})`}
                </Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    paddingVertical: 8,
                }}
            >
                {/* Existing Images */}
                {images.map((imageUrl, index) => (
                    <View
                        key={index}
                        style={{
                            width: IMAGE_SIZE,
                            height: IMAGE_SIZE,
                            marginRight: 12,
                            borderRadius: 12,
                            overflow: 'hidden',
                            borderWidth: 1,
                            borderColor: themeColors.border,
                        }}
                    >
                        <Image
                            source={{ uri: imageUrl }}
                            style={{ width: '100%', height: '100%' }}
                            contentFit="cover"
                            transition={200}
                        />

                        {/* Remove Button */}
                        <TouchableOpacity
                            onPress={() => handleImageRemove(index)}
                            disabled={disabled}
                            style={{
                                position: 'absolute',
                                top: 6,
                                right: 6,
                                width: 28,
                                height: 28,
                                borderRadius: 14,
                                backgroundColor: themeColors.overlayBg,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Feather name="x" size={16} color="white" />
                        </TouchableOpacity>

                        {/* Image Number Badge */}
                        <View
                            style={{
                                position: 'absolute',
                                bottom: 6,
                                left: 6,
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 8,
                                backgroundColor: themeColors.overlayBg,
                            }}
                        >
                            <Text
                                className="text-white font-rubik-semibold text-xs"
                            >
                                {index + 1}
                            </Text>
                        </View>
                    </View>
                ))}

                {/* Add New Image Button */}
                {canAddMore && (
                    <TouchableOpacity
                        onPress={handleImagePick}
                        disabled={disabled || uploading}
                        style={{
                            width: IMAGE_SIZE,
                            height: IMAGE_SIZE,
                            borderRadius: 12,
                            borderWidth: 2,
                            borderStyle: 'dashed',
                            borderColor: themeColors.border,
                            backgroundColor: themeColors.background,
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: disabled || uploading ? 0.5 : 1,
                        }}
                    >
                        {uploading ? (
                            <View className="items-center">
                                <ActivityIndicator size="small" color={themeColors.accent} />
                                <Text
                                    className="font-rubik text-xs mt-2"
                                    style={{ color: themeColors.textSecondary }}
                                >
                                    {uploadProgress}%
                                </Text>
                            </View>
                        ) : (
                            <>
                                <View
                                    className="w-12 h-12 rounded-full items-center justify-center mb-2"
                                    style={{ backgroundColor: `${themeColors.accent}20` }}
                                >
                                    <Feather name="plus" size={24} color={themeColors.accent} />
                                </View>
                                <Text
                                    className="font-rubik text-xs text-center"
                                    style={{ color: themeColors.textSecondary }}
                                >
                                    Add Image
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </ScrollView>

            {/* Helper Text */}
            <Text
                className="font-rubik text-xs mt-2"
                style={{ color: themeColors.textTertiary }}
            >
                {images.length === 0
                    ? 'Add speaker images for panel discussions. Images appear in order.'
                    : `${maxImages - images.length} more image${maxImages - images.length !== 1 ? 's' : ''} can be added`
                }
            </Text>
        </View>
    );
};

export default MultiImagePicker;