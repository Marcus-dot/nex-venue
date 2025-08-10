import { View, Text, Image, Alert } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { useRouter } from 'expo-router';
import Onboarding from 'react-native-onboarding-swiper';

import { setOnboardingCompleted } from '@/utils/storage';
import { appOnboardingPageData } from '@/constants/data';
import { HEADING_FONT_SIZE, SUBTITlE_FONT_SIZE } from '@/constants';

const OnboardingScreen = () => {

    const router = useRouter();

    const pages = appOnboardingPageData.map((page) => ({
        backgroundColor: page.backgroundColor,
        title: page.title,
        subtitle: page.subtitle,
        image: 
            <View>
                <View className='items-center justify-center bg-red-500'>
                    {/* <Image 
                        source={}
                        accessible
                    /> */}
                </View>
            </View>,
        titleStyles: {
            fontSize: HEADING_FONT_SIZE,
            fontFamily: "Rubik-ExtraBold"
        },
        subTitleStyles: {
            fontSize: SUBTITlE_FONT_SIZE,
            fontFamily: 'Rubik-Medium',
        }
    }))     

    const handleComplete = async () => {

        try {

            await setOnboardingCompleted();
            router.replace("/welcome")

        } catch (error) {
            Alert.alert(error instanceof Error ? error.message : "An unknown error occurred")
        }

    }

  return (
    <View className='flex-1 relative'>
      <Onboarding 
        onDone={handleComplete}
        onSkip={handleComplete}
        containerStyles={{ paddingHorizontal: RFPercentage(3.0)}}
        pages={pages}
      />
    </View>
  )
}

export default OnboardingScreen;