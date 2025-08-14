import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth as useClerkAuth } from '@clerk/clerk-expo';

import { Colors } from '@/shared/constants/Colors';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { useAuth } from '@/shared/contexts/AuthContext';

export default function IndexScreen() {
  const { user, isLoading } = useAuth();
  const { isLoaded: isClerkLoaded, isSignedIn } = useClerkAuth();
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const router = useRouter();
  const [hasNavigated, setHasNavigated] = useState(false);

  const checkFirstTimeUser = useCallback(async () => {
    try {
      // Wait for both our auth context and Clerk to be loaded
      if (!isLoading && isClerkLoaded && !hasNavigated) {
        setHasNavigated(true);
        
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        
        if (!hasSeenOnboarding) {
          // First time user - show onboarding
          router.replace('/onboarding');
        } else if (user && isSignedIn) {
          // Returning user with account - go to main app
          router.replace('/(tabs)');
        } else {
          // Returning user without account - go to sign in
          router.replace('/auth/sign-in');
        }
      }
    } catch (error) {
      console.log('Error checking first time user:', error);
      // Fallback to normal flow
      if (!isLoading && isClerkLoaded && !hasNavigated) {
        setHasNavigated(true);
        
        if (user && isSignedIn) {
          router.replace('/(tabs)');
        } else {
          router.replace('/auth/sign-in');
        }
      }
    }
  }, [user, isLoading, isClerkLoaded, isSignedIn, router, hasNavigated]);

  useEffect(() => {
    checkFirstTimeUser();
  }, [checkFirstTimeUser]);

  // Show loading screen during initial load
  if (isLoading || !isClerkLoaded || !hasNavigated) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: colors.background
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{
          marginTop: 16,
          color: colors.text,
          fontSize: 16,
          opacity: 0.7
        }}>
          Loading...
        </Text>
      </View>
    );
  }

  return null;
} 