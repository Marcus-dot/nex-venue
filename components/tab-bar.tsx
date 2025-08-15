import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { RFPercentage } from "react-native-responsive-fontsize";

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {

    return (
        <View className="" style={styles.tabBarContainer}>
            <BlurView style={styles.tabBar} className="absolute overflow-hidden" tint="systemThickMaterialDark" intensity={50}>

            </BlurView>
        </View>
    )

}

const styles = StyleSheet.create({
    tabBarContainer: {
        elevation: 3,
        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity:  0.17,
        shadowRadius: 2.54,
    },
    tabBar: {
        bottom: RFPercentage(5),
        paddingVertical: RFPercentage(1.3),
        paddingHorizontal: RFPercentage(1.3),
        gap: 5,
        alignSelf: "center",
        borderRadius: 40,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    }
})