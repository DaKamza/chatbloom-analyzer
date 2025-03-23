
import { ParsedChat, ParsedMessage } from './chatParser';

interface MessageCount {
  [participant: string]: number;
}

interface WordCount {
  [word: string]: number;
}

interface ResponseTime {
  total: number;
  count: number;
  average: number;
}

interface ConversationStarter {
  [participant: string]: number;
}

export interface ChatAnalysis {
  totalMessages: number;
  messageCountByParticipant: MessageCount;
  messagePercentageByParticipant: MessageCount;
  wordCountByParticipant: MessageCount;
  averageMessageLengthByParticipant: MessageCount;
  mostFrequentWords: { word: string; count: number }[];
  mostFrequentWordsPerParticipant: { 
    [participant: string]: { word: string; count: number }[] 
  };
  conversationStarters: {
    [participant: string]: { count: number; percentage: number }
  };
  responseTime: {
    [participant: string]: ResponseTime
  };
  emojiUsage: {
    total: number;
    byParticipant: MessageCount;
  };
  chatDuration: {
    days: number;
    months: number;
    years: number;
  };
}

/**
 * Analyze chat data to extract insights
 */
export const analyzeChatData = (parsedChat: ParsedChat): ChatAnalysis => {
  const { messages, participants } = parsedChat;
  
  // Basic message count
  const messageCountByParticipant: MessageCount = {};
  const wordCountByParticipant: MessageCount = {};
  const messageLengthTotalByParticipant: MessageCount = {};
  const emojiCountByParticipant: MessageCount = {};
  
  // Initialize counters for each participant
  participants.forEach(participant => {
    messageCountByParticipant[participant] = 0;
    wordCountByParticipant[participant] = 0;
    messageLengthTotalByParticipant[participant] = 0;
    emojiCountByParticipant[participant] = 0;
  });
  
  // Word frequency analysis
  const wordFrequency: WordCount = {};
  const wordFrequencyByParticipant: { [participant: string]: WordCount } = {};
  
  participants.forEach(participant => {
    wordFrequencyByParticipant[participant] = {};
  });
  
  // Conversation starter analysis
  const conversationStarters: ConversationStarter = {};
  participants.forEach(participant => {
    conversationStarters[participant] = 0;
  });
  
  // Response time analysis
  const responseTimeByParticipant: { [participant: string]: ResponseTime } = {};
  participants.forEach(participant => {
    responseTimeByParticipant[participant] = { total: 0, count: 0, average: 0 };
  });
  
  // Track last message for conversation starters and response time
  let lastMessageTimestamp: Date | null = null;
  let lastMessageSender: string | null = null;
  let isNewConversation = true;
  
  // Define new conversation as messages more than 3 hours apart
  const NEW_CONVERSATION_THRESHOLD = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
  
  // Process each message
  messages.forEach((message, index) => {
    const { sender, content, words, timestamp, hasEmoji } = message;
    
    // Update message count
    messageCountByParticipant[sender]++;
    
    // Update word count
    wordCountByParticipant[sender] += words.length;
    
    // Update message length for average calculation
    messageLengthTotalByParticipant[sender] += content.length;
    
    // Update emoji count
    if (hasEmoji) {
      emojiCountByParticipant[sender]++;
    }
    
    // Update word frequency
    words.forEach(word => {
      if (word.length > 3) { // Ignore very short words
        // Global word frequency
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        
        // Per participant word frequency
        wordFrequencyByParticipant[sender][word] = 
          (wordFrequencyByParticipant[sender][word] || 0) + 1;
      }
    });
    
    // Check if this is a new conversation
    if (lastMessageTimestamp) {
      const timeDiff = timestamp.getTime() - lastMessageTimestamp.getTime();
      isNewConversation = timeDiff > NEW_CONVERSATION_THRESHOLD;
    }
    
    // Update conversation starters
    if (isNewConversation) {
      conversationStarters[sender]++;
    }
    
    // Calculate response time if this is a reply
    if (lastMessageSender && lastMessageTimestamp && lastMessageSender !== sender) {
      const responseTime = timestamp.getTime() - lastMessageTimestamp.getTime();
      
      // Only count reasonable response times (less than 1 day)
      if (responseTime < 24 * 60 * 60 * 1000) {
        responseTimeByParticipant[sender].total += responseTime;
        responseTimeByParticipant[sender].count++;
      }
    }
    
    // Update tracking variables
    lastMessageTimestamp = timestamp;
    lastMessageSender = sender;
    isNewConversation = false;
  });
  
  // Calculate average message length
  const averageMessageLengthByParticipant: MessageCount = {};
  participants.forEach(participant => {
    averageMessageLengthByParticipant[participant] = 
      Math.round(messageLengthTotalByParticipant[participant] / 
                (messageCountByParticipant[participant] || 1));
  });
  
  // Calculate average response times
  participants.forEach(participant => {
    if (responseTimeByParticipant[participant].count > 0) {
      responseTimeByParticipant[participant].average = 
        responseTimeByParticipant[participant].total / 
        responseTimeByParticipant[participant].count;
    }
  });
  
  // Calculate message percentage by participant
  const totalMessages = messages.length;
  const messagePercentageByParticipant: MessageCount = {};
  
  participants.forEach(participant => {
    messagePercentageByParticipant[participant] = 
      Math.round((messageCountByParticipant[participant] / totalMessages) * 100);
  });
  
  // Get most frequent words
  const mostFrequentWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));
  
  // Get most frequent words per participant
  const mostFrequentWordsPerParticipant: { 
    [participant: string]: { word: string; count: number }[] 
  } = {};
  
  participants.forEach(participant => {
    mostFrequentWordsPerParticipant[participant] = Object.entries(wordFrequencyByParticipant[participant])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));
  });
  
  // Calculate conversation starter percentages
  const totalConversations = Object.values(conversationStarters).reduce((a, b) => a + b, 0) || 1;
  const conversationStarterPercentages: { [participant: string]: { count: number; percentage: number } } = {};
  
  participants.forEach(participant => {
    conversationStarterPercentages[participant] = {
      count: conversationStarters[participant],
      percentage: Math.round((conversationStarters[participant] / totalConversations) * 100)
    };
  });
  
  // Calculate chat duration
  const startDate = parsedChat.startDate;
  const endDate = parsedChat.endDate;
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));
  const durationMonths = Math.floor(durationDays / 30);
  const durationYears = Math.floor(durationDays / 365);
  
  return {
    totalMessages,
    messageCountByParticipant,
    messagePercentageByParticipant,
    wordCountByParticipant,
    averageMessageLengthByParticipant,
    mostFrequentWords,
    mostFrequentWordsPerParticipant,
    conversationStarters: conversationStarterPercentages,
    responseTime: responseTimeByParticipant,
    emojiUsage: {
      total: Object.values(emojiCountByParticipant).reduce((a, b) => a + b, 0),
      byParticipant: emojiCountByParticipant
    },
    chatDuration: {
      days: durationDays,
      months: durationMonths,
      years: durationYears
    }
  };
};
