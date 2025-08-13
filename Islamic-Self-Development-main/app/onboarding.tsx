import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Colors } from '@/shared/constants/Colors';
import { useTheme } from '@/shared/contexts/ThemeContext';

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'Welcome to Your Self-Development Journey',
    description: 'Discover a vast library of personal growth content designed to help you become the best version of yourself.',
    icon: 'rocket-outline',
    color: '#6366F1',
  },
  {
    id: 2,
    title: 'Track Your Progress',
    description: 'Set reading goals, monitor your daily progress, and celebrate your achievements along the way.',
    icon: 'trending-up-outline',
    color: '#10B981',
  },
  {
    id: 3,
    title: 'Connect with Community',
    description: 'Share insights, discuss ideas, and learn from others on their self-development journey.',
    icon: 'people-outline',
    color: '#F59E0B',
  },
  {
    id: 4,
    title: 'Start Your Journey Today',
    description: 'Ready to transform your life? Let\'s begin with creating your account and setting your first reading goal.',
    icon: 'star-outline',
    color: '#EF4444',
  },
];

export default function OnboardingScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const markOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    } catch (error) {
      console.log('Error saving onboarding status:', error);
    }
  };

  const handleNext = async () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      await markOnboardingComplete();
      router.replace('/auth/sign-up');
    }
  };

  const handleSkip = async () => {
    await markOnboardingComplete();
    router.replace('/auth/sign-in');
  };

  const currentItem = onboardingData[currentIndex];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={[styles.skipText, { color: colors.secondaryText }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View 
          key={currentItem.id}
          entering={FadeInDown.delay(200)}
          style={styles.iconContainer}
        >
          <View style={[styles.iconCircle, { backgroundColor: currentItem.color + '20' }]}>
            <Ionicons name={currentItem.icon as any} size={64} color={currentItem.color} />
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(400)}
          style={styles.textContainer}
        >
          <Text style={[styles.title, { color: colors.text }]}>{currentItem.title}</Text>
          <Text style={[styles.description, { color: colors.secondaryText }]}>
            {currentItem.description}
          </Text>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(600)}
          style={styles.pagination}
        >
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index === currentIndex ? colors.primary : colors.border,
                  width: index === currentIndex ? 24 : 8,
                }
              ]}
            />
          ))}
        </Animated.View>
      </ScrollView>

      <Animated.View entering={FadeInRight.delay(800)} style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: colors.primary }]}
          onPress={handleNext}
        >
          <Text style={[styles.nextButtonText, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
            {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons 
            name="arrow-forward" 
            size={20} 
            color={isDark ? '#FFFFFF' : '#1A1A1A'} 
            style={styles.nextIcon}
          />
        </TouchableOpacity>

                 {currentIndex === onboardingData.length - 1 && (
           <TouchableOpacity
             style={[styles.signInButton, { borderColor: colors.border }]}
             onPress={async () => {
               await markOnboardingComplete();
               router.replace('/auth/sign-in');
             }}
           >
             <Text style={[styles.signInButtonText, { color: colors.text }]}>
               Already have an account? Sign In
             </Text>
           </TouchableOpacity>
         )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 16,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextIcon: {
    marginLeft: 8,
  },
  signInButton: {
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  signInButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 