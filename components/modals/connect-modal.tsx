// components/modals/connect-modal.tsx
import { Feather } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    Modal,
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

interface ConnectModalProps {
    visible: boolean;
    onClose: () => void;
    attendee: AttendeeInfo | null;
    onStartChat: () => void;
    onViewProfile: () => void;
    themeColors: any;
}

const ConnectModal: React.FC<ConnectModalProps> = ({
    visible,
    onClose,
    attendee,
    onStartChat,
    onViewProfile,
    themeColors
}) => {
    if (!attendee) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            {/* Backdrop */}
            <TouchableWithoutFeedback onPress={onClose}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: 20
                    }}
                >
                    {/* Modal Content */}
                    <TouchableWithoutFeedback>
                        <View
                            style={{
                                backgroundColor: themeColors.surface,
                                borderRadius: 24,
                                padding: 24,
                                width: SCREEN_WIDTH * 0.85,
                                maxWidth: 400,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 20 },
                                shadowOpacity: 0.25,
                                shadowRadius: 25,
                                elevation: 25,
                            }}
                        >
                            {/* Header with Avatar */}
                            <View style={{ alignItems: 'center', marginBottom: 24 }}>
                                <View
                                    style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: 40,
                                        backgroundColor: '#e85c29',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: 16,
                                        shadowColor: '#e85c29',
                                        shadowOffset: { width: 0, height: 8 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 16,
                                        elevation: 8,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: 'white',
                                            fontSize: 28,
                                            fontFamily: 'Rubik-Bold',
                                        }}
                                    >
                                        {attendee.fullName.charAt(0).toUpperCase()}
                                    </Text>
                                </View>

                                <Text
                                    style={{
                                        color: themeColors.text,
                                        fontSize: 22,
                                        fontFamily: 'Rubik-Bold',
                                        marginBottom: 4,
                                        textAlign: 'center'
                                    }}
                                >
                                    Connect with {attendee.fullName}
                                </Text>

                                <Text
                                    style={{
                                        color: themeColors.textSecondary,
                                        fontSize: 16,
                                        fontFamily: 'Rubik-Regular',
                                        textAlign: 'center'
                                    }}
                                >
                                    Choose how you'd like to connect
                                </Text>
                            </View>

                            {/* Action Buttons */}
                            <View style={{ gap: 12 }}>
                                {/* Start Direct Chat Button */}
                                <TouchableOpacity
                                    onPress={() => {
                                        onStartChat();
                                        onClose();
                                    }}
                                    style={{
                                        backgroundColor: '#e85c29',
                                        borderRadius: 16,
                                        paddingVertical: 16,
                                        paddingHorizontal: 20,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        shadowColor: '#e85c29',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 8,
                                        elevation: 4,
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <Feather name="message-circle" size={20} color="white" />
                                    <Text
                                        style={{
                                            color: 'white',
                                            fontSize: 16,
                                            fontFamily: 'Rubik-SemiBold',
                                            marginLeft: 12
                                        }}
                                    >
                                        Start Direct Chat
                                    </Text>
                                </TouchableOpacity>

                                {/* View Profile Button */}
                                <TouchableOpacity
                                    onPress={onViewProfile}  // ← Just this, no onClose()
                                    style={{
                                        backgroundColor: themeColors.surfaceSecondary,
                                        borderRadius: 16,
                                        paddingVertical: 16,
                                        paddingHorizontal: 20,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderWidth: 1,
                                        borderColor: themeColors.border,
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <Feather name="user" size={20} color={themeColors.text} />
                                    <Text
                                        style={{
                                            color: themeColors.text,
                                            fontSize: 16,
                                            fontFamily: 'Rubik-SemiBold',
                                            marginLeft: 12
                                        }}
                                    >
                                        View Profile
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Cancel Button */}
                            <TouchableOpacity
                                onPress={onClose}
                                style={{
                                    marginTop: 16,
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
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default ConnectModal;