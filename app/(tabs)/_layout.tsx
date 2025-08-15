import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { View, ActivityIndicator, Image } from 'react-native';
import { useEffect, useCallback, useMemo } from 'react';

import { Colors } from '@/shared/constants/Colors';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { useAuth } from '@/shared/contexts/AuthContext';
import React from 'react;'

type TabIconProps = {
  color: string;
  size: number;
  focused: boolean;
};

// Custom image icons mapping
const customIcons = {
  home: require('../../assets/images/home.png'),
  library: require('../../assets/images/libarary.png'), // Note: keeping original filename
  supplications: require('../../assets/images/dua.png'),
  community: require('../../assets/images/community.png'),
  profile: require('../../assets/images/settings.png'),
};

const CustomImageIcon = React.memo(({ 
  imageSource, 
  color, 
  size, 
  focused 
}: TabIconProps & { imageSource: any }) => {
  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: focused ? color + '20' : 'transparent',
    }}>
      <Image 
        source={imageSource}
        style={{ 
          width: 30, 
          height: 30,
          tintColor: color,
        }}
        resizeMode="contain"
      />
    </View>
  );
});

const TabIcon = React.memo(({ name, color, size, focused }: TabIconProps & { name: keyof typeof Ionicons.glyphMap }) => {
  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: focused ? color + '20' : 'transparent',
    }}>
      <Ionicons 
        name={name} 
        size={size} 
        color={color}
      />
    </View>
  );
});

export default function TabLayout() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const handleAuthRedirect = useCallback(() => {
    if (!isLoading && !user) {
      router.replace('/auth/sign-in');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    handleAuthRedirect();
  }, [handleAuthRedirect]);

  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: colors.background 
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return null; // Will redirect to sign-in
  }

  const tabScreenOptions = useMemo(() => ({
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.secondaryText,
    tabBarStyle: {
      position: 'absolute',
      bottom: 25,
      left: 25,
      right: 25,
      backgroundColor: colors.card,
      borderRadius: 30,
      height: 64,
      paddingBottom: 0,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      borderWidth: 1,
      borderColor: colors.border,
      marginHorizontal: 10,
    },
    tabBarIconStyle: {
      marginTop: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabBarLabelStyle: {
      fontSize: 12,
      marginTop: 0,
      marginBottom: 8,
      fontWeight: '600',
      textAlign: 'center',
    },
    headerShown: false,
  }), [colors]);

  return (
    <Tabs
      screenOptions={tabScreenOptions}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: (props) => (
            <CustomImageIcon imageSource={customIcons.home} {...props} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: (props) => (
            <CustomImageIcon imageSource={customIcons.library} {...props} />
          ),
        }}
      />
      <Tabs.Screen
        name="supplications"
        options={{
          title: 'Duas',
          tabBarIcon: (props) => (
            <CustomImageIcon imageSource={customIcons.supplications} {...props} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: (props) => (
            <CustomImageIcon imageSource={customIcons.community} {...props} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: (props) => (
            <CustomImageIcon imageSource={customIcons.profile} {...props} />
          ),
        }}
      />
    </Tabs>
  );
}
