import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Clerk Configuration
// You'll need to get these from your Clerk Dashboard at https://clerk.com
// Create a new application and find these keys in the API Keys section

// Token cache implementation for session persistence
const tokenCache = {
  async getToken(key: string) {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      }
      return SecureStore.getItemAsync(key);
    } catch (err) {
      console.warn('Error getting token from cache:', err);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      if (Platform.OS === 'web') {
        return localStorage.setItem(key, value);
      }
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.warn('Error saving token to cache:', err);
    }
  },
};

export const clerkConfig = {
  // Get this from Clerk Dashboard > API Keys > Publishable key
  publishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_dW5pdGVkLW1hbW1vdGgtMS5jbGVyay5hY2NvdW50cy5kZXYk',
  // Add token cache for session persistence
  tokenCache,
  // Additional options for better session handling
  localization: {},
  telemetry: {
    disabled: false,
    debug: __DEV__,
  },
};

// OAuth Configuration (optional - Clerk handles OAuth providers)
export const oauthConfig = {
  // These will be configured in Clerk Dashboard
  google: {
    enabled: true,
  },
  apple: {
    enabled: true,
  },
  microsoft: {
    enabled: true,
  },
  // You can add more providers as needed
  // facebook: { enabled: true },
  // github: { enabled: true },
  // discord: { enabled: true },
} as const; 