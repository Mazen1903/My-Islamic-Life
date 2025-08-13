import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '@/shared/constants/Colors';
import { useTheme } from '@/shared/contexts/ThemeContext';

export default function HomeScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <View>
            <View style={styles.greetingContainer}>
              <View style={[styles.greetingBadge, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="sparkles" size={16} color={colors.primary} style={styles.greetingIcon} />
                <Text style={[styles.greeting, { color: colors.primary }]}>Welcome back</Text>
              </View>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Today</Text>
          </View>
        </Animated.View>

        {/* Current Reading Section */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.manuscriptCard}>
          <LinearGradient
            colors={[colors.card, colors.background]}
            style={styles.cardGradient}
          >
            <View style={[styles.currentReading, { borderColor: colors.border }]}>
              <View style={[styles.bookCover, { backgroundColor: colors.border }]}>
                <Ionicons name="bookmark" size={40} color={colors.primary} />
              </View>
          <View style={styles.bookInfo}>
            <Text style={[styles.bookTitle, { color: colors.text }]}>The Keys to Happiness</Text>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { width: '30%', backgroundColor: colors.primary }]} />
            </View>
            <Text style={[styles.progressText, { color: colors.secondaryText }]}>Chapter 4 of 10</Text>
            <View style={styles.tagContainer}>
              <Text style={[styles.tag, { backgroundColor: colors.primary + '20', color: colors.primary }]}>MIND</Text>
            </View>
            <Link href={{ pathname: "/reading/[id]", params: { id: "1" }}} asChild>
              <TouchableOpacity style={[styles.continueButton, { backgroundColor: colors.primary }]}>
                <Text style={[styles.continueButtonText, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>Continue Reading</Text>
                                  <Ionicons name="arrow-forward" size={16} color={isDark ? '#FFFFFF' : '#1A1A1A'} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </Link>
          </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>MY PROGRESS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.progressGrid} contentContainerStyle={{ paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
            <Animated.View entering={FadeInRight.delay(300)} style={styles.progressCardContainer}>
              <LinearGradient
                colors={[colors.card, colors.background]}
                style={styles.cardGradient}
              >
                <View style={[styles.progressCard, { borderColor: colors.border }]}>
                  <View style={[styles.progressIcon, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons name="school" size={24} color={colors.primary} />
                  </View>
                  <Text style={[styles.progressCardTitle, { color: colors.text }]}>The Mind</Text>
                  <Text style={[styles.progressCardSubtitle, { color: colors.secondaryText }]}>Chapter 4 of 10</Text>
                  <Text style={[styles.progressCardPercentage, { color: colors.primary }]}>40% Complete</Text>
                </View>
              </LinearGradient>
            </Animated.View>
            
            <Animated.View entering={FadeInRight.delay(400)} style={styles.progressCardContainer}>
              <LinearGradient
                colors={[colors.card, colors.background]}
                style={styles.cardGradient}
              >
                <View style={[styles.progressCard, { borderColor: colors.border }]}>
                  <View style={[styles.progressIcon, { backgroundColor: colors.secondary + '20' }]}>
                    <Ionicons name="body" size={24} color={colors.secondary} />
                  </View>
                  <Text style={[styles.progressCardTitle, { color: colors.text }]}>Health</Text>
                  <Text style={[styles.progressCardSubtitle, { color: colors.secondaryText }]}>Chapter 3 of 10</Text>
                  <Text style={[styles.progressCardPercentage, { color: colors.secondary }]}>30% Complete</Text>
                </View>
              </LinearGradient>
            </Animated.View>
            
            <Animated.View entering={FadeInRight.delay(500)} style={styles.progressCardContainer}>
              <LinearGradient
                colors={[colors.card, colors.background]}
                style={styles.cardGradient}
              >
                <View style={[styles.progressCard, { borderColor: colors.border }]}>
                  <View style={[styles.progressIcon, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons name="heart" size={24} color={colors.primary} />
                  </View>
                  <Text style={[styles.progressCardTitle, { color: colors.text }]}>The Soul</Text>
                  <Text style={[styles.progressCardSubtitle, { color: colors.secondaryText }]}>Chapter 2 of 10</Text>
                  <Text style={[styles.progressCardPercentage, { color: colors.primary }]}>20% Complete</Text>
                </View>
              </LinearGradient>
            </Animated.View>
          </ScrollView>
        </View>

        {/* Stats Section */}
        <Animated.View entering={FadeInDown.delay(600)} style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>STATS & COMMUNITY</Text>
          <View style={styles.statsGrid}>
            <View style={[
              styles.statsCard, 
              { backgroundColor: colors.card },
              !isDark && {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }
            ]}>
              <View style={[styles.statsIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="star" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.statsNumber, { color: colors.text }]}>5</Text>
              <Text style={[styles.statsLabel, { color: colors.secondaryText }]}>Day Streak</Text>
            </View>
            <View style={[
              styles.statsCard, 
              { backgroundColor: colors.card },
              !isDark && {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }
            ]}>
              <View style={[styles.statsIcon, { backgroundColor: colors.secondary + '20' }]}>
                <Ionicons name="time" size={24} color={colors.secondary} />
              </View>
              <Text style={[styles.statsNumber, { color: colors.text }]}>7</Text>
              <Text style={[styles.statsLabel, { color: colors.secondaryText }]}>Hours Total</Text>
            </View>
            <View style={[
              styles.statsCard, 
              { backgroundColor: colors.card },
              !isDark && {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }
            ]}>
              <View style={[styles.statsIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="library" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.statsNumber, { color: colors.text }]}>14</Text>
              <Text style={[styles.statsLabel, { color: colors.secondaryText }]}>Chapters</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greetingContainer: {
    marginBottom: 4,
  },
  greetingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  greetingIcon: {
    marginRight: 6,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
  },
  manuscriptCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardGradient: {
    flex: 1,
  },
  currentReading: {
    flexDirection: 'row',
    padding: 20,
    borderWidth: 1,
    borderRadius: 24,
  },
  bookCover: {
    width: 100,
    height: 150,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookInfo: {
    flex: 1,
    marginLeft: 16,
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginVertical: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  continueButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  progressSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  progressGrid: {
    flexDirection: 'row',
  },
  progressCardContainer: {
    width: 160,
    marginRight: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  progressCard: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 20,
  },
  progressIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  progressCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  progressCardSubtitle: {
    fontSize: 12,
    marginBottom: 8,
  },
  progressCardPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsSection: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsCard: {
    width: '31%',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  statsIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});
