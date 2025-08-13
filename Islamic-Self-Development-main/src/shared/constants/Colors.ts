/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#8B4513';
const tintColorDark = '#CD7F32';

export const Colors = {
  light: {
    primary: '#8B4513',      // Islamic Brown
    secondary: '#DAA520',    // Gold
    background: '#F5F1E8',   // Parchment background
    text: '#2F1B14',         // Dark ink
    secondaryText: '#5D4E37', // Light ink
    border: '#D2B48C',       // Tan border
    card: '#FAF7F0',         // Light parchment
    success: '#228B22',      // Islamic green
    error: '#CC5500',        // Warm red
    warning: '#FF8C00',      // Orange
    tint: tintColorLight,
    icon: '#8B4513',
    tabIconDefault: '#8B7355',
    tabIconSelected: tintColorLight,
    // Additional manuscript colors
    parchment: '#F5F1E8',
    darkParchment: '#E8E0D0',
    gold: '#DAA520',
    darkGold: '#B8860B',
    lightBrown: '#A0764A',
  },
  dark: {
    primary: '#CD7F32',      // Warm Bronze for dark mode  
    secondary: '#B87333',    // Dark Bronze
    background: '#1C1612',   // Dark parchment
    text: '#F5F1E8',         // Light parchment text
    secondaryText: '#C4B69C', // Muted light
    border: '#3D3426',       // Dark border
    card: '#2A241A',         // Dark card
    success: '#32CD32',      // Light green
    error: '#FF6347',        // Tomato red
    warning: '#FFA500',      // Orange
    tint: tintColorDark,
    icon: '#CD7F32',
    tabIconDefault: '#B8976A',
    tabIconSelected: tintColorDark,
    // Additional manuscript colors for dark mode
    parchment: '#2A241A',
    darkParchment: '#1C1612',
    gold: '#CD7F32',
    darkGold: '#B87333',
    lightBrown: '#8B7355',
  },
};

export type ThemeColors = typeof Colors.light;
