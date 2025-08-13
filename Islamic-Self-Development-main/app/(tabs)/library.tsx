import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '@/shared/constants/Colors';
import { useTheme } from '@/shared/contexts/ThemeContext';

type Chapter = {
  id: string;
  title: string;
  wordCount: number;
  readingTime: string;
};

const chapters: Chapter[] = [
  {
    id: '1',
    title: 'Chapter 1: Understanding Happiness',
    wordCount: 2500,
    readingTime: '10 min', 
  },
  {
    id: '2',
    title: 'Chapter 2: The Role of Mindfulness',
    wordCount: 3000,
    readingTime: '12 min',
  },
  {
    id: '3',
    title: 'Chapter 3: Building Good Habits',
    wordCount: 2800,
    readingTime: '11 min',
  },
  {
    id: '4',
    title: 'Chapter 4: Emotional Intelligence',
    wordCount: 3200,
    readingTime: '13 min',
  },
  {
    id: '5',
    title: 'Chapter 5: Finding Purpose',
    wordCount: 2700,
    readingTime: '11 min',
  },
];

const sections = ['All Chapters', 'In Progress', 'Completed'];

export default function LibraryScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const [activeSection, setActiveSection] = useState('All Chapters');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Library</Text>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.card }]}>
          <Ionicons name="search-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView 
        entering={FadeInDown.delay(200)}
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.sectionTabs}
        contentContainerStyle={styles.sectionTabsContent}
      >
        {sections.map((section) => (
          <TouchableOpacity
            key={section}
            style={[
              styles.sectionTab, 
              { backgroundColor: colors.card },
              activeSection === section && [styles.activeSectionTab, { backgroundColor: colors.primary }]
            ]}
            onPress={() => setActiveSection(section)}
          >
            <Text
              style={[
                styles.sectionTabText,
                { color: colors.secondaryText },
                activeSection === section && [styles.activeSectionTabText, { color: '#FFFFFF' }]
              ]}
            >
              {section}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.ScrollView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <View style={styles.section}>
          {chapters.map((chapter, index) => (
            <Link
              href={{
                pathname: '/reading/[id]',
                params: { id: chapter.id },
              }}
              key={chapter.id}
              asChild
            >
              <Pressable
                style={({ pressed }) => [
                  { backgroundColor: colors.card },
                  pressed && { backgroundColor: isDark ? colors.border : '#e8ecf1' },
                ]}
              >
                <Animated.View
                  entering={FadeInRight.delay(100 * index)}
                  style={styles.chapterCard}
                >
                  <View style={styles.chapterProgress}>
                    <View style={[styles.progressRing, { borderColor: colors.primary }]}>
                      <Text style={[styles.chapterNumber, { color: colors.primary }]}>{chapter.id}</Text>
                    </View>
                    <View style={[styles.progressLine, { backgroundColor: colors.border }]} />
                  </View>
                  <View style={styles.chapterContent}>
                    <Text style={[styles.chapterTitle, { color: colors.text }]}>{chapter.title}</Text>
                    <Text style={[styles.chapterInfo, { color: colors.secondaryText }]}>
                      {chapter.wordCount} words · {chapter.readingTime}
                    </Text>
                    <View style={styles.chapterMeta}>
                      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                        <View style={[styles.progressFill, { width: '30%', backgroundColor: colors.primary }]} />
                      </View>
                      <Text style={[styles.progressText, { color: colors.secondaryText }]}>30% Complete</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
                </Animated.View>
              </Pressable>
            </Link>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTabs: {
    flexGrow: 0,
    marginBottom: 10,
  },
  sectionTabsContent: {
    paddingHorizontal: 20,
  },
  sectionTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
  },
  activeSectionTab: {
  },
  sectionTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeSectionTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  chapterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  chapterProgress: {
    alignItems: 'center',
    marginRight: 16,
  },
  progressRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressLine: {
    width: 2,
    height: 24,
    marginVertical: 4,
  },
  chapterContent: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  chapterInfo: {
    fontSize: 14,
    marginBottom: 8,
  },
  chapterMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    height: 4,
    width: 100,
    borderRadius: 2,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
  },
}); 