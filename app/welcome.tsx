import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, SafeAreaView, Text, View } from "react-native";


import { TEXT_SIZE } from "@/constants";


const Welcome = () => {
  const router = useRouter();


  // this anim controls the shimmer slide for the button
  const shimmerAnim = useRef(new Animated.Value(0)).current;


  // just keeping a ref to control/play the lottie if needed
  const lottieRef = useRef(null);


  const handlePhoneLogin = () => {
    // just moving to login page...
    router.push("/auth/login");
  };


  useEffect(() => {
    // delaying shimmer start so the lottie gets its spotlight first
    const shimmerTimeout = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 2000, // smooth glide
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 0, // reset instantly
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 1000);


    // cleanup if user bounces off page quick
    return () => clearTimeout(shimmerTimeout);
  }, []);


  // shimmer slide left to right
  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });


  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* bg gradient - I went with brand orange fading to dark, i dont know when i dicieded that */}
      <LinearGradient
        colors={["rgba(232,92,41,1)", "rgba(34,37,81,1)"]}
        locations={[0, 1]} // fade midpoint
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />


      {/* top branding - logo text + tagline */}
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
          loop={true} // right now looping forever, could change to false if we want it once
          style={{ width: 250, height: 250 }}
        />
      </View>


      {/* call to action button w/ shimmer */}
      <View className="mb-16 px-6">
        <Pressable
          onPress={handlePhoneLogin}
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.96 : 1 }], // lil press feedback
          })}
        >
          <View
            style={{
              borderRadius: 15,
              overflow: "hidden", // so shimmer stays inside button
              backgroundColor: "#e85c29",
              paddingVertical: 18,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text className="text-white font-bold text-lg">
              Continue with Phone Number
            </Text>


            {/* shimmer overlay - moving white highlight */}
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


