import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { StyleSheet, View } from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import { BlurView } from "expo-blur";

import { ACCENT_COlOR } from "@/constants";

import TabBarButton from "./tab-bar-button";

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {

    return (
        <View className="" style={styles.tabBarContainer}>
            <BlurView style={styles.tabBar} className="absolute overflow-hidden" tint="systemChromeMaterialDark" intensity={70}>
                {state.routes.map((route, index) => {

                    const { options } = descriptors[route.key];

                    const label = 
                        options.tabBarLabel !== undefined 
                        ? options.tabBarLabel 
                        : options.title !== undefined
                         ? options.title
                         : route.name;

                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: "tabPress",
                            target: route.key,
                            canPreventDefault: true
                        })

                        if(!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name, route.params)
                        }
                    }

                    const onLongPress = () => {
                        navigation.emit({
                            type: "tabLongPress",
                            target: route.key
                        })
                    }

                    return (
                        <TabBarButton 
                            key={route.name}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            isFocused={isFocused}
                            routeName={route.name}
                            color={isFocused ? ACCENT_COlOR : "white"}
                            label={label as string}
                        />
                    )                
                })}
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