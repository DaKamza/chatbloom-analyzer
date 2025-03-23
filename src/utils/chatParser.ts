
// Regular expression patterns to match various WhatsApp message formats
// Format 1: [DD/MM/YY, HH:MM:SS] Sender: Message
// Format 2: [DD/MM/YY HH:MM:SS] Sender: Message (no comma)
// Format 3: DD/MM/YY, HH:MM - Sender: Message (older format)
// Format 4: DD/MM/YYYY, HH:MM - Sender: Message (older format with 4-digit year)
const MESSAGE_PATTERNS = [
  /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?)\]\s([^:]+):\s(.+)$/,
  /^\[(\d{1,2}\/\d{1,2}\/\d{2,4})\s(\d{1,2}:\d{2}(?::\d{2})?)\]\s([^:]+):\s(.+)$/,
  /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2})(?:\s)?-(?:\s)?([^:]+):\s(.+)$/,
  /^(\d{1,2}\/\d{1,2}\/\d{2,4})\s(\d{1,2}:\d{2})(?:\s)?-(?:\s)?([^:]+):\s(.+)$/
];

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
 * Parse a date string from various WhatsApp date formats
 */
const parseWhatsAppDate = (datePart: string, timePart: string): Date => {
  try {
    const [day, month, year] = datePart.split('/');
    const fullYear = year.length === 2 ? `20${year}` : year;
    
    // Handle different time formats (HH:MM or HH:MM:SS)
    const timeComponents = timePart.split(':');
    let timeString = timePart;
    
    if (timeComponents.length === 2) {
      timeString = `${timePart}:00`; // Add seconds if not present
    }
    
    return new Date(`${fullYear}-${month}-${day}T${timeString}`);
  } catch (error) {
    console.error("Error parsing date:", error);
    return new Date(); // Fallback to current date
  }
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

  // Try to detect non-message system information lines to exclude
  const systemMessagePatterns = [
    /^Messages to this group are now secured with end-to-end encryption/i,
    /^.* created group/i,
    /^.* changed the subject from/i,
    /^.* added/i,
    /^.* joined using this group's invite link/i,
    /^.* left/i,
    /^.* removed/i,
    /^.* changed this group's icon/i,
    /^.* changed the group description/i,
    /^You created group/i,
    /^Group notification/i,
    /^.* changed their phone number/i
  ];

  // Process each line in the chat
  lines.forEach(line => {
    // Skip empty lines
    if (!line.trim()) {
      return;
    }
    
    // Skip system messages
    if (systemMessagePatterns.some(pattern => pattern.test(line))) {
      return;
    }
    
    // Try each message pattern until one matches
    let matched = false;
    
    for (const pattern of MESSAGE_PATTERNS) {
      const match = line.match(pattern);
      
      if (match) {
        matched = true;
        const [, datePart, timePart, sender, content] = match;
        
        // Parse date and time
        const timestamp = parseWhatsAppDate(datePart, timePart);
        
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
        
        break; // Stop once a pattern matches
      }
    }
    
    if (!matched && process.env.NODE_ENV !== 'production') {
      console.debug('No pattern match for line:', line);
    }
  });

  // Add debug information to help diagnose issues
  if (messages.length === 0) {
    console.log('No messages parsed. Sample lines:', lines.slice(0, 5));
  }

  return {
    messages,
    participants: Array.from(participantsSet),
    startDate: earliestDate || new Date(),
    endDate: latestDate || new Date()
  };
};
