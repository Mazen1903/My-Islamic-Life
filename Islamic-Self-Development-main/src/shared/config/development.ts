export const DEV_CONFIG = {
  // API Configuration
  API_BASE_URL: __DEV__ ? 'http://localhost:3000/api' : 'https://api.yourapp.com',
  API_TIMEOUT: 10000, // 10 seconds
  
  // Mock Data Settings - Set to false when you have real backend
  ENABLE_MOCK_DATA: false, // Change to false when connecting to real database
  MOCK_API_DELAY: 1000, // 1 second delay for mock calls
  
  // Logging
  ENABLE_DETAILED_LOGGING: __DEV__,
  LOG_API_CALLS: __DEV__,
  LOG_STATE_CHANGES: __DEV__,
  
  // Feature Flags
  FEATURES: {
    ENABLE_SOCIAL_LOGIN: false,
    ENABLE_PUSH_NOTIFICATIONS: true,
    ENABLE_ANALYTICS: !__DEV__,
    ENABLE_CRASH_REPORTING: !__DEV__,
  },
  
  // Development Tools
  SHOW_PERFORMANCE_MONITOR: __DEV__,
  ENABLE_REDUX_DEVTOOLS: __DEV__,
  
  // Storage Keys
  STORAGE_KEYS: {
    USER_DATA: '@user_data',
    THEME_PREFERENCE: '@theme_preference',
    READING_PROGRESS: '@reading_progress',
    SETTINGS: '@app_settings',
  },
} as const;

export const isDevelopment = __DEV__;
export const isProduction = !__DEV__;

export const log = {
  info: (message: string, ...args: any[]) => {
    if (DEV_CONFIG.ENABLE_DETAILED_LOGGING) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (DEV_CONFIG.ENABLE_DETAILED_LOGGING) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  
  api: (message: string, ...args: any[]) => {
    if (DEV_CONFIG.LOG_API_CALLS) {
      console.log(`[API] ${message}`, ...args);
    }
  },
}; 