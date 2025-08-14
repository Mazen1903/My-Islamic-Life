import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/shared/constants/Colors';
import { useTheme } from '@/shared/contexts/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  
  const [fontSize, setFontSize] = useState(16);
  const [autoScroll, setAutoScroll] = useState(false);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [textAlignment, setTextAlignment] = useState<'left' | 'center' | 'right'>('left');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Reading Settings</Text>

          <View style={styles.setting}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Font Size</Text>
            <View style={[styles.slider, { backgroundColor: colors.border }]}>
              <View style={[styles.sliderFill, { width: '50%', backgroundColor: colors.primary }]} />
            </View>
          </View>

          <View style={styles.setting}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Theme</Text>
            <View style={[styles.themeButtons, { backgroundColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.themeButton, !isDark && styles.activeThemeButton, { backgroundColor: !isDark ? colors.card : 'transparent' }]}
                onPress={() => toggleTheme()}>
                <Text
                  style={[styles.themeButtonText, !isDark && styles.activeThemeButtonText, { color: !isDark ? colors.text : colors.secondaryText }]}>
                  Light
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.themeButton, isDark && styles.activeThemeButton, { backgroundColor: isDark ? colors.card : 'transparent' }]}
                onPress={() => toggleTheme()}>
                <Text style={[styles.themeButtonText, isDark && styles.activeThemeButtonText, { color: isDark ? colors.text : colors.secondaryText }]}>
                  Dark
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.setting}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Auto Scroll</Text>
            <TouchableOpacity
              style={[styles.toggle, autoScroll && styles.toggleActive, { backgroundColor: autoScroll ? colors.primary : colors.border }]}
              onPress={() => setAutoScroll(!autoScroll)}>
              <View style={[styles.toggleHandle, autoScroll && styles.toggleHandleActive, { backgroundColor: colors.background }]} />
            </TouchableOpacity>
          </View>

          <View style={styles.setting}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Line Height</Text>
            <View style={[styles.slider, { backgroundColor: colors.border }]}>
              <View style={[styles.sliderFill, { width: '60%', backgroundColor: colors.primary }]} />
            </View>
          </View>

          <View style={styles.setting}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Text Alignment</Text>
            <View style={styles.alignmentButtons}>
              <TouchableOpacity
                style={[styles.alignButton, textAlignment === 'left' && styles.activeAlignButton, 
                  { backgroundColor: colors.card }, 
                  textAlignment === 'left' && { backgroundColor: colors.primary + '20' }]}
                onPress={() => setTextAlignment('left')}>
                <Ionicons
                  name="text"
                  size={20}
                  color={textAlignment === 'left' ? colors.primary : colors.text}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.alignButton, textAlignment === 'center' && styles.activeAlignButton, 
                  { backgroundColor: colors.card }, 
                  textAlignment === 'center' && { backgroundColor: colors.primary + '20' }]}
                onPress={() => setTextAlignment('center')}>
                <Ionicons
                  name="text"
                  size={20}
                  color={textAlignment === 'center' ? colors.primary : colors.text}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.alignButton, textAlignment === 'right' && styles.activeAlignButton, 
                  { backgroundColor: colors.card }, 
                  textAlignment === 'right' && { backgroundColor: colors.primary + '20' }]}
                onPress={() => setTextAlignment('right')}>
                <Ionicons
                  name="text"
                  size={20}
                  color={textAlignment === 'right' ? colors.primary : colors.text}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.setting}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Font Type</Text>
            <TouchableOpacity style={[styles.fontTypeButton, { backgroundColor: colors.card }]}>
              <Text style={[styles.fontTypeText, { color: colors.text }]}>Sans-serif</Text>
              <Ionicons name="chevron-down" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  setting: {
    marginBottom: 24,
  },
  settingLabel: {
    fontSize: 16,
    marginBottom: 12,
  },
  slider: {
    height: 4,
    borderRadius: 2,
  },
  sliderFill: {
    height: '100%',
    borderRadius: 2,
  },
  themeButtons: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 4,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeThemeButton: {
  },
  themeButtonText: {
    fontSize: 16,
  },
  activeThemeButtonText: {
    fontWeight: '600',
  },
  toggle: {
    width: 51,
    height: 31,
    borderRadius: 15.5,
    padding: 2,
  },
  toggleActive: {
  },
  toggleHandle: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
  },
  toggleHandleActive: {
    transform: [{ translateX: 20 }],
  },
  alignmentButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  alignButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeAlignButton: {
  },
  fontTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  fontTypeText: {
    fontSize: 16,
  },
}); 