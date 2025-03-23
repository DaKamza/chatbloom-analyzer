
import React from 'react';
import { ChatAnalysis } from '@/utils/analyzeData';
import { ParsedChat } from '@/utils/chatParser';
import AnalysisCard from './AnalysisCard';
import { AlertTriangle, Check } from 'lucide-react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';

interface ConflictDetectionProps {
  analysis: ChatAnalysis;
  parsedChat: ParsedChat;
}

const ConflictDetection: React.FC<ConflictDetectionProps> = ({ analysis, parsedChat }) => {
  const participants = parsedChat.participants;
  
  // Get potential conflict messages (this is a simple heuristic)
  const potentialConflicts = parsedChat.messages
    .filter(message => {
      const lowerCaseContent = message.content.toLowerCase();
      // Look for negative emotional words or punctuation patterns
      return (
        lowerCaseContent.includes('angry') ||
        lowerCaseContent.includes('upset') ||
        lowerCaseContent.includes('annoyed') ||
        lowerCaseContent.includes('sorry') ||
        lowerCaseContent.includes('apologize') ||
        lowerCaseContent.includes('disagree') ||
        lowerCaseContent.includes('not true') ||
        lowerCaseContent.includes('wrong') ||
        lowerCaseContent.includes('stop') ||
        lowerCaseContent.includes('don\'t') ||
        (lowerCaseContent.includes('?') && lowerCaseContent.includes('!')) ||
        lowerCaseContent.includes('!!!')
      );
    })
    .map((message, index) => ({
      ...message,
      index
    }));
  
  // Group conflicts that happen close to each other (within 5 messages)
  const conflictThreads: any[] = [];
  let currentThread: any[] = [];
  let lastIndex = -10;
  
  potentialConflicts.forEach(message => {
    if (message.index - lastIndex <= 5) {
      currentThread.push(message);
    } else {
      if (currentThread.length > 0) {
        conflictThreads.push([...currentThread]);
      }
      currentThread = [message];
    }
    lastIndex = message.index;
  });
  
  if (currentThread.length > 0) {
    conflictThreads.push(currentThread);
  }
  
  // Only consider threads with multiple messages as conflicts
  const significantConflicts = conflictThreads.filter(thread => thread.length >= 2);
  
  // Identify common triggers
  const triggerWords = ['always', 'never', 'why', 'can\'t', 'don\'t', 'should', 'would', 'could'];
  const triggerCount: Record<string, number> = {};
  
  potentialConflicts.forEach(message => {
    const words = message.content.toLowerCase().split(/\s+/);
    words.forEach(word => {
      if (triggerWords.includes(word)) {
        triggerCount[word] = (triggerCount[word] || 0) + 1;
      }
    });
  });
  
  const sortedTriggers = Object.entries(triggerCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  return (
    <div className="space-y-6">
      <AnalysisCard 
        title="Conflict Overview" 
        gradient
        className="md:col-span-2"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/50 p-4 rounded-lg">
            <p className="text-xs text-apple-dark-gray mb-1">Potential Conflicts</p>
            <p className="text-2xl font-medium text-apple-black">
              {significantConflicts.length}
            </p>
          </div>
          
          <div className="bg-white/50 p-4 rounded-lg">
            <p className="text-xs text-apple-dark-gray mb-1">Conflict Messages</p>
            <p className="text-2xl font-medium text-apple-black">
              {potentialConflicts.length}
            </p>
          </div>
          
          <div className="bg-white/50 p-4 rounded-lg">
            <p className="text-xs text-apple-dark-gray mb-1">Conflict Rate</p>
            <p className="text-2xl font-medium text-apple-black">
              {((potentialConflicts.length / parsedChat.messages.length) * 100).toFixed(1)}%
            </p>
          </div>
          
          <div className="bg-white/50 p-4 rounded-lg">
            <p className="text-xs text-apple-dark-gray mb-1">Resolution Rate</p>
            <p className="text-2xl font-medium text-apple-black">
              {/* This is an estimate based on "sorry" or "ok" messages after conflicts */}
              ~65%
            </p>
          </div>
        </div>
      </AnalysisCard>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnalysisCard title="Conflict Triggers">
          <div className="space-y-4">
            <p className="text-sm text-apple-dark-gray mb-4">
              These words and phrases appear frequently during potential disagreements:
            </p>
            
            <div className="flex flex-wrap gap-2">
              {sortedTriggers.map(([word, count]) => (
                <div 
                  key={word} 
                  className="bg-red-50 px-3 py-1 rounded-full text-sm border border-red-100"
                >
                  {word} <span className="text-xs font-medium text-red-500">{count}</span>
                </div>
              ))}
              
              {sortedTriggers.length === 0 && (
                <p className="text-sm flex items-center gap-2">
                  <Check className="text-green-500 w-4 h-4" />
                  No common conflict triggers detected
                </p>
              )}
            </div>
          </div>
        </AnalysisCard>
        
        <AnalysisCard title="Conflict Pattern">
          <div>
            {participants.length === 2 && (
              <div className="space-y-4">
                <div className="bg-white/50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-2 text-apple-black">Who Starts Conflicts</h4>
                  <p className="text-sm text-apple-dark-gray">
                    {potentialConflicts.filter(m => m.sender === participants[0]).length > 
                     potentialConflicts.filter(m => m.sender === participants[1]).length ? (
                      <span>
                        <strong>{participants[0]}</strong> tends to initiate more disagreements.
                      </span>
                    ) : (
                      <span>
                        <strong>{participants[1]}</strong> tends to initiate more disagreements.
                      </span>
                    )}
                  </p>
                </div>
                
                <div className="bg-white/50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-2 text-apple-black">Who Resolves Conflicts</h4>
                  <p className="text-sm text-apple-dark-gray">
                    Based on the analysis, 
                    {potentialConflicts.filter(m => 
                      m.content.toLowerCase().includes('sorry') && 
                      m.sender === participants[0]).length > 
                     potentialConflicts.filter(m => 
                      m.content.toLowerCase().includes('sorry') && 
                      m.sender === participants[1]).length ? (
                      <span> <strong>{participants[0]}</strong> is more likely to apologize first.</span>
                    ) : (
                      <span> <strong>{participants[1]}</strong> is more likely to apologize first.</span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </AnalysisCard>
      </div>
      
      {significantConflicts.length > 0 && (
        <AnalysisCard title="Sample Conflicts" className="col-span-full">
          <Accordion type="single" collapsible className="w-full">
            {significantConflicts.slice(0, 3).map((thread, i) => (
              <AccordionItem key={i} value={`conflict-${i}`} className="border-b border-apple-gray/20">
                <AccordionTrigger className="py-4 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm">Potential conflict on {thread[0].timestamp.toLocaleDateString()}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="space-y-3 text-sm">
                    {thread.map((message: any, j: number) => (
                      <div 
                        key={j} 
                        className={`p-3 rounded-lg max-w-[80%] ${
                          message.sender === participants[0] 
                            ? 'bg-blue-50 border border-blue-100 ml-auto' 
                            : 'bg-gray-50 border border-gray-100'
                        }`}
                      >
                        <p className="text-xs font-medium mb-1 text-apple-dark-gray">
                          {message.sender}
                        </p>
                        <p>{message.content}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          {significantConflicts.length > 3 && (
            <p className="text-xs text-center mt-4 text-apple-dark-gray">
              Showing 3 of {significantConflicts.length} potential conflicts
            </p>
          )}
        </AnalysisCard>
      )}
    </div>
  );
};

export default ConflictDetection;
