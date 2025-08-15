import { Redirect, Tabs } from "expo-router";

import { useAuth } from "@/context/auth-context";
import AppLoader from "@/components/app-loader";
import { TabBar } from "@/components/tab-bar";

export default function AppLayout() {

    const { user, isLoading } = useAuth();

    if (!isLoading && !user) {
        return <Redirect href="/welcome" />;
    }

    if(isLoading && !user) {
        return <AppLoader />
    }

    return (
        <>
            <Tabs tabBar={(props) => <TabBar {...props} />} initialRouteName="home" screenOptions={{ headerShown: false, tabBarShowLabel: true}}>
                <Tabs.Screen name="home" options={{ title: "Home"}} />
                <Tabs.Screen name="discover" options={{ title: "Discover"}} />
                <Tabs.Screen name="events" options={{ title: "Events"}} />
                <Tabs.Screen name="profile" options={{ title: "Profile"}} />
            </Tabs>
        </>
    )
}