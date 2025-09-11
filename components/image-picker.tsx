import { useTheme } from '@/context/theme-context';
import { imageUploadService, UploadProgress } from '@/services/imageUpload';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Text, TouchableOpacity, View } from 'react-native';

interface ImagePickerProps {
    onImageUploaded: (imageUrl: string) => void;
    onImageRemoved: () => void;
    currentImageUrl?: string;
    error?: string;
    disabled?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.5; // 16:9 aspect ratio-ish

const ImagePickerComponent: React.FC<ImagePickerProps> = ({
    onImageUploaded,
    onImageRemoved,
    currentImageUrl,
    error,
    disabled = false
}) => {
    const { activeTheme } = useTheme();
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Theme-aware colors
    const themeColors = {
        background: activeTheme === 'light' ? '#f9fafb' : '#374151',
        border: activeTheme === 'light' ? '#d1d5db' : '#6b7280',
        errorBorder: '#ef4444',
        text: activeTheme === 'light' ? '#1f2937' : '#ffffff',
        textSecondary: activeTheme === 'light' ? '#6b7280' : '#d1d5db',
        textTertiary: activeTheme === 'light' ? '#9ca3af' : '#9CA3AF',
        buttonBg: activeTheme === 'light' ? '#ffffff' : '#1f2937',
        buttonBorder: activeTheme === 'light' ? '#e5e7eb' : '#374151',
        accent: '#e85c29',
        success: '#10b981',
        progressBg: activeTheme === 'light' ? '#e5e7eb' : '#4b5563',
        overlayBg: 'rgba(0, 0, 0, 0.5)'
    };

    const handleImagePick = async () => {
        if (disabled || uploading) return;

        try {
            setUploading(true);
            setUploadProgress(0);

            const imageUrl = await imageUploadService.pickAndUploadImage({
                folder: 'events',
                onProgress: (progress: UploadProgress) => {
                    setUploadProgress(progress.percentage);
                }
            });

            onImageUploaded(imageUrl);
            Alert.alert('Success', 'Image uploaded successfully!');
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleImageRemove = () => {
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
                        onImageRemoved();
                        // Optionally delete from storage (but might be used elsewhere)
                        // if (currentImageUrl) {
                        //     imageUploadService.deleteImage(currentImageUrl);
                        // }
                    }
                }
            ]
        );
    };

    return (
        <View className="mb-4">
            {/* Label */}
            <Text
                className="font-rubik-medium text-base mb-2"
                style={{ color: themeColors.text }}
            >
                Event Image (Optional)
            </Text>

            {/* Image Container */}
            <View
                className={`rounded-xl border-2 overflow-hidden ${error ? 'border-red-500' : ''}`}
                style={{
                    height: IMAGE_HEIGHT,
                    backgroundColor: themeColors.background,
                    borderColor: error ? themeColors.errorBorder : themeColors.border,
                    borderStyle: 'dashed',
                }}
            >
                {currentImageUrl && !uploading ? (
                    // Image Preview
                    <View className="relative h-full">
                        <Image
                            source={{ uri: currentImageUrl }}
                            style={{ width: '100%', height: '100%' }}
                            contentFit="cover"
                            transition={200}
                        />

                        {/* Image Actions Overlay */}
                        <View
                            className="absolute top-3 right-3 flex-row space-x-2"
                            style={{ opacity: disabled ? 0.5 : 1 }}
                        >
                            <TouchableOpacity
                                onPress={handleImagePick}
                                disabled={disabled}
                                className="w-10 h-10 rounded-full items-center justify-center"
                                style={{ backgroundColor: themeColors.overlayBg }}
                                activeOpacity={0.8}
                            >
                                <Feather name="edit-2" size={16} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleImageRemove}
                                disabled={disabled}
                                className="w-10 h-10 rounded-full items-center justify-center"
                                style={{ backgroundColor: themeColors.overlayBg }}
                                activeOpacity={0.8}
                            >
                                <Feather name="trash-2" size={16} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Image Info Overlay */}
                        <View
                            className="absolute bottom-3 left-3 px-3 py-1 rounded-full"
                            style={{ backgroundColor: themeColors.overlayBg }}
                        >
                            <Text className="text-white font-rubik text-xs">
                                ✓ Image uploaded
                            </Text>
                        </View>
                    </View>
                ) : (
                    // Upload Area
                    <TouchableOpacity
                        onPress={handleImagePick}
                        disabled={disabled || uploading}
                        className="flex-1 items-center justify-center p-6"
                        activeOpacity={0.8}
                        style={{ opacity: disabled ? 0.5 : 1 }}
                    >
                        {uploading ? (
                            // Upload Progress
                            <View className="items-center">
                                <ActivityIndicator size="large" color={themeColors.accent} />
                                <Text
                                    className="font-rubik-medium text-base mt-4 mb-2"
                                    style={{ color: themeColors.text }}
                                >
                                    Uploading Image...
                                </Text>

                                {/* Progress Bar */}
                                <View
                                    className="w-32 h-2 rounded-full mb-2"
                                    style={{ backgroundColor: themeColors.progressBg }}
                                >
                                    <View
                                        className="h-full rounded-full transition-all duration-200"
                                        style={{
                                            backgroundColor: themeColors.accent,
                                            width: `${uploadProgress}%`
                                        }}
                                    />
                                </View>

                                <Text
                                    className="font-rubik text-sm"
                                    style={{ color: themeColors.textSecondary }}
                                >
                                    {uploadProgress}%
                                </Text>
                            </View>
                        ) : (
                            // Upload Prompt
                            <View className="items-center">
                                <View
                                    className="w-16 h-16 rounded-full items-center justify-center mb-4"
                                    style={{ backgroundColor: `${themeColors.accent}20` }}
                                >
                                    <Feather name="camera" size={32} color={themeColors.accent} />
                                </View>

                                <Text
                                    className="font-rubik-semibold text-lg mb-2 text-center"
                                    style={{ color: themeColors.text }}
                                >
                                    Add Event Image
                                </Text>

                                <Text
                                    className="font-rubik text-sm text-center max-w-xs leading-5"
                                    style={{ color: themeColors.textSecondary }}
                                >
                                    Upload an image from your camera or photo library to make your event more attractive
                                </Text>

                                <View
                                    className="mt-4 px-4 py-2 rounded-lg border"
                                    style={{
                                        backgroundColor: themeColors.buttonBg,
                                        borderColor: themeColors.buttonBorder
                                    }}
                                >
                                    <View className="flex-row items-center">
                                        <Feather name="upload" size={16} color={themeColors.accent} />
                                        <Text
                                            className="font-rubik-medium text-sm ml-2"
                                            style={{ color: themeColors.accent }}
                                        >
                                            Choose Image
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* Error Message */}
            {error && (
                <View className="flex-row items-center mt-2">
                    <Feather name="alert-circle" size={14} color="#ef4444" />
                    <Text className="text-red-400 font-rubik text-sm ml-1">
                        {error}
                    </Text>
                </View>
            )}

            {/* Helper Text */}
            {!error && (
                <Text
                    className="font-rubik text-xs mt-2"
                    style={{ color: themeColors.textTertiary }}
                >
                    Recommended: 16:9 aspect ratio, max 10MB. JPEG, PNG formats supported.
                </Text>
            )}
        </View>
    );
};

export default ImagePickerComponent;