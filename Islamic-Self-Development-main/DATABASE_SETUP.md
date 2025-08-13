# Database Setup for Community App

## Overview

This document explains how to set up the database for the community app, including the new discussion replies functionality.

## Database Schema

The database includes the following main tables:

### Core Tables
- `users` - User accounts synced from Clerk
- `community_posts` - Posts in the community feed
- `discussions` - Discussion topics
- `discussion_replies` - **NEW** - Replies to discussions
- `conversations` - Private conversations between users
- `messages` - Messages in conversations

### Supporting Tables
- `post_likes` - Post likes
- `community_polls` - Polls attached to posts
- `poll_options` - Poll options
- `poll_votes` - Poll votes
- `reply_likes` - **NEW** - Reply likes
- `conversation_participants` - Conversation participants

## New Features Implemented

### 1. Discussion Replies
- **Table**: `discussion_replies`
- **Features**:
  - Store replies to discussions
  - Support for nested replies (parent_reply_id)
  - Like system for replies
  - Automatic reply count updates
  - Mark replies as accepted answers

### 2. Reply Likes
- **Table**: `reply_likes`
- **Features**:
  - Like/unlike replies
  - Automatic like count updates via triggers

### 3. Automatic Count Updates
- **Triggers**: Automatically update reply counts when replies are added
- **Functions**: Helper functions for incrementing counts

## Setup Instructions

### 1. Run the Database Schema

Execute the `database-schema.sql` file in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of database-schema.sql
-- This will create all tables, indexes, triggers, and RLS policies
```

### 2. Configure Row Level Security (RLS)

The schema includes basic RLS policies. You may need to customize them based on your requirements:

```sql
-- Example: Disable RLS for testing (not recommended for production)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE discussions DISABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_replies DISABLE ROW LEVEL SECURITY;
```

### 3. Test the Setup

You can test the setup by running these queries:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%discussion%';

-- Check if triggers exist
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

## API Implementation

### New Methods Added

#### 1. `replyToDiscussion(replyData: CreateReplyRequest)`
- **Purpose**: Create a new reply to a discussion
- **Database**: Inserts into `discussion_replies` table
- **Features**: 
  - Updates discussion reply count automatically
  - Updates last reply timestamp
  - Supports nested replies

#### 2. `getDiscussionReplies(discussionId: string)`
- **Purpose**: Get all replies for a discussion
- **Database**: Queries `discussion_replies` with author information
- **Features**:
  - Returns replies with author details
  - Ordered by creation time (oldest first)
  - Includes like counts and accepted answer status

### Usage Example

```typescript
// Create a reply
const replyData = {
  discussion_id: 'discussion-uuid',
  content: 'This is my reply to the discussion',
  parent_reply_id: undefined // For top-level replies
};

const response = await supabaseCommunityService.replyToDiscussion(replyData);

// Get replies for a discussion
const repliesResponse = await supabaseCommunityService.getDiscussionReplies('discussion-uuid');
const replies = repliesResponse.data; // Array of DiscussionReply objects
```

## Frontend Integration

### Components Updated

1. **DiscussionTopic.tsx**
   - Now loads real replies from database
   - Displays reply count from database
   - Handles reply submission

2. **DiscussionDetailModal.tsx**
   - Displays real replies from database
   - Shows reply author information
   - Handles reply creation

3. **Community.tsx**
   - Updated to use real database calls
   - Handles reply submission and loading

### Mock Data

The community service includes mock data for development:

```typescript
// Mock replies for testing
private getMockReplies(): DiscussionReply[] {
  return [
    {
      id: '1',
      discussion_id: '1',
      user_id: 'user1',
      content: 'I found that focusing on the meaning...',
      likes_count: 12,
      is_accepted_answer: true,
      author: { id: 'user1', name: 'Scholar_Ahmad' }
    }
    // ... more mock replies
  ];
}
```

## Database Triggers and Functions

### Automatic Count Updates

1. **Reply Count Trigger**
   - Automatically increments `replies_count` when a reply is added
   - Updates `last_reply_at` and `last_reply_user_name`

2. **Like Count Triggers**
   - Updates post like counts automatically
   - Updates reply like counts automatically

### Functions

1. `increment_reply_count()` - Increments discussion reply count
2. `update_post_likes_count()` - Updates post like counts
3. `update_reply_likes_count()` - Updates reply like counts

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**
   ```sql
   -- If you get RLS errors, temporarily disable RLS for testing
   ALTER TABLE discussion_replies DISABLE ROW LEVEL SECURITY;
   ```

2. **Trigger Errors**
   ```sql
   -- Check if triggers exist
   SELECT trigger_name FROM information_schema.triggers;
   
   -- Recreate triggers if needed
   DROP TRIGGER IF EXISTS trigger_increment_reply_count ON discussion_replies;
   CREATE TRIGGER trigger_increment_reply_count
       AFTER INSERT ON discussion_replies
       FOR EACH ROW
       EXECUTE FUNCTION increment_reply_count();
   ```

3. **Function Errors**
   ```sql
   -- Recreate functions if needed
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
   ```

### Testing the Implementation

1. **Create a test discussion**
2. **Add replies to the discussion**
3. **Check that reply counts update automatically**
4. **Verify that replies appear in the UI**

## Next Steps

### Potential Enhancements

1. **Reply Editing**
   - Add edit functionality for replies
   - Add edit timestamps

2. **Reply Moderation**
   - Add moderation flags
   - Add report functionality

3. **Advanced Reply Features**
   - Rich text formatting
   - Image attachments
   - Code blocks for technical discussions

4. **Reply Notifications**
   - Email notifications for replies
   - Push notifications
   - In-app notifications

### Performance Optimizations

1. **Pagination**
   - Implement pagination for large reply lists
   - Add cursor-based pagination

2. **Caching**
   - Cache frequently accessed replies
   - Implement Redis for caching

3. **Search**
   - Add full-text search for replies
   - Add reply search functionality

## Security Considerations

1. **Input Validation**
   - Validate reply content length
   - Sanitize HTML content
   - Prevent XSS attacks

2. **Rate Limiting**
   - Limit reply creation rate
   - Prevent spam replies

3. **Content Moderation**
   - Add content filtering
   - Implement automated moderation

## Support

If you encounter issues:

1. Check the browser console for errors
2. Verify database connections
3. Test with mock data first
4. Check RLS policies
5. Verify trigger functions exist

The implementation is now complete and ready for testing! 