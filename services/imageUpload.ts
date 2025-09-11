import storage from '@react-native-firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export interface ImagePickerResult {
    uri: string;
    width: number;
    height: number;
    size: number;
}

export interface UploadProgress {
    bytesTransferred: number;
    totalBytes: number;
    percentage: number;
}

export interface ImageUploadOptions {
    folder?: string;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    onProgress?: (progress: UploadProgress) => void;
}

export const imageUploadService = {
    // Request permissions for camera and photo library
    requestPermissions: async (): Promise<boolean> => {
        try {
            if (Platform.OS !== 'web') {
                // Request camera permissions
                const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
                // Request media library permissions
                const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

                if (cameraPermission.status !== 'granted' || mediaLibraryPermission.status !== 'granted') {
                    Alert.alert(
                        'Permissions Required',
                        'Camera and photo library permissions are required to upload images.',
                        [{ text: 'OK' }]
                    );
                    return false;
                }
            }
            return true;
        } catch (error) {
            console.error('Error requesting permissions:', error);
            return false;
        }
    },

    // Show image picker options (camera or library)
    showImagePickerOptions: (onImageSelected: (result: ImagePickerResult) => void): void => {
        Alert.alert(
            'Select Image',
            'Choose how you want to add an image',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Camera',
                    onPress: () => imageUploadService.pickImageFromCamera(onImageSelected),
                },
                {
                    text: 'Photo Library',
                    onPress: () => imageUploadService.pickImageFromLibrary(onImageSelected),
                },
            ]
        );
    },

    // Pick image from camera
    pickImageFromCamera: async (onImageSelected: (result: ImagePickerResult) => void): Promise<void> => {
        try {
            const hasPermissions = await imageUploadService.requestPermissions();
            if (!hasPermissions) return;

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [16, 9], // Good aspect ratio for event images
                quality: 0.8,
                base64: false,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                onImageSelected({
                    uri: asset.uri,
                    width: asset.width || 0,
                    height: asset.height || 0,
                    size: asset.fileSize || 0,
                });
            }
        } catch (error) {
            console.error('Error picking image from camera:', error);
            Alert.alert('Error', 'Failed to take photo. Please try again.');
        }
    },

    // Pick image from photo library
    pickImageFromLibrary: async (onImageSelected: (result: ImagePickerResult) => void): Promise<void> => {
        try {
            const hasPermissions = await imageUploadService.requestPermissions();
            if (!hasPermissions) return;

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [16, 9], // Good aspect ratio for event images
                quality: 0.8,
                base64: false,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                onImageSelected({
                    uri: asset.uri,
                    width: asset.width || 0,
                    height: asset.height || 0,
                    size: asset.fileSize || 0,
                });
            }
        } catch (error) {
            console.error('Error picking image from library:', error);
            Alert.alert('Error', 'Failed to select image. Please try again.');
        }
    },

    // Generate unique filename
    generateFileName: (originalUri: string, folder: string = 'events'): string => {
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const extension = originalUri.split('.').pop()?.toLowerCase() || 'jpg';
        return `${folder}/${timestamp}_${randomId}.${extension}`;
    },

    // Upload image to Firebase Storage
    uploadImage: async (
        imageUri: string,
        options: ImageUploadOptions = {}
    ): Promise<string> => {
        try {
            const {
                folder = 'events',
                onProgress
            } = options;

            // Generate unique filename
            const fileName = imageUploadService.generateFileName(imageUri, folder);
            const storageRef = storage().ref(fileName);

            // Upload the image
            const task = storageRef.putFile(imageUri);

            // Track upload progress
            if (onProgress) {
                task.on('state_changed', (snapshot) => {
                    const progress: UploadProgress = {
                        bytesTransferred: snapshot.bytesTransferred,
                        totalBytes: snapshot.totalBytes,
                        percentage: Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
                    };
                    onProgress(progress);
                });
            }

            // Wait for upload to complete
            await task;

            // Get download URL
            const downloadURL = await storageRef.getDownloadURL();

            return downloadURL;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw new Error('Failed to upload image. Please try again.');
        }
    },

    // Complete flow: pick and upload image
    pickAndUploadImage: async (
        options: ImageUploadOptions = {}
    ): Promise<string> => {
        return new Promise((resolve, reject) => {
            imageUploadService.showImagePickerOptions(async (pickedImage) => {
                try {
                    const uploadedUrl = await imageUploadService.uploadImage(pickedImage.uri, options);
                    resolve(uploadedUrl);
                } catch (error) {
                    reject(error);
                }
            });
        });
    },

    // Delete image from Firebase Storage
    deleteImage: async (imageUrl: string): Promise<void> => {
        try {
            const imageRef = storage().refFromURL(imageUrl);
            await imageRef.delete();
        } catch (error) {
            console.error('Error deleting image:', error);
            // Don't throw error for delete failures as it's not critical
        }
    },

    // Validate image size and format
    validateImage: (imageResult: ImagePickerResult): { valid: boolean; error?: string } => {
        const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
        const maxWidth = 4000;
        const maxHeight = 4000;

        if (imageResult.size > maxSizeInBytes) {
            return {
                valid: false,
                error: 'Image size must be less than 10MB'
            };
        }

        if (imageResult.width > maxWidth || imageResult.height > maxHeight) {
            return {
                valid: false,
                error: 'Image dimensions must be less than 4000x4000 pixels'
            };
        }

        return { valid: true };
    }
};