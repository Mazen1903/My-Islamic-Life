import React, { useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { Colors } from '@/shared/constants/Colors';

interface ExpandableTextProps {
  text: string;
  numberOfLines?: number;
  style?: any;
  expandStyle?: any;
  buttonStyle?: any;
  textAlign?: 'left' | 'center' | 'right';
}

export function ExpandableText({ 
  text, 
  numberOfLines = 3, 
  style, 
  expandStyle,
  buttonStyle,
  textAlign = 'left'
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const onTextLayout = (e: any) => {
    if (e.nativeEvent.lines.length > numberOfLines && !showReadMore) {
      setShowReadMore(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text
        style={[
          {
            color: colors.text,
            textAlign: textAlign,
          },
          style,
          isExpanded && expandStyle
        ]}
        numberOfLines={isExpanded ? undefined : numberOfLines}
        onTextLayout={onTextLayout}
      >
        {text}
      </Text>
      
      {showReadMore && (
        <TouchableOpacity 
          style={[
            styles.button,
            { 
              backgroundColor: colors.primary + '15',
              alignSelf: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start'
            },
            buttonStyle
          ]} 
          onPress={toggleExpanded}
        >
          <Text style={[styles.buttonText, { color: colors.primary }]}>
            {isExpanded ? 'Minimize Hadith' : 'Expand Hadith'}
          </Text>
          <Ionicons 
            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
            size={14} 
            color={colors.primary} 
            style={styles.icon}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  icon: {
    marginLeft: 4,
  },
}); 