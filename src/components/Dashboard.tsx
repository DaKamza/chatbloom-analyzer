
import React, { useState } from 'react';
import { ChatAnalysis } from '@/utils/analyzeData';
import { ParsedChat } from '@/utils/chatParser';
import MessageStats from './MessageStats';
import { 
  Alert, 
  AlertTitle, 
  AlertDescription 
} from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConflictDetection from './ConflictDetection';
import RelationshipAdvice from './RelationshipAdvice';
import UpgradePrompts from './UpgradePrompts';
import { Sparkles, Smile, AlertTriangle, BarChart } from 'lucide-react';
import EmojiAnalysis from './EmojiAnalysis';
import { useAuth } from '@/context/AuthContext';

interface DashboardProps {
  analysis: ChatAnalysis;
  parsedChat: ParsedChat;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ analysis, parsedChat, onReset }) => {
  const hasLimitedData = parsedChat.messages.length < 50;
  // Use auth context for premium status
  const { isPremium, checkFeatureAccess } = useAuth();
  // Cycle through different upgrade prompts
  const [promptIndex, setPromptIndex] = useState(0);
  
  const promptTypes = ['basic', 'pay-per-feature', 'subscription'] as const;
  
  // Cycle to the next prompt type
  const cyclePrompt = () => {
    setPromptIndex((prev) => (prev + 1) % promptTypes.length);
  };

  // Handle upgrade success
  const handleUpgradeSuccess = () => {
    // No need to manually set premium status as it's managed by our AuthContext
    // after the payment is processed
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-10 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-semibold text-apple-black">
            <span className="bg-gradient-to-r from-apple-blue to-apple-light-blue bg-clip-text text-transparent">
              Analysis Results
            </span>
          </h2>
          <p className="text-apple-dark-gray">
            {parsedChat.participants.join(' & ')} • {analysis.totalMessages.toLocaleString()} messages
          </p>
        </div>
        
        <div className="flex gap-2">
          {/* Demo button to cycle prompts */}
          <button
            onClick={cyclePrompt}
            className="px-4 py-1 text-xs rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
          >
            Cycle Prompts
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 rounded-lg bg-apple-gray hover:bg-apple-gray/80 text-apple-black transition-colors"
          >
            Analyze Another Chat
          </button>
        </div>
      </div>
      
      {hasLimitedData && (
        <Alert className="mb-6 border-apple-blue/20 bg-apple-blue/5">
          <AlertTitle className="text-apple-blue">Limited Data Analysis</AlertTitle>
          <AlertDescription>
            Your chat contains fewer than 50 messages. For more comprehensive insights, 
            try uploading a chat with more messages.
          </AlertDescription>
        </Alert>
      )}
      
      {!isPremium && (
        <div className="mb-6">
          <UpgradePrompts 
            type={promptTypes[promptIndex]} 
            onUpgradeSuccess={handleUpgradeSuccess}
          />
        </div>
      )}
      
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="w-full max-w-md mx-auto mb-8 bg-apple-gray/50 p-1 rounded-full">
          <TabsTrigger 
            value="stats" 
            className="rounded-full text-sm py-2 data-[state=active]:bg-white data-[state=active]:shadow-apple-card"
          >
            <BarChart className="w-4 h-4 mr-1" />
            Message Stats
          </TabsTrigger>
          <TabsTrigger 
            value="conflicts" 
            className="rounded-full text-sm py-2 data-[state=active]:bg-white data-[state=active]:shadow-apple-card"
            disabled={!isPremium || !checkFeatureAccess('conflict_analysis')}
          >
            <AlertTriangle className="w-4 h-4 mr-1" />
            Conflict Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="emojis" 
            className="rounded-full text-sm py-2 data-[state=active]:bg-white data-[state=active]:shadow-apple-card"
          >
            <Smile className="w-4 h-4 mr-1" />
            Emoji Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="advice" 
            className="rounded-full text-sm py-2 data-[state=active]:bg-white data-[state=active]:shadow-apple-card"
            disabled={!isPremium || !checkFeatureAccess('relationship_advice')}
          >
            <Sparkles className="w-4 h-4 mr-1" />
            Resolution Advice
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <MessageStats analysis={analysis} parsedChat={parsedChat} />
        </TabsContent>
        
        <TabsContent value="conflicts" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          {isPremium && checkFeatureAccess('conflict_analysis') ? (
            <ConflictDetection analysis={analysis} parsedChat={parsedChat} />
          ) : (
            <div className="text-center py-10">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">Premium Feature</h3>
              <p className="text-apple-dark-gray mb-4 max-w-md mx-auto">
                Conflict Analysis is a premium feature. Upgrade to access detailed insights about
                conversation conflicts and tension points.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="emojis" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <EmojiAnalysis analysis={analysis} parsedChat={parsedChat} />
        </TabsContent>
        
        <TabsContent value="advice" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          {isPremium && checkFeatureAccess('relationship_advice') ? (
            <RelationshipAdvice analysis={analysis} parsedChat={parsedChat} />
          ) : (
            <div className="text-center py-10">
              <Sparkles className="w-10 h-10 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">Premium Feature</h3>
              <p className="text-apple-dark-gray mb-4 max-w-md mx-auto">
                AI-powered Resolution Advice is a premium feature. Upgrade to get personalized
                suggestions for improving your communication.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
