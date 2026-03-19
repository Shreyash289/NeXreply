import { supabase } from '../lib/supabase';

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  text: string;
  is_user: boolean;
  created_at: string;
}

export const createConversation = async (userId: string): Promise<Conversation | null> => {
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: userId })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating conversation:', error);
    return null;
  }

  return data;
};

export const saveMessage = async (
  conversationId: string,
  text: string,
  isUser: boolean
): Promise<Message | null> => {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      text,
      is_user: isUser,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error saving message:', error);
    return null;
  }

  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  return data;
};

export const loadMessages = async (conversationId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error loading messages:', error);
    return [];
  }

  return data || [];
};

export const loadConversations = async (userId: string): Promise<Conversation[]> => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error loading conversations:', error);
    return [];
  }

  return data || [];
};
