import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, TextInput, FlatList, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/shared/constants/Colors';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { useAuth } from '@/shared/contexts/AuthContext';
import { supabaseCommunityService as communityService } from '@/shared/services/supabase-community.service';
import { CommunityPost, CreatePostRequest, Conversation, ConnectedUser } from '@/shared/types';
import { useAuthHelper } from '@/shared/utils/auth-helper';
import EnhancedChatScreen from '@/src/components/messaging/EnhancedChatScreen';
import AddUserModal from '@/src/components/messaging/AddUserModal';
import SwipeableConversationItem from '@/src/components/messaging/SwipeableConversationItem';
import { FeedPost, DiscussionTopic, CreatePostModal, CreateTopicModal } from '@/src/components/community';

type TabType = 'Feed' | 'Discuss' | 'Messages';

// Mock data for different sections
const feedPosts = [
  {
    id: '1',
    user: 'Ahmad_99',
    avatar: 'person-circle',
    timeAgo: '2h ago',
    content: 'Alhamdulillah! Day 21 of reading this book 📖 The Soul section is really opening my heart. May Allah guide us all 🤲',
    likes: 34,
    comments: 8,
    hashtags: ['#Day21', '#BookProgress', '#Alhamdulillah'],
    type: 'milestone'
  },
  {
    id: '2',
    user: 'Fatima.Learns',
    avatar: 'person-circle',
    timeAgo: '4h ago', 
    content: 'Beautiful sunrise during Fajr today 🌅 Starting my morning dhikr routine. "SubhanAllahi wa bihamdihi" 100x ✨',
    likes: 67,
    comments: 12,
    hashtags: ['#FajrVibes', '#MorningDhikr'],
    type: 'moment',
    hasImage: true
  },
  {
    id: '3',
    user: 'Yusuf_Habits',
    avatar: 'person-circle',
    timeAgo: '6h ago',
    content: 'Week 3 of my new morning routine: Fajr ✅ Quran reading ✅ 20min exercise ✅ Healthy breakfast ✅ The Mind-Body-Soul connection is real! 💪',
    likes: 89,
    comments: 23,
    hashtags: ['#MorningRoutine', '#HealthyHabits'],
    type: 'progress'
  },
  {
    id: '4',
    user: 'Maryam.Reflects',
    avatar: 'person-circle',
    timeAgo: '8h ago',
    content: '"The best of people are those who benefit others." This hadith from today\'s reading hit differently. Time to be more helpful to my community 💚',
    likes: 45,
    comments: 15,
    hashtags: ['#Reflection', '#Hadith'],
    type: 'reflection'
  },
  {
    id: '5',
    user: 'Omar.Journey',
    avatar: 'person-circle',
    timeAgo: '12h ago',
    content: 'Completed the entire Mind section! 🧠✨ The chapter on controlling anger changed my life. JazakAllahu khairan to everyone who recommended this book 📚',
    likes: 156,
    comments: 34,
    hashtags: ['#BookComplete', '#PersonalGrowth'],
    type: 'achievement'
  },
  {
    id: '6',
    user: 'Aisha_Polls',
    avatar: 'person-circle',
    timeAgo: '1 day ago',
    content: 'What time do you usually pray Fajr? Trying to build consistency 🤲',
    likes: 45,
    comments: 18,
    hashtags: ['#Fajr', '#Prayer', '#Consistency'],
    type: 'poll'
  }
];

