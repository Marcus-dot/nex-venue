import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';

type ThemeType = 'light' | 'dark' | 'system';

type ThemeContextType = {
    theme: ThemeType;
    activeTheme: 'light' | 'dark'; // The actual theme being used (resolved from system if needed)
    setTheme: (theme: ThemeType) => void;
    toggleTheme: () => void;
    isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
    theme: 'system',
    activeTheme: 'dark',
    setTheme: () => { },
    toggleTheme: () => { },
    isLoading: true,
});

const THEME_STORAGE_KEY = 'app_theme_preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<ThemeType>('system');
    const [activeTheme, setActiveTheme] = useState<'light' | 'dark'>('dark');
    const [isLoading, setIsLoading] = useState(true);

    // Get system color scheme
    const getSystemTheme = (): 'light' | 'dark' => {
        const systemScheme = Appearance.getColorScheme();
        return systemScheme === 'light' ? 'light' : 'dark';
    };

    // Resolve the active theme based on preference
    const resolveActiveTheme = (themePreference: ThemeType): 'light' | 'dark' => {
        if (themePreference === 'system') {
            return getSystemTheme();
        }
        return themePreference;
    };

    // Load theme preference from storage
    const loadThemePreference = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            const themeToUse: ThemeType = (savedTheme as ThemeType) || 'system';

            setThemeState(themeToUse);
            setActiveTheme(resolveActiveTheme(themeToUse));
        } catch (error) {
            console.error('Error loading theme preference:', error);
            // Fallback to system theme
            setThemeState('system');
            setActiveTheme(getSystemTheme());
        } finally {
            setIsLoading(false);
        }
    };

    // Save theme preference to storage
    const saveThemePreference = async (newTheme: ThemeType) => {
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    };

    // Set theme function
    const setTheme = async (newTheme: ThemeType) => {
        setThemeState(newTheme);
        setActiveTheme(resolveActiveTheme(newTheme));
        await saveThemePreference(newTheme);
    };

    // Toggle between light and dark (doesn't use system)
    const toggleTheme = async () => {
        const newTheme = activeTheme === 'light' ? 'dark' : 'light';
        await setTheme(newTheme);
    };

    // Listen to system theme changes
    useEffect(() => {
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            if (theme === 'system') {
                const systemTheme = colorScheme === 'light' ? 'light' : 'dark';
                setActiveTheme(systemTheme);
            }
        });

        return () => subscription?.remove();
    }, [theme]);

    // Load initial theme on mount
    useEffect(() => {
        loadThemePreference();
    }, []);

    const value: ThemeContextType = {
        theme,
        activeTheme,
        setTheme,
        toggleTheme,
        isLoading,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};