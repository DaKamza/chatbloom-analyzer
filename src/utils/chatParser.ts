
// Regular expression patterns to match various WhatsApp message formats
// Format 1: [DD/MM/YY, HH:MM:SS] Sender: Message
// Format 2: [DD/MM/YY HH:MM:SS] Sender: Message (no comma)
// Format 3: DD/MM/YY, HH:MM - Sender: Message (older format)
// Format 4: DD/MM/YYYY, HH:MM - Sender: Message (older format with 4-digit year)
// Format 5: [YYYY/MM/DD, HH:MM:SS] Sender: Message (with year first)
const MESSAGE_PATTERNS = [
  /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?)\]\s([^:]+):\s(.+)$/,
  /^\[(\d{1,2}\/\d{1,2}\/\d{2,4})\s(\d{1,2}:\d{2}(?::\d{2})?)\]\s([^:]+):\s(.+)$/,
  /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2})(?:\s)?-(?:\s)?([^:]+):\s(.+)$/,
  /^(\d{1,2}\/\d{1,2}\/\d{2,4})\s(\d{1,2}:\d{2})(?:\s)?-(?:\s)?([^:]+):\s(.+)$/,
  /^\[(\d{4}\/\d{1,2}\/\d{1,2}),\s(\d{1,2}:\d{2}(?::\d{2})?)\]\s([^:]+):\s(.+)$/
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
    // Check if the date is in YYYY/MM/DD format
    if (datePart.match(/^\d{4}\/\d{1,2}\/\d{1,2}$/)) {
      const [year, month, day] = datePart.split('/');
      
      // Handle different time formats (HH:MM or HH:MM:SS)
      const timeComponents = timePart.split(':');
      let timeString = timePart;
      
      if (timeComponents.length === 2) {
        timeString = `${timePart}:00`; // Add seconds if not present
      }
      
      return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timeString}`);
    } else {
      // Standard DD/MM/YY(YY) format
      const [day, month, year] = datePart.split('/');
      const fullYear = year.length === 2 ? `20${year}` : year;
      
      // Handle different time formats (HH:MM or HH:MM:SS)
      const timeComponents = timePart.split(':');
      let timeString = timePart;
      
      if (timeComponents.length === 2) {
        timeString = `${timePart}:00`; // Add seconds if not present
      }
      
      return new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timeString}`);
    }
  } catch (error) {
    console.error("Error parsing date:", error, "for date part:", datePart, "time part:", timePart);
    return new Date(); // Fallback to current date
  }
};

/**
 * Parse WhatsApp chat text into structured data
 */
export const parseWhatsAppChat = (chatText: string): ParsedChat => {
  // Clean the input by normalizing line endings
  const normalizedText = chatText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalizedText.split('\n');
  const messages: ParsedMessage[] = [];
  const participantsSet = new Set<string>();
  
  let earliestDate: Date | null = null;
  let latestDate: Date | null = null;

  // Try to detect non-message system information lines to exclude
  const systemMessagePatterns = [
    /^Messages and calls are end-to-end encrypted/i,
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

  // Debug information
  console.log("Total lines before processing:", lines.length);
  let matchedLines = 0;
  let unmatchedLines = 0;

  // Process each line in the chat
  lines.forEach((line, index) => {
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
        matchedLines++;
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
    
    if (!matched) {
      unmatchedLines++;
      if (process.env.NODE_ENV !== 'production' && index < 20) {
        // Only log the first 20 unmatched lines to avoid excessive logging
        console.debug('No pattern match for line:', line);
      }
    }
  });

  // Add debug information to help diagnose issues
  console.log(`Processed lines: ${lines.length}, Matched: ${matchedLines}, Unmatched: ${unmatchedLines}`);
  
  if (messages.length === 0) {
    console.log('No messages parsed. Sample lines:', lines.slice(0, 5));
    console.log('Message patterns tried:', MESSAGE_PATTERNS.map(p => p.toString()));
  } else {
    console.log(`Successfully parsed ${messages.length} messages from ${participantsSet.size} participants`);
  }

  return {
    messages,
    participants: Array.from(participantsSet),
    startDate: earliestDate || new Date(),
    endDate: latestDate || new Date()
  };
};
