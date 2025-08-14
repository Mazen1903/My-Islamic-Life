-- Database Schema for Community App
-- This script creates all necessary tables for the community features

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (synced from Clerk)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT,
    name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Posts table
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'text',
    hashtags TEXT[] DEFAULT '{}',
    image_url TEXT,
    image_caption TEXT,
    is_public BOOLEAN DEFAULT true,
    category TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post Likes table
CREATE TABLE IF NOT EXISTS post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Community Polls table
CREATE TABLE IF NOT EXISTS community_polls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    total_votes INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    allow_multiple_votes BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Poll Options table
CREATE TABLE IF NOT EXISTS poll_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id UUID NOT NULL REFERENCES community_polls(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    votes_count INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Poll Votes table
CREATE TABLE IF NOT EXISTS poll_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id UUID NOT NULL REFERENCES community_polls(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(poll_id, option_id, user_id)
);

-- Discussions table
CREATE TABLE IF NOT EXISTS discussions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    is_pinned BOOLEAN DEFAULT false,
    is_solved BOOLEAN DEFAULT false,
    is_scholarly BOOLEAN DEFAULT false,
    replies_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    last_reply_at TIMESTAMP WITH TIME ZONE,
    last_reply_user_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discussion Replies table
CREATE TABLE IF NOT EXISTS discussion_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discussion_id UUID NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    is_accepted_answer BOOLEAN DEFAULT false,
    parent_reply_id UUID REFERENCES discussion_replies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reply Likes table
CREATE TABLE IF NOT EXISTS reply_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reply_id UUID NOT NULL REFERENCES discussion_replies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(reply_id, user_id)
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation Participants table
CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    is_read BOOLEAN DEFAULT false,
    media_url TEXT,
    media_caption TEXT,
    media_duration INTEGER, -- For voice messages in seconds
    media_size INTEGER, -- File size in bytes
    media_file_name TEXT,
    media_mime_type TEXT,
    delivery_status TEXT DEFAULT 'sent',
    reply_to_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_discussions_user_id ON discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_discussions_category ON discussions(category);
CREATE INDEX IF NOT EXISTS idx_discussions_created_at ON discussions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_discussion_id ON discussion_replies(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_user_id ON discussion_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_created_at ON discussion_replies(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_reply_likes_reply_id ON reply_likes(reply_id);
CREATE INDEX IF NOT EXISTS idx_reply_likes_user_id ON reply_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at ASC);

-- Create functions for updating counts
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_posts 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_posts 
        SET likes_count = likes_count - 1 
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_reply_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE discussion_replies 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.reply_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE discussion_replies 
        SET likes_count = likes_count - 1 
        WHERE id = OLD.reply_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic count updates
CREATE TRIGGER trigger_update_post_likes_count
    AFTER INSERT OR DELETE ON post_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_post_likes_count();

CREATE TRIGGER trigger_update_reply_likes_count
    AFTER INSERT OR DELETE ON reply_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_reply_likes_count();

-- Create function to increment reply count
CREATE OR REPLACE FUNCTION increment_reply_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE discussions 
    SET replies_count = replies_count + 1,
        last_reply_at = NOW(),
        last_reply_user_name = (SELECT name FROM users WHERE id = NEW.user_id)
    WHERE id = NEW.discussion_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic reply count updates
CREATE TRIGGER trigger_increment_reply_count
    AFTER INSERT ON discussion_replies
    FOR EACH ROW
    EXECUTE FUNCTION increment_reply_count();

-- Row Level Security (RLS) Policies
-- Note: You may need to enable RLS on tables and create appropriate policies
-- For now, we'll create basic policies for the main tables

-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (you may need to customize these based on your requirements)
-- Users can read all public posts
CREATE POLICY "Users can read public posts" ON community_posts
    FOR SELECT USING (is_public = true);

-- Users can create their own posts
CREATE POLICY "Users can create posts" ON community_posts
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own posts
CREATE POLICY "Users can update own posts" ON community_posts
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Users can read all discussions
CREATE POLICY "Users can read discussions" ON discussions
    FOR SELECT USING (true);

-- Users can create discussions
CREATE POLICY "Users can create discussions" ON discussions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Users can read all replies
CREATE POLICY "Users can read replies" ON discussion_replies
    FOR SELECT USING (true);

-- Users can create replies
CREATE POLICY "Users can create replies" ON discussion_replies
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Users can read conversations they participate in
CREATE POLICY "Users can read conversations" ON conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants 
            WHERE conversation_id = conversations.id 
            AND user_id::text = auth.uid()::text
        )
    );

-- Users can read messages in conversations they participate in
CREATE POLICY "Users can read messages" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants 
            WHERE conversation_id = messages.conversation_id 
            AND user_id::text = auth.uid()::text
        )
    );

-- Users can send messages to conversations they participate in
CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (
        sender_id::text = auth.uid()::text
        AND EXISTS (
            SELECT 1 FROM conversation_participants 
            WHERE conversation_id = messages.conversation_id 
            AND user_id::text = auth.uid()::text
        )
    );

-- Helper function for setting current user context (for RLS)
CREATE OR REPLACE FUNCTION set_current_user_clerk_id(clerk_id TEXT)
RETURNS VOID AS $$
BEGIN
    -- This function can be used to set the current user context for RLS
    -- You may need to implement this based on your authentication setup
    PERFORM set_config('app.current_user_clerk_id', clerk_id, false);
END;
$$ LANGUAGE plpgsql; 