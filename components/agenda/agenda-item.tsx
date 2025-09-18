import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { AgendaItem as AgendaItemType } from '@/types/agenda';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface AgendaItemProps {
    item: AgendaItemType;
    isCurrentItem?: boolean;
    onEdit?: (item: AgendaItemType) => void;
    onDelete?: (itemId: string) => void;
    onSetCurrent?: (itemId: string) => void;
}

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const AgendaItem: React.FC<AgendaItemProps> = ({
    item,
    isCurrentItem = false,
    onEdit,
    onDelete,
    onSetCurrent
}) => {
    const { isAdmin } = useAuth();
    const { activeTheme } = useTheme();

    const [isSpeakerModalVisible, setSpeakerModalVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(screenHeight)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    // Enhanced modal animations
    const showModal = useCallback(() => {
        setSpeakerModalVisible(true);
        StatusBar.setBarStyle('light-content', true);

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            })
        ]).start();
    }, [fadeAnim, slideAnim, scaleAnim]);

    const hideModal = useCallback(() => {
        StatusBar.setBarStyle(activeTheme === 'light' ? 'dark-content' : 'light-content', true);

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: screenHeight,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 250,
                useNativeDriver: true,
            })
        ]).start(() => {
            setSpeakerModalVisible(false);
        });
    }, [activeTheme, fadeAnim, slideAnim, scaleAnim]);

    useEffect(() => {
        if (!isSpeakerModalVisible) {
            slideAnim.setValue(screenHeight);
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.9);
        }
    }, [isSpeakerModalVisible, slideAnim, fadeAnim, scaleAnim]);

    // Enhanced theme colors with better contrast and accessibility
    const themeColors = {
        // Basic colors
        background: activeTheme === 'light' ? '#D8D9D4' : '#161616',
        surface: activeTheme === 'light' ? '#ffffff' : '#1f2937',
        surfaceSecondary: activeTheme === 'light' ? '#f8fafc' : '#111827',
        surfaceElevated: activeTheme === 'light' ? '#ffffff' : '#374151',
        text: activeTheme === 'light' ? '#1f2937' : '#f9fafb',
        textSecondary: activeTheme === 'light' ? '#64748b' : '#d1d5db',
        textTertiary: activeTheme === 'light' ? '#94a3b8' : '#9ca3af',
        border: activeTheme === 'light' ? '#e2e8f0' : '#374151',
        borderLight: activeTheme === 'light' ? '#f1f5f9' : '#1f2937',

        // Card styles
        cardDefault: activeTheme === 'light' ? '#ffffff' : '#1f2937',
        cardDefaultBorder: activeTheme === 'light' ? 'rgba(226, 232, 240, 0.8)' : 'rgba(71, 85, 105, 0.6)',
        cardDefaultShadow: activeTheme === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(0, 0, 0, 0.2)',

        // Break item styling
        breakBackground: activeTheme === 'light' ? 'rgba(248, 250, 252, 0.9)' : 'rgba(17, 24, 39, 0.8)',
        breakBorder: activeTheme === 'light' ? 'rgba(226, 232, 240, 0.6)' : 'rgba(71, 85, 105, 0.4)',
        breakIcon: activeTheme === 'light' ? '#64748b' : '#94a3b8',

        // Live item highlights
        currentBackground: activeTheme === 'light'
            ? 'rgba(232, 92, 41, 0.08)'
            : 'rgba(232, 92, 41, 0.12)',
        currentBorder: '#e85c29',
        currentGlow: activeTheme === 'light' ? 'rgba(232, 92, 41, 0.2)' : 'rgba(232, 92, 41, 0.3)',

        // Time and accent colors
        timeAccent: '#e85c29',
        timeBackground: activeTheme === 'light'
            ? 'rgba(232, 92, 41, 0.1)'
            : 'rgba(232, 92, 41, 0.15)',

        // Admin controls
        adminButtonBg: activeTheme === 'light' ? '#f8fafc' : '#111827',
        adminButtonBorder: activeTheme === 'light' ? '#e2e8f0' : '#374151',

        // Modal specific
        modalOverlay: activeTheme === 'light' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.6)',
        modalSurface: activeTheme === 'light' ? '#ffffff' : '#1f2937',
        modalBorder: activeTheme === 'light' ? '#e2e8f0' : '#374151',

        // Category colors base
        categoryAlpha: activeTheme === 'light' ? '0.12' : '0.2',
    };

    // Enhanced category configurations
    const getCategoryConfig = (category?: string) => {
        const configs = {
            keynote: {
                bg: `rgba(147, 51, 234, ${themeColors.categoryAlpha})`,
                border: 'rgba(147, 51, 234, 0.3)',
                text: activeTheme === 'light' ? '#7c3aed' : '#a855f7',
                icon: 'mic' as const
            },
            presentation: {
                bg: `rgba(59, 130, 246, ${themeColors.categoryAlpha})`,
                border: 'rgba(59, 130, 246, 0.3)',
                text: activeTheme === 'light' ? '#2563eb' : '#60a5fa',
                icon: 'monitor' as const
            },
            panel: {
                bg: `rgba(16, 185, 129, ${themeColors.categoryAlpha})`,
                border: 'rgba(16, 185, 129, 0.3)',
                text: activeTheme === 'light' ? '#059669' : '#34d399',
                icon: 'users' as const
            },
            workshop: {
                bg: `rgba(245, 158, 11, ${themeColors.categoryAlpha})`,
                border: 'rgba(245, 158, 11, 0.3)',
                text: activeTheme === 'light' ? '#d97706' : '#fbbf24',
                icon: 'tool' as const
            },
            networking: {
                bg: `rgba(236, 72, 153, ${themeColors.categoryAlpha})`,
                border: 'rgba(236, 72, 153, 0.3)',
                text: activeTheme === 'light' ? '#be185d' : '#f472b6',
                icon: 'coffee' as const
            },
            break: {
                bg: `rgba(107, 114, 128, ${themeColors.categoryAlpha})`,
                border: 'rgba(107, 114, 128, 0.3)',
                text: activeTheme === 'light' ? '#6b7280' : '#9ca3af',
                icon: 'pause-circle' as const
            },
            other: {
                bg: `rgba(232, 92, 41, ${themeColors.categoryAlpha})`,
                border: 'rgba(232, 92, 41, 0.3)',
                text: '#e85c29',
                icon: 'star' as const
            }
        };
        return configs[category as keyof typeof configs] || configs.other;
    };

    const formatTime = (time: string) => {
        try {
            const [hours, minutes] = time.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
        } catch {
            return time;
        }
    };

    const getItemStyles = () => {
        const baseStyle = {
            borderRadius: 20,
            marginBottom: 24,
            overflow: 'hidden' as const,
        };

        if (isCurrentItem) {
            return {
                ...baseStyle,
                backgroundColor: themeColors.currentBackground,
                borderColor: themeColors.currentBorder,
                borderWidth: 2,
                shadowColor: themeColors.currentBorder,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 16,
                elevation: 12,
            };
        }

        if (item.isBreak) {
            return {
                ...baseStyle,
                backgroundColor: themeColors.breakBackground,
                borderColor: themeColors.breakBorder,
                borderWidth: 1,
                shadowColor: themeColors.cardDefaultShadow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 8,
                elevation: 4,
            };
        }

        return {
            ...baseStyle,
            backgroundColor: themeColors.cardDefault,
            borderColor: themeColors.cardDefaultBorder,
            borderWidth: 1,
            shadowColor: themeColors.cardDefaultShadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 12,
            elevation: 6,
        };
    };

    const categoryConfig = getCategoryConfig(item.category);

    return (
        <>
            <View style={[{ padding: 24 }, getItemStyles()]}>
                {/* Category badges */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
                    {item.category && (
                        <View
                            style={{
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                borderRadius: 20,
                                marginRight: 12,
                                marginBottom: 8,
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: categoryConfig.bg,
                                borderWidth: 1,
                                borderColor: categoryConfig.border,
                            }}
                        >
                            <Feather
                                name={categoryConfig.icon}
                                size={14}
                                color={categoryConfig.text}
                                style={{ marginRight: 6 }}
                            />
                            <Text
                                style={{
                                    fontFamily: 'Rubik_600SemiBold',
                                    fontSize: 12,
                                    color: categoryConfig.text,
                                    letterSpacing: 0.5,
                                }}
                            >
                                {item.category.toUpperCase()}
                            </Text>
                        </View>
                    )}
                    {isCurrentItem && (
                        <Animated.View
                            style={{
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                borderRadius: 20,
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: themeColors.timeAccent,
                                borderWidth: 2,
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                marginBottom: 8,
                                shadowColor: themeColors.timeAccent,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 4,
                            }}
                        >
                            <Animated.View
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: 'white',
                                    marginRight: 8,
                                }}
                            />
                            <Text style={{
                                color: 'white',
                                fontFamily: 'Rubik_700Bold',
                                fontSize: 12,
                                letterSpacing: 0.5,
                            }}>
                                LIVE NOW
                            </Text>
                        </Animated.View>
                    )}
                </View>

                {/* Title */}
                <View style={{ marginBottom: 24 }}>
                    <Text style={{
                        fontFamily: 'Rubik_700Bold',
                        fontSize: 24,
                        lineHeight: 32,
                        color: themeColors.text,
                        marginBottom: 8,
                    }}>
                        {item.title}
                    </Text>
                </View>

                {/* Time */}
                <View style={{ marginBottom: 24 }}>
                    <View
                        style={{
                            paddingHorizontal: 20,
                            paddingVertical: 16,
                            borderRadius: 16,
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: themeColors.timeBackground,
                            borderWidth: 1,
                            borderColor: 'rgba(232, 92, 41, 0.2)',
                        }}
                    >
                        <Feather
                            name="clock"
                            size={20}
                            color={themeColors.timeAccent}
                            style={{ marginRight: 12 }}
                        />
                        <Text style={{
                            fontFamily: 'Rubik_700Bold',
                            fontSize: 18,
                            color: themeColors.timeAccent
                        }}>
                            {formatTime(item.startTime)} - {formatTime(item.endTime)}
                        </Text>
                    </View>
                </View>

                {/* Location */}
                {item.location && (
                    <View style={{ marginBottom: 24, flexDirection: 'row', alignItems: 'center' }}>
                        <Feather
                            name="map-pin"
                            size={18}
                            color={themeColors.textTertiary}
                            style={{ marginRight: 10 }}
                        />
                        <Text style={{
                            fontFamily: 'Rubik_500Medium',
                            fontSize: 16,
                            color: themeColors.textSecondary,
                            flex: 1,
                        }}>
                            {item.location}
                        </Text>
                    </View>
                )}

                {/* Description */}
                {item.description && (
                    <View
                        style={{
                            padding: 20,
                            borderRadius: 16,
                            marginBottom: 24,
                            backgroundColor: themeColors.surfaceSecondary,
                            borderWidth: 1,
                            borderColor: themeColors.borderLight,
                        }}
                    >
                        <Text style={{
                            fontFamily: 'Rubik_400Regular',
                            fontSize: 16,
                            lineHeight: 24,
                            color: themeColors.textSecondary
                        }}>
                            {item.description}
                        </Text>
                    </View>
                )}

                {/* Speaker */}
                {item.speaker && (
                    <TouchableOpacity
                        onPress={showModal}
                        activeOpacity={0.7}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: 16,
                            borderRadius: 16,
                            marginBottom: 24,
                            backgroundColor: themeColors.surfaceSecondary,
                            borderWidth: 1,
                            borderColor: themeColors.borderLight,
                            shadowColor: themeColors.cardDefaultShadow,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 2,
                        }}
                    >
                        <View style={{
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 16,
                            backgroundColor: 'rgba(59, 130, 246, 0.12)',
                        }}>
                            <Feather name="user" size={20} color="#3b82f6" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{
                                fontFamily: 'Rubik_500Medium',
                                fontSize: 12,
                                letterSpacing: 0.5,
                                color: themeColors.textTertiary,
                                marginBottom: 4,
                            }}>
                                SPEAKER
                            </Text>
                            <Text style={{
                                fontFamily: 'Rubik_600SemiBold',
                                fontSize: 18,
                                color: themeColors.text
                            }}>
                                {item.speaker}
                            </Text>
                        </View>
                        <Feather name="chevron-right" size={20} color={themeColors.textTertiary} />
                    </TouchableOpacity>
                )}

                {/* Break indicator */}
                {item.isBreak && (
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 16,
                        borderRadius: 16,
                        marginBottom: 24,
                        backgroundColor: 'rgba(107, 114, 128, 0.08)',
                    }}>
                        <Feather
                            name="coffee"
                            size={20}
                            color={themeColors.breakIcon}
                            style={{ marginRight: 12 }}
                        />
                        <Text style={{
                            fontFamily: 'Rubik_500Medium',
                            fontSize: 16,
                            color: themeColors.breakIcon
                        }}>
                            Break Time - Refresh & Network
                        </Text>
                    </View>
                )}

                {/* Admin controls */}
                {isAdmin && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
                        {onSetCurrent && !isCurrentItem && (
                            <TouchableOpacity
                                onPress={() => onSetCurrent(item.id)}
                                style={{
                                    paddingHorizontal: 16,
                                    paddingVertical: 12,
                                    borderRadius: 12,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: themeColors.timeAccent,
                                    shadowColor: themeColors.timeAccent,
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 8,
                                    elevation: 4,
                                }}
                            >
                                <Feather name="play" size={16} color="white" style={{ marginRight: 8 }} />
                                <Text style={{
                                    color: 'white',
                                    fontFamily: 'Rubik_700Bold',
                                    fontSize: 12,
                                    letterSpacing: 0.5,
                                }}>
                                    SET LIVE
                                </Text>
                            </TouchableOpacity>
                        )}
                        {onEdit && (
                            <TouchableOpacity
                                onPress={() => onEdit(item)}
                                style={{
                                    paddingHorizontal: 16,
                                    paddingVertical: 12,
                                    borderRadius: 12,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: themeColors.adminButtonBg,
                                    borderWidth: 1,
                                    borderColor: themeColors.adminButtonBorder,
                                }}
                            >
                                <Feather name="edit-2" size={16} color="#3b82f6" style={{ marginRight: 8 }} />
                                <Text style={{
                                    fontFamily: 'Rubik_700Bold',
                                    fontSize: 12,
                                    letterSpacing: 0.5,
                                    color: '#3b82f6'
                                }}>
                                    EDIT
                                </Text>
                            </TouchableOpacity>
                        )}
                        {onDelete && (
                            <TouchableOpacity
                                onPress={() => onDelete(item.id)}
                                style={{
                                    paddingHorizontal: 16,
                                    paddingVertical: 12,
                                    borderRadius: 12,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    borderWidth: 1,
                                    borderColor: 'rgba(239, 68, 68, 0.3)',
                                }}
                            >
                                <Feather name="trash-2" size={16} color="#ef4444" style={{ marginRight: 8 }} />
                                <Text style={{
                                    fontFamily: 'Rubik_700Bold',
                                    fontSize: 12,
                                    letterSpacing: 0.5,
                                    color: '#ef4444'
                                }}>
                                    DELETE
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>

            {/* Enhanced Speaker Modal with Blur */}
            <Modal
                visible={isSpeakerModalVisible}
                transparent
                animationType="none"
                onRequestClose={hideModal}
                statusBarTranslucent
            >
                <Animated.View
                    style={{
                        flex: 1,
                        opacity: fadeAnim,
                    }}
                >
                    <BlurView
                        intensity={Platform.OS === 'ios' ? 100 : 150}
                        tint={activeTheme === 'light' ? 'light' : 'dark'}
                        style={{ flex: 1 }}
                    >
                        <Pressable
                            style={{
                                flex: 1,
                                justifyContent: 'flex-end',
                                backgroundColor: themeColors.modalOverlay,
                            }}
                            onPress={hideModal}
                        >
                            <Animated.View
                                style={{
                                    transform: [
                                        { translateY: slideAnim },
                                        { scale: scaleAnim }
                                    ],
                                    maxHeight: screenHeight * 0.8,
                                    width: '100%',
                                    borderTopLeftRadius: 24,
                                    borderTopRightRadius: 24,
                                    backgroundColor: themeColors.modalSurface,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: -4 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 16,
                                    elevation: 20,
                                }}
                                onStartShouldSetResponder={() => true}
                            >
                                {/* Modal Handle */}
                                <View style={{
                                    alignItems: 'center',
                                    paddingTop: 12,
                                    paddingBottom: 8,
                                }}>
                                    <View style={{
                                        width: 40,
                                        height: 4,
                                        borderRadius: 2,
                                        backgroundColor: themeColors.textTertiary,
                                        opacity: 0.3,
                                    }} />
                                </View>

                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    bounces={false}
                                    contentContainerStyle={{
                                        paddingHorizontal: 24,
                                        paddingBottom: 40,
                                    }}
                                >
                                    {/* Header */}
                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginBottom: 24,
                                        paddingTop: 8,
                                    }}>
                                        <View
                                            style={{
                                                width: 64,
                                                height: 64,
                                                borderRadius: 32,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: 20,
                                                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                                                borderWidth: 2,
                                                borderColor: 'rgba(59, 130, 246, 0.2)',
                                            }}
                                        >
                                            <Feather name="user" size={28} color="#3b82f6" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text
                                                style={{
                                                    fontFamily: 'Rubik_700Bold',
                                                    fontSize: 24,
                                                    lineHeight: 32,
                                                    color: themeColors.text,
                                                    flexWrap: 'wrap',
                                                }}
                                                numberOfLines={2}
                                            >
                                                {item.speaker}
                                            </Text>
                                            <Text
                                                style={{
                                                    fontFamily: 'Rubik_500Medium',
                                                    fontSize: 14,
                                                    color: themeColors.textTertiary,
                                                    marginTop: 4,
                                                }}
                                            >
                                                Speaker
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Bio Section */}
                                    <View style={{
                                        backgroundColor: themeColors.surfaceSecondary,
                                        borderRadius: 16,
                                        padding: 20,
                                        marginBottom: 24,
                                        borderWidth: 1,
                                        borderColor: themeColors.borderLight,
                                    }}>
                                        <Text
                                            style={{
                                                fontFamily: 'Rubik_400Regular',
                                                fontSize: 16,
                                                lineHeight: 24,
                                                color: themeColors.textSecondary,
                                            }}
                                        >
                                            {item.speakerBio || 'No biography available for this speaker.'}
                                        </Text>
                                    </View>

                                    {/* Session Info */}
                                    <View style={{
                                        backgroundColor: themeColors.timeBackground,
                                        borderRadius: 16,
                                        padding: 20,
                                        borderWidth: 1,
                                        borderColor: 'rgba(232, 92, 41, 0.2)',
                                    }}>
                                        <Text
                                            style={{
                                                fontFamily: 'Rubik_600SemiBold',
                                                fontSize: 16,
                                                color: themeColors.timeAccent,
                                                marginBottom: 8,
                                            }}
                                        >
                                            {item.title}
                                        </Text>
                                        <Text
                                            style={{
                                                fontFamily: 'Rubik_500Medium',
                                                fontSize: 14,
                                                color: themeColors.timeAccent,
                                                opacity: 0.8,
                                            }}
                                        >
                                            {formatTime(item.startTime)} - {formatTime(item.endTime)}
                                        </Text>
                                    </View>
                                </ScrollView>

                                {/* Close Button */}
                                <View style={{
                                    paddingHorizontal: 24,
                                    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
                                    paddingTop: 16,
                                    borderTopWidth: 1,
                                    borderTopColor: themeColors.borderLight,
                                    backgroundColor: themeColors.modalSurface,
                                }}>
                                    <TouchableOpacity
                                        onPress={hideModal}
                                        style={{
                                            backgroundColor: themeColors.timeAccent,
                                            paddingVertical: 16,
                                            borderRadius: 12,
                                            alignItems: 'center',
                                            shadowColor: themeColors.timeAccent,
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.2,
                                            shadowRadius: 8,
                                            elevation: 4,
                                        }}
                                    >
                                        <Text style={{
                                            color: 'white',
                                            fontFamily: 'Rubik_700Bold',
                                            fontSize: 16,
                                            letterSpacing: 0.5,
                                        }}>
                                            Close
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        </Pressable>
                    </BlurView>
                </Animated.View>
            </Modal>
        </>
    );
};

export default AgendaItem;