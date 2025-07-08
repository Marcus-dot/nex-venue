import "../global.css";

import { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function RootLayout() {

  const [ fontsLoaded ] = useFonts({

  })

  useEffect(() => {
    if(fontsLoaded) {
      SplashScreen.hide();
    }
  }, [fontsLoaded]) 

  if(!fontsLoaded) return null;

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  )
}
