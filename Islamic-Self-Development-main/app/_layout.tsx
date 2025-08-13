import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ClerkProvider } from '@clerk/clerk-expo';

import { ThemeProvider } from '@/shared/contexts/ThemeContext';
import { AuthProvider } from '@/shared/contexts/AuthContext';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { clerkConfig } from '@/shared/config/clerk';
import { Colors } from '@/shared/constants/Colors';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isDark } = useTheme();
  const themeColors = Colors[isDark ? 'dark' : 'light'];

  useEffect(() => {
    // Hide splash screen after a brief moment
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <SafeAreaProvider style={{ backgroundColor: themeColors.background }}>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: themeColors.background }}>
          <AuthProvider>
            <Stack 
              screenOptions={{ 
                headerShown: false,
                contentStyle: { backgroundColor: themeColors.background },
                animation: 'fade'
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="auth/sign-in" />
              <Stack.Screen name="auth/sign-up" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="settings" />
              <Stack.Screen name="app-settings" />
              <Stack.Screen name="reading/[id]" />
              <Stack.Screen name="+not-found" />
            </Stack>
          </AuthProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider 
      publishableKey={clerkConfig.publishableKey}
      tokenCache={clerkConfig.tokenCache}
    >
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </ClerkProvider>
  );
}
