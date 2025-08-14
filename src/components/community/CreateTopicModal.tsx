import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/shared/constants/Colors';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { useAuth } from '@/shared/contexts/AuthContext';

interface CreateTopicModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, content: string, category: string) => void;
  isCreating: boolean;
}

const DEFAULT_CATEGORIES = [
  'Islamic Practice & Spirituality',
  'Book Study & Reflection', 
  'Habit Building & Discipline',
  'Healthy Living (Halal Lifestyle)',
  'Community Support',
  'Ask a Scholar'
];

export default function CreateTopicModal({ visible, onClose, onSubmit, isCreating }: CreateTopicModalProps) {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    onSubmit(title.trim(), content.trim(), category);
    
    // Reset form
    setTitle('');
    setContent('');
    setCategory(DEFAULT_CATEGORIES[0]);
  };

  const getUserDisplayName = () => {
    if (user?.fullName) return user.fullName;
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) return user.firstName;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView 
        style={[styles.modalContainer, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Create New Topic</Text>
          <TouchableOpacity 
            style={[styles.postButton, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
            disabled={isCreating}
          >
            <Text style={styles.postButtonText}>
              {isCreating ? 'Creating...' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.modalContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.userRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="person" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.username, { color: colors.text }]}>{getUserDisplayName()}</Text>
          </View>
          
          <Text style={[styles.addToPostLabel, { color: colors.text }]}>Title:</Text>
          <TextInput
            style={[styles.topicTitleInput, { color: colors.text, borderColor: colors.border }]}
            placeholder="What's your discussion topic?"
            placeholderTextColor={colors.secondaryText}
            value={title}
            onChangeText={setTitle}
          />
          
          <Text style={[styles.addToPostLabel, { color: colors.text }]}>Content:</Text>
          <TextInput
            style={[styles.postInput, { color: colors.text }]}
            placeholder="Describe your topic in detail..."
            placeholderTextColor={colors.secondaryText}
            multiline
            value={content}
            onChangeText={setContent}
          />
          
          <Text style={[styles.addToPostLabel, { color: colors.text }]}>Category:</Text>
          
          <View style={styles.categoryOptions}>
            {DEFAULT_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryOption,
                  { 
                    backgroundColor: category === cat ? colors.primary + '20' : colors.card,
                    borderColor: colors.border
                  }
                ]}
                onPress={() => setCategory(cat)}
              >
                                 <Text style={[
                   styles.categoryOptionText, 
                   { color: category === cat ? colors.primary : colors.text }
                 ]}>
                  {cat}
                </Text>
                {category === cat && (
                  <Ionicons name="checkmark" size={16} color={colors.primary} style={styles.checkmark} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  postButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
  },
  addToPostLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  topicTitleInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  postInput: {
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  categoryOptions: {
    gap: 8,
    marginTop: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  checkmark: {
    marginLeft: 8,
  },
}); 