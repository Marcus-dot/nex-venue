import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ICON_SIZE, TEXT_SIZE } from '@/constants';
import { useTheme } from '@/context/theme-context';

interface BackNavProps {
  title?: string;
  subtitle?: string;
  handlePress?: () => void;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
  iconColor?: string;
  elevation?: boolean;
  centerTitle?: boolean;
}

const BackNav = ({
  title,
  subtitle,
  handlePress,
  showBackButton = true,
  rightComponent,
  backgroundColor,
  textColor,
  iconColor,
  elevation = false,
  centerTitle = false
}: BackNavProps) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { activeTheme } = useTheme();

  const defaultHandlePress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // Fallback to a safe navigation
      router.replace('/(app)/home');
    }
  };

  // Theme-aware colors (can be overridden by props)
  const themeColors = {
    background: backgroundColor || (activeTheme === 'light' ? '#D8D9D4' : '#161616'),
    text: textColor || (activeTheme === 'light' ? '#1f2937' : '#ffffff'),
    icon: iconColor || (activeTheme === 'light' ? '#374151' : '#ffffff'),
    subtitle: activeTheme === 'light' ? '#6b7280' : '#d1d5db',
    border: activeTheme === 'light' ? '#e5e7eb' : '#374151',
    buttonPress: activeTheme === 'light' ? '#f3f4f6' : '#374151'
  };

  // Status bar style based on theme
  const statusBarStyle = activeTheme === 'light' ? 'dark-content' : 'light-content';

  return (
    <>
      {Platform.OS === 'ios' && (
        <StatusBar
          barStyle={statusBarStyle}
          backgroundColor="transparent"
          translucent
        />
      )}
      {Platform.OS === 'android' && (
        <StatusBar
          barStyle={statusBarStyle}
          backgroundColor={themeColors.background}
          translucent={false}
        />
      )}
      <View
        className={`flex-row items-center px-4 ${elevation ? 'border-b' : ''}`}
        style={[
          {
            paddingTop: Platform.OS === 'android' ? insets.top + 8 : 8,
            paddingBottom: 12,
            backgroundColor: themeColors.background,
            minHeight: Platform.OS === 'android' ? insets.top + 56 : 56,
            borderBottomColor: elevation ? themeColors.border : 'transparent',
          },
          elevation && {
            shadowColor: activeTheme === 'light' ? '#000' : '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: activeTheme === 'light' ? 0.1 : 0.3,
            shadowRadius: 3,
            elevation: 3,
          }
        ]}
      >
        {/* Back Button */}
        {showBackButton && (
          <TouchableOpacity
            onPress={handlePress || defaultHandlePress}
            className="mr-3 p-2 -ml-2 rounded-full"
            style={{
              backgroundColor: 'transparent'
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="arrow-left" size={ICON_SIZE * 0.8} color={themeColors.icon} />
          </TouchableOpacity>
        )}

        {/* Title Section */}
        <View className={`flex-1 ${centerTitle ? 'items-center' : ''} ${showBackButton ? '' : 'ml-0'}`}>
          {title && (
            <Text
              style={{
                fontSize: TEXT_SIZE * 1.1,
                color: themeColors.text
              }}
              className="font-rubik-semibold"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
          )}
          {subtitle && (
            <Text
              style={{
                fontSize: TEXT_SIZE * 0.8,
                color: themeColors.subtitle
              }}
              className="font-rubik mt-0.5"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right Component */}
        {rightComponent && (
          <View className="ml-3">
            {rightComponent}
          </View>
        )}
      </View>
    </>
  );
};

export default BackNav;