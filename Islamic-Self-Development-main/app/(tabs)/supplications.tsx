import { Ionicons } from '@expo/vector-icons';
import React, { useState, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Dimensions,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { Colors } from '@/shared/constants/Colors';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { ZikrSeries, ZikrCategory, DuaSubcategory } from '@/shared/types/supplications';
import { ZIKR_SERIES, ZIKR_CATEGORIES } from '@/shared/constants/supplications';
import { ExpandableText } from '@/src/components/ui/ExpandableText';

const { width, height } = Dimensions.get('window');

// Helper functions for handling mixed series (subcategories + direct duas)
const getAllDuasFromSeries = (series: ZikrSeries): any[] => {
  const allDuas: any[] = [];
  
  // Add direct duas first (if any)
  if (series.duas && series.duas.length > 0) {
    allDuas.push(...series.duas);
  }
  
  // Add duas from subcategories (if any)
  if (series.subcategories && series.subcategories.length > 0) {
    const subcategoryDuas = series.subcategories.flatMap(subcategory => subcategory.duas);
    allDuas.push(...subcategoryDuas);
  }
  
  return allDuas;
};

const hasSubcategories = (series: ZikrSeries): boolean => {
  return !!(series.subcategories && series.subcategories.length > 0);
};

const hasDirectDuas = (series: ZikrSeries): boolean => {
  return !!(series.duas && series.duas.length > 0);
};

const isMixedSeries = (series: ZikrSeries): boolean => {
  return hasSubcategories(series) && hasDirectDuas(series);
};

// Helper function to get manuscript-style colors based on theme
const getManuscriptColors = (isDark: boolean, themeColors: any) => ({
  parchment: isDark ? themeColors.background : '#F5F1E8',
  darkParchment: isDark ? themeColors.card : '#E8E0D0',
  brown: themeColors.primary,
  darkBrown: isDark ? themeColors.primary : themeColors.primary + 'CC',
  gold: themeColors.primary,
  darkGold: isDark ? themeColors.primary : themeColors.primary + 'DD',
  ink: themeColors.text,
  lightInk: themeColors.secondaryText,
  border: isDark ? themeColors.border : '#D2B48C',
  spiralBinding: themeColors.primary
});

export default function SupplicationsScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const manuscriptColors = getManuscriptColors(isDark, colors);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeries, setSelectedSeries] = useState<ZikrSeries | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<DuaSubcategory | null>(null);
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [zikrSessionVisible, setZikrSessionVisible] = useState(false);
  const [currentDuaIndex, setCurrentDuaIndex] = useState(0);
  const [currentCount, setCurrentCount] = useState(0);
  const horizontalScrollRef = useRef<ScrollView>(null);


  const filteredSeries = ZIKR_SERIES.filter((series: ZikrSeries) => {
    const matchesCategory = selectedCategory === 'all' || series.categories.includes(selectedCategory);
    return matchesCategory;
  });

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleSeriesSelect = (series: ZikrSeries) => {
    if (hasSubcategories(series) || isMixedSeries(series)) {
      // Complex or mixed series - show subcategories (and direct duas if mixed)
      setSelectedSeries(series);
      setShowSubcategories(true);
    } else {
      
    }
  };

  const startZikrSession = (subcategory: DuaSubcategory) => {
    setSelectedSubcategory(subcategory);
    setCurrentDuaIndex(0);
    setCurrentCount(0);
    setZikrSessionVisible(true);
  };

  const closeZikrSession = () => {
    setZikrSessionVisible(false);
    setSelectedSubcategory(null);
    setCurrentDuaIndex(0);
    setCurrentCount(0);
  };

  const goBackToSeries = () => {
    setShowSubcategories(false);
    setSelectedSeries(null);
  };

  const incrementCount = () => {
    if (!selectedSubcategory) return;

    const currentDua = selectedSubcategory.duas[currentDuaIndex];
    const newCount = currentCount + 1;

    if (newCount >= (currentDua.repetitions || 1)) {
      // Move to next dua
      if (currentDuaIndex < selectedSubcategory.duas.length - 1) {
        // Completed current dhikr, moving to next
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const nextIndex = currentDuaIndex + 1;
        setCurrentDuaIndex(nextIndex);
        setCurrentCount(0);
        // Auto-scroll to next page
        horizontalScrollRef.current?.scrollTo({
          x: nextIndex * width,
          animated: true
        });
      } else {
        // Session complete - stronger celebration feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 200);
        closeZikrSession();
      }
    } else {
      // Regular count increment - light tap feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentCount(newCount);
    }
  };

  const handlePageChange = (event: any) => {
    const pageIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (pageIndex !== currentDuaIndex && pageIndex >= 0 && pageIndex < (selectedSubcategory?.duas.length || 0)) {
      setCurrentDuaIndex(pageIndex);
      setCurrentCount(0); // Reset counter when manually swiping to different dua
      // Light haptic feedback for manual swipe
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const CategoryButton = ({ category, isSelected }: { category: ZikrCategory, isSelected: boolean }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        {
          backgroundColor: isSelected ? manuscriptColors.brown : manuscriptColors.parchment,
          borderColor: manuscriptColors.border,
          borderWidth: 1
        }
      ]}
      onPress={() => handleCategorySelect(category.id)}
    >
      <Ionicons
        name={category.icon as any}
        size={20}
        color={isSelected ? manuscriptColors.parchment : manuscriptColors.brown}
      />
      <Text style={[
        styles.categoryText,
        { color: isSelected ? manuscriptColors.parchment : manuscriptColors.brown }
      ]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  const SeriesCard = ({ series }: { series: ZikrSeries }) => {
    const totalDuas = getAllDuasFromSeries(series).length;
    const hasSubcats = hasSubcategories(series);
    
    return (
      <TouchableOpacity
        style={styles.manuscriptCard}
        onPress={() => handleSeriesSelect(series)}
      >
        <LinearGradient
          colors={[manuscriptColors.parchment, manuscriptColors.darkParchment]}
          style={styles.cardGradient}
        >
          <View style={[styles.cardBorder, { borderColor: manuscriptColors.border }]}>
            <View style={styles.duaHeader}>
              <Text style={[styles.duaTitle, { color: manuscriptColors.ink }]}>{series.title}</Text>
              <Ionicons name={series.icon as any} size={20} color={manuscriptColors.brown} />
            </View>
            <Text style={[styles.duaTranslation, { color: manuscriptColors.lightInk }]} numberOfLines={2}>
              {series.description}
            </Text>
            <View style={styles.duaFooter}>
              <View style={styles.duaFooterLeft}>
                <Ionicons name="book" size={12} color={manuscriptColors.brown} />
                <Text style={[styles.duaReference, { color: manuscriptColors.brown }]}>
                  {hasSubcats 
                    ? `${series.subcategories?.length || 0} categories • ${totalDuas} duas`
                    : `${totalDuas} duas`
                  }
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={manuscriptColors.brown} />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const SubcategoryCard = ({ subcategory }: { subcategory: DuaSubcategory }) => (
    <TouchableOpacity
      style={styles.manuscriptCard}
      onPress={() => startZikrSession(subcategory)}
    >
      <LinearGradient
        colors={[manuscriptColors.parchment, manuscriptColors.darkParchment]}
        style={styles.cardGradient}
      >
        <View style={[styles.cardBorder, { borderColor: manuscriptColors.border }]}>
          <View style={styles.duaHeader}>
            <Text style={[styles.duaTitle, { color: manuscriptColors.ink }]}>{subcategory.name}</Text>
            <Ionicons name={subcategory.icon as any} size={20} color={manuscriptColors.brown} />
          </View>
          <Text style={[styles.duaTranslation, { color: manuscriptColors.lightInk }]} numberOfLines={2}>
            {subcategory.description}
          </Text>
          <View style={styles.duaFooter}>
            <View style={styles.duaFooterLeft}>
              <Ionicons name="book" size={12} color={manuscriptColors.brown} />
              <Text style={[styles.duaReference, { color: manuscriptColors.brown }]}>
                {subcategory.duas.length} duas
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={manuscriptColors.brown} />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Spiral binding component
  const SpiralBinding = () => (
    <View style={styles.spiralContainer}>
      {Array.from({ length: 18 }, (_, i) => (
        <View key={i} style={[styles.spiralHole, { backgroundColor: manuscriptColors.spiralBinding }]} />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: manuscriptColors.parchment }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <View>
            <View style={styles.greetingContainer}>
              <View style={[styles.greetingBadge, {
                backgroundColor: manuscriptColors.brown + '20',
                borderColor: manuscriptColors.border
              }]}>
                <Ionicons name="moon" size={16} color={manuscriptColors.brown} style={styles.greetingIcon} />
                <Text style={[styles.greeting, { color: manuscriptColors.brown }]}>Islamic Supplications</Text>
              </View>
            </View>
            <Text style={[styles.title, { color: manuscriptColors.lightInk }]}>Dua & Dhikr</Text>
          </View>
        </Animated.View>

        {/* Categories */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.categoriesSection}>
          <Text style={[styles.sectionTitle, { color: manuscriptColors.brown }]}>CATEGORIES</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {ZIKR_CATEGORIES.map((category: ZikrCategory, index: number) => (
              <Animated.View key={category.id} entering={FadeInRight.delay(300 + index * 100)}>
                <CategoryButton
                  category={category}
                  isSelected={selectedCategory === category.id}
                />
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Zikr Series List or Subcategories */}
        {!showSubcategories ? (
          <Animated.View entering={FadeInDown.delay(600)} style={styles.supplicationsSection}>
            <Text style={[styles.sectionTitle, { color: manuscriptColors.brown }]}>
              ZIKR SERIES ({filteredSeries.length})
            </Text>
            {filteredSeries.map((series: ZikrSeries, index: number) => (
              <Animated.View key={series.id} entering={FadeInDown.delay(700 + index * 100)}>
                <SeriesCard series={series} />
              </Animated.View>
            ))}
            {filteredSeries.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="book" size={48} color={manuscriptColors.lightInk} />
                <Text style={[styles.emptyStateText, { color: manuscriptColors.lightInk }]}>
                  No zikr series in this category
                </Text>
              </View>
            )}
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(300)} style={styles.supplicationsSection}>
            {/* Back Button */}
            <TouchableOpacity
              style={[styles.backButton, {
                backgroundColor: manuscriptColors.parchment,
                borderColor: manuscriptColors.border
              }]}
              onPress={goBackToSeries}
            >
              <Ionicons name="chevron-back" size={20} color={manuscriptColors.brown} />
              <Text style={[styles.backButtonText, { color: manuscriptColors.brown }]}>
                Back to Series
              </Text>
            </TouchableOpacity>

            <Text style={[styles.sectionTitle, { color: manuscriptColors.brown }]}>
              {selectedSeries?.title ? `${selectedSeries.title.toUpperCase()} CATEGORIES` : 'CATEGORIES'}
            </Text>
            {selectedSeries?.subcategories?.map((subcategory: DuaSubcategory, index: number) => (
              <Animated.View key={subcategory.id} entering={FadeInDown.delay(400 + index * 100)}>
                <SubcategoryCard subcategory={subcategory} />
              </Animated.View>
            ))}
          </Animated.View>
        )}
      </ScrollView>

      {/* Zikr Session Modal - Islamic Manuscript Style */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={zikrSessionVisible}
        onRequestClose={closeZikrSession}
      >
        <LinearGradient
          colors={[manuscriptColors.parchment, manuscriptColors.darkParchment]}
          style={styles.manuscriptContainer}
        >
          <SafeAreaView style={styles.manuscriptSafeArea}>
            {/* Spiral Binding */}
            <SpiralBinding />

            {/* Manuscript Header */}
            <View style={[styles.manuscriptHeader, { borderBottomColor: manuscriptColors.border }]}>
              <TouchableOpacity
                style={[styles.closeButton, {
                  backgroundColor: manuscriptColors.parchment,
                  borderColor: manuscriptColors.border
                }]}
                onPress={closeZikrSession}
              >
                <Ionicons name="chevron-back" size={24} color={manuscriptColors.brown} />
              </TouchableOpacity>

              <View style={styles.titleContainer}>
                <Text style={[styles.manuscriptTitle, { color: manuscriptColors.ink }]}>
                  {selectedSubcategory?.name || 'دعاء'}
                </Text>
                <Text style={[styles.manuscriptSubtitle, { color: manuscriptColors.lightInk }]}>
                  {selectedSubcategory?.duas[currentDuaIndex]?.title || ''}
                </Text>
              </View>
            </View>

            {/* Manuscript Content - Horizontal Swiping */}
            {selectedSubcategory && selectedSubcategory.duas && selectedSubcategory.duas.length > 0 && (
              <ScrollView
                ref={horizontalScrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handlePageChange}
                style={styles.horizontalScrollView}
                contentOffset={{ x: currentDuaIndex * width, y: 0 }}
              >
                {selectedSubcategory.duas.map((dua, index) => (
                  <ScrollView
                    key={index}
                    style={[styles.manuscriptScrollView, { width }]}
                    contentContainerStyle={styles.manuscriptContent}
                    showsVerticalScrollIndicator={false}
                  >
                    <TouchableOpacity
                      style={styles.tappableContent}
                      onPress={index === currentDuaIndex ? incrementCount : undefined}
                      activeOpacity={index === currentDuaIndex ? 0.8 : 1}
                    >
                      {/* Arabic Text */}
                      <View style={styles.arabicSection}>
                        <Text style={[styles.manuscriptArabic, { color: manuscriptColors.ink }]}>
                          {dua.arabic || ''}
                        </Text>
                      </View>

                      {/* Divider */}
                      <View style={[styles.manuscriptDivider, { backgroundColor: manuscriptColors.border }]} />

                      {/* Transliteration */}
                      <View style={styles.textSection}>
                        <Text style={[styles.manuscriptTransliteration, { color: manuscriptColors.lightInk }]}>
                          {dua.transliteration || ''}
                        </Text>
                      </View>

                      {/* Translation */}
                      <View style={styles.textSection}>
                        <Text style={[styles.manuscriptTranslation, { color: manuscriptColors.lightInk }]}>
                          {dua.translation || ''}
                        </Text>
                      </View>

                      {/* Reference */}
                      <View style={[styles.referenceSection, { borderTopColor: manuscriptColors.border }]}>
                        {(dua.fullReference && (dua.id === '1-2' || dua.id === '2-1' || dua.id === '2-2' || dua.id === '2-6' || dua.id === '2-8')) ? (
                          <ExpandableText
                            text={`Reference: ${dua.reference || ''}\n\n${dua.fullReference}`}
                            numberOfLines={2}
                            style={[styles.manuscriptReference, { color: manuscriptColors.brown }]}
                            expandStyle={[styles.manuscriptReference, { color: manuscriptColors.brown }]}
                            buttonStyle={[styles.learnMoreButton, {
                              backgroundColor: manuscriptColors.brown + '15',
                              borderColor: manuscriptColors.brown + '30'
                            }]}
                            textAlign="left"
                          />
                        ) : (
                          <Text style={[styles.manuscriptReference, { color: manuscriptColors.brown }]}>
                            {dua.reference || ''}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  </ScrollView>
                ))}
              </ScrollView>
            )}

            {/* Navigation Indicator */}
            {selectedSubcategory && (
              <View style={styles.swipeIndicatorContainer}>
                {selectedSubcategory.duas.length > 1 && (
                  <View style={styles.swipeDotsContainer}>
                    {selectedSubcategory.duas.map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.swipeDot,
                          {
                            backgroundColor: index === currentDuaIndex
                              ? manuscriptColors.brown
                              : manuscriptColors.border
                          }
                        ]}
                      />
                    ))}
                  </View>
                )}
                <Text style={[styles.swipeHint, { color: manuscriptColors.lightInk }]}>
                  {selectedSubcategory.duas.length > 1
                    ? 'Swipe left/right to navigate • Tap anywhere to count'
                    : 'Tap anywhere on the screen to count'
                  }
                </Text>
              </View>
            )}

            {/* Islamic Counter */}
            <View style={[styles.islamicCounterContainer, { borderTopColor: manuscriptColors.border }]}>
              {/* Counter Info Row */}
              <View style={styles.counterInfoRow}>
                <View style={[styles.counterLabelContainer, {
                  backgroundColor: manuscriptColors.parchment + '80',
                  borderColor: manuscriptColors.border
                }]}>
                  <Text style={[styles.counterLabelText, { color: manuscriptColors.brown }]}>
                    Dhikr {currentDuaIndex + 1} of {selectedSubcategory?.duas.length || 1}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.islamicCounterButton}
                  onPress={incrementCount}
                >
                  <LinearGradient
                    colors={[manuscriptColors.gold, manuscriptColors.darkGold]}
                    style={[styles.counterButtonGradient, { borderColor: manuscriptColors.brown }]}
                  >
                    <Text style={[styles.counterButtonText, { color: manuscriptColors.ink }]}>
                      {currentCount + 1}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <View style={[styles.counterLabelContainer, {
                  backgroundColor: manuscriptColors.parchment + '80',
                  borderColor: manuscriptColors.border
                }]}>
                  <Text style={[styles.counterLabelText, { color: manuscriptColors.brown }]}>
                    {selectedSubcategory?.duas[currentDuaIndex]?.repetitions === 1 ? 'Once' : `${selectedSubcategory?.duas[currentDuaIndex]?.repetitions || 1} times`}
                  </Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Modal>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  greetingContainer: {
    marginBottom: 8,
  },
  greetingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  greetingIcon: {
    marginRight: 6,
  },
  greeting: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  categoriesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  categoriesScroll: {
    paddingLeft: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  subCategoriesSection: {
    marginBottom: 20,
  },
  subCategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  subCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 8,
    width: '45%', // Adjust as needed for grid layout
    aspectRatio: 1.2, // Make buttons slightly taller than wide
  },
  subCategoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subCategoryContent: {
    flex: 1,
  },
  subCategoryName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  subCategoryDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
  supplicationsSection: {
    paddingHorizontal: 20,
  },
  manuscriptCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardGradient: {
    flex: 1,
  },
  cardBorder: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  duaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  duaTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  duaTranslation: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  duaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duaFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duaReference: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 12,
  },

  // Manuscript Modal Styles
  manuscriptContainer: {
    flex: 1,
  },
  manuscriptSafeArea: {
    flex: 1,
  },
  spiralContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  spiralHole: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  manuscriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 2,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  manuscriptTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  manuscriptSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 2,
  },
  progressIndicator: {
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  horizontalScrollView: {
    flex: 1,
  },
  manuscriptScrollView: {
    flex: 1,
  },
  manuscriptContent: {
    padding: 20,
    paddingTop: 30,
    minHeight: height * 0.6,
  },
  tappableContent: {
    flex: 1,
    minHeight: height * 0.6,
  },
  arabicSection: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  manuscriptArabic: {
    fontSize: 24,
    fontWeight: '400',
    lineHeight: 40,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: 'System',
  },
  manuscriptDivider: {
    height: 2,
    marginVertical: 20,
    marginHorizontal: width * 0.25,
  },
  textSection: {
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  manuscriptTransliteration: {
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
    textAlign: 'justify',
  },
  manuscriptTranslation: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
  },
  referenceSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    paddingHorizontal: 10,
  },
  manuscriptReference: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'justify',
    fontWeight: '500',
  },
  swipeIndicatorContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  swipeDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  swipeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  swipeHint: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  islamicCounterContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderTopWidth: 2,
  },
  counterInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  counterLabelContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterLabelText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  islamicCounterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  counterButtonGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  counterButtonText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  learnMoreButton: {
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 10,
    right: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 