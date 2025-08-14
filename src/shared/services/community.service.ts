import { 
  CommunityPost, 
  Discussion, 
  DiscussionReply,
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
  PostInteraction
} from '@/shared/types';
import { DEV_CONFIG } from '@/shared/config/development';
import { authHelper } from '@/shared/utils/auth-helper';

class CommunityService {
  private baseUrl = DEV_CONFIG.API_BASE_URL;

  // Helper method to simulate API delay in development
  private async mockDelay() {
    if (DEV_CONFIG.ENABLE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, DEV_CONFIG.MOCK_API_DELAY));
    }
  }

  // Helper method to get auth token (when using real API)
  private async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      if (!DEV_CONFIG.ENABLE_MOCK_DATA) {
        // Use the auth helper to get authentication headers
        return await authHelper.getAuthHeaders();
      }
      return { 'Content-Type': 'application/json' };
    } catch (error) {
      console.error('Error getting auth headers:', error);
      return { 'Content-Type': 'application/json' };
    }
  }

  // Helper method to make API calls
  private async apiCall<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      if (DEV_CONFIG.ENABLE_MOCK_DATA) {
        // In development, use mock data
        return this.getMockResponse<T>(endpoint, options);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEV_CONFIG.API_TIMEOUT);
      const authHeaders = await this.getAuthHeaders();

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        signal: controller.signal,
        headers: {
          ...authHeaders,
          ...options?.headers,
        },
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('API call failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Mock response handler for development
  private async getMockResponse<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    await this.mockDelay();

    // Mock data based on endpoint
    if (endpoint.includes('/posts')) {
      return { success: true, data: this.getMockPosts() as T };
    } else if (endpoint.includes('/discussions')) {
      return { success: true, data: this.getMockDiscussions() as T };
    } else if (endpoint.includes('/conversations')) {
      return { success: true, data: this.getMockConversations() as T };
    } else if (endpoint.includes('/replies')) {
      return { success: true, data: this.getMockReplies() as T };
    }

    return { success: true, data: {} as T };
  }

  // Posts API methods
  async getPosts(page = 1, limit = 10): Promise<ApiResponse<PostsResponse>> {
    return this.apiCall<PostsResponse>(`/community/posts?page=${page}&limit=${limit}`);
  }

  async createPost(postData: CreatePostRequest): Promise<ApiResponse<CommunityPost>> {
    return this.apiCall<CommunityPost>('/community/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async updatePost(postId: string, postData: UpdatePostRequest): Promise<ApiResponse<CommunityPost>> {
    return this.apiCall<CommunityPost>(`/community/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  }

  async deletePost(postId: string): Promise<ApiResponse<void>> {
    return this.apiCall<void>(`/community/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  async likePost(postId: string): Promise<ApiResponse<void>> {
    return this.apiCall<void>(`/community/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  async unlikePost(postId: string): Promise<ApiResponse<void>> {
    return this.apiCall<void>(`/community/posts/${postId}/like`, {
      method: 'DELETE',
    });
  }

  async voteOnPoll(postId: string, optionId: string): Promise<ApiResponse<void>> {
    return this.apiCall<void>(`/community/posts/${postId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ optionId }),
    });
  }

  async getPostComments(postId: string): Promise<ApiResponse<Comment[]>> {
    return this.apiCall<Comment[]>(`/community/posts/${postId}/comments`);
  }

  async addComment(postId: string, content: string, parentCommentId?: string): Promise<ApiResponse<Comment>> {
    return this.apiCall<Comment>(`/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parentCommentId }),
    });
  }

  // Discussions API methods
  async getDiscussions(page = 1, limit = 10, category?: string): Promise<ApiResponse<DiscussionsResponse>> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (category) params.append('category', category);
    
    return this.apiCall<DiscussionsResponse>(`/community/discussions?${params.toString()}`);
  }

  async createDiscussion(discussionData: CreateDiscussionRequest): Promise<ApiResponse<Discussion>> {
    return this.apiCall<Discussion>('/community/discussions', {
      method: 'POST',
      body: JSON.stringify(discussionData),
    });
  }

  async getDiscussion(discussionId: string): Promise<ApiResponse<Discussion>> {
    return this.apiCall<Discussion>(`/community/discussions/${discussionId}`);
  }

  async replyToDiscussion(replyData: CreateReplyRequest): Promise<ApiResponse<void>> {
    return this.apiCall<void>('/community/discussions/replies', {
      method: 'POST',
      body: JSON.stringify(replyData),
    });
  }

  async getDiscussionReplies(discussionId: string): Promise<ApiResponse<DiscussionReply[]>> {
    return this.apiCall<DiscussionReply[]>(`/community/discussions/${discussionId}/replies`);
  }

  // Messages API methods
  async getConversations(): Promise<ApiResponse<ConversationsResponse>> {
    return this.apiCall<ConversationsResponse>('/community/conversations');
  }

  async getMessages(conversationId: string): Promise<ApiResponse<Message[]>> {
    return this.apiCall<Message[]>(`/community/conversations/${conversationId}/messages`);
  }

  async sendMessage(messageData: SendMessageRequest): Promise<ApiResponse<Message>> {
    return this.apiCall<Message>('/community/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async markMessageAsRead(messageId: string): Promise<ApiResponse<void>> {
    return this.apiCall<void>(`/community/messages/${messageId}/read`, {
      method: 'PUT',
    });
  }

  // Mock data generators for development
  private getMockPosts(): PostsResponse {
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
        imageUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&h=600&fit=crop',
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
            { id: 'opt1', text: 'Right at Adhan time (70%)', votes: 70, percentage: 70, hasVoted: false },
            { id: 'opt2', text: '10-15 minutes after (20%)', votes: 20, percentage: 20, hasVoted: false },
            { id: 'opt3', text: 'Before sunrise (10%)', votes: 10, percentage: 10, hasVoted: false },
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
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d75df4?w=800&h=600&fit=crop',
        imageCaption: 'Evening golden hour 🌅'
      }
    ];

    return {
      posts: mockPosts,
      pagination: { page: 1, limit: 10, total: mockPosts.length, hasNext: false }
    };
  }

  private getMockDiscussions(): DiscussionsResponse {
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
      discussions: mockDiscussions,
      pagination: { page: 1, limit: 10, total: mockDiscussions.length, hasNext: false }
    };
  }

  private getMockConversations(): ConversationsResponse {
    const mockConversations: Conversation[] = [
      {
        id: '1',
        participants: [
          { id: 'currentUser', name: 'You' },
          { id: 'user5', name: 'Omar.Journey' }
        ],
        lastMessage: {
          content: 'Thank you for your support...',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          senderId: 'user5'
        },
        unreadCount: 1,
        updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        participants: [
          { id: 'currentUser', name: 'You' },
          { id: 'user6', name: 'Aisha.Study' }
        ],
        lastMessage: {
          content: 'Looking forward to the discussion.',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          senderId: 'currentUser'
        },
        unreadCount: 0,
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    return {
      conversations: mockConversations,
      pagination: { page: 1, limit: 10, total: mockConversations.length, hasNext: false }
    };
  }

  private getMockReplies(): DiscussionReply[] {
    const mockReplies: DiscussionReply[] = [
      {
        id: '1',
        discussion_id: '1',
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
        discussion_id: '1',
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
      },
      {
        id: '3',
        discussion_id: '1',
        user_id: 'user3',
        content: 'I struggled with this too when I first converted. What helped me was starting with shorter prayers and gradually building up. Don\'t be too hard on yourself!',
        likes_count: 15,
        is_accepted_answer: false,
        parent_reply_id: undefined,
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        author: {
          id: 'user3',
          name: 'NewMuslim_Brother',
          avatar: undefined
        }
      }
    ];

    return mockReplies;
  }
}

// Export singleton instance
export const communityService = new CommunityService(); 