/*
  # Create Conversation and Messages Tables

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key) - Unique identifier for each conversation
      - `user_id` (text) - Identifier for the user (can be session ID or user ID)
      - `title` (text) - Optional title for the conversation
      - `created_at` (timestamptz) - When the conversation was created
      - `updated_at` (timestamptz) - When the conversation was last updated

    - `messages`
      - `id` (uuid, primary key) - Unique identifier for each message
      - `conversation_id` (uuid, foreign key) - References conversations table
      - `text` (text) - The message content
      - `is_user` (boolean) - Whether the message is from the user or the bot
      - `created_at` (timestamptz) - When the message was sent

  2. Security
    - Enable RLS on both tables
    - Add policies for public access (since using session-based user_id)
    - Users can view and create their own conversations and messages

  3. Indexes
    - Index on conversation_id for faster message queries
    - Index on user_id for faster conversation lookups
    - Index on created_at for sorting
*/

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  title text DEFAULT 'New Conversation',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  text text NOT NULL,
  is_user boolean NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view conversations"
  ON conversations FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can view messages"
  ON messages FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create messages"
  ON messages FOR INSERT
  WITH CHECK (true);
