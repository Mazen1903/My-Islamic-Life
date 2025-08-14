import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/shared/constants/Colors';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { useAuth } from '@/shared/contexts/AuthContext';
import DiscussionDetailModal from './DiscussionDetailModal';
import { supabaseCommunityService as communityService } from '@/shared/services/supabase-community.service';

interface DiscussionTopicProps {
  topic: any;
  onPress: (topicId: string) => void;
  onReply: (topicId: string, reply: string) => Promise<boolean>;
  isAuthor?: boolean;
  isSubmittingReply?: boolean;
}

export default function DiscussionTopic({ topic, onPress, onReply, isAuthor = false, isSubmittingReply = false }: DiscussionTopicProps) {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { user } = useAuth();
  const [showDiscussionDetail, setShowDiscussionDetail] = useState(false);
  const [replies, setReplies] = useState<any[]>([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);

  const handleReply = async (content: string) => {
    try {
      // Call the parent's reply function and wait for the result
      const success = await onReply(topic.id, content);
      
      if (success) {
        // Only add to local state if the API call was successful
        const newReply = {
          id: Date.now().toString(),
          content,
          author: {
            id: 'current-user',
            name: 'You',
          },
          createdAt: new Date().toISOString(),
          likes: 0,
          hasLiked: false,
        };
        setReplies(prev => [newReply, ...prev]);
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  };

  const loadReplies = async () => {
    try {
      setIsLoadingReplies(true);
      const response = await communityService.getDiscussionReplies(topic.id);
      if (response.success && response.data) {
        setReplies(response.data);
      } else {
        console.error('Failed to load replies:', response.error);
      }
    } catch (error) {
      console.error('Error loading replies:', error);
    } finally {
      setIsLoadingReplies(false);
    }
  };

  const getAuthorName = () => {
    if (topic.author?.name) return topic.author.name;
    if (topic.author?.firstName && topic.author?.lastName) {
      return `${topic.author.firstName} ${topic.author.lastName}`;
    }
    if (topic.author?.firstName) return topic.author.firstName;
    return 'Anonymous User';
  };

  return (
    <TouchableOpacity 
      style={[styles.discussionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => {
        setShowDiscussionDetail(true);
        loadReplies(); // Load replies when opening discussion
      }}
    >
      <View style={styles.discussionHeader}>
        {topic.isPinned && <Ionicons name="pin" size={16} color={colors.primary} />}
        {topic.isSolved && <Ionicons name="checkmark-circle" size={16} color={colors.success} />}
        {topic.isScholarly && <Ionicons name="school" size={16} color={colors.secondary} />}
      </View>
      
      <Text style={[styles.discussionTitle, { color: colors.text }]}>{topic.title}</Text>
      
      <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '15' }]}>
        <Text style={[styles.categoryBadgeText, { color: colors.primary }]}>{topic.category}</Text>
      </View>
      
      <Text style={[styles.discussionPreview, { color: colors.secondaryText }]} numberOfLines={3}>
        {topic.content}
      </Text>
      
      <View style={styles.discussionFooter}>
        <Text style={[styles.discussionMeta, { color: colors.secondaryText }]}>
          By {getAuthorName()} • {new Date(topic.createdAt).toLocaleDateString()}
        </Text>
        <Text style={[styles.discussionStats, { color: colors.primary }]}>
          {topic.replies || 0} replies
        </Text>
      </View>

      {/* Discussion Detail Modal */}
      <DiscussionDetailModal
        visible={showDiscussionDetail}
        onClose={() => setShowDiscussionDetail(false)}
        discussion={topic}
        replies={replies}
        onReply={handleReply}
        isLoading={isLoadingReplies}
        isSubmitting={isSubmittingReply}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  discussionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  discussionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  discussionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  discussionPreview: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  discussionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  discussionMeta: {
    fontSize: 12,
  },
  discussionStats: {
    fontSize: 12,
  },
  quickReplyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    gap: 4,
  },
  quickReplyText: {
    fontSize: 12,
    fontWeight: '500',
  },

}); 