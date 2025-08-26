import { router } from "expo-router";
import { useEffect } from "react";

import { useAuth } from "@/context/auth-context";
import { hasCompletedOnboarding } from "@/utils/storage";

import AppLoader from "@/components/app-loader";

export default function Index() {

  const { isLoading, isNewUser, user, userProfile } = useAuth();

  useEffect(() => {
    const checkInitialRoute = async () => {

      if (isLoading) return;

      if (user) {

        if (isNewUser || (userProfile && !userProfile.profileComplete)) {
          router.replace("/auth/profile-setup")
        } else {
          router.replace("/(app)/home");
        }
      } else {
        const onboardingDone = await hasCompletedOnboarding();
        if (onboardingDone) {
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
