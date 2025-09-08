import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useRef /*, useEffect*/ } from "react"; // removed shimmer hooks for now
import { /*Animated, Easing,*/ Pressable, SafeAreaView, Text, View } from "react-native";

import { TEXT_SIZE } from "@/constants";

const Welcome = () => {
  const router = useRouter();

  // shimmer animation value (disabled)
  // const shimmerAnim = useRef(new Animated.Value(0)).current;

  // just keeping a ref to control/play the lottie if needed
  const lottieRef = useRef(null);

  const handlePhoneLogin = () => {
    router.push("/auth/login");
  };

  /*
  // shimmer loop (disabled)
  useEffect(() => {
    const shimmerTimeout = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 1000);

    return () => clearTimeout(shimmerTimeout);
  }, []);

  // shimmer translateX (disabled)
  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });
  */

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* bg gradient */}
      <LinearGradient
        colors={["rgba(232,92,41,1)", "rgba(34,37,81,1)"]}
        locations={[0, 1]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* top branding */}
      <View className="w-full flex items-center mt-12">
        <Text className="text-5xl text-white font-extrabold tracking-tight">
          NexVenue
        </Text>
        <Text className="text-white/80 text-lg mt-2 font-rubik-medium">
          Your gateway to unforgettable events
        </Text>
      </View>

      {/* main center animation */}
      <View className="flex-1 justify-center items-center">
        <LottieView
          ref={lottieRef}
          source={require("@/assets/animations/welcome.json")}
          autoPlay
          loop={true}
          style={{ width: 250, height: 250 }}
        />
      </View>

      {/* call to action button */}
      <View className="mb-16 px-6">
        <Pressable
          onPress={handlePhoneLogin}
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.96 : 1 }],
          })}
        >
          <View
            style={{
              borderRadius: 15,
              backgroundColor: "#e85c29",
              paddingVertical: 18,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text className="text-white font-bold text-lg">
              Continue with Phone Number
            </Text>

            {/*
            // shimmer overlay (disabled)
            <Animated.View
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: "40%",
                transform: [{ translateX }],
              }}
            >
              <LinearGradient
                colors={["transparent", "rgba(255,255,255,0.4)", "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              />
            </Animated.View>
            */}
          </View>
        </Pressable>
      </View>

      {/* footer text */}
      <View className="items-center mb-4">
        <Text
          style={{ fontSize: TEXT_SIZE * 0.5 }}
          className="text-white/70 font-rubik-medium"
        >
          © {new Date().getFullYear()} Powered by Gralix
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Welcome;