const discussionTopics = [
  {
    id: '1',
    title: 'How to maintain focus during long prayers?',
    category: 'Islamic Practice & Spirituality',
    author: 'NewMuslim_Sister',
    timeAgo: '3h ago',
    replies: 47,
    lastReply: '15min ago',
    pinned: false,
    solved: true,
    preview: 'I recently converted to Islam and I\'m struggling to maintain concentration during Maghrib and Isha prayers...'
  },
  {
    id: '2', 
    title: 'Chapter 4 Discussion: "Disciplining the Nafs" - Your thoughts?',
    category: 'Book Study & Reflection',
    author: 'BookClub_Admin',
    timeAgo: '1 day ago',
    replies: 89,
    lastReply: '2h ago',
    pinned: true,
    solved: false,
    preview: 'Let\'s discuss the key concepts from Chapter 4. What strategies resonated with you for controlling desires?'
  },
  {
    id: '3',
    title: 'Waking up for Fajr: Practical tips that actually work',
    category: 'Habit Building & Discipline',
    author: 'EarlyBird_Muslim',
    timeAgo: '2 days ago',
    replies: 134,
    lastReply: '1h ago',
    pinned: false,
    solved: false,
    preview: 'After years of struggle, I finally found methods that work. Sharing what helped me and looking for more ideas...'
  },
  {
    id: '4',
    title: 'Halal nutrition while building muscle - meal ideas?',
    category: 'Healthy Living (Halal Lifestyle)',
    author: 'FitMuslimBro',
    timeAgo: '3 days ago',
    replies: 67,
    lastReply: '4h ago',
    pinned: false,
    solved: false,
    preview: 'Trying to bulk up while staying halal. What are your go-to protein sources and meal prep ideas?'
  },
  {
    id: '5',
    title: 'Managing work stress through Islamic practices',
    category: 'Community Support',
    author: 'StressedEngineer',
    timeAgo: '4 days ago',
    replies: 78,
    lastReply: '6h ago',
    pinned: false,
    solved: false,
    preview: 'Work deadlines are overwhelming me. How do you brothers and sisters find peace through dua and dhikr?'
  },
  {
    id: '6',
    title: 'Understanding the concept of "Ihsan" - scholarly discussion',
    category: 'Ask a Scholar',
    author: 'Scholar_Ahmad',
    timeAgo: '1 week ago',
    replies: 156,
    lastReply: '1 day ago',
    pinned: false,
    solved: true,
    isScholarly: true,
    preview: 'Deep dive into the concept of Ihsan and how it applies to our daily worship and character development...'
  }
];



const messagesList = [
  {
    id: '1',
    user: 'Ahmad_99',
    time: '10:30 AM',
    lastMessage: 'Thank you for your support with the book recommendation! 📚',
    unread: true,
  },
  {
    id: '2',
    user: 'Fatima.Learns',
    time: 'Yesterday',
    lastMessage: 'Looking forward to the discussion about morning routines.',
    unread: false,
  },
  {
    id: '3',
    user: 'Yusuf_Habits', 
    time: '3/6/24',
    lastMessage: '🎵 Voice message (0:45)',
    unread: false,
  },
  {
    id: '4',
    user: 'Maryam.Reflects',
    time: '3/1/24',
    lastMessage: '📎 Shared a document: "Daily_Dhikr_Guide.pdf"',
    unread: false,
  },
  {
    id: '5',
    user: 'Omar.Journey',
    time: '2/28/24',
    lastMessage: '📷 Photo',
    unread: false,
  },
];

// Helper functions for post types
const getPostTypeColor = (type: string, colors: any) => {
  switch (type) {
    case 'milestone': return colors.success;
    case 'moment': return colors.primary;
    case 'progress': return colors.secondary;
    case 'reflection': return colors.primary + 'AA';
    case 'achievement': return colors.success;
    default: return colors.primary;
  }
};

const getPostTypeLabel = (type: string) => {
  switch (type) {
    case 'milestone': return '🎯 Milestone';
    case 'moment': return '✨ Moment';
    case 'progress': return '💪 Progress';
    case 'reflection': return '💭 Reflection';
    case 'achievement': return '🏆 Achievement';
    default: return '📝 Update';
  }
};

