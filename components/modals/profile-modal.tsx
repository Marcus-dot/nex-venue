// components/modals/profile-modal.tsx
import { Feather } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    Linking,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AttendeeInfo {
    uid: string;
    fullName: string;
    phoneNumber: string;
    avatar: string | null;
}

interface ProfileModalProps {
    visible: boolean;
    onClose: () => void;
    attendee: AttendeeInfo | null;
    onStartChat: () => void;
    themeColors: any;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
    visible,
    onClose,
    attendee,
    onStartChat,
    themeColors
}) => {
    if (!attendee) return null;

    const handleCallPress = () => {
        const phoneUrl = `tel:${attendee.phoneNumber}`;
        Linking.openURL(phoneUrl).catch(() => {
            // Handle error silently or show a toast
        });
    };

    const handleMessagePress = () => {
        const smsUrl = `sms:${attendee.phoneNumber}`;
        Linking.openURL(smsUrl).catch(() => {
            // Handle error silently or show a toast
        });
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            {/* Backdrop */}
            <TouchableWithoutFeedback onPress={onClose}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        justifyContent: 'flex-end'
                    }}
                >
                    {/* Modal Content */}
                    <TouchableWithoutFeedback>
                        <View
                            style={{
                                backgroundColor: themeColors.surface,
                                borderTopLeftRadius: 24,
                                borderTopRightRadius: 24,
                                minHeight: SCREEN_HEIGHT * 0.45,
                                maxHeight: SCREEN_HEIGHT * 0.8,
                                paddingTop: 8,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: -5 },
                                shadowOpacity: 0.25,
                                shadowRadius: 25,
                                elevation: 25,
                            }}
                        >
                            {/* Handle Bar */}
                            <View style={{ alignItems: 'center', paddingBottom: 20 }}>
                                <View
                                    style={{
                                        width: 36,
                                        height: 4,
                                        backgroundColor: themeColors.border,
                                        borderRadius: 2,
                                        marginBottom: 16
                                    }}
                                />
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
                                    {/* Header with Large Avatar */}
                                    <View style={{ alignItems: 'center', marginBottom: 32 }}>
                                        <View
                                            style={{
                                                width: 100,
                                                height: 100,
                                                borderRadius: 50,
                                                backgroundColor: '#e85c29',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                marginBottom: 16,
                                                shadowColor: '#e85c29',
                                                shadowOffset: { width: 0, height: 8 },
                                                shadowOpacity: 0.3,
                                                shadowRadius: 20,
                                                elevation: 10,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: 'white',
                                                    fontSize: 36,
                                                    fontFamily: 'Rubik-Bold',
                                                }}
                                            >
                                                {attendee.fullName.charAt(0).toUpperCase()}
                                            </Text>
                                        </View>

                                        <Text
                                            style={{
                                                color: themeColors.text,
                                                fontSize: 26,
                                                fontFamily: 'Rubik-Bold',
                                                marginBottom: 4,
                                                textAlign: 'center'
                                            }}
                                        >
                                            {attendee.fullName}
                                        </Text>

                                        <View
                                            style={{
                                                backgroundColor: '#e85c29',
                                                paddingHorizontal: 12,
                                                paddingVertical: 4,
                                                borderRadius: 12
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: 'white',
                                                    fontSize: 12,
                                                    fontFamily: 'Rubik-Medium'
                                                }}
                                            >
                                                Event Attendee
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Contact Information Section */}
                                    <View style={{ marginBottom: 24 }}>
                                        <Text
                                            style={{
                                                color: themeColors.text,
                                                fontSize: 18,
                                                fontFamily: 'Rubik-SemiBold',
                                                marginBottom: 16
                                            }}
                                        >
                                            Contact Information
                                        </Text>

                                        {/* Phone Number */}
                                        <View
                                            style={{
                                                backgroundColor: themeColors.surfaceSecondary,
                                                borderRadius: 16,
                                                padding: 16,
                                                marginBottom: 12,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                borderWidth: 1,
                                                borderColor: themeColors.border
                                            }}
                                        >
                                            <View
                                                style={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 20,
                                                    backgroundColor: '#10b981',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    marginRight: 12
                                                }}
                                            >
                                                <Feather name="phone" size={18} color="white" />
                                            </View>

                                            <View style={{ flex: 1 }}>
                                                <Text
                                                    style={{
                                                        color: themeColors.textSecondary,
                                                        fontSize: 12,
                                                        fontFamily: 'Rubik-Medium',
                                                        marginBottom: 2
                                                    }}
                                                >
                                                    Phone Number
                                                </Text>
                                                <Text
                                                    style={{
                                                        color: themeColors.text,
                                                        fontSize: 16,
                                                        fontFamily: 'Rubik-SemiBold'
                                                    }}
                                                >
                                                    {attendee.phoneNumber}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Member Since (placeholder for now) */}
                                        <View
                                            style={{
                                                backgroundColor: themeColors.surfaceSecondary,
                                                borderRadius: 16,
                                                padding: 16,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                borderWidth: 1,
                                                borderColor: themeColors.border
                                            }}
                                        >
                                            <View
                                                style={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 20,
                                                    backgroundColor: '#3b82f6',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    marginRight: 12
                                                }}
                                            >
                                                <Feather name="calendar" size={18} color="white" />
                                            </View>

                                            <View style={{ flex: 1 }}>
                                                <Text
                                                    style={{
                                                        color: themeColors.textSecondary,
                                                        fontSize: 12,
                                                        fontFamily: 'Rubik-Medium',
                                                        marginBottom: 2
                                                    }}
                                                >
                                                    Member Since
                                                </Text>
                                                <Text
                                                    style={{
                                                        color: themeColors.text,
                                                        fontSize: 16,
                                                        fontFamily: 'Rubik-SemiBold'
                                                    }}
                                                >
                                                    January 2025
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Quick Actions */}
                                    <View style={{ marginBottom: 16 }}>
                                        <Text
                                            style={{
                                                color: themeColors.text,
                                                fontSize: 18,
                                                fontFamily: 'Rubik-SemiBold',
                                                marginBottom: 16
                                            }}
                                        >
                                            Quick Actions
                                        </Text>

                                        <View style={{ flexDirection: 'row', gap: 12 }}>
                                            {/* Call Button */}
                                            <TouchableOpacity
                                                onPress={handleCallPress}
                                                style={{
                                                    flex: 1,
                                                    backgroundColor: '#10b981',
                                                    borderRadius: 14,
                                                    paddingVertical: 14,
                                                    alignItems: 'center',
                                                    shadowColor: '#10b981',
                                                    shadowOffset: { width: 0, height: 4 },
                                                    shadowOpacity: 0.3,
                                                    shadowRadius: 8,
                                                    elevation: 4,
                                                }}
                                                activeOpacity={0.8}
                                            >
                                                <Feather name="phone-call" size={18} color="white" />
                                                <Text
                                                    style={{
                                                        color: 'white',
                                                        fontSize: 14,
                                                        fontFamily: 'Rubik-SemiBold',
                                                        marginTop: 4
                                                    }}
                                                >
                                                    Call
                                                </Text>
                                            </TouchableOpacity>

                                            {/* Message Button */}
                                            <TouchableOpacity
                                                onPress={handleMessagePress}
                                                style={{
                                                    flex: 1,
                                                    backgroundColor: '#3b82f6',
                                                    borderRadius: 14,
                                                    paddingVertical: 14,
                                                    alignItems: 'center',
                                                    shadowColor: '#3b82f6',
                                                    shadowOffset: { width: 0, height: 4 },
                                                    shadowOpacity: 0.3,
                                                    shadowRadius: 8,
                                                    elevation: 4,
                                                }}
                                                activeOpacity={0.8}
                                            >
                                                <Feather name="message-square" size={18} color="white" />
                                                <Text
                                                    style={{
                                                        color: 'white',
                                                        fontSize: 14,
                                                        fontFamily: 'Rubik-SemiBold',
                                                        marginTop: 4
                                                    }}
                                                >
                                                    Text
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Primary Action Button */}
                                    <TouchableOpacity
                                        onPress={() => {
                                            onStartChat();
                                            onClose();
                                        }}
                                        style={{
                                            backgroundColor: '#e85c29',
                                            borderRadius: 16,
                                            paddingVertical: 16,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            shadowColor: '#e85c29',
                                            shadowOffset: { width: 0, height: 6 },
                                            shadowOpacity: 0.3,
                                            shadowRadius: 12,
                                            elevation: 6,
                                            marginBottom: 12
                                        }}
                                        activeOpacity={0.8}
                                    >
                                        <Feather name="message-circle" size={20} color="white" />
                                        <Text
                                            style={{
                                                color: 'white',
                                                fontSize: 16,
                                                fontFamily: 'Rubik-Bold',
                                                marginLeft: 12
                                            }}
                                        >
                                            Start Direct Chat
                                        </Text>
                                    </TouchableOpacity>

                                    {/* Close Button */}
                                    <TouchableOpacity
                                        onPress={onClose}
                                        style={{
                                            paddingVertical: 12,
                                            alignItems: 'center'
                                        }}
                                        activeOpacity={0.6}
                                    >
                                        <Text
                                            style={{
                                                color: themeColors.textSecondary,
                                                fontSize: 16,
                                                fontFamily: 'Rubik-Medium'
                                            }}
                                        >
                                            Close
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default ProfileModal;