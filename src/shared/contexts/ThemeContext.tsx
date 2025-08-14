import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
  isDark: false,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeType>('light');
  
  // Load theme preference from storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme === 'dark' || savedTheme === 'light') {
          setThemeState(savedTheme);
        } else if (systemColorScheme) {
          // Use system preference if no saved theme
          setThemeState(systemColorScheme);
        }
      } catch (error) {
        console.log('Failed to load theme preference', error);
      }
    };
    
    loadTheme();
  }, [systemColorScheme]);
  
  // Save theme preference to storage
  const setTheme = async (newTheme: ThemeType) => {
    try {
      await AsyncStorage.setItem('theme', newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.log('Failed to save theme preference', error);
    }
  };
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };
  
  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        setTheme, 
        toggleTheme,
        isDark: theme === 'dark'
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 