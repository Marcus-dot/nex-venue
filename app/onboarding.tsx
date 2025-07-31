import { View, Text, Image, Alert } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import { useRouter } from 'expo-router';

import { setOnboardingCompleted } from '@/utils/storage';
import { appOnboardingPageData } from '@/constants';

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
            fontSize: 3,
        },
        subTitleStyles: {
            fontSize: 3
        }
    }))

    const handleComplete = async () => {

        try {

            await setOnboardingCompleted();
            // router.replace("")

        } catch (error) {
            Alert.alert(error instanceof Error ? error.message : "An unknown error occurred")
        }

    }

  return (
    <View className='flex-1 relative'>
      <Onboarding 
        onDone={handleComplete}
        onSkip={handleComplete}
        pages={pages}
      />
    </View>
  )
}

export default OnboardingScreen;