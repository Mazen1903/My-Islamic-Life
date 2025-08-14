import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, FlatList, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/shared/constants/Colors';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { useAuth } from '@/shared/contexts/AuthContext';

interface DiscussionDetailModalProps {
  visible: boolean;
  onClose: () => void;
  discussion: any;
  replies: any[];
  onReply: (content: string) => Promise<void>;
  isLoading?: boolean;
  isSubmitting?: boolean;
}

export default function DiscussionDetailModal({ 
  visible, 
  onClose, 
  discussion, 
  replies, 
  onReply, 
  isLoading = false,
  isSubmitting = false
}: DiscussionDetailModalProps) {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { user } = useAuth();
  const [replyText, setReplyText] = useState('');

  const getAuthorName = () => {
    if (discussion.author?.name) return discussion.author.name;
    if (discussion.author?.firstName && discussion.author?.lastName) {
      return `${discussion.author.firstName} ${discussion.author.lastName}`;
    }
    if (discussion.author?.firstName) return discussion.author.firstName;
    return 'Anonymous User';
  };

  const handleSubmitReply = async () => {
    if (replyText.trim() && !isSubmitting) {
      try {
        await onReply(replyText.trim());
        setReplyText(''); // Only clear on success
      } catch (error) {
        console.error('Error submitting reply:', error);
      }
    }
  };

  const renderReply = ({ item }: { item: any }) => (
    <View style={[styles.replyItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.replyHeader}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="person" size={16} color={colors.primary} />
          </View>
          <View style={styles.userDetails}>
            <Text style={[styles.username, { color: colors.text }]}>{item.author?.name || 'Anonymous'}</Text>
            <Text style={[styles.timeAgo, { color: colors.secondaryText }]}>
              {new Date(item.created_at).toLocaleDateString()}
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
            name="heart-outline" 
            size={16} 
            color={colors.text} 
          />
          <Text style={[styles.actionText, { color: colors.text }]}>{item.likes_count || 0}</Text>
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
      <KeyboardAvoidingView 
        style={[styles.modalContainer, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Discussion</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* Discussion Header */}
          <View style={[styles.discussionHeader, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.discussionMeta}>
              <View style={styles.authorRow}>
                <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="person" size={20} color={colors.primary} />
                </View>
                <View style={styles.authorInfo}>
                  <Text style={[styles.authorName, { color: colors.text }]}>{getAuthorName()}</Text>
                  <Text style={[styles.postDate, { color: colors.secondaryText }]}>
                    {new Date(discussion.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              
              <View style={styles.discussionBadges}>
                {discussion.isPinned && (
                  <View style={[styles.badge, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name="pin" size={12} color={colors.primary} />
                    <Text style={[styles.badgeText, { color: colors.primary }]}>Pinned</Text>
                  </View>
                )}
                {discussion.isSolved && (
                  <View style={[styles.badge, { backgroundColor: colors.success + '15' }]}>
                    <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                    <Text style={[styles.badgeText, { color: colors.success }]}>Solved</Text>
                  </View>
                )}
                {discussion.isScholarly && (
                  <View style={[styles.badge, { backgroundColor: colors.secondary + '15' }]}>
                    <Ionicons name="school" size={12} color={colors.secondary} />
                    <Text style={[styles.badgeText, { color: colors.secondary }]}>Scholarly</Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.categoryText, { color: colors.primary }]}>{discussion.category}</Text>
            </View>
            
            <Text style={[styles.discussionTitle, { color: colors.text }]}>{discussion.title}</Text>
            
            <Text style={[styles.discussionContent, { color: colors.text }]}>{discussion.content}</Text>
            
            <View style={styles.discussionStats}>
              <Text style={[styles.statsText, { color: colors.secondaryText }]}>
                {replies.length} replies • {discussion.views || 0} views
              </Text>
            </View>
          </View>
          
          {/* Replies Section */}
          <View style={styles.repliesSection}>
            <Text style={[styles.repliesTitle, { color: colors.text }]}>
              {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
            </Text>
            
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
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.repliesList}
              />
            )}
          </View>
        </ScrollView>
        
        {/* Reddit-style Reply Form */}
        <View style={[styles.replyForm, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <View style={styles.replyInputContainer}>
            <TextInput
              style={[styles.replyInput, { 
                color: colors.text, 
                backgroundColor: colors.background,
                borderColor: colors.border 
              }]}
              placeholder="Add a reply..."
              placeholderTextColor={colors.secondaryText}
              value={replyText}
              onChangeText={setReplyText}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity 
              style={[
                styles.sendButton, 
                { 
                  backgroundColor: replyText.trim() && !isSubmitting ? colors.primary : colors.border,
                  opacity: replyText.trim() && !isSubmitting ? 1 : 0.5
                }
              ]}
              onPress={handleSubmitReply}
              disabled={!replyText.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <Ionicons 
                  name="reload" 
                  size={18} 
                  color={colors.secondaryText} 
                />
              ) : (
                <Ionicons 
                  name="send" 
                  size={18} 
                  color={replyText.trim() ? '#FFFFFF' : colors.secondaryText} 
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
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
  contentContainer: {
    flex: 1,
  },
  discussionHeader: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  discussionMeta: {
    marginBottom: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  postDate: {
    fontSize: 12,
    marginTop: 2,
  },
  discussionBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  discussionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    lineHeight: 28,
  },
  discussionContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  discussionStats: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 12,
  },
  statsText: {
    fontSize: 14,
  },
  repliesSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  repliesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
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
    gap: 12,
  },
  replyItem: {
    padding: 16,
    borderRadius: 12,
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
  replyForm: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 14,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 