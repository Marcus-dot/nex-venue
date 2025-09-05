import { ACCENT_COlOR } from "@/constants";
import { useTheme } from "@/context/theme-context";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { StyleSheet, View } from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TabBarButton from "./tab-bar-button";

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const { activeTheme } = useTheme();

    // Theme-aware blur tint and styling
    const blurTint = activeTheme === 'light' ? 'systemChromeMaterialLight' : 'systemChromeMaterialDark';
    const backgroundColor = activeTheme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(55, 65, 81, 0.9)';
    const borderColor = activeTheme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';

    return (
        <View className="" style={styles.tabBarContainer}>
            <BlurView
                style={[
                    styles.tabBar,
                    {
                        bottom: Math.max(insets.bottom + 10, RFPercentage(3)),
                        backgroundColor: backgroundColor,
                        borderWidth: 1,
                        borderColor: borderColor,
                    }
                ]}
                className="absolute overflow-hidden"
                tint={blurTint}
                intensity={activeTheme === 'light' ? 80 : 70}
            >
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
                        if (!isFocused && !event.defaultPrevented) {
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
                            color={isFocused ? ACCENT_COlOR : (activeTheme === 'light' ? '#6b7280' : '#9CA3AF')}
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
        shadowOpacity: 0.17,
        shadowRadius: 2.54,
    },
    tabBar: {
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