import "../global.css";

import { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { PhoneNumberProvider } from "@/context/phone-number-context";
import { AuthProvider } from "@/context/auth-context";

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function RootLayout() {

  const [ fontsLoaded ] = useFonts({ 
    "Rubik-ExtraBold": require("../assets/fonts/Rubik-ExtraBold.ttf"),
    "Rubik-Bold": require("../assets/fonts/Rubik-Bold.ttf"),
    "Rubik-SemiBold": require("../assets/fonts/Rubik-SemiBold.ttf"),
    "Rubik-Medium": require("../assets/fonts/Rubik-Medium.ttf"),
    "Rubik-Regular": require("../assets/fonts/Rubik-Regular.ttf"),
    "Rubik-Light": require("../assets/fonts/Rubik-Light.ttf"),
  });

  useEffect(() => {
    if(fontsLoaded) {
      SplashScreen.hide();
    }
  }, [fontsLoaded]) 

  if(!fontsLoaded) return null;

  return (
    <AuthProvider>
      <PhoneNumberProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="auth/profile-setup" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/terms" options={{ headerShown: false }} />
          <Stack.Screen name="auth/verify" options={{ headerShown: false }} />
        </Stack>
      </PhoneNumberProvider>
    </AuthProvider>
  )
}
