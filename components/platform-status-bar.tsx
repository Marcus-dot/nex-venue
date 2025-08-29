import React from 'react';
import { Platform, StatusBar, StatusBarStyle, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PlatformStatusBarProps {
    barStyle?: StatusBarStyle;
    backgroundColor?: string;
    translucent?: boolean;
    hidden?: boolean;
}

const PlatformStatusBar: React.FC<PlatformStatusBarProps> = ({
    barStyle = 'light-content',
    backgroundColor = '#161616',
    translucent = true,
    hidden = false
}) => {
    const insets = useSafeAreaInsets();

    // iOS specific configuration
    if (Platform.OS === 'ios') {
        return (
            <StatusBar
                barStyle={barStyle}
                backgroundColor="transparent"
                translucent={true}
                hidden={hidden}
                animated={true}
            />
        );
    }

    // Android specific configuration
    return (
        <>
            <StatusBar
                barStyle={barStyle}
                backgroundColor={translucent ? 'transparent' : backgroundColor}
                translucent={translucent}
                hidden={hidden}
                animated={true}
            />
            {/* Android status bar background when translucent */}
            {translucent && !hidden && (
                <View
                    style={{
                        height: insets.top,
                        backgroundColor: backgroundColor,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                    }}
                />
            )}
        </>
    );
};

export default PlatformStatusBar;