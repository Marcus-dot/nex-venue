// components/agenda/speaker-image-carousel.tsx

import { Image } from 'expo-image';
import React, { useCallback, useState } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';

interface SpeakerImageCarouselProps {
    images: string[];
    activeTheme: 'light' | 'dark';
}

const { width: screenWidth } = Dimensions.get('window');

const SpeakerImageCarousel: React.FC<SpeakerImageCarouselProps> = ({
    images,
    activeTheme
}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [imageLoadErrors, setImageLoadErrors] = useState<{ [key: number]: boolean }>({});

    const themeColors = {
        indicatorInactive: activeTheme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
        indicatorActive: activeTheme === 'light' ? '#e85c29' : '#f97316',
    };

    const handleImageError = useCallback((index: number) => {
        setImageLoadErrors(prev => ({ ...prev, [index]: true }));
    }, []);

    const goToPrevious = () => {
        setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1));
    };

    const goToNext = () => {
        setActiveIndex((current) => (current === images.length - 1 ? 0 : current + 1));
    };

    if (!images || images.length === 0) return null;

    // If only one image, don't show carousel controls
    if (images.length === 1) {
        return (
            <View style={{
                marginBottom: 24,
                borderRadius: 16,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 6,
            }}>
                {!imageLoadErrors[0] && (
                    <Image
                        source={{ uri: images[0] }}
                        style={{
                            width: '100%',
                            height: screenWidth * 0.5,
                        }}
                        contentFit="contain"
                        transition={200}
                        onError={() => handleImageError(0)}
                    />
                )}
            </View>
        );
    }

    return (
        <View style={{ marginBottom: 24 }}>
            {/* Carousel Container */}
            <View style={{
                borderRadius: 16,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 6,
                position: 'relative',
            }}>
                {/* Current Image */}
                {!imageLoadErrors[activeIndex] && (
                    <Image
                        source={{ uri: images[activeIndex] }}
                        style={{
                            width: '100%',
                            height: screenWidth * 0.5,
                        }}
                        contentFit="contain"
                        transition={200}
                        onError={() => handleImageError(activeIndex)}
                    />
                )}

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        {/* Previous Button */}
                        <TouchableOpacity
                            onPress={goToPrevious}
                            style={{
                                position: 'absolute',
                                left: 12,
                                top: '50%',
                                transform: [{ translateY: -20 }],
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>‹</Text>
                        </TouchableOpacity>

                        {/* Next Button */}
                        <TouchableOpacity
                            onPress={goToNext}
                            style={{
                                position: 'absolute',
                                right: 12,
                                top: '50%',
                                transform: [{ translateY: -20 }],
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>›</Text>
                        </TouchableOpacity>

                        {/* Image Counter */}
                        <View style={{
                            position: 'absolute',
                            bottom: 12,
                            right: 12,
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 12,
                        }}>
                            <Text style={{
                                color: 'white',
                                fontSize: 12,
                                fontFamily: 'Rubik_600SemiBold',
                            }}>
                                {activeIndex + 1} / {images.length}
                            </Text>
                        </View>
                    </>
                )}
            </View>

            {/* Dot Indicators */}
            {images.length > 1 && (
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 12,
                }}>
                    {images.map((_, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => setActiveIndex(index)}
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: index === activeIndex
                                    ? themeColors.indicatorActive
                                    : themeColors.indicatorInactive,
                                marginHorizontal: 4,
                            }}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};

export default SpeakerImageCarousel;