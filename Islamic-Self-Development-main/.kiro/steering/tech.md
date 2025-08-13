# Technology Stack

## Framework & Platform
- **React Native** (0.79.5) with **Expo** (53.0.19)
- **TypeScript** (5.7.2) for type safety
- **Expo Router** (5.1.3) for file-based navigation
- Cross-platform: iOS, Android, and Web support

## Key Libraries
- **@clerk/clerk-expo** - Authentication and user management
- **@react-navigation/native** - Navigation system
- **react-native-reanimated** - Smooth animations
- **@react-native-async-storage/async-storage** - Local data persistence
- **expo-secure-store** - Secure credential storage
- **react-native-webview** - Web content integration

## Development Tools
- **Jest** with **jest-expo** preset for testing
- **ESLint** via `expo lint` for code quality
- **Metro** bundler (default Expo config)
- **TypeScript** strict mode enabled

## Build System
React Native with Expo managed workflow using Metro bundler.

## Common Commands

### Development
```bash
# Start development server
npm start
# or
npx expo start

# Platform-specific development
npm run android    # Android emulator/device
npm run ios        # iOS simulator/device  
npm run web        # Web browser
```

### Testing & Quality
```bash
# Run tests in watch mode
npm test

# Lint code
npm run lint
```

### Dependencies
```bash
# Install dependencies
npm install

# Add new package
npx expo install <package-name>
```

## Configuration Notes
- Uses Expo's new architecture (`newArchEnabled: true`)
- TypeScript path aliases configured for clean imports
- Supports both light and dark themes
- Web output configured as static build