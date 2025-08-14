import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/shared/constants/Colors';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { CommunityPost } from '@/shared/types';
import ReplyModal from './ReplyModal';

interface FeedPostProps {
  post: CommunityPost;
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  onShare: (postId: string) => void;
  onVotePoll?: (postId: string, optionId: string) => void;
}

export default function FeedPost({ post, onLike, onComment, onShare, onVotePoll }: FeedPostProps) {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const handleComment = (content: string) => {
    onComment(post.id, content);
    // Add the new comment to the local state
    const newComment = {
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
    setComments(prev => [newComment, ...prev]);
  };

  const renderPoll = () => {
    if (post.type !== 'poll' || !post.poll) return null;

    return (
      <View style={styles.postPoll}>
        <Text style={[styles.pollQuestionText, { color: colors.text }]}>
          {post.poll.question}
        </Text>
        <View style={styles.pollOptionsContainer}>
          {post.poll.options.map((option) => (
            <TouchableOpacity 
              key={option.id} 
              style={styles.pollOptionContainer}
              onPress={() => onVotePoll?.(post.id, option.id)}
            >
              <View style={[styles.pollOptionBar, { backgroundColor: colors.border }]}>
                <View 
                  style={[
                    styles.pollOptionFill, 
                    { 
                      backgroundColor: option.hasVoted ? colors.primary : colors.primary + '40',
                      width: `${option.percentage}%` 
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.pollOptionText, { color: colors.text }]}>
                {option.text} ({option.percentage}%)
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.pollStats, { color: colors.secondaryText }]}>
          {post.poll.totalVotes} votes{post.poll.expiresAt ? ` • Expires ${new Date(post.poll.expiresAt).toLocaleDateString()}` : ''}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="person" size={20} color={colors.primary} />
          </View>
          <View style={styles.userDetails}>
            <Text style={[styles.username, { color: colors.text }]}>{post.author.name}</Text>
            <Text style={[styles.timeAgo, { color: colors.secondaryText }]}>
              {new Date(post.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
      
      <Text style={[styles.postContent, { color: colors.text }]}>{post.content}</Text>
      
      {post.imageUrl && (
        <View style={styles.postImageContainer}>
          <Image 
            source={{ uri: post.imageUrl }} 
            style={styles.postImage}
            resizeMode="cover"
            onError={(error) => console.log('Image loading error:', error)}
          />
          {post.imageCaption && (
            <Text style={[styles.imageCaption, { color: colors.secondaryText }]}>
              {post.imageCaption}
            </Text>
          )}
        </View>
      )}

      {renderPoll()}
      
      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onLike(post.id)}
        >
          <Ionicons 
            name={post.hasLiked ? "heart" : "heart-outline"} 
            size={20} 
            color={post.hasLiked ? colors.primary : colors.text} 
          />
          <Text style={[styles.actionText, { color: colors.text }]}>{post.likes}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowComments(true)}
        >
          <Ionicons name="chatbubble-outline" size={20} color={colors.text} />
          <Text style={[styles.actionText, { color: colors.text }]}>{post.comments}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onShare(post.id)}
        >
          <Ionicons name="share-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Comments Modal */}
      <ReplyModal
        visible={showComments}
        onClose={() => setShowComments(false)}
        onSubmit={handleComment}
        replies={comments}
        title="Comments"
        isLoading={isLoadingComments}
        originalPost={post}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  postCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: 12,
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
  timeAgo: {
    fontSize: 12,
    marginTop: 2,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  postImageContainer: {
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  imageCaption: {
    fontSize: 14,
    padding: 12,
    fontStyle: 'italic',
  },
  postActions: {
    flexDirection: 'row',
    gap: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
  },
  postPoll: {
    marginTop: 12,
    marginBottom: 16,
  },
  pollQuestionText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  pollOptionsContainer: {
    gap: 8,
    marginBottom: 12,
  },
  pollOptionContainer: {
    position: 'relative',
  },
  pollOptionBar: {
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  pollOptionFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: 16,
  },
  pollOptionText: {
    fontSize: 14,
    position: 'absolute',
    left: 12,
    top: 8,
    zIndex: 1,
  },
  pollStats: {
    fontSize: 12,
    textAlign: 'center',
  },

}); 