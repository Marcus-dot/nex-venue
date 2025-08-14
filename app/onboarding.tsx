import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React from 'react';
import { Alert, View } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import { RFPercentage } from 'react-native-responsive-fontsize';

import { HEADING_FONT_SIZE, SUBTITlE_FONT_SIZE } from '@/constants';
import { appOnboardingPageData } from '@/constants/data';
import { setOnboardingCompleted } from '@/utils/storage';

const animations = [
    require('../assets/animations/hello.json'),
    require('../assets/animations/searching.json'),
    require('../assets/animations/newsletter.json'),
];

const OnboardingScreen = () => {
    const router = useRouter();

    const pages = appOnboardingPageData.map((page, idx) => ({
        backgroundColor: page.backgroundColor,
        title: page.title,
        subtitle: page.subtitle,
        image: (
            <View className='overflow-visible' style={{ alignItems: 'center', justifyContent: 'center', width: '100%', paddingBottom: 24 }}>
                <LottieView
                    source={animations[idx]}
                    autoPlay
                    loop
                    style={{ width: RFPercentage(50), height: RFPercentage(20) }}
                    resizeMode="cover"
                />
            </View>
        ),
        titleStyles: {
            fontSize: HEADING_FONT_SIZE,
            fontFamily: 'Rubik-ExtraBold',
            // can lahh...
        },
        subTitleStyles: {
            fontSize: SUBTITlE_FONT_SIZE,
            fontFamily: 'Rubik-Medium',
        },
    }));

    const handleComplete = async () => {
        try {
            await setOnboardingCompleted();
            router.replace('/welcome');
        } catch (error) {
            Alert.alert(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    };

    return (
        <View className="flex-1 relative">
            <Onboarding
                onDone={handleComplete}
                onSkip={handleComplete}
                containerStyles={{ paddingHorizontal: RFPercentage(3.0) }}
                pages={pages}
            />
        </View>
    );
};

export default OnboardingScreen;
