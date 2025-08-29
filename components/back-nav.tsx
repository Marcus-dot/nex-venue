import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ICON_SIZE, TEXT_SIZE } from '@/constants';

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
  backgroundColor = 'transparent',
  textColor = 'white',
  iconColor = 'white',
  elevation = false,
  centerTitle = false
}: BackNavProps) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const defaultHandlePress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // Fallback to a safe navigation
      router.replace('/(app)/home');
    }
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      )}
      <View
        className={`flex-row items-center px-4 ${elevation ? 'border-b border-gray-700' : ''}`}
        style={{
          paddingTop: Platform.OS === 'android' ? insets.top + 8 : 8,
          paddingBottom: 12,
          backgroundColor,
          minHeight: Platform.OS === 'android' ? insets.top + 56 : 56,
          ...(elevation && {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
          })
        }}
      >
        {/* Back Button */}
        {showBackButton && (
          <TouchableOpacity
            onPress={handlePress || defaultHandlePress}
            className="mr-3 p-2 -ml-2 rounded-full active:bg-gray-800"
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="arrow-left" size={ICON_SIZE * 0.8} color={iconColor} />
          </TouchableOpacity>
        )}

        {/* Title Section */}
        <View className={`flex-1 ${centerTitle ? 'items-center' : ''} ${showBackButton ? '' : 'ml-0'}`}>
          {title && (
            <Text
              style={{ fontSize: TEXT_SIZE * 1.1, color: textColor }}
              className="font-rubik-semibold"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
          )}
          {subtitle && (
            <Text
              style={{ fontSize: TEXT_SIZE * 0.8, color: textColor + '80' }}
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