import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useCallback } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ClerkProvider } from '@clerk/clerk-expo';

import { ThemeProvider } from '@/shared/contexts/ThemeContext';
import { AuthProvider } from '@/shared/contexts/AuthContext';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { clerkConfig } from '@/shared/config/clerk';
import { Colors } from '@/shared/constants/Colors'
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isDark } = useTheme();
  const themeColors = Colors[isDark ? 'dark' : 'light'];

  const hideSplashScreen = useCallback(async () => {
    try {
      SplashScreen.hideAsync();
    } catch (error) {
      console.warn('Error hiding splash screen:', error);
    }
  }, []);

  useEffect(() => {
    // Hide splash screen immediately when layout is ready
    hideSplashScreen();
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
                animation: 'simple_push'
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
  useFrameworkReady();
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
