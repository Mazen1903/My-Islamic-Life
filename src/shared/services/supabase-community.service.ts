import {
  CommunityPost,
  Discussion,
  Conversation,
  Message,
  CreatePostRequest,
  UpdatePostRequest,
  CreateDiscussionRequest,
  CreateReplyRequest,
  SendMessageRequest,
  PostsResponse,
  DiscussionsResponse,
  ConversationsResponse,
  ApiResponse,
  Comment,
  ConnectedUser,
  UserSearchResponse,
  CreateConversationRequest,
  DiscussionReply,
} from "@/shared/types";
import { authHelper } from "@/shared/utils/auth-helper";

class MockCommunityService {
  // Helper to simulate API delay
  private async mockDelay() {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Helper to get current user ID
  private async getCurrentUserId(): Promise<string | null> {
    const clerkUserId = authHelper.getCurrentUserId();
    return clerkUserId || 'mock-user-id';
  }

  // Sync user (no-op for mock)
  async syncUser(clerkUser: any): Promise<void> {
    console.log('Mock: User synced', clerkUser.id);
  }

  // Posts API methods
  async getPosts(page = 1, limit = 10): Promise<ApiResponse<PostsResponse>> {
    try {
      await this.mockDelay();
      
      const mockPosts: CommunityPost[] = [
        {
          id: '1',
          userId: 'user1',
          author: { id: 'user1', name: 'Ahmad_99', avatar: undefined },
          content: 'Alhamdulillah! Day 21 of reading this book 📖 The Soul section is really opening my heart. May Allah guide us all 🤲',
          type: 'milestone',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          likes: 34,
          comments: 8,
          shares: 2,
          hashtags: ['#Day21', '#BookProgress', '#Alhamdulillah'],
          hasLiked: false,
          isPublic: true,
          category: 'Book Progress'
        },
        {
          id: '2',
          userId: 'user2',
          author: { id: 'user2', name: 'Fatima.Learns', avatar: undefined },
          content: 'Beautiful sunrise during Fajr today 🌅 Starting my morning dhikr routine. "SubhanAllahi wa bihamdihi" 100x ✨',
          type: 'moment',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          likes: 67,
          comments: 12,
          shares: 5,
          hashtags: ['#FajrVibes', '#MorningDhikr'],
          hasLiked: true,
          isPublic: true,
          imageUrl: 'https://images.pexels.com/photos/1431822/pexels-photo-1431822.jpeg?auto=compress&cs=tinysrgb&w=800',
          imageCaption: 'Beautiful sunrise 🌅'
        },
        {
          id: '3',
          userId: 'user3',
          author: { id: 'user3', name: 'Omar_Polls', avatar: undefined },
          content: 'What time do you usually pray Fajr? Trying to build consistency 🤲',
          type: 'poll',
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          likes: 23,
          comments: 15,
          shares: 1,
          hashtags: ['#Fajr', '#Consistency'],
          hasLiked: false,
          isPublic: true,
          poll: {
            question: 'What time do you usually pray Fajr?',
            options: [
              { id: 'opt1', text: 'Right at Adhan time', votes: 70, percentage: 70, hasVoted: false },
              { id: 'opt2', text: '10-15 minutes after', votes: 20, percentage: 20, hasVoted: false },
              { id: 'opt3', text: 'Before sunrise', votes: 10, percentage: 10, hasVoted: false },
            ],
            totalVotes: 100,
            allowMultipleVotes: false,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        },
        {
          id: '4',
          userId: 'user4',
          author: { id: 'user4', name: 'Sara_Photography', avatar: undefined },
          content: 'Captured this beautiful moment during my evening walk 🚶‍♀️ The golden hour light was perfect for reflection',
          type: 'image',
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          likes: 45,
          comments: 6,
          shares: 3,
          hashtags: ['#GoldenHour', '#Reflection', '#Photography'],
          hasLiked: false,
          isPublic: true,
          imageUrl: 'https://images.pexels.com/photos/1431822/pexels-photo-1431822.jpeg?auto=compress&cs=tinysrgb&w=800',
          imageCaption: 'Evening golden hour 🌅'
        }
      ];

      return {
        success: true,
        data: {
          posts: mockPosts,
          pagination: { page, limit, total: mockPosts.length, hasNext: false }
        },
      };
    } catch (error) {
      console.error("Error getting posts:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get posts",
      };
    }
  }

  async createPost(postData: CreatePostRequest): Promise<ApiResponse<CommunityPost>> {
    try {
      await this.mockDelay();
      
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }

      const newPost: CommunityPost = {
        id: Date.now().toString(),
        userId,
        author: { id: userId, name: 'Current User' },
        content: postData.content,
        type: postData.type,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0,
        comments: 0,
        shares: 0,
        hashtags: postData.hashtags || [],
        hasLiked: false,
        isPublic: postData.isPublic ?? true,
        category: postData.category,
        imageUrl: postData.imageUrl,
        imageCaption: postData.imageCaption,
        poll: postData.poll ? {
          question: postData.poll.question,
          options: postData.poll.options.map((option, index) => ({
            id: `opt${index + 1}`,
            text: option,
            votes: 0,
            percentage: 0,
            hasVoted: false,
          })),
          totalVotes: 0,
          allowMultipleVotes: postData.poll.allowMultipleVotes || false,
          expiresAt: postData.poll.expiresAt,
        } : undefined,
      };

      return { success: true, data: newPost };
    } catch (error) {
      console.error("Error creating post:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create post",
      };
    }
  }

  async likePost(postId: string): Promise<ApiResponse<void>> {
    await this.mockDelay();
    console.log('Mock: Liked post', postId);
    return { success: true, data: undefined };
  }

  async unlikePost(postId: string): Promise<ApiResponse<void>> {
    await this.mockDelay();
    console.log('Mock: Unliked post', postId);
    return { success: true, data: undefined };
  }

  async voteOnPoll(postId: string, optionId: string): Promise<ApiResponse<void>> {
    await this.mockDelay();
    console.log('Mock: Voted on poll', postId, optionId);
    return { success: true, data: undefined };
  }

  // Discussions methods
  async getDiscussions(page = 1, limit = 10, category?: string): Promise<ApiResponse<DiscussionsResponse>> {
    try {
      await this.mockDelay();
      
      const mockDiscussions: Discussion[] = [
        {
          id: '1',
          title: 'How to maintain focus during long prayers?',
          content: 'I recently converted to Islam and I\'m struggling to maintain concentration during Maghrib and Isha prayers...',
          category: 'Islamic Practice & Spirituality',
          author: { id: 'user4', name: 'NewMuslim_Sister' },
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          replies: 47,
          views: 156,
          lastReply: { authorName: 'Scholar_Ahmad', timestamp: '15min ago' },
          isPinned: false,
          isSolved: true,
          tags: ['prayer', 'focus', 'new-muslim']
        },
        {
          id: '2',
          title: 'Chapter 4 Discussion: "Disciplining the Nafs" - Your thoughts?',
          content: 'Let\'s discuss the key concepts from Chapter 4. What strategies resonated with you for controlling desires?',
          category: 'Book Study & Reflection',
          author: { id: 'admin1', name: 'BookClub_Admin' },
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          replies: 89,
          views: 234,
          lastReply: { authorName: 'Yusuf_Reader', timestamp: '2h ago' },
          isPinned: true,
          isSolved: false,
          tags: ['book-study', 'nafs', 'self-discipline']
        }
      ];

      return {
        success: true,
        data: {
          discussions: mockDiscussions,
          pagination: { page, limit, total: mockDiscussions.length, hasNext: false }
        },
      };
    } catch (error) {
      console.error("Error getting discussions:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get discussions",
      };
    }
  }

  async createDiscussion(discussionData: CreateDiscussionRequest): Promise<ApiResponse<Discussion>> {
    try {
      await this.mockDelay();
      
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }

      const newDiscussion: Discussion = {
        id: Date.now().toString(),
        title: discussionData.title,
        content: discussionData.content,
        category: discussionData.category,
        author: { id: userId, name: 'Current User' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        replies: 0,
        views: 0,
        isPinned: false,
        isSolved: false,
        isScholarly: false,
        tags: discussionData.tags || [],
      };

      return { success: true, data: newDiscussion };
    } catch (error) {
      console.error("Error creating discussion:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create discussion",
      };
    }
  }

  async replyToDiscussion(replyData: CreateReplyRequest): Promise<ApiResponse<void>> {
    await this.mockDelay();
    console.log('Mock: Reply created for discussion', replyData.discussion_id);
    return { success: true, data: undefined };
  }

  async getDiscussionReplies(discussionId: string): Promise<ApiResponse<DiscussionReply[]>> {
    try {
      await this.mockDelay();
      
      const mockReplies: DiscussionReply[] = [
        {
          id: '1',
          discussion_id: discussionId,
          user_id: 'user1',
          content: 'I found that focusing on the meaning of the words really helps. Try reciting slowly and understanding what you\'re saying.',
          likes_count: 12,
          is_accepted_answer: true,
          parent_reply_id: undefined,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          author: {
            id: 'user1',
            name: 'Scholar_Ahmad',
            avatar: undefined
          }
        },
        {
          id: '2',
          discussion_id: discussionId,
          user_id: 'user2',
          content: 'Also, try to find a quiet place and minimize distractions. I found that praying in a dedicated prayer space helps a lot.',
          likes_count: 8,
          is_accepted_answer: false,
          parent_reply_id: undefined,
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          author: {
            id: 'user2',
            name: 'Fatima.Learns',
            avatar: undefined
          }
        }
      ];

      return { success: true, data: mockReplies };
    } catch (error) {
      console.error("Error getting discussion replies:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get discussion replies",
      };
    }
  }

  // Conversations methods
  async getConversations(): Promise<ApiResponse<ConversationsResponse>> {
    try {
      await this.mockDelay();
      
      const mockConversations: Conversation[] = [
        {
          id: '1',
          participants: [
            { id: 'user5', name: 'Omar.Journey' }
          ],
          lastMessage: {
            content: 'Thank you for your support with the book recommendation! 📚',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            senderId: 'user5'
          },
          unreadCount: 1,
          updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          participants: [
            { id: 'user6', name: 'Aisha.Study' }
          ],
          lastMessage: {
            content: 'Looking forward to the discussion about morning routines.',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            senderId: 'mock-user-id'
          },
          unreadCount: 0,
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      return {
        success: true,
        data: {
          conversations: mockConversations,
          pagination: { page: 1, limit: 50, total: mockConversations.length, hasNext: false }
        },
      };
    } catch (error) {
      console.error("Error getting conversations:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get conversations",
      };
    }
  }

  async getMessages(conversationId: string): Promise<ApiResponse<Message[]>> {
    try {
      await this.mockDelay();
      
      const mockMessages: Message[] = [
        {
          id: '1',
          senderId: 'user5',
          receiverId: 'mock-user-id',
          content: 'Hello! How are you doing with the book?',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          messageType: 'text',
          deliveryStatus: 'read'
        },
        {
          id: '2',
          senderId: 'mock-user-id',
          receiverId: 'user5',
          content: 'Great! I\'m on chapter 4 now. Really enjoying it.',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          messageType: 'text',
          deliveryStatus: 'read'
        },
        {
          id: '3',
          senderId: 'user5',
          receiverId: 'mock-user-id',
          content: 'Thank you for your support with the book recommendation! 📚',
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          isRead: false,
          messageType: 'text',
          deliveryStatus: 'sent'
        }
      ];

      return { success: true, data: mockMessages };
    } catch (error) {
      console.error("Error getting messages:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get messages",
      };
    }
  }

  async sendMessage(messageData: SendMessageRequest): Promise<ApiResponse<Message>> {
    try {
      await this.mockDelay();
      
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }

      const newMessage: Message = {
        id: Date.now().toString(),
        senderId: userId,
        receiverId: messageData.receiverId || '',
        content: messageData.content,
        createdAt: new Date().toISOString(),
        isRead: false,
        messageType: messageData.messageType || 'text',
        mediaUrl: messageData.mediaUrl,
        mediaCaption: messageData.mediaCaption,
        mediaDuration: messageData.mediaDuration,
        mediaSize: messageData.mediaSize,
        mediaFileName: messageData.mediaFileName,
        mediaMimeType: messageData.mediaMimeType,
        deliveryStatus: 'sent',
        replyToMessageId: messageData.replyToMessageId,
      };

      return { success: true, data: newMessage };
    } catch (error) {
      console.error("Error sending message:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send message",
      };
    }
  }

  async markMessageAsRead(messageId: string): Promise<ApiResponse<void>> {
    await this.mockDelay();
    console.log('Mock: Message marked as read', messageId);
    return { success: true, data: undefined };
  }

  async markConversationAsRead(conversationId: string): Promise<ApiResponse<void>> {
    await this.mockDelay();
    console.log('Mock: Conversation marked as read', conversationId);
    return { success: true, data: undefined };
  }

  async searchUsers(query: string, page = 1, limit = 20): Promise<ApiResponse<UserSearchResponse>> {
    try {
      await this.mockDelay();
      
      const mockUsers: ConnectedUser[] = [
        {
          id: 'user7',
          name: 'Ahmad_Scholar',
          avatar: undefined,
          isOnline: true,
          lastSeen: new Date().toISOString(),
          bio: 'Islamic studies student'
        },
        {
          id: 'user8',
          name: 'Fatima_Reader',
          avatar: undefined,
          isOnline: false,
          lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          bio: 'Love reading and self-development'
        }
      ].filter(user => user.name.toLowerCase().includes(query.toLowerCase()));

      return {
        success: true,
        data: {
          users: mockUsers,
          pagination: { page, limit, total: mockUsers.length, hasNext: false }
        },
      };
    } catch (error) {
      console.error("Error searching users:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to search users",
      };
    }
  }

  async createConversation(data: CreateConversationRequest): Promise<ApiResponse<Conversation>> {
    try {
      await this.mockDelay();
      
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }

      const newConversation: Conversation = {
        id: Date.now().toString(),
        participants: data.participantIds.map(id => ({ id, name: 'User' })),
        lastMessage: {
          content: data.initialMessage || 'Conversation started',
          timestamp: new Date().toISOString(),
          senderId: userId
        },
        unreadCount: 0,
        updatedAt: new Date().toISOString()
      };

      return { success: true, data: newConversation };
    } catch (error) {
      console.error("Error creating conversation:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create conversation",
      };
    }
  }

  async getCurrentDatabaseUserId(): Promise<string | null> {
    return await this.getCurrentUserId();
  }

  async deleteConversation(conversationId: string): Promise<ApiResponse<void>> {
    await this.mockDelay();
    console.log('Mock: Conversation deleted', conversationId);
    return { success: true, data: undefined };
  }

  // Placeholder methods for compatibility
  async updatePost(postId: string, postData: UpdatePostRequest): Promise<ApiResponse<CommunityPost>> {
    return { success: false, error: "Not implemented" };
  }

  async deletePost(postId: string): Promise<ApiResponse<void>> {
    return { success: false, error: "Not implemented" };
  }

  async getPostComments(postId: string): Promise<ApiResponse<Comment[]>> {
    return { success: false, error: "Not implemented" };
  }

  async addComment(postId: string, content: string, parentCommentId?: string): Promise<ApiResponse<Comment>> {
    return { success: false, error: "Not implemented" };
  }

  async getDiscussion(discussionId: string): Promise<ApiResponse<Discussion>> {
    return { success: false, error: "Not implemented" };
  }
}

// Export singleton instance
export const supabaseCommunityService = new MockCommunityService();