export default function CommunityScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { user } = useAuth();
  
  // Initialize auth helper for API calls
  useAuthHelper();
  const [activeTab, setActiveTab] = useState<TabType>('Feed');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [showChatScreen, setShowChatScreen] = useState(false);
  const [showEnhancedChat, setShowEnhancedChat] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState<'Islamic Practice & Spirituality' | 'Book Study & Reflection' | 'Habit Building & Discipline' | 'Healthy Living (Halal Lifestyle)' | 'Community Support' | 'Ask a Scholar'>('Islamic Practice & Spirituality');
  const [searchMessages, setSearchMessages] = useState('');
  const [postType, setPostType] = useState<'text' | 'image' | 'poll'>('text');
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [showPollOptions, setShowPollOptions] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageCaption, setImageCaption] = useState('');
  
  // Real data state
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [isLoadingDiscussions, setIsLoadingDiscussions] = useState(true);
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  const loadPosts = useCallback(async () => {
    try {
      setIsLoadingPosts(true);
      console.log('📝 Loading posts...');
      const response = await communityService.getPosts();
      console.log('Posts response:', response);
      if (response.success && response.data) {
        console.log('✅ Posts loaded successfully:', response.data.posts.length, 'posts');
        setPosts(response.data.posts);
      } else {
        console.error('❌ Failed to load posts:', response.error);
      }
    } catch (error) {
      console.error('❌ Error loading posts:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  }, []);

  const loadDiscussions = useCallback(async () => {
    try {
      setIsLoadingDiscussions(true);
      console.log('💬 Loading discussions...');
      const response = await communityService.getDiscussions();
      console.log('Discussions response:', response);
      if (response.success && response.data) {
        console.log('✅ Discussions loaded successfully:', response.data.discussions.length, 'discussions');
        setDiscussions(response.data.discussions);
      } else {
        console.error('❌ Failed to load discussions:', response.error);
      }
    } catch (error) {
      console.error('❌ Error loading discussions:', error);
    } finally {
      setIsLoadingDiscussions(false);
    }
  }, []);

  const loadConversations = useCallback(async (skipLoadingState = false) => {
    try {
      if (!skipLoadingState) {
        setIsLoadingConversations(true);
      }
      const response = await communityService.getConversations();
      if (response.success && response.data) {
        setConversations(response.data.conversations);
        
        // Calculate total unread count
        const totalUnread = response.data.conversations.reduce((sum: number, conv: any) => {
          return sum + (conv.unreadCount || 0);
        }, 0);
        setTotalUnreadCount(totalUnread);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      if (!skipLoadingState) {
        setIsLoadingConversations(false);
      }
    }
  }, []);

  // Load data on component mount and tab changes
  useEffect(() => {
    // Only load data for the current active tab to improve performance
    if (activeTab === 'Feed' && posts.length === 0) {
      loadPosts();
    } else if (activeTab === 'Discuss' && discussions.length === 0) {
      loadDiscussions();
    } else if (activeTab === 'Messages') {
      loadConversations();
    }
  }, [activeTab, posts.length, discussions.length, loadPosts, loadDiscussions, loadConversations]);

  const handleCreatePost = useCallback(async () => {
    if (!user) {
      alert('Please log in to create a post');
      return;
    }

    // Validate based on post type
    if (postType === 'text' && !newPostContent.trim()) {
      alert('Please enter some content for your post');
      return;
    }
    
    if (postType === 'poll' && (!pollQuestion.trim() || pollOptions.filter(opt => opt.trim()).length < 2)) {
      alert('Please provide a poll question and at least 2 options');
      return;
    }

    if (postType === 'image' && !selectedImage) {
      alert('Please select an image for your post');
      return;
    }

    try {
      setIsCreatingPost(true);
      console.log('Creating post...', { user: user.id, content: newPostContent, type: postType });
      
      const postData: CreatePostRequest = {
        content: newPostContent,
        type: postType,
        isPublic: true,
      };

      if (postType === 'poll') {
        postData.poll = {
          question: pollQuestion,
          options: pollOptions.filter(opt => opt.trim()),
        };
      }

      if (postType === 'image' && selectedImage) {
        postData.imageUrl = selectedImage;
        postData.imageCaption = imageCaption;
      }

      console.log('Sending post data:', postData);
      const response = await communityService.createPost(postData);
      console.log('Post creation response:', response);
      
      if (response.success) {
        console.log('✅ Post created successfully');
        // Close modal and reset form
        setShowNewPostModal(false);
        setNewPostContent('');
        setPostType('text');
        setPollQuestion('');
        setPollOptions(['', '']);
        setShowPollOptions(false);
        setSelectedImage(null);
        setImageCaption('');
        
        // Reload posts
        await loadPosts();
        alert('Post created successfully!');
      } else {
        console.error('❌ Post creation failed:', response.error);
        alert(`Failed to create post: ${response.error}`);
      }
    } catch (error) {
      console.error('❌ Error creating post:', error);
      alert(`Failed to create post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreatingPost(false);
    }
  }, [user, newPostContent, postType, pollQuestion, pollOptions, selectedImage, imageCaption, loadPosts]);

  const handleLikePost = useCallback(async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.hasLiked) {
        await communityService.unlikePost(postId);
      } else {
        await communityService.likePost(postId);
      }

      // Update local state optimistically
      setPosts(prevPosts => 
        prevPosts.map((p: CommunityPost) => 
          p.id === postId 
            ? { 
                ...p, 
                hasLiked: !p.hasLiked,
                likes: p.hasLiked ? p.likes - 1 : p.likes + 1
              }
            : p
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  }, [posts]);

  const handleVoteOnPoll = useCallback(async (postId: string, optionId: string) => {
    try {
      await communityService.voteOnPoll(postId, optionId);
      // Reload posts to get updated poll data
      loadPosts();
    } catch (error: any) {
      console.error('Error voting on poll:', error);
      
      // Handle duplicate vote error gracefully
      if (error?.message?.includes('duplicate key value') || error?.details?.includes('already exists')) {
        // User already voted on this option, just reload to show current state
        loadPosts();
      } else {
        // Show error for other types of errors
        alert('Failed to vote on poll. Please try again.');
      }
    }
  }, [loadPosts]);

  const handleCreateTopic = useCallback(async (title: string, content: string, category: string) => {
    if (!user || !title.trim() || !content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    try {
      setIsCreatingTopic(true);
      console.log('Creating discussion...', { user: user.id, title });
      
      const topicData = {
        title: title.trim(),
        content: content.trim(),
        category: category as any, // Cast to any to handle custom categories
        tags: []
      };

      console.log('Sending discussion data:', topicData);
      const response = await communityService.createDiscussion(topicData);
      console.log('Discussion creation response:', response);
      
      if (response.success) {
        console.log('✅ Discussion created successfully');
        // Close modal and reset form
        setShowNewTopicModal(false);
        
        // Reload discussions
        await loadDiscussions();
        alert('Discussion topic created successfully!');
      } else {
        console.error('❌ Discussion creation failed:', response.error);
        alert(`Failed to create discussion: ${response.error}`);
      }
    } catch (error) {
      console.error('❌ Error creating discussion:', error);
      alert(`Failed to create discussion: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreatingTopic(false);
    }
  }, [user, loadDiscussions]);

  const handleReplyToDiscussion = useCallback(async (topicId: string, reply: string): Promise<boolean> => {
    if (!user || !reply.trim()) {
      alert('Please enter a reply');
      return false;
    }
    
    if (isSubmittingReply) {
      return false; // Prevent double submission
    }
    
    try {
      setIsSubmittingReply(true);
      console.log('Replying to discussion:', topicId, reply);
      
      // Call the actual API to save reply to database
      const replyData = {
        discussion_id: topicId,
        content: reply.trim(),
      };
      
      const response = await communityService.replyToDiscussion(replyData);
      
      if (response.success) {
        console.log('✅ Reply saved to database successfully');
        // Reload discussions to get updated counts from database
        await loadDiscussions();
        return true; // Indicate success
      } else {
        console.error('❌ Failed to save reply to database:', response.error);
        alert(`Failed to add reply: ${response.error}`);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Error saving reply to database:', error);
      alert(`Failed to add reply: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    } finally {
      setIsSubmittingReply(false);
    }
  }, [user, isSubmittingReply, loadDiscussions]);

  const handleUserSelected = useCallback(async (selectedUser: ConnectedUser, conversationId?: string) => {
    console.log('🎯 handleUserSelected called with user:', selectedUser.name, 'conversationId:', conversationId);
    
    try {
      let conversation: Conversation;
      
      if (conversationId) {
        // Use the real conversation ID passed from AddUserModal
        console.log('📋 Using conversation ID:', conversationId);
        
        // Check if this conversation already exists in our list
        const existingConversation = conversations.find(conv => conv.id === conversationId);
        
        if (existingConversation) {
          console.log('📋 Found existing conversation in list, using it');
          conversation = existingConversation;
        } else {
          console.log('📋 Creating conversation object for new conversation');
          conversation = {
            id: conversationId,
            participants: [
              { id: selectedUser.id, name: selectedUser.name, avatar: selectedUser.avatar },
              { id: user?.id || 'current-user-id', name: user?.email?.split('@')[0] || 'You', avatar: undefined }
            ],
            lastMessage: {
              content: 'Start a conversation...',
              timestamp: new Date().toISOString(),
              senderId: user?.id || 'current-user-id'
            },
            unreadCount: 0,
            updatedAt: new Date().toISOString()
          };
        }
      } else {
        // This shouldn't happen anymore since AddUserModal always provides conversationId
        console.log('📞 Creating new conversation with user:', selectedUser.id);
        const response = await communityService.createConversation({
          participantIds: [selectedUser.id],
        });

        if (response.success && response.data) {
          conversation = response.data;
        } else {
          alert('Failed to create conversation');
          return;
        }
      }
      
      console.log('📱 Setting selected conversation and showing enhanced chat');
      setSelectedConversation(conversation);
      setShowEnhancedChat(true);
      
      // Refresh conversations to update unread counts
      await loadConversations();
    } catch (error) {
      console.error('Error in handleUserSelected:', error);
      alert('Failed to start conversation');
    }
  }, [user, conversations, loadConversations]);

  const handleDeleteConversation = useCallback(async (conversationId: string) => {
    try {
      console.log('🗑️ Deleting conversation:', conversationId);
      const response = await communityService.deleteConversation(conversationId);
      
      if (response.success) {
        console.log('✅ Conversation deleted successfully');
        // Refresh conversations to update the list
        await loadConversations();
      } else {
        console.error('❌ Failed to delete conversation:', response.error);
        alert(`Failed to delete conversation: ${response.error}`);
      }
    } catch (error) {
      console.error('❌ Error deleting conversation:', error);
      alert('Failed to delete conversation');
    }
  }, [loadConversations]);

  const renderFeedScreen = useMemo(() => (
    <ScrollView 
      style={styles.tabContent} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }} // Add bottom padding for floating tab bar
    >
      {/* Share Something Button */}
      <TouchableOpacity
        style={[styles.shareButton, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => setShowNewPostModal(true)}
      >
        <Text style={[styles.shareButtonText, { color: colors.secondaryText }]}>What's happening in your journey? 🌟</Text>
        <TouchableOpacity style={[styles.shareButtonIcon, { backgroundColor: colors.primary }]}>
          <Ionicons name="add" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Feed Posts */}
      {isLoadingPosts ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: colors.secondaryText }}>Loading posts...</Text>
        </View>
      ) : posts.length === 0 ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: colors.secondaryText }}>No posts yet. Be the first to share!</Text>
        </View>
      ) : (
        posts.map((post) => (
          <FeedPost
          key={post.id}
            post={post}
            onLike={handleLikePost}
            onComment={(postId, comment) => {
              // TODO: Implement comment functionality
              console.log('Comment on post:', postId, comment);
            }}
            onShare={(postId) => {
              // TODO: Implement share functionality
              console.log('Share post:', postId);
            }}
            onVotePoll={handleVoteOnPoll}
          />
        ))
      )}
    </ScrollView>
  ), [colors, isLoadingPosts, posts, handleLikePost, handleVoteOnPoll]);

  const renderDiscussScreen = useMemo(() => (
    <ScrollView 
      style={styles.tabContent} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }} // Add bottom padding for floating tab bar
    >
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Discussion Topics</Text>
        <TouchableOpacity 
          style={[styles.newButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowNewTopicModal(true)}
        >
          <Text style={styles.newButtonText}>New Topic</Text>
        </TouchableOpacity>
      </View>

      {isLoadingDiscussions ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: colors.secondaryText }}>Loading discussions...</Text>
        </View>
      ) : discussions.length === 0 ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: colors.secondaryText }}>No discussions yet. Start a conversation!</Text>
        </View>
      ) : (
        discussions.map((topic) => (
          <DiscussionTopic
          key={topic.id}
            topic={topic}
            onPress={(topicId) => {
              // TODO: Navigate to discussion detail
              console.log('Open discussion:', topicId);
            }}
            onReply={handleReplyToDiscussion}
            isSubmittingReply={isSubmittingReply}
          />
        ))
      )}
    </ScrollView>
  ), [colors, isLoadingDiscussions, discussions, handleReplyToDiscussion, isSubmittingReply]);

  const renderMessagesScreen = useMemo(() => (
    <View style={styles.tabContent}>
      {/* Header with Search and New Chat Button */}
      <View style={styles.messagesHeader}>
        <View style={[styles.searchBarContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.secondaryText} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search messages..."
            placeholderTextColor={colors.secondaryText}
            value={searchMessages}
            onChangeText={setSearchMessages}
          />
          {searchMessages.length > 0 && (
            <TouchableOpacity onPress={() => setSearchMessages('')}>
              <Ionicons name="close-circle" size={20} color={colors.secondaryText} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={[styles.newChatButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowAddUserModal(true)}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.newChatButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      {isLoadingConversations ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: colors.secondaryText }}>Loading conversations...</Text>
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.emptyMessagesContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color={colors.border} />
          <Text style={[styles.emptyMessagesTitle, { color: colors.text }]}>
            No conversations yet
          </Text>
          <Text style={[styles.emptyMessagesText, { color: colors.secondaryText }]}>
            Start a conversation with someone from the community
          </Text>
          <TouchableOpacity 
            style={[styles.startChatButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowAddUserModal(true)}
          >
            <Ionicons name="add" size={16} color="#FFFFFF" />
            <Text style={styles.startChatButtonText}>Start a Chat</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={conversations.filter(conv => 
            searchMessages === '' || 
            conv.participants.some((p: any) => p.name.toLowerCase().includes(searchMessages.toLowerCase())) ||
            conv.lastMessage.content.toLowerCase().includes(searchMessages.toLowerCase())
          )}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 120 }} // Add bottom padding for floating tab bar
          renderItem={({ item, index }) => (
            <SwipeableConversationItem
              item={item}
              index={index}
              onPress={() => {
                setSelectedConversation(item);
                setShowEnhancedChat(true);
              }}
              onDelete={() => handleDeleteConversation(item.id)}
            />
          )}
        />
      )}
    </View>
  ), [colors, searchMessages, isLoadingConversations, conversations, handleDeleteConversation]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Feed':
        return renderFeedScreen();
      case 'Discuss':
        return renderDiscussScreen();
      case 'Messages':
        return renderMessagesScreen();
      default:
        return renderFeedScreen();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Community</Text>
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        {(['Feed', 'Discuss', 'Messages'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && [styles.activeTabButton, { borderBottomColor: colors.primary }]
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <View style={styles.tabButtonContent}>
              <Text
                style={[
                  styles.tabButtonText,
                  { color: colors.secondaryText },
                  activeTab === tab && [styles.activeTabButtonText, { color: colors.primary }]
                ]}
              >
                {tab}
              </Text>
              {tab === 'Messages' && totalUnreadCount > 0 && (
                <View style={[styles.tabUnreadDot, { backgroundColor: colors.primary }]} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {renderTabContent()}

      {/* New Post Modal */}
      <CreatePostModal
        visible={showNewPostModal}
        onClose={() => setShowNewPostModal(false)}
        onSubmit={(content, type, pollData, settings, imageData) => {
          // Store all data for use in handleCreatePost
          setNewPostContent(content);
          setPostType(type);
          setPollQuestion(pollData?.question || '');
          setPollOptions(pollData?.options || ['', '']);
          setSelectedImage(imageData?.uri || null);
          setImageCaption(imageData?.caption || '');
          
          handleCreatePost();
        }}
        isCreating={isCreatingPost}
      />

      {/* New Topic Modal */}
      <CreateTopicModal
        visible={showNewTopicModal}
        onClose={() => setShowNewTopicModal(false)}
        onSubmit={(title, content, category) => {
          handleCreateTopic(title, content, category);
        }}
        isCreating={isCreatingTopic}
      />

      {/* Chat Screen Modal */}
      <Modal
        visible={showChatScreen}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowChatScreen(false)}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.chatHeaderInfo}>
              <Text style={[styles.chatUserName, { color: colors.text }]}>Omar</Text>
              <Text style={[styles.chatStatus, { color: colors.success }]}>Online</Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>
          
          <ScrollView style={styles.chatMessages}>
            {[
              { id: 1, time: '10:25 AM', message: 'Hello there!', sent: false },
              { id: 2, time: '10:26 AM', message: 'Hi! How are you?', sent: true },
              { id: 3, time: '10:30 AM', message: 'I wanted to discuss the latest chapter...', sent: false },
              { id: 4, time: '10:32 AM', message: 'Sure, which part specifically?', sent: true },
            ].map((msg) => (
              <View key={msg.id} style={[styles.messageRow, msg.sent && styles.sentMessageRow]}>
                <View style={[
                  styles.messageBubble,
                  { backgroundColor: msg.sent ? colors.primary : colors.card },
                  msg.sent && styles.sentMessageBubble
                ]}>
                  <Text style={[
                    styles.messageText,
                    { color: msg.sent ? '#FFFFFF' : colors.text }
                  ]}>
                    {msg.message}
                  </Text>
                </View>
                <Text style={[styles.messageTimeStamp, { color: colors.secondaryText }]}>
                  {msg.time}
                </Text>
              </View>
            ))}
          </ScrollView>
          
          <View style={[styles.chatInputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
            <TextInput
              style={[styles.chatInput, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="Type a message..."
              placeholderTextColor={colors.secondaryText}
            />
            <TouchableOpacity style={[styles.sendButton, { backgroundColor: colors.primary }]}>
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Enhanced Chat Screen */}
      {showEnhancedChat && selectedConversation && (
        <Modal
          visible={showEnhancedChat}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <EnhancedChatScreen
            conversationId={selectedConversation.id}
            participantName={selectedConversation.participants[0]?.name || 'Unknown'}
            onClose={() => {
              setShowEnhancedChat(false);
              setSelectedConversation(null);
              // Reload conversations to get updated data
              loadConversations();
            }}
          />
        </Modal>
      )}

      {/* Add User Modal */}
      <AddUserModal
        visible={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onUserSelected={handleUserSelected}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomWidth: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabButtonText: {
    fontWeight: '600',
  },
  tabButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabUnreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  shareButtonText: {
    fontSize: 16,
  },
  shareButtonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  postTypeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  postTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  postImage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 16,
  },
  imageText: {
    fontSize: 12,
    marginTop: 8,
  },
  hashtags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    marginBottom: 16,
  },
  hashtag: {
    fontSize: 12,
    fontWeight: '600',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  newButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  newButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  pollCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  pollQuestion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  pollAuthor: {
    fontSize: 12,
    marginBottom: 16,
  },
  pollOptions: {
    gap: 8,
  },
  pollOption: {
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

  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  messageContent: {
    flex: 1,
    marginLeft: 12,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageUser: {
    fontSize: 16,
    fontWeight: '600',
  },
  messageTime: {
    fontSize: 12,
  },
  lastMessage: {
    fontSize: 14,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
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
    padding: 20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  postInput: {
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  addToPostLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  mediaOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  mediaOption: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postSettings: {
    gap: 12,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  settingText: {
    fontSize: 14,
  },
  chatHeaderInfo: {
    alignItems: 'center',
  },
  chatUserName: {
    fontSize: 16,
    fontWeight: '600',
  },
  chatStatus: {
    fontSize: 12,
  },
  headerSpacer: {
    width: 24,
  },
  chatMessages: {
    flex: 1,
    padding: 16,
  },
  messageRow: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  sentMessageRow: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 4,
  },
  sentMessageBubble: {
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
  },
  messageTimeStamp: {
    fontSize: 10,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  chatInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  },
  discussionMeta: {
    fontSize: 12,
  },
  discussionStats: {
    fontSize: 12,
  },
  hashtagChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    marginRight: 8,
    marginBottom: 8,
  },
  
  // Poll creation styles
  pollCreation: {
    marginTop: 16,
    gap: 12,
  },
  pollLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  pollQuestionInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  pollOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pollOptionInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  removeOptionButton: {
    marginLeft: 8,
    padding: 8,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  addOptionText: {
    fontSize: 14,
    marginLeft: 4,
  },
  
  // Poll display styles (in feed)
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
  pollStats: {
    fontSize: 12,
    textAlign: 'center',
  },
  
  // Topic creation styles
  topicTitleInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  categoryOptions: {
    gap: 8,
    marginTop: 8,
  },
  categoryOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Enhanced messaging styles
  messagesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  addUserButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
    flexShrink: 0, // Prevent the button from shrinking
    minWidth: 60, // Ensure minimum width
  },
  newChatButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyMessagesContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyMessagesTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessagesText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  startChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  startChatButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  lastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
}); 