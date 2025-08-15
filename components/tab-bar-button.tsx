import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { View, GestureResponderEvent, StyleSheet } from 'react-native'
import { PlatformPressable } from '@react-navigation/elements';
import React, { useEffect } from 'react'
import { Feather } from '@expo/vector-icons';

import { ACCENT_COlOR, CONTAINER_WIDTH, TAB_BAR_ICON_SIZE } from '@/constants';

interface TabBarButtonProps {
    onPress: (e: GestureResponderEvent | React.MouseEvent<HTMLAnchorElement>) => void,
    onLongPress: (event: GestureResponderEvent) => void,
    isFocused: boolean,
    routeName: string,
    color: string,
    label: string
}

const TabBarButton = ({ onPress, onLongPress, isFocused, routeName }: TabBarButtonProps) => {

    const bgColor = useSharedValue(isFocused ? ACCENT_COlOR : "white");

    useEffect(() => {
        bgColor.value = withSpring(isFocused ? ACCENT_COlOR : "white", {
            damping: 15,
            stiffness: 200
        })
    }, [isFocused]);

    const animatedBgStyle = useAnimatedStyle(() => ({
        backgroundColor: bgColor.value
    }))

    const icon = {
        home: (props: any) => <Feather name='home' size={TAB_BAR_ICON_SIZE} {...props} />,
        discover : (props: any) => <Feather name='compass' size={TAB_BAR_ICON_SIZE} {...props} />,
        events: (props: any) => <Feather name='calendar' size={TAB_BAR_ICON_SIZE} {...props} />,
        profile: (props: any) => <Feather name='user' size={TAB_BAR_ICON_SIZE} {...props} />
    }

  return (
        <PlatformPressable onPress={onPress} onLongPress={onLongPress} style={styles.tabBarItem}>
            <View style={styles.innerTabBarItem}>
                {
                    // @ts-ignore
                    icon[routeName]({
                        color: isFocused ? "white" : "black"
                    })
                }
                <Animated.View style={animatedBgStyle} className='absolute z-[-1] w-full h-full rounded-full'></Animated.View>
            </View>
        </PlatformPressable>
  )
}

export default TabBarButton;

const styles = StyleSheet.create({
    tabBarItem: {
        gap: 5,
        position: "relative",
        borderRadius: 9999
    },
    innerTabBarItem: {
        width: CONTAINER_WIDTH,
        height: CONTAINER_WIDTH,
        borderRadius: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden"
    }
})