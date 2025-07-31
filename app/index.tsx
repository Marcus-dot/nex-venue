import { useRouter } from "expo-router";

import AppLoader from "@/components/app-loader";
import { useEffect } from "react";

export default function Index() {

  const router = useRouter();

  const user = false;
  const isLoading = false;
  const isNewUser = false;
  const userProfile = {
    profileComplete: false
  }

  useEffect(() => {
    const checkInitialRoute = async () => {

    }

    checkInitialRoute();
    
  }, [])

  return (
    <AppLoader />
  );

}
