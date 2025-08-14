import { createClient, SupabaseClient } from "@supabase/supabase-js";
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

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

class SupabaseCommunityService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  // Helper to set RLS context for current user
  private async setUserContext(): Promise<void> {
    const clerkUserId = authHelper.getCurrentUserId();
    if (clerkUserId) {
      try {
        const { error } = await this.supabase.rpc("set_current_user_clerk_id", {
          clerk_id: clerkUserId,
        });
        if (error) {
          // If the function doesn't exist, RLS might be disabled - that's okay
          if (error.code === "PGRST202") {
            console.log(
              "ℹ️ RLS helper function not found - RLS might be disabled (this is fine for testing)"
            );
            return;
          }
          console.error("❌ Error setting user context:", error);
          return;
        }
        console.log("✅ User context set for RLS:", clerkUserId);
      } catch (error) {
        console.error("❌ Error calling set_current_user_clerk_id:", error);
      }
    } else {
      console.warn("⚠️ No clerk user ID found for RLS context");
    }
  }

  // Helper to get current user ID from Clerk (assumes context is already set)
  private async getCurrentUserId(): Promise<string | null> {
    const clerkUserId = authHelper.getCurrentUserId();
    if (!clerkUserId) {
      console.warn("⚠️ No Clerk user ID found");
      return null;
    }

    // Get the user ID from our users table based on clerk_id
    const { data, error } = await this.supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .maybeSingle(); // Use maybeSingle() instead of single() to handle no results gracefully

    if (error) {
      console.error("❌ Error getting user ID:", error);
      return null;
    }

    // If user doesn't exist in Supabase yet, return null
    // The user sync process will create the record
    if (!data) {
      console.log(
        "⚠️ User not found in Supabase, will be synced automatically"
      );
      return null;
    }

    console.log("✅ Found user ID:", data.id);
    return data.id;
  }

  // Sync user from Clerk to Supabase
  async syncUser(clerkUser: any): Promise<void> {
    try {
      console.log("🔄 Syncing user to Supabase:", clerkUser.id);

      // First check if user already exists
      const { data: existingUser, error: checkError } = await this.supabase
        .from("users")
        .select("id")
        .eq("clerk_id", clerkUser.id)
        .maybeSingle();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 = not found, which is OK
        console.error("Error checking existing user:", checkError);
        return;
      }

      if (existingUser) {
        console.log("✅ User already exists in Supabase");
        return;
      }

      // If user doesn't exist, use service role to bypass RLS for user creation
      // For now, we'll try the regular insert and handle the RLS issue
      const { data, error } = await this.supabase
        .from("users")
        .insert({
          clerk_id: clerkUser.id,
          email:
            clerkUser.primaryEmailAddress?.emailAddress ||
            clerkUser.emailAddresses?.[0]?.emailAddress ||
            "",
          name:
            clerkUser.fullName ||
            clerkUser.firstName ||
            clerkUser.username ||
            "User",
          avatar_url: clerkUser.imageUrl,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Error syncing user to Supabase:", error);

        // If it's an RLS error, provide helpful message
        if (error.code === "42501") {
          console.error(
            "💡 RLS Policy Error: You need to disable RLS on users table or fix the policies"
          );
          console.error(
            '💡 Quick fix: Run "ALTER TABLE users DISABLE ROW LEVEL SECURITY;" in Supabase SQL Editor'
          );
        }
        return;
      }

      console.log("✅ User synced to Supabase successfully:", data?.id);
    } catch (error) {
      console.error("❌ Error syncing user to Supabase:", error);
    }
  }

  // Posts API methods
  async getPosts(page = 1, limit = 10): Promise<ApiResponse<PostsResponse>> {
    try {
      const currentUserId = await this.getCurrentUserId(); // This also sets RLS context

      // If user isn't synced yet, still set the context for RLS
      if (!currentUserId) {
        await this.setUserContext();
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      // Get posts with author info and user's like status
      const { data, error, count } = await this.supabase
        .from("community_posts")
        .select(
          `
          *,
          author:users!user_id(id, name, avatar_url),
          post_likes!left(user_id),
          community_polls(
            id,
            question,
            total_votes,
            expires_at,
            allow_multiple_votes,
            poll_options(
              id,
              text,
              votes_count,
              poll_votes!left(user_id)
            )
          )
        `,
          { count: "exact" }
        )
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      const posts: CommunityPost[] =
        data?.map((post) => ({
          id: post.id,
          userId: post.user_id,
          author: {
            id: post.author.id,
            name: post.author.name,
            avatar: post.author.avatar_url,
          },
          content: post.content,
          type: post.type,
          createdAt: post.created_at,
          updatedAt: post.updated_at,
          likes: post.likes_count,
          comments: post.comments_count,
          shares: post.shares_count,
          hashtags: post.hashtags || [],
          hasLiked: currentUserId
            ? post.post_likes?.some(
                (like: any) => like.user_id === currentUserId
              ) || false
            : false,
          imageUrl: post.image_url,
          imageCaption: post.image_caption,
          isPublic: post.is_public,
          category: post.category,
          poll: post.community_polls?.[0]
            ? {
                question: post.community_polls[0].question,
                options:
                  post.community_polls[0].poll_options?.map((option: any) => ({
                    id: option.id,
                    text: option.text,
                    votes: option.votes_count,
                    percentage:
                      post.community_polls[0].total_votes > 0
                        ? Math.round(
                            (option.votes_count /
                              post.community_polls[0].total_votes) *
                              100
                          )
                        : 0,
                    hasVoted: currentUserId
                      ? option.poll_votes?.some(
                          (vote: any) => vote.user_id === currentUserId
                        ) || false
                      : false,
                  })) || [],
                totalVotes: post.community_polls[0].total_votes,
                expiresAt: post.community_polls[0].expires_at,
                allowMultipleVotes:
                  post.community_polls[0].allow_multiple_votes,
              }
            : undefined,
        })) || [];

      return {
        success: true,
        data: {
          posts,
          pagination: {
            page,
            limit,
            total: count || 0,
            hasNext: (count || 0) > to + 1,
          },
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

  async createPost(
    postData: CreatePostRequest
  ): Promise<ApiResponse<CommunityPost>> {
    try {
      // Set user context for RLS first
      await this.setUserContext();

      const userId = await this.getCurrentUserId();
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }

      console.log("📝 Creating post for user:", userId);

      // Create the post
      const { data: post, error: postError } = await this.supabase
        .from("community_posts")
        .insert({
          user_id: userId,
          content: postData.content,
          type: postData.type,
          hashtags: postData.hashtags || [],
          image_url: postData.imageUrl,
          image_caption: postData.imageCaption,
          is_public: postData.isPublic ?? true,
          category: postData.category,
        })
        .select()
        .single();

      if (postError) throw postError;

      // If it's a poll, create poll and options
      if (postData.type === "poll" && postData.poll && post) {
        const { data: pollData, error: pollError } = await this.supabase
          .from("community_polls")
          .insert({
            post_id: post.id,
            question: postData.poll.question,
            expires_at: postData.poll.expiresAt,
            allow_multiple_votes: postData.poll.allowMultipleVotes || false,
          })
          .select()
          .single();

        if (pollError) throw pollError;

        // Create poll options
        const options = postData.poll.options.map((option, index) => ({
          poll_id: pollData.id,
          text: option,
          display_order: index,
        }));

        const { error: optionsError } = await this.supabase
          .from("poll_options")
          .insert(options);

        if (optionsError) throw optionsError;
      }

      // Return the created post (simplified for now)
      const createdPost: CommunityPost = {
        id: post.id,
        userId: post.user_id,
        author: { id: userId, name: "Current User" }, // You'd get this from the user
        content: post.content,
        type: post.type,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        likes: 0,
        comments: 0,
        shares: 0,
        hashtags: post.hashtags || [],
        hasLiked: false,
        isPublic: post.is_public,
      };

      return { success: true, data: createdPost };
    } catch (error) {
      console.error("Error creating post:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create post",
      };
    }
  }

  async likePost(postId: string): Promise<ApiResponse<void>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }

      const { error } = await this.supabase
        .from("post_likes")
        .insert({ post_id: postId, user_id: userId });

      if (error) throw error;
      return { success: true, data: undefined };
    } catch (error) {
      console.error("Error liking post:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to like post",
      };
    }
  }

  async unlikePost(postId: string): Promise<ApiResponse<void>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }

      const { error } = await this.supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);

      if (error) throw error;
      return { success: true, data: undefined };
    } catch (error) {
      console.error("Error unliking post:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to unlike post",
      };
    }
  }

  async voteOnPoll(
    postId: string,
    optionId: string
  ): Promise<ApiResponse<void>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }

      // Get the poll ID from the post
      const { data: poll, error: pollError } = await this.supabase
        .from("community_polls")
        .select("id")
        .eq("post_id", postId)
        .single();

      if (pollError || !poll) throw new Error("Poll not found");

      // Insert the vote
      const { error } = await this.supabase.from("poll_votes").insert({
        poll_id: poll.id,
        option_id: optionId,
        user_id: userId,
      });

      if (error) throw error;
      return { success: true, data: undefined };
    } catch (error) {
      console.error("Error voting on poll:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to vote",
      };
    }
  }

  // Discussions methods
  async getDiscussions(
    page = 1,
    limit = 10,
    category?: string
  ): Promise<ApiResponse<DiscussionsResponse>> {
    try {
      // Set RLS context for proper policy enforcement
      await this.setUserContext();

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = this.supabase
        .from("discussions")
        .select(
          `
          *,
          author:users!user_id(id, name, avatar_url)
        `,
          { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .range(from, to);

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      const discussions: Discussion[] =
        data?.map((discussion) => ({
          id: discussion.id,
          title: discussion.title,
          content: discussion.content,
          category: discussion.category,
          author: {
            id: discussion.author.id,
            name: discussion.author.name,
            avatar: discussion.author.avatar_url,
          },
          createdAt: discussion.created_at,
          updatedAt: discussion.updated_at,
          replies: discussion.replies_count,
          views: discussion.views_count,
          lastReply: discussion.last_reply_at
            ? {
                authorName: discussion.last_reply_user_name,
                timestamp: discussion.last_reply_at,
              }
            : undefined,
          isPinned: discussion.is_pinned,
          isSolved: discussion.is_solved,
          isScholarly: discussion.is_scholarly,
          tags: discussion.tags || [],
        })) || [];

      return {
        success: true,
        data: {
          discussions,
          pagination: {
            page,
            limit,
            total: count || 0,
            hasNext: (count || 0) > to + 1,
          },
        },
      };
    } catch (error) {
      console.error("Error getting discussions:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get discussions",
      };
    }
  }

  // Conversations methods
  async getConversations(): Promise<ApiResponse<ConversationsResponse>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }

      // Get conversations where the user is a participant
      const { data: userConversations, error: convError } = await this.supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", userId);

      if (convError) throw convError;

      if (!userConversations || userConversations.length === 0) {
        return {
          success: true,
          data: {
            conversations: [],
            pagination: { page: 1, limit: 50, total: 0, hasNext: false },
          },
        };
      }

      const conversationIds = userConversations.map((uc) => uc.conversation_id);

      // Get full conversation data with ALL participants
      const { data, error } = await this.supabase
        .from("conversations")
        .select(
          `
          *,
          conversation_participants(
            user_id,
            users(id, name, avatar_url)
          )
        `
        )
        .in("id", conversationIds)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Get last message for each conversation separately to avoid relationship conflicts
      const conversationsWithMessages = await Promise.all(
        (data || []).map(async (conv) => {
          const { data: lastMessage } = await this.supabase
            .from("messages")
            .select("content, sender_id, created_at")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          return {
            ...conv,
            lastMessage: lastMessage || {
              content: "No messages yet",
              sender_id: "",
              created_at: conv.created_at,
            },
          };
        })
      );

      if (error) throw error;

      // Calculate unread counts for each conversation
      const conversationsWithUnreadCounts = await Promise.all(
        conversationsWithMessages.map(async (conv) => {
          const { data: unreadMessages, error: unreadError } = await this.supabase
            .from("messages")
            .select("id")
            .eq("conversation_id", conv.id)
            .eq("is_read", false)
            .neq("sender_id", userId);

          if (unreadError) {
            console.error("Error getting unread count:", unreadError);
          }

          const unreadCount = unreadMessages?.length || 0;

          // Get all participants and filter out the current user
          const allParticipants = conv.conversation_participants.map(
            (p: any) => ({
              id: p.users.id,
              name: p.users.name,
              avatar: p.users.avatar_url,
            })
          );

          // For display purposes, we want to show the OTHER participants (not the current user)
          const otherParticipants = allParticipants.filter(
            (p: { id: string; name: string; avatar?: string }) => p.id !== userId
          );

          return {
            id: conv.id,
            participants: otherParticipants, // Only show other participants, not the current user
            lastMessage: {
              content: conv.lastMessage.content,
              timestamp: conv.lastMessage.created_at,
              senderId: conv.lastMessage.sender_id,
            },
            unreadCount,
            updatedAt: conv.updated_at,
          };
        })
      );

      const conversations: Conversation[] = conversationsWithUnreadCounts;

      return {
        success: true,
        data: {
          conversations,
          pagination: {
            page: 1,
            limit: 50,
            total: conversations.length,
            hasNext: false,
          },
        },
      };
    } catch (error) {
      console.error("Error getting conversations:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get conversations",
      };
    }
  }

  // Real-time subscriptions (bonus feature!)
  subscribeToPostUpdates(callback: (post: CommunityPost) => void) {
    return this.supabase
      .channel("community_posts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "community_posts",
        },
        (payload) => {
          // Transform and call callback with new post
          console.log("New post:", payload.new);
          // You'd transform this to CommunityPost format
        }
      )
      .subscribe();
  }

  // Placeholder methods for other operations
  async updatePost(
    postId: string,
    postData: UpdatePostRequest
  ): Promise<ApiResponse<CommunityPost>> {
    // Implementation for updating posts
    return { success: false, error: "Not implemented yet" };
  }

  async deletePost(postId: string): Promise<ApiResponse<void>> {
    // Implementation for deleting posts
    return { success: false, error: "Not implemented yet" };
  }

  async getPostComments(postId: string): Promise<ApiResponse<Comment[]>> {
    // Implementation for getting comments
    return { success: false, error: "Not implemented yet" };
  }

  async addComment(
    postId: string,
    content: string,
    parentCommentId?: string
  ): Promise<ApiResponse<Comment>> {
    // Implementation for adding comments
    return { success: false, error: "Not implemented yet" };
  }

  async createDiscussion(
    discussionData: CreateDiscussionRequest
  ): Promise<ApiResponse<Discussion>> {
    try {
      // Set user context for RLS first
      await this.setUserContext();

      const userId = await this.getCurrentUserId();
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }

      console.log("💬 Creating discussion for user:", userId);

      // Create the discussion
      const { data: discussion, error: discussionError } = await this.supabase
        .from("discussions")
        .insert({
          user_id: userId,
          title: discussionData.title,
          content: discussionData.content,
          category: discussionData.category,
          tags: discussionData.tags || [],
          is_pinned: false,
          is_solved: false,
          is_scholarly: false,
        })
        .select(
          `
          *,
          author:users!user_id(id, name, avatar_url)
        `
        )
        .single();

      if (discussionError) throw discussionError;

      // Return the created discussion
      const createdDiscussion: Discussion = {
        id: discussion.id,
        title: discussion.title,
        content: discussion.content,
        category: discussion.category,
        author: {
          id: discussion.author.id,
          name: discussion.author.name,
          avatar: discussion.author.avatar_url,
        },
        createdAt: discussion.created_at,
        updatedAt: discussion.updated_at,
        replies: 0,
        views: 0,
        isPinned: discussion.is_pinned,
        isSolved: discussion.is_solved,
        isScholarly: discussion.is_scholarly,
        tags: discussion.tags || [],
      };

      return { success: true, data: createdDiscussion };
    } catch (error) {
      console.error("Error creating discussion:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create discussion",
      };
    }
  }

  async getDiscussion(discussionId: string): Promise<ApiResponse<Discussion>> {
    // Implementation for getting single discussion
    return { success: false, error: "Not implemented yet" };
  }

  async replyToDiscussion(
    replyData: CreateReplyRequest
  ): Promise<ApiResponse<void>> {
    try {
      // Set user context for RLS first
      await this.setUserContext();

      const userId = await this.getCurrentUserId();
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }

      console.log("💬 Creating reply for discussion:", replyData.discussion_id);
      console.log("💬 User ID:", userId);
      console.log("💬 Reply content:", replyData.content);

      // Create the reply
      const { data: reply, error: replyError } = await this.supabase
        .from("discussion_replies")
        .insert({
          discussion_id: replyData.discussion_id,
          user_id: userId,
          content: replyData.content,
          parent_reply_id: replyData.parent_reply_id || null,
        })
        .select()
        .single();

      console.log("💬 Reply created:", reply);
      console.log("💬 Reply error:", replyError);

      if (replyError) throw replyError;

      // Update the discussion's reply count and last reply timestamp
      // First get current count
      const { data: currentDiscussion, error: getError } = await this.supabase
        .from("discussions")
        .select("replies_count")
        .eq("id", replyData.discussion_id)
        .single();

      if (getError) {
        console.warn("⚠️ Failed to get current reply count:", getError);
      } else {
        const { error: updateError } = await this.supabase
          .from("discussions")
          .update({
            replies_count: (currentDiscussion?.replies_count || 0) + 1,
            last_reply_at: new Date().toISOString(),
            last_reply_user_name: (await this.getCurrentUserId()) ? 'Current User' : 'Anonymous',
          })
          .eq("id", replyData.discussion_id);

        if (updateError) {
          console.warn("⚠️ Failed to update discussion reply count:", updateError);
          // Don't fail the entire operation if this fails
        }
      }

      return { success: true, data: undefined };
    } catch (error) {
      console.error("Error creating reply:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create reply",
      };
    }
  }

  async getDiscussionReplies(discussionId: string): Promise<ApiResponse<DiscussionReply[]>> {
    try {
      console.log("🔍 Getting replies for discussion:", discussionId);
      
      // Set user context for RLS first
      await this.setUserContext();

      const { data, error } = await this.supabase
        .from("discussion_replies")
        .select(
          `
          *,
          author:users!user_id(id, name, avatar_url)
        `
        )
        .eq("discussion_id", discussionId)
        .order("created_at", { ascending: true });

      console.log("🔍 Raw data from database:", data);
      console.log("🔍 Database error:", error);

      if (error) throw error;

      const replies: DiscussionReply[] =
        data?.map((reply) => ({
          id: reply.id,
          discussion_id: reply.discussion_id,
          user_id: reply.user_id,
          content: reply.content,
          likes_count: reply.likes_count || 0,
          is_accepted_answer: reply.is_accepted_answer || false,
          parent_reply_id: reply.parent_reply_id,
          created_at: reply.created_at,
          updated_at: reply.updated_at,
          author: reply.author ? {
            id: reply.author.id,
            name: reply.author.name,
            avatar: reply.author.avatar_url,
          } : undefined,
        })) || [];

      return { success: true, data: replies };
    } catch (error) {
      console.error("Error getting discussion replies:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get discussion replies",
      };
    }
  }

  async getMessages(conversationId: string): Promise<ApiResponse<Message[]>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }

      const { data, error } = await this.supabase
        .from("messages")
        .select(
          `
          *,
          sender:users!sender_id(id, name, avatar_url)
        `
        )
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const messages: Message[] =
        data?.map((msg) => ({
          id: msg.id,
          senderId: msg.sender_id,
          receiverId: "", // Not applicable for group conversations
          content: msg.content,
          createdAt: msg.created_at,
          isRead: msg.is_read,
          messageType: msg.message_type,
          mediaUrl: msg.media_url,
          mediaCaption: msg.media_caption,
          mediaDuration: msg.media_duration,
          mediaSize: msg.media_size,
          mediaFileName: msg.media_file_name,
          mediaMimeType: msg.media_mime_type,
          deliveryStatus: msg.delivery_status || "sent",
          replyToMessageId: msg.reply_to_message_id,
          replyToMessage: undefined, // We'll implement this later if needed
        })) || [];

      // Mark unread messages as read when fetching messages
      await this.markConversationAsRead(conversationId);

      return { success: true, data: messages };
    } catch (error) {
      console.error("Error getting messages:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get messages",
      };
    }
  }

  async sendMessage(
    messageData: SendMessageRequest
  ): Promise<ApiResponse<Message>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }

      // If no conversation ID provided, create a new conversation
      let conversationId = messageData.conversationId;
      if (!conversationId && messageData.receiverId) {
        const conversation = await this.createConversation({
          participantIds: [userId, messageData.receiverId],
          initialMessage: messageData.content,
        });
        if (!conversation.success) {
          return { success: false, error: "Failed to create conversation" };
        }
        conversationId = conversation.data!.id;
      }

      if (!conversationId) {
        return { success: false, error: "No conversation ID provided" };
      }

      const { data: message, error } = await this.supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          content: messageData.content,
          message_type: messageData.messageType || "text",
          media_url: messageData.mediaUrl,
          media_caption: messageData.mediaCaption,
          media_duration: messageData.mediaDuration,
          media_size: messageData.mediaSize,
          media_file_name: messageData.mediaFileName,
          media_mime_type: messageData.mediaMimeType,
          reply_to_message_id: messageData.replyToMessageId,
          delivery_status: "sent",
        })
        .select(
          `
          *,
          sender:users!sender_id(id, name, avatar_url)
        `
        )
        .single();

      if (error) throw error;

      // Update conversation's last message timestamp
      await this.supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      const sentMessage: Message = {
        id: message.id,
        senderId: message.sender_id,
        receiverId: "",
        content: message.content,
        createdAt: message.created_at,
        isRead: false,
        messageType: message.message_type,
        mediaUrl: message.media_url,
        mediaCaption: message.media_caption,
        mediaDuration: message.media_duration,
        mediaSize: message.media_size,
        mediaFileName: message.media_file_name,
        mediaMimeType: message.media_mime_type,
        deliveryStatus: message.delivery_status,
        replyToMessageId: message.reply_to_message_id,
      };

      return { success: true, data: sentMessage };
    } catch (error) {
      console.error("Error sending message:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to send message",
      };
    }
  }

  async markMessageAsRead(messageId: string): Promise<ApiResponse<void>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }

      const { error } = await this.supabase
        .from("messages")
        .update({
          is_read: true,
          delivery_status: "read",
        })
        .eq("id", messageId)
        .neq("sender_id", userId); // Don't mark own messages as read

      if (error) throw error;
      return { success: true, data: undefined };
    } catch (error) {
      console.error("Error marking message as read:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to mark message as read",
      };
    }
  }

  async markConversationAsRead(conversationId: string): Promise<ApiResponse<void>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }

      // Mark all unread messages in this conversation as read
      const { error } = await this.supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", userId) // Only mark messages from other users as read
        .eq("is_read", false);

      if (error) throw error;

      return { success: true, data: undefined };
    } catch (error) {
      console.error("Error marking conversation as read:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to mark conversation as read",
      };
    }
  }

  // New methods for user discovery and connections
  async searchUsers(
    query: string,
    page = 1,
    limit = 20
  ): Promise<ApiResponse<UserSearchResponse>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await this.supabase
        .from("users")
        .select("id, name, avatar_url, bio, updated_at", { count: "exact" })
        .neq("id", userId) // Exclude current user
        .or(`name.ilike.%${query}%, email.ilike.%${query}%`)
        .order("name")
        .range(from, to);

      if (error) throw error;

      const users: ConnectedUser[] =
        data?.map((user) => ({
          id: user.id,
          name: user.name,
          avatar: user.avatar_url,
          isOnline: false, // You'd implement real-time presence
          lastSeen: user.updated_at,
          bio: user.bio,
        })) || [];

      return {
        success: true,
        data: {
          users,
          pagination: {
            page,
            limit,
            total: count || 0,
            hasNext: (count || 0) > to + 1,
          },
        },
      };
    } catch (error) {
      console.error("Error searching users:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to search users",
      };
    }
  }

  async createConversation(
    data: CreateConversationRequest
  ): Promise<ApiResponse<Conversation>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }

      // Check if conversation already exists between these participants
      const participantIds = [...data.participantIds];
      if (!participantIds.includes(userId)) {
        participantIds.push(userId);
      }

      // For 1-on-1 conversations, check if one already exists
      if (participantIds.length === 2) {
        // First, get all conversations that include the current user
        const { data: userConversations, error: userConvError } = await this.supabase
          .from("conversation_participants")
          .select(`
            conversation_id,
            conversations!inner(id, updated_at)
          `)
          .eq("user_id", userId);

        if (!userConvError && userConversations) {
          // Get conversation IDs that include the current user
          const userConvIds = userConversations.map(uc => uc.conversation_id);
          
          // Check if any of these conversations also include the other participant
          const { data: existingConv, error: checkError } = await this.supabase
            .from("conversation_participants")
            .select(`
              conversation_id,
              conversations!inner(id, updated_at)
            `)
            .in("conversation_id", userConvIds)
            .eq("user_id", participantIds.find(id => id !== userId));

                     if (!checkError && existingConv && existingConv.length > 0) {
             // Return existing conversation
             const conv = existingConv[0];
             return {
               success: true,
               data: {
                 id: conv.conversation_id,
                 participants: [],
                 lastMessage: { content: "", timestamp: "", senderId: "" },
                 unreadCount: 0,
                 updatedAt: new Date().toISOString(),
               },
             };
           }
        }
      }

      // Create new conversation
      const { data: conversation, error: convError } = await this.supabase
        .from("conversations")
        .insert({
          created_by: userId,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (convError) throw convError;

      // Add participants
      const participants = participantIds.map((participantId) => ({
        conversation_id: conversation.id,
        user_id: participantId,
        joined_at: new Date().toISOString(),
      }));

      const { error: participantsError } = await this.supabase
        .from("conversation_participants")
        .insert(participants);

      if (participantsError) throw participantsError;

      // Send initial message if provided
      if (data.initialMessage) {
        await this.sendMessage({
          conversationId: conversation.id,
          content: data.initialMessage,
          messageType: "text",
        });
      }

      return {
        success: true,
        data: {
          id: conversation.id,
          participants: [],
          lastMessage: {
            content: data.initialMessage || "",
            timestamp: conversation.created_at,
            senderId: userId,
          },
          unreadCount: 0,
          updatedAt: conversation.updated_at,
        },
      };
    } catch (error) {
      console.error("Error creating conversation:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create conversation",
      };
    }
  }

  // Public method to get current user ID for UI components
  async getCurrentDatabaseUserId(): Promise<string | null> {
    return await this.getCurrentUserId();
  }

  // Delete a conversation and all its messages
  async deleteConversation(conversationId: string): Promise<ApiResponse<void>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }

      // First, delete all messages in the conversation
      const { error: messagesError } = await this.supabase
        .from("messages")
        .delete()
        .eq("conversation_id", conversationId);

      if (messagesError) throw messagesError;

      // Then, delete conversation participants
      const { error: participantsError } = await this.supabase
        .from("conversation_participants")
        .delete()
        .eq("conversation_id", conversationId);

      if (participantsError) throw participantsError;

      // Finally, delete the conversation itself
      const { error: conversationError } = await this.supabase
        .from("conversations")
        .delete()
        .eq("id", conversationId);

      if (conversationError) throw conversationError;

      return { success: true, data: undefined };
    } catch (error) {
      console.error("Error deleting conversation:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete conversation",
      };
    }
  }
}

// Export singleton instance
export const supabaseCommunityService = new SupabaseCommunityService();
