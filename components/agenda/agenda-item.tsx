import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { AgendaItem as AgendaItemType } from '@/types/agenda';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface AgendaItemProps {
    item: AgendaItemType;
    isCurrentItem?: boolean;
    onEdit?: (item: AgendaItemType) => void;
    onDelete?: (itemId: string) => void;
    onSetCurrent?: (itemId: string) => void;
}

const AgendaItem: React.FC<AgendaItemProps> = ({
    item,
    isCurrentItem = false,
    onEdit,
    onDelete,
    onSetCurrent
}) => {
    const { isAdmin } = useAuth();
    const { activeTheme } = useTheme();

    // Theme-aware colors with premium enhancements
    const themeColors = {
        // Base colors
        background: activeTheme === 'light' ? '#D8D9D4' : '#222551',
        surface: activeTheme === 'light' ? '#ffffff' : '#374151',
        surfaceSecondary: activeTheme === 'light' ? '#f3f4f6' : '#1f2937',
        text: activeTheme === 'light' ? '#1f2937' : '#ffffff',
        textSecondary: activeTheme === 'light' ? '#6b7280' : '#d1d5db',
        textTertiary: activeTheme === 'light' ? '#9ca3af' : '#9CA3AF',
        border: activeTheme === 'light' ? '#e5e7eb' : '#374151',

        // Premium card variations
        cardDefault: activeTheme === 'light' ? '#ffffff' : '#374151',
        cardDefaultBorder: activeTheme === 'light' ? 'rgba(226, 232, 240, 0.8)' : 'rgba(71, 85, 105, 0.6)',
        cardDefaultShadow: activeTheme === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(0, 0, 0, 0.2)',

        // Break item styling
        breakBackground: activeTheme === 'light' ? 'rgba(248, 250, 252, 0.8)' : 'rgba(30, 41, 59, 0.6)',
        breakBorder: activeTheme === 'light' ? 'rgba(226, 232, 240, 0.6)' : 'rgba(71, 85, 105, 0.4)',
        breakIcon: activeTheme === 'light' ? '#94a3b8' : '#64748b',

        // Current/Live item styling
        currentBackground: activeTheme === 'light'
            ? 'linear-gradient(135deg, rgba(232, 92, 41, 0.08) 0%, rgba(248, 113, 113, 0.05) 100%)'
            : 'linear-gradient(135deg, rgba(232, 92, 41, 0.15) 0%, rgba(248, 113, 113, 0.08) 100%)',
        currentBorder: '#e85c29',
        currentGlow: activeTheme === 'light' ? 'rgba(232, 92, 41, 0.2)' : 'rgba(232, 92, 41, 0.3)',

        // Time and accent colors
        timeAccent: '#e85c29',
        timeBackground: activeTheme === 'light'
            ? 'rgba(232, 92, 41, 0.1)'
            : 'rgba(232, 92, 41, 0.2)',

        // Admin controls
        adminButtonBg: activeTheme === 'light' ? 'rgba(248, 250, 252, 0.9)' : 'rgba(30, 41, 59, 0.8)',
        adminButtonBorder: activeTheme === 'light' ? 'rgba(226, 232, 240, 0.8)' : 'rgba(71, 85, 105, 0.6)',

        // Category colors base
        categoryAlpha: activeTheme === 'light' ? '0.15' : '0.25',
    };

    // Premium category styling with better colors
    const getCategoryConfig = (category?: string) => {
        const configs = {
            keynote: {
                bg: `rgba(147, 51, 234, ${themeColors.categoryAlpha})`,
                border: 'rgba(147, 51, 234, 0.4)',
                text: activeTheme === 'light' ? '#7c3aed' : '#a855f7',
                icon: 'mic'
            },
            presentation: {
                bg: `rgba(59, 130, 246, ${themeColors.categoryAlpha})`,
                border: 'rgba(59, 130, 246, 0.4)',
                text: activeTheme === 'light' ? '#2563eb' : '#60a5fa',
                icon: 'monitor'
            },
            panel: {
                bg: `rgba(16, 185, 129, ${themeColors.categoryAlpha})`,
                border: 'rgba(16, 185, 129, 0.4)',
                text: activeTheme === 'light' ? '#059669' : '#34d399',
                icon: 'users'
            },
            workshop: {
                bg: `rgba(245, 158, 11, ${themeColors.categoryAlpha})`,
                border: 'rgba(245, 158, 11, 0.4)',
                text: activeTheme === 'light' ? '#d97706' : '#fbbf24',
                icon: 'tool'
            },
            networking: {
                bg: `rgba(236, 72, 153, ${themeColors.categoryAlpha})`,
                border: 'rgba(236, 72, 153, 0.4)',
                text: activeTheme === 'light' ? '#be185d' : '#f472b6',
                icon: 'coffee'
            },
            break: {
                bg: `rgba(107, 114, 128, ${themeColors.categoryAlpha})`,
                border: 'rgba(107, 114, 128, 0.4)',
                text: activeTheme === 'light' ? '#6b7280' : '#9ca3af',
                icon: 'pause-circle'
            },
            other: {
                bg: `rgba(232, 92, 41, ${themeColors.categoryAlpha})`,
                border: 'rgba(232, 92, 41, 0.4)',
                text: '#e85c29',
                icon: 'star'
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
            return time; // Fallback to original time if parsing fails
        }
    };

    const getItemStyles = () => {
        if (isCurrentItem) {
            return {
                backgroundColor: 'transparent', // Will use gradient background
                borderColor: themeColors.currentBorder,
                borderWidth: 2,
                shadowColor: themeColors.currentBorder,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 8,
            };
        }

        if (item.isBreak) {
            return {
                backgroundColor: themeColors.breakBackground,
                borderColor: themeColors.breakBorder,
                borderWidth: 1,
                shadowColor: themeColors.cardDefaultShadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 4,
                elevation: 2,
            };
        }

        return {
            backgroundColor: themeColors.cardDefault,
            borderColor: themeColors.cardDefaultBorder,
            borderWidth: 1,
            shadowColor: themeColors.cardDefaultShadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 6,
            elevation: 3,
        };
    };

    const categoryConfig = getCategoryConfig(item.category);

    return (
        <View
            className="p-6 rounded-2xl mb-6"
            style={[
                getItemStyles(),
                // Apply gradient background for current items
                isCurrentItem && {
                    backgroundColor: themeColors.currentBackground
                }
            ]}
        >
            {/* Premium gradient overlay for current items */}
            {isCurrentItem && (
                <View
                    className="absolute inset-0 rounded-2xl opacity-80"
                    style={{
                        backgroundColor: activeTheme === 'light'
                            ? 'rgba(232, 92, 41, 0.05)'
                            : 'rgba(232, 92, 41, 0.1)'
                    }}
                />
            )}

            {/* Category and Live badges row with proper spacing */}
            <View className="flex-row items-center mb-5 flex-wrap">
                {item.category && (
                    <View
                        className="px-4 py-2 rounded-full mr-3 mb-2 flex-row items-center border"
                        style={{
                            backgroundColor: categoryConfig.bg,
                            borderColor: categoryConfig.border
                        }}
                    >
                        <Feather
                            name={categoryConfig.icon as any}
                            size={12}
                            color={categoryConfig.text}
                            style={{ marginRight: 6 }}
                        />
                        <Text
                            className="font-rubik-semibold text-sm"
                            style={{ color: categoryConfig.text }}
                        >
                            {item.category.toUpperCase()}
                        </Text>
                    </View>
                )}

                {isCurrentItem && (
                    <View
                        className="px-4 py-2 rounded-full flex-row items-center border-2 mb-2"
                        style={{
                            backgroundColor: themeColors.timeAccent,
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            shadowColor: themeColors.timeAccent,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                            elevation: 4,
                        }}
                    >
                        <View
                            className="w-2 h-2 rounded-full mr-2"
                            style={{ backgroundColor: 'white' }}
                        />
                        <Text className="text-white font-rubik-bold text-sm">
                            LIVE NOW
                        </Text>
                    </View>
                )}
            </View>

            {/* Title with proper spacing */}
            <View className="mb-6">
                <Text
                    className="font-rubik-bold text-2xl mb-3"
                    style={{
                        color: themeColors.text,
                        lineHeight: 32
                    }}
                >
                    {item.title}
                </Text>
            </View>

            {/* Time section with better layout */}
            <View className="mb-6">
                <View
                    className="px-5 py-4 rounded-xl border flex-row items-center"
                    style={{
                        backgroundColor: themeColors.timeBackground,
                        borderColor: 'rgba(232, 92, 41, 0.3)'
                    }}
                >
                    <Feather name="clock" size={18} color={themeColors.timeAccent} style={{ marginRight: 12 }} />
                    <Text
                        className="font-rubik-bold text-lg"
                        style={{ color: themeColors.timeAccent }}
                    >
                        {formatTime(item.startTime)} - {formatTime(item.endTime)}
                    </Text>
                </View>
            </View>

            {/* Location with better spacing */}
            {item.location && (
                <View className="mb-6">
                    <View className="flex-row items-center">
                        <Feather name="map-pin" size={16} color={themeColors.textTertiary} style={{ marginRight: 8 }} />
                        <Text
                            className="font-rubik-medium text-base"
                            style={{ color: themeColors.textSecondary }}
                        >
                            {item.location}
                        </Text>
                    </View>
                </View>
            )}

            {/* Description with proper spacing */}
            {item.description && (
                <View
                    className="p-5 rounded-xl mb-6 border"
                    style={{
                        backgroundColor: activeTheme === 'light' ? 'rgba(248, 250, 252, 0.8)' : 'rgba(30, 41, 59, 0.6)',
                        borderColor: activeTheme === 'light' ? 'rgba(226, 232, 240, 0.8)' : 'rgba(71, 85, 105, 0.4)'
                    }}
                >
                    <Text
                        className="font-rubik text-base"
                        style={{
                            color: themeColors.textSecondary,
                            lineHeight: 24
                        }}
                    >
                        {item.description}
                    </Text>
                </View>
            )}

            {/* Speaker section with better spacing */}
            {item.speaker && (
                <View className="flex-row items-center p-4 rounded-xl border mb-6"
                    style={{
                        backgroundColor: activeTheme === 'light' ? 'rgba(249, 250, 251, 0.8)' : 'rgba(17, 24, 39, 0.6)',
                        borderColor: activeTheme === 'light' ? 'rgba(229, 231, 235, 0.8)' : 'rgba(55, 65, 81, 0.6)'
                    }}
                >
                    <View
                        className="w-12 h-12 rounded-full items-center justify-center mr-4"
                        style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }}
                    >
                        <Feather name="user" size={18} color="#3b82f6" />
                    </View>
                    <View className="flex-1">
                        <Text
                            className="font-rubik-medium text-sm mb-1"
                            style={{ color: themeColors.textTertiary }}
                        >
                            SPEAKER
                        </Text>
                        <Text
                            className="font-rubik-semibold text-lg"
                            style={{ color: themeColors.text, lineHeight: 22 }}
                        >
                            {item.speaker}
                        </Text>
                    </View>
                </View>
            )}

            {/* Break indicator with proper spacing */}
            {item.isBreak && (
                <View className="flex-row items-center justify-center p-4 rounded-xl mb-6"
                    style={{ backgroundColor: 'rgba(107, 114, 128, 0.1)' }}
                >
                    <Feather name="coffee" size={18} color={themeColors.breakIcon} style={{ marginRight: 10 }} />
                    <Text
                        className="font-rubik-medium text-base"
                        style={{ color: themeColors.breakIcon }}
                    >
                        Break Time - Refresh & Network
                    </Text>
                </View>
            )}

            {/* Admin controls moved to bottom with better spacing */}
            {isAdmin && (
                <View className="flex-row flex-wrap gap-3 mt-4">
                    {onSetCurrent && !isCurrentItem && (
                        <TouchableOpacity
                            onPress={() => onSetCurrent(item.id)}
                            className="px-4 py-3 rounded-lg border flex-row items-center"
                            style={{
                                backgroundColor: themeColors.timeAccent,
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                shadowColor: themeColors.timeAccent,
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.2,
                                shadowRadius: 4,
                                elevation: 3,
                            }}
                            activeOpacity={0.8}
                        >
                            <Feather name="play" size={14} color="white" style={{ marginRight: 6 }} />
                            <Text className="text-white font-rubik-bold text-sm">
                                SET LIVE
                            </Text>
                        </TouchableOpacity>
                    )}

                    {onEdit && (
                        <TouchableOpacity
                            onPress={() => onEdit(item)}
                            className="px-4 py-3 rounded-lg border flex-row items-center"
                            style={{
                                backgroundColor: themeColors.adminButtonBg,
                                borderColor: themeColors.adminButtonBorder
                            }}
                            activeOpacity={0.8}
                        >
                            <Feather name="edit-2" size={14} color="#3b82f6" style={{ marginRight: 6 }} />
                            <Text className="font-rubik-bold text-sm" style={{ color: '#3b82f6' }}>
                                EDIT
                            </Text>
                        </TouchableOpacity>
                    )}

                    {onDelete && (
                        <TouchableOpacity
                            onPress={() => onDelete(item.id)}
                            className="px-4 py-3 rounded-lg border flex-row items-center"
                            style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                borderColor: 'rgba(239, 68, 68, 0.3)'
                            }}
                            activeOpacity={0.8}
                        >
                            <Feather name="trash-2" size={14} color="#ef4444" style={{ marginRight: 6 }} />
                            <Text className="font-rubik-bold text-sm" style={{ color: '#ef4444' }}>
                                DELETE
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
};

export default AgendaItem;