
import React from 'react';
import { ChatAnalysis } from '@/utils/analyzeData';
import { ParsedChat } from '@/utils/chatParser';
import AnalysisCard from './AnalysisCard';
import { AlertTriangle, Check, MessageSquare, TrendingUp, XCircle } from 'lucide-react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';

interface ConflictDetectionProps {
  analysis: ChatAnalysis;
  parsedChat: ParsedChat;
}

const ConflictDetection: React.FC<ConflictDetectionProps> = ({ analysis, parsedChat }) => {
  const participants = parsedChat.participants;
  
  // Negative emotion words for enhanced detection
  const negativeEmotionWords = [
    'angry', 'upset', 'annoyed', 'sorry', 'apologize', 'disagree', 'wrong', 'stop', 
    'don\'t', 'can\'t', 'not', 'never', 'hate', 'sad', 'disappointed', 'terrible', 
    'awful', 'horrible', 'bad', 'worse', 'worst', 'poor', 'sick', 'tired', 'exhausted',
    'frustrated', 'irritated', 'bothered', 'mad', 'furious', 'enraged', 'outraged',
    'stop', 'enough', 'leave me alone', 'whatever', 'idc', 'idk'
  ];
  
  // Get potential conflict messages (enhanced heuristic)
  const potentialConflicts = parsedChat.messages
    .filter(message => {
      const lowerCaseContent = message.content.toLowerCase();
      
      // Check for negative emotions and confrontational language
      const hasNegativeWords = negativeEmotionWords.some(word => 
        lowerCaseContent.includes(word)
      );
      
      // Check for confrontational punctuation patterns
      const hasFrustrationPunctuation = 
        (lowerCaseContent.includes('?') && lowerCaseContent.includes('!')) || 
        lowerCaseContent.includes('???') ||
        lowerCaseContent.includes('!!!');
      
      // Check for capitalized text (shouting)
      const hasCapitalizedText = 
        message.content.length > 5 && 
        message.content === message.content.toUpperCase();
      
      return hasNegativeWords || hasFrustrationPunctuation || hasCapitalizedText;
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
  
  // Analyze conflict initiators per participant
  const conflictInitiators: Record<string, number> = {};
  participants.forEach(participant => {
    conflictInitiators[participant] = 0;
  });
  
  significantConflicts.forEach(thread => {
    if (thread.length > 0) {
      const initiator = thread[0].sender;
      conflictInitiators[initiator] = (conflictInitiators[initiator] || 0) + 1;
    }
  });
  
  // Calculate conflict initiation percentages
  const totalConflicts = significantConflicts.length;
  const conflictInitiationPercentage: Record<string, number> = {};
  
  participants.forEach(participant => {
    conflictInitiationPercentage[participant] = 
      Math.round((conflictInitiators[participant] / totalConflicts) * 100) || 0;
  });
  
  // Identify common triggers
  const triggerWords = [
    'always', 'never', 'why', "can't", "don't", 'should', 'would', 'could',
    'need', 'must', 'have to', 'impossible', 'whatever', 'fine', 'but',
    'actually', 'obviously', 'clearly', 'just', 'only', 'really', 'literally'
  ];
  
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
  
  // Calculate sentiment scores
  const calculateConflictRate = () => {
    return ((potentialConflicts.length / parsedChat.messages.length) * 100).toFixed(1);
  };
  
  // Estimate resolution rate based on "sorry", "ok", "understand" messages after conflicts
  const calculateResolutionRate = () => {
    let resolvedCount = 0;
    
    significantConflicts.forEach(thread => {
      // Check if any of the last two messages contain resolution indicators
      const lastMessages = thread.slice(-2);
      const hasResolution = lastMessages.some(message => {
        const content = message.content.toLowerCase();
        return (
          content.includes('sorry') || 
          content.includes('ok') || 
          content.includes('understand') ||
          content.includes('alright') ||
          content.includes('fine') ||
          content.includes('agree') ||
          content.includes('love you')
        );
      });
      
      if (hasResolution) {
        resolvedCount++;
      }
    });
    
    return Math.round((resolvedCount / significantConflicts.length) * 100) || 0;
  };
  
  const resolutionRate = calculateResolutionRate();
  
  return (
    <div className="space-y-6">
      <AnalysisCard 
        title="Conflict Analysis Overview" 
        gradient
        className="md:col-span-2"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white/70 p-5 rounded-lg border border-apple-gray/20">
            <h3 className="text-lg font-semibold mb-4 text-apple-black">Conflict Frequency</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-apple-dark-gray">Conflict Rate</span>
              <span className="text-sm font-medium">{calculateConflictRate()}%</span>
            </div>
            <Progress 
              value={Number(calculateConflictRate())} 
              className="h-2 mb-4" 
              indicatorClassName="bg-gradient-to-r from-green-500 to-red-500" 
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-apple-dark-gray mb-1">Potential Conflicts</p>
                <p className="text-2xl font-medium text-apple-black">
                  {significantConflicts.length}
                </p>
              </div>
              <div>
                <p className="text-xs text-apple-dark-gray mb-1">Conflict Messages</p>
                <p className="text-2xl font-medium text-apple-black">
                  {potentialConflicts.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 p-5 rounded-lg border border-apple-gray/20">
            <h3 className="text-lg font-semibold mb-4 text-apple-black">Resolution Success</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-apple-dark-gray">Resolution Rate</span>
              <span className="text-sm font-medium">{resolutionRate}%</span>
            </div>
            <Progress 
              value={resolutionRate} 
              className="h-2 mb-4" 
              indicatorClassName={`bg-${resolutionRate > 60 ? 'green' : resolutionRate > 30 ? 'amber' : 'red'}-500`}
            />
            
            <div className="flex items-center mt-4">
              {resolutionRate > 60 ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="w-5 h-5" />
                  <span className="text-sm font-medium">Healthy conflict resolution</span>
                </div>
              ) : resolutionRate > 30 ? (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm font-medium">Moderate resolution success</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Poor conflict resolution</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {participants.length === 2 && (
            <>
              <div className="bg-white/50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-apple-black">Who Initiates Conflicts</h4>
                </div>
                
                {participants.map(participant => (
                  <div key={participant} className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-apple-dark-gray">{participant}</span>
                      <span className="text-xs font-medium">{conflictInitiationPercentage[participant]}%</span>
                    </div>
                    <Progress value={conflictInitiationPercentage[participant]} className="h-2" />
                  </div>
                ))}
                
                <p className="text-xs text-apple-dark-gray mt-3">
                  {conflictInitiationPercentage[participants[0]] > 
                   conflictInitiationPercentage[participants[1]] ? (
                    <span><strong>{participants[0]}</strong> starts most disagreements.</span>
                  ) : (
                    <span><strong>{participants[1]}</strong> starts most disagreements.</span>
                  )}
                </p>
              </div>
              
              <div className="bg-white/50 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-2 text-apple-black">Message Patterns During Conflicts</h4>
                
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare className="w-4 h-4 text-apple-blue" />
                  <div>
                    <p className="text-xs text-apple-dark-gray">Average messages in conflict</p>
                    <p className="text-sm font-medium">
                      {Math.round(significantConflicts.reduce((acc, thread) => acc + thread.length, 0) / 
                        (significantConflicts.length || 1))}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-apple-blue" />
                  <div>
                    <p className="text-xs text-apple-dark-gray">Longest conflict</p>
                    <p className="text-sm font-medium">
                      {significantConflicts.length > 0 ? 
                        Math.max(...significantConflicts.map(thread => thread.length)) : 0} messages
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </AnalysisCard>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnalysisCard title="Conflict Triggers">
          <div className="space-y-4">
            <p className="text-sm text-apple-dark-gray mb-4">
              These words and phrases frequently appear during disagreements:
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
                  <h4 className="text-sm font-medium mb-2 text-apple-black">Emotional Tone</h4>
                  <p className="text-sm text-apple-dark-gray">
                    {potentialConflicts.filter(m => m.sender === participants[0]).length > 
                     potentialConflicts.filter(m => m.sender === participants[1]).length ? (
                      <span>
                        <strong>{participants[0]}</strong> tends to use more emotional language during disagreements.
                      </span>
                    ) : (
                      <span>
                        <strong>{participants[1]}</strong> tends to use more emotional language during disagreements.
                      </span>
                    )}
                  </p>
                </div>
                
                <div className="bg-white/50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-2 text-apple-black">Resolution Style</h4>
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
