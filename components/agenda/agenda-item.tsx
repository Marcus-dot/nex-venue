import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { AgendaItem as AgendaItemType } from '@/types/agenda';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import SpeakerImageCarousel from './speaker-image-carousel';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

        // Delay StatusBar change to avoid timing conflicts
        setTimeout(() => {
            StatusBar.setBarStyle('light-content', true);
        }, 50);

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
        // Delay StatusBar change to avoid timing conflicts
        setTimeout(() => {
            StatusBar.setBarStyle(activeTheme === 'light' ? 'dark-content' : 'light-content', true);
        }, 50);

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

    // Memoize category config to avoid recalculation during renders
    const categoryConfig = useMemo(() => {
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
                icon: 'pause' as const
            },
            other: {
                bg: `rgba(75, 85, 99, ${themeColors.categoryAlpha})`,
                border: 'rgba(75, 85, 99, 0.3)',
                text: activeTheme === 'light' ? '#4b5563' : '#9ca3af',
                icon: 'calendar' as const
            }
        };

        return configs[item.category as keyof typeof configs] || configs.other;
    }, [item.category, activeTheme, themeColors.categoryAlpha]);

    const formatTime = (time: string) => {
        // Simple time formatting - you might want to enhance this
        return time;
    };

    return (
        <>
            {/* Enhanced Agenda Item Card */}
            <TouchableOpacity
                onPress={item.speaker ? showModal : undefined}
                disabled={!item.speaker}
                style={{
                    backgroundColor: isCurrentItem ? themeColors.currentBackground : (item.isBreak ? themeColors.breakBackground : themeColors.cardDefault),
                    borderWidth: 1,
                    borderColor: isCurrentItem ? themeColors.currentBorder : (item.isBreak ? themeColors.breakBorder : themeColors.cardDefaultBorder),
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 12,
                    shadowColor: isCurrentItem ? themeColors.currentBorder : '#000',
                    shadowOffset: { width: 0, height: isCurrentItem ? 6 : 2 },
                    shadowOpacity: isCurrentItem ? 0.15 : (activeTheme === 'light' ? 0.04 : 0.1),
                    shadowRadius: isCurrentItem ? 12 : 4,
                    elevation: isCurrentItem ? 8 : 2,
                    ...(isCurrentItem && {
                        shadowColor: themeColors.currentBorder,
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.2,
                        shadowRadius: 16,
                        elevation: 12,
                    })
                }}
            >
                {/* Time and Category Header */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 12,
                }}>
                    <View style={{
                        backgroundColor: categoryConfig.bg,
                        borderWidth: 1,
                        borderColor: categoryConfig.border,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 20,
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}>
                        <Feather name={categoryConfig.icon} size={12} color={categoryConfig.text} />
                        <Text style={{
                            fontFamily: 'Rubik_600SemiBold',
                            fontSize: 11,
                            color: categoryConfig.text,
                            marginLeft: 6,
                            letterSpacing: 0.5,
                        }}>
                            {item.category ? item.category.toUpperCase() : 'OTHER'}
                        </Text>
                    </View>

                    <View style={{
                        backgroundColor: themeColors.timeBackground,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: `${themeColors.timeAccent}30`,
                    }}>
                        <Text style={{
                            fontFamily: 'Rubik_700Bold',
                            fontSize: 12,
                            color: themeColors.timeAccent,
                            letterSpacing: 0.3,
                        }}>
                            {formatTime(item.startTime)} - {formatTime(item.endTime)}
                        </Text>
                    </View>
                </View>

                {/* Main Content */}
                <View>
                    <Text style={{
                        fontFamily: 'Rubik_700Bold',
                        fontSize: 18,
                        color: themeColors.text,
                        marginBottom: 8,
                        lineHeight: 24,
                    }}>
                        {item.title}
                    </Text>

                    {item.description && (
                        <Text style={{
                            fontFamily: 'Rubik_400Regular',
                            fontSize: 14,
                            color: themeColors.textSecondary,
                            lineHeight: 20,
                            marginBottom: 12,
                        }}>
                            {item.description}
                        </Text>
                    )}

                    {/* Speaker and Location */}
                    <View style={{ gap: 8 }}>
                        {item.speaker && (
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
                                <View style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 12,
                                    backgroundColor: `${themeColors.timeAccent}20`,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 10,
                                }}>
                                    <Feather name="user" size={12} color={themeColors.timeAccent} />
                                </View>
                                <Text style={{
                                    fontFamily: 'Rubik_500Medium',
                                    fontSize: 14,
                                    color: themeColors.textSecondary,
                                    flex: 1,
                                }}>
                                    {item.speaker}
                                </Text>
                                {item.speaker && (
                                    <Text style={{
                                        fontFamily: 'Rubik_400Regular',
                                        fontSize: 11,
                                        color: themeColors.textTertiary,
                                        fontStyle: 'italic',
                                    }}>
                                        Tap to view details
                                    </Text>
                                )}
                            </View>
                        )}

                        {item.location && (
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
                                <View style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 12,
                                    backgroundColor: `${categoryConfig.text}20`,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 10,
                                }}>
                                    <Feather name="map-pin" size={12} color={categoryConfig.text} />
                                </View>
                                <Text style={{
                                    fontFamily: 'Rubik_400Regular',
                                    fontSize: 14,
                                    color: themeColors.textTertiary,
                                }}>
                                    {item.location}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Current Item Indicator */}
                {isCurrentItem && (
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 16,
                        paddingTop: 16,
                        borderTopWidth: 1,
                        borderTopColor: themeColors.borderLight,
                    }}>
                        <View style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: themeColors.timeAccent,
                            marginRight: 8,
                        }} />
                        <Text style={{
                            fontFamily: 'Rubik_600SemiBold',
                            fontSize: 13,
                            color: themeColors.timeAccent,
                            letterSpacing: 0.5,
                        }}>
                            CURRENTLY LIVE
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
            </TouchableOpacity>

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
                        <Pressable style={{ flex: 1 }} onPress={hideModal}>
                            <Animated.View
                                style={{
                                    flex: 1,
                                    justifyContent: 'flex-end',
                                    transform: [
                                        { translateY: slideAnim },
                                        { scale: scaleAnim }
                                    ],
                                }}
                            >
                                {/* Handle */}
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
                                    showsVerticalScrollIndicator={true}
                                    bounces={true}
                                    scrollEnabled={true}
                                    nestedScrollEnabled={true}
                                    contentContainerStyle={{
                                        paddingHorizontal: 24,
                                        paddingBottom: 40,
                                        flexGrow: 1,
                                    }}
                                    style={{
                                        backgroundColor: themeColors.modalSurface,
                                        borderTopLeftRadius: 24,
                                        borderTopRightRadius: 24,
                                        maxHeight: screenHeight * 0.75,
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
                                                backgroundColor: categoryConfig.bg,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: 16,
                                                borderWidth: 1,
                                                borderColor: categoryConfig.border,
                                            }}
                                        >
                                            <Feather name="user" size={28} color={categoryConfig.text} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{
                                                fontFamily: 'Rubik_700Bold',
                                                fontSize: 24,
                                                color: themeColors.text,
                                                marginBottom: 4,
                                            }}>
                                                {item.speaker}
                                            </Text>
                                            <Text style={{
                                                fontFamily: 'Rubik_500Medium',
                                                fontSize: 14,
                                                color: themeColors.textTertiary,
                                                marginTop: 4,
                                            }}>
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
                                        <Text style={{
                                            fontFamily: 'Rubik_600SemiBold',
                                            fontSize: 16,
                                            color: themeColors.text,
                                            marginBottom: 12,
                                        }}>
                                            About the Speaker
                                        </Text>
                                        <Text style={{
                                            fontFamily: 'Rubik_400Regular',
                                            fontSize: 16,
                                            lineHeight: 24,
                                            color: themeColors.textSecondary,
                                        }}>
                                            {item.speakerBio || 'No biography available for this speaker.'}
                                        </Text>
                                    </View>

                                    {/* Speaker Images Carousel */}
                                    {(() => {
                                        const images = item.speakerImages && item.speakerImages.length > 0
                                            ? item.speakerImages
                                            : item.speakerImage ? [item.speakerImage] : [];
                                        
                                        if (images.length > 0) {
                                            return <SpeakerImageCarousel images={images} activeTheme={activeTheme} />;
                                        }
                                        return null;
                                    })()}

                                    {/* Session Details */}
                                    <View style={{
                                        backgroundColor: themeColors.surfaceElevated,
                                        borderRadius: 16,
                                        padding: 20,
                                        marginBottom: 24,
                                        borderWidth: 1,
                                        borderColor: themeColors.border,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: activeTheme === 'light' ? 0.02 : 0.1,
                                        shadowRadius: 6,
                                        elevation: 2,
                                    }}>
                                        <Text style={{
                                            fontFamily: 'Rubik_600SemiBold',
                                            fontSize: 16,
                                            color: themeColors.text,
                                            marginBottom: 16,
                                        }}>
                                            Session Details
                                        </Text>

                                        <View style={{ marginBottom: 16 }}>
                                            <Text style={{
                                                fontFamily: 'Rubik_700Bold',
                                                fontSize: 20,
                                                color: themeColors.text,
                                                marginBottom: 8,
                                                lineHeight: 28,
                                            }}>
                                                {item.title}
                                            </Text>
                                            {item.description && (
                                                <Text style={{
                                                    fontFamily: 'Rubik_400Regular',
                                                    fontSize: 15,
                                                    color: themeColors.textSecondary,
                                                    lineHeight: 22,
                                                    marginBottom: 16,
                                                }}>
                                                    {item.description}
                                                </Text>
                                            )}
                                        </View>

                                        <View style={{ gap: 12 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Feather name="clock" size={16} color={themeColors.textTertiary} />
                                                <Text style={{
                                                    fontFamily: 'Rubik_500Medium',
                                                    fontSize: 14,
                                                    color: themeColors.textSecondary,
                                                    marginLeft: 12,
                                                }}>
                                                    {formatTime(item.startTime)} - {formatTime(item.endTime)}
                                                </Text>
                                            </View>

                                            {item.location && (
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Feather name="map-pin" size={16} color={themeColors.textTertiary} />
                                                    <Text style={{
                                                        fontFamily: 'Rubik_400Regular',
                                                        fontSize: 14,
                                                        color: themeColors.textSecondary,
                                                        marginLeft: 12,
                                                    }}>
                                                        {item.location}
                                                    </Text>
                                                </View>
                                            )}

                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Feather name="tag" size={16} color={themeColors.textTertiary} />
                                                <Text style={{
                                                    fontFamily: 'Rubik_400Regular',
                                                    fontSize: 14,
                                                    color: categoryConfig.text,
                                                    marginLeft: 12,
                                                }}>
                                                    {item.category ? (item.category.charAt(0).toUpperCase() + item.category.slice(1)) : 'Other'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </ScrollView>

                                {/* Enhanced Close Button */}
                                <View style={{
                                    paddingHorizontal: screenWidth > 400 ? 40 : 24,
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