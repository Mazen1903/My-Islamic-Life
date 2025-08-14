import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '@/shared/constants/Colors';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { useAuth } from '@/shared/contexts/AuthContext';

const achievements = [
  { id: '1', title: 'Early Bird', description: 'Complete 5 chapters before 9 AM', icon: 'time-outline' as const },
  { id: '2', title: 'Bookworm', description: 'Read for 7 days in a row', icon: 'library-outline' as const },
  { id: '3', title: 'Deep Thinker', description: 'Spend 2 hours on a single chapter', icon: 'school-outline' as const },
  { id: '4', title: 'Social Butterfly', description: 'Share 10 insights with the community', icon: 'share-social-outline' as const },
];

export default function ProfileScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth/sign-in');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.profileHeader, { borderBottomColor: colors.border }]}>
        <View style={styles.headerSpacer} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => router.push('/app-settings')}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile Header */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <View style={[styles.profileImageContainer]}>
            <View style={[
              styles.profileImage, 
              { backgroundColor: colors.card },
              !isDark && {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 4,
              }
            ]}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={40} color={colors.secondaryText} />
              )}
            </View>
            <TouchableOpacity style={[
              styles.editButton, 
              { backgroundColor: colors.card },
              !isDark && {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }
            ]}>
              <Ionicons name="camera" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{user?.name || 'User'}</Text>
          <Text style={[styles.bio, { color: colors.secondaryText }]}>
            Passionate about self-improvement and mindfulness
          </Text>
        </Animated.View>

        {/* Stats Overview */}
        <Animated.View entering={FadeInDown.delay(200)} style={[
          styles.statsContainer, 
          { backgroundColor: colors.card },
          !isDark && {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }
        ]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.text }]}>24</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Chapters Read</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.text }]}>12</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Hours Spent</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.text }]}>8</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Achievements</Text>
          </View>
        </Animated.View>

        {/* Reading Goals */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>READING GOALS</Text>
          <View style={[
            styles.goalCard, 
            { backgroundColor: colors.card },
            !isDark && {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }
          ]}>
            <View style={styles.goalHeader}>
              <Text style={[styles.goalTitle, { color: colors.text }]}>Daily Reading Goal</Text>
              <Text style={[styles.goalProgress, { color: colors.primary }]}>2/3 chapters</Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { width: '66%', backgroundColor: colors.primary }]} />
            </View>
          </View>
        </Animated.View>

        {/* Achievements */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>ACHIEVEMENTS</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement, index) => (
              <View key={achievement.id} style={[
                styles.achievementCard, 
                { backgroundColor: colors.card },
                !isDark && {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }
              ]}>
                <View style={[styles.achievementIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name={achievement.icon} size={24} color={colors.primary} />
                </View>
                <Text style={[styles.achievementTitle, { color: colors.text }]}>{achievement.title}</Text>
                <Text style={[styles.achievementDescription, { color: colors.secondaryText }]}>{achievement.description}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Settings */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>SETTINGS</Text>
          <View style={[styles.settingsContainer, { backgroundColor: colors.card }]}>
            <TouchableOpacity 
              style={[styles.settingItem, { borderBottomColor: colors.border }]}
              onPress={() => router.push('/app-settings')}
            >
              <View style={styles.settingIconContainer}>
                <Ionicons name="settings-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>App Settings</Text>
                <Text style={[styles.settingSubtitle, { color: colors.secondaryText }]}>Theme, notifications, account</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.settingItem, { borderBottomColor: colors.border }]} 
              onPress={() => router.push('/settings')}
            >
              <View style={styles.settingIconContainer}>
                <Ionicons name="book-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Reader Settings</Text>
                <Text style={[styles.settingSubtitle, { color: colors.secondaryText }]}>Font size, spacing, alignment</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingIconContainer}>
                <Ionicons name="help-circle-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Help & Support</Text>
                <Text style={[styles.settingSubtitle, { color: colors.secondaryText }]}>FAQs, contact us</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.settingItem, { borderBottomWidth: 0 }]}
              onPress={handleSignOut}
            >
              <View style={styles.settingIconContainer}>
                <Ionicons name="log-out-outline" size={22} color="#FF6B6B" />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: '#FF6B6B' }]}>Sign Out</Text>
                <Text style={[styles.settingSubtitle, { color: colors.secondaryText }]}>Sign out of your account</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
            </TouchableOpacity>
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerSpacer: {
    width: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingsButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: 8,
    borderRadius: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 20,
    borderRadius: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  goalCard: {
    padding: 16,
    borderRadius: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  goalProgress: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#8F9BB3',
    textAlign: 'center',
    lineHeight: 16,
  },
  settingsContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 13,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
}); 