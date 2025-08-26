import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseAuthTypes, getAuth, onAuthStateChanged } from "@react-native-firebase/auth";
import firestore from '@react-native-firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';

import type { User, UserProfile } from '@/types/auth';

type AuthContextType = {
    user: User | null;
    userProfile: UserProfile | null;
    isLoading: boolean;
    isNewUser: boolean;
    isAdmin: boolean;
    verificationId: FirebaseAuthTypes.ConfirmationResult | null;
    setVerificationId: (confirm: FirebaseAuthTypes.ConfirmationResult) => void;
    updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
    fetchUserProfile: (currentUser: User) => Promise<UserProfile | null>;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    userProfile: null,
    isLoading: true,
    isNewUser: false,
    isAdmin: false,
    verificationId: null,
    setVerificationId: () => { },
    updateUserProfile: async () => { },
    fetchUserProfile: async () => null
});

export const cacheUserData = async (userData: UserProfile) => {
    try {
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
        // error intentionally ignored
    }
};

export const getCachedUserData = async (): Promise<UserProfile | null> => {
    try {
        const userData = await AsyncStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        return null;
    }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isNewUser, setIsNewUser] = useState(false);
    const [verificationId, setVerificationId] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);

    // Computed value for admin status
    const isAdmin = userProfile?.role === 'admin';

    const fetchUserProfile = async (currentUser: User) => {
        try {

            const userRef = firestore().collection('users').doc(currentUser.uid);
            const userSnap = await userRef.get();

            if (userSnap.exists()) {
                const userData = userSnap.data() as UserProfile;

                // Handle existing users who don't have a role (backward compatibility)
                if (!userData.role) {
                    userData.role = 'user';
                    await userRef.update({ role: 'user' });
                }

                setUserProfile(userData);
                if (userData.profileComplete) {
                    setIsNewUser(false);
                } else {
                    setIsNewUser(true)
                }
                await cacheUserData(userData);
                return userData;
            } else {
                const newUserData: UserProfile = {
                    uid: currentUser.uid,
                    phoneNumber: currentUser.phoneNumber || '',
                    role: 'user', // Default role for new users
                    createdAt: Date.now(),
                    profileComplete: false,
                    avatar: null,
                }

                await userRef.set(newUserData);
                setUserProfile(newUserData);
                setIsNewUser(true);
                await cacheUserData(newUserData);
                return newUserData;
            }

        } catch (error) {
            const cachedData = await getCachedUserData();
            if (cachedData) {
                // Handle cached data without role
                if (!cachedData.role) {
                    cachedData.role = 'user';
                }
                setUserProfile(cachedData);
            }
            return null;
        }
    }

    const updateUserProfile = async (data: Partial<UserProfile>) => {

        if (!user) return;

        try {

            const userRef = firestore().collection('users').doc(user.uid);
            await userRef.update(data);

            setUserProfile(prev => prev ? { ...prev, ...data } : null);

            const cachedData = await getCachedUserData();
            if (cachedData) {
                await cacheUserData({ ...cachedData, ...data });
            }

        } catch (error) {
            throw error;
        }

    }

    useEffect(() => {

        const subscriber = onAuthStateChanged(getAuth(), async (currentUser) => {
            if (currentUser) {
                const userObj: User = {
                    uid: currentUser.uid,
                    phoneNumber: currentUser.phoneNumber,
                };
                setUser(userObj);
                await fetchUserProfile(userObj);
            } else {
                setUser(null);
                setUserProfile(null);
            }

            setIsLoading(false);

        });

        return subscriber;

    }, [])

    const value = {
        user,
        userProfile,
        isLoading,
        isNewUser,
        isAdmin,
        verificationId,
        setVerificationId,
        updateUserProfile,
        fetchUserProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext);