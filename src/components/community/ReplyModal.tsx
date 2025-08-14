import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/shared/constants/Colors';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { useAuth } from '@/shared/contexts/AuthContext';

interface Reply {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  likes: number;
  hasLiked: boolean;
}

interface ReplyModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void;
  replies: Reply[];
  title: string;
  isLoading?: boolean;
  isSubmitting?: boolean; // New prop for submission loading state
  originalPost?: any; // For showing the original post content
}

export default function ReplyModal({ visible, onClose, onSubmit, replies, title, isLoading = false, isSubmitting = false, originalPost }: ReplyModalProps) {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { user } = useAuth();
  const [newReply, setNewReply] = useState('');

  const handleSubmit = () => {
    if (newReply.trim() && !isSubmitting) {
      onSubmit(newReply.trim());
      // Don't clear the input immediately - let the parent handle it after successful submission
    }
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

  const renderReply = ({ item }: { item: Reply }) => (
    <View style={[styles.replyItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.replyHeader}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="person" size={16} color={colors.primary} />
          </View>
          <View style={styles.userDetails}>
            <Text style={[styles.username, { color: colors.text }]}>{item.author.name}</Text>
            <Text style={[styles.timeAgo, { color: colors.secondaryText }]}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={16} color={colors.secondaryText} />
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.replyContent, { color: colors.text }]}>{item.content}</Text>
      
      <View style={styles.replyActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons 
            name={item.hasLiked ? "heart" : "heart-outline"} 
            size={16} 
            color={item.hasLiked ? colors.primary : colors.text} 
          />
          <Text style={[styles.actionText, { color: colors.text }]}>{item.likes}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={16} color={colors.text} />
          <Text style={[styles.actionText, { color: colors.text }]}>Reply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.contentContainer}>
          {/* Show original post if provided */}
          {originalPost && (
            <View style={[styles.originalPostContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.originalPostHeader}>
                <View style={styles.userInfo}>
                  <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons name="person" size={16} color={colors.primary} />
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={[styles.username, { color: colors.text }]}>{originalPost.author.name}</Text>
                    <Text style={[styles.timeAgo, { color: colors.secondaryText }]}>
                      {new Date(originalPost.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={[styles.originalPostContent, { color: colors.text }]}>{originalPost.content}</Text>
            </View>
          )}
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Ionicons name="reload" size={24} color={colors.secondaryText} />
              <Text style={[styles.loadingText, { color: colors.secondaryText }]}>Loading replies...</Text>
            </View>
          ) : replies.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No replies yet</Text>
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                Be the first to share your thoughts!
              </Text>
            </View>
          ) : (
            <FlatList
              data={replies}
              renderItem={renderReply}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.repliesList}
            />
          )}
        </View>
        
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <View style={styles.userRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="person" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.username, { color: colors.text }]}>{getUserDisplayName()}</Text>
          </View>
          
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.replyInput, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="Add your reply..."
              placeholderTextColor={colors.secondaryText}
              value={newReply}
              onChangeText={setNewReply}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[
                styles.sendButton, 
                { 
                  backgroundColor: newReply.trim() && !isSubmitting ? colors.primary : colors.border,
                  opacity: newReply.trim() && !isSubmitting ? 1 : 0.5
                }
              ]}
              onPress={handleSubmit}
              disabled={!newReply.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <Ionicons name="reload" size={20} color={colors.secondaryText} />
              ) : (
                <Ionicons name="send" size={20} color={newReply.trim() ? "#FFFFFF" : colors.secondaryText} />
              )}
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.characterCount, { color: colors.secondaryText }]}>
            {newReply.length}/500
          </Text>
        </View>
      </View>
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
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  repliesList: {
    padding: 16,
  },
  replyItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeAgo: {
    fontSize: 12,
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  replyContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  replyActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  replyInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
    maxHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  originalPostContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  originalPostHeader: {
    marginBottom: 8,
  },
  originalPostContent: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 