import { useRouter } from "expo-router";
import { useEffect } from "react";

import AppLoader from "@/components/app-loader";
import { hasCompletedOnboarding } from "@/utils/storage";

export default function Index() {

  const router = useRouter();

  const isLoading = false;
  const isNewUser = false;
  const user = false;
  const userProfile = {
    profileComplete: false
  }

  useEffect(() => {
    const checkInitialRoute = async () => {

      if(user) {
        if(isNewUser || (userProfile && !userProfile.profileComplete)) {
          router.replace("/auth/profile-setup")
        } else {
          
        }
      } else {
          const onboardingDone = await hasCompletedOnboarding();
          if(onboardingDone) {
            router.replace("/welcome");
          } else {
            router.replace("/onboarding")
          }
      }
    }

    checkInitialRoute();
    
  }, [isLoading, user, userProfile, isNewUser])

  return (
    <AppLoader />
  );

}
