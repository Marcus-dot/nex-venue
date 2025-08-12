import { Redirect, Tabs } from "expo-router";

import { useAuth } from "@/context/auth-context";
import AppLoader from "@/components/app-loader";

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
            <Tabs screenOptions={{ headerShown: false}}>
                <Tabs.Screen name="home" options={{ title: "Home"}} />
                <Tabs.Screen name="profile" options={{ title: "Profile"}} />
            </Tabs>
        </>
    )
}