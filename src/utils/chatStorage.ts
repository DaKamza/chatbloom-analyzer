
import { supabase } from '@/integrations/supabase/client';
import { ParsedChat } from './chatParser';
import { ChatAnalysis } from './analyzeData';
import { toast } from '@/hooks/use-toast';

// Save chat upload to Supabase
export const saveChatUpload = async (
  parsedChat: ParsedChat, 
  fileName: string, 
  userId?: string
): Promise<string | null> => {
  // If no user ID, don't save
  if (!userId) {
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('chat_uploads')
      .insert({
        user_id: userId,
        chat_data: parsedChat,
        file_name: fileName
      })
      .select('id')
      .single();
      
    if (error) {
      throw error;
    }
    
    toast({
      title: 'Chat Saved',
      description: 'Your chat has been saved to your account.',
    });
    
    return data.id;
  } catch (error) {
    console.error('Error saving chat upload:', error);
    toast({
      title: 'Error Saving Chat',
      description: 'Failed to save your chat. Please try again.',
      variant: 'destructive',
    });
    return null;
  }
};

// Save chat analysis to Supabase
export const saveChatAnalysis = async (
  analysis: ChatAnalysis, 
  chatUploadId: string,
  userId?: string
): Promise<void> => {
  // If no user ID or chat upload ID, don't save
  if (!userId || !chatUploadId) {
    return;
  }
  
  try {
    const { error } = await supabase
      .from('chat_analysis')
      .insert({
        user_id: userId,
        chat_upload_id: chatUploadId,
        analysis_data: analysis
      });
      
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error saving chat analysis:', error);
    // No need for toast here as it's a background operation
  }
};

// Get user's saved chat uploads
export const getUserChatUploads = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('chat_uploads')
      .select('id, file_name, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching user chat uploads:', error);
    return [];
  }
};

// Get a specific chat upload
export const getChatUpload = async (uploadId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('chat_uploads')
      .select('id, file_name, chat_data, created_at')
      .eq('id', uploadId)
      .eq('user_id', userId)
      .single();
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching chat upload:', error);
    return null;
  }
};

// Get analysis for a specific chat upload
export const getChatAnalysis = async (chatUploadId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('chat_analysis')
      .select('analysis_data, created_at')
      .eq('chat_upload_id', chatUploadId)
      .eq('user_id', userId)
      .single();
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching chat analysis:', error);
    return null;
  }
};
