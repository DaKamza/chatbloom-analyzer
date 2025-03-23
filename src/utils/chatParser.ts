
// Regular expression pattern to match WhatsApp message format
// Format: [DD/MM/YY, HH:MM:SS] Sender: Message
const MESSAGE_PATTERN = /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?)\]\s([^:]+):\s(.+)$/;

// Interface for parsed message
export interface ParsedMessage {
  timestamp: Date;
  sender: string;
  content: string;
  words: string[];
  hasEmoji: boolean;
}

// Interface for parsed chat
export interface ParsedChat {
  messages: ParsedMessage[];
  participants: string[];
  startDate: Date;
  endDate: Date;
}

/**
 * Check if a string contains emoji
 */
const containsEmoji = (text: string): boolean => {
  // Simple emoji detection regex
  const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(text);
};

/**
 * Parse WhatsApp chat text into structured data
 */
export const parseWhatsAppChat = (chatText: string): ParsedChat => {
  const lines = chatText.split('\n');
  const messages: ParsedMessage[] = [];
  const participantsSet = new Set<string>();
  
  let earliestDate: Date | null = null;
  let latestDate: Date | null = null;

  lines.forEach(line => {
    const match = line.match(MESSAGE_PATTERN);
    
    if (match) {
      const [, datePart, timePart, sender, content] = match;
      
      // Parse date and time
      const [day, month, year] = datePart.split('/');
      const fullYear = year.length === 2 ? `20${year}` : year;
      
      // Create timestamp
      const timestamp = new Date(`${fullYear}-${month}-${day}T${timePart}`);
      
      // Update earliest and latest dates
      if (!earliestDate || timestamp < earliestDate) {
        earliestDate = timestamp;
      }
      
      if (!latestDate || timestamp > latestDate) {
        latestDate = timestamp;
      }
      
      // Add participant to set
      participantsSet.add(sender.trim());
      
      // Split content into words
      const words = content
        .toLowerCase()
        .replace(/[^\w\s]/gi, ' ')
        .split(/\s+/)
        .filter(word => word.length > 0);
      
      // Check for emoji
      const hasEmoji = containsEmoji(content);
      
      // Add parsed message to array
      messages.push({
        timestamp,
        sender: sender.trim(),
        content,
        words,
        hasEmoji
      });
    }
  });

  return {
    messages,
    participants: Array.from(participantsSet),
    startDate: earliestDate || new Date(),
    endDate: latestDate || new Date()
  };
};
