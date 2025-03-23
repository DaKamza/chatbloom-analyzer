
import React from 'react';
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
import { Sparkles, Smile } from 'lucide-react';
import EmojiAnalysis from './EmojiAnalysis';

interface DashboardProps {
  analysis: ChatAnalysis;
  parsedChat: ParsedChat;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ analysis, parsedChat, onReset }) => {
  const hasLimitedData = parsedChat.messages.length < 50;

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
        
        <button
          onClick={onReset}
          className="px-4 py-2 rounded-lg bg-apple-gray hover:bg-apple-gray/80 text-apple-black transition-colors"
        >
          Analyze Another Chat
        </button>
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
      
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="w-full max-w-md mx-auto mb-8 bg-apple-gray/50 p-1 rounded-full">
          <TabsTrigger 
            value="stats" 
            className="rounded-full text-sm py-2 data-[state=active]:bg-white data-[state=active]:shadow-apple-card"
          >
            Message Stats
          </TabsTrigger>
          <TabsTrigger 
            value="conflicts" 
            className="rounded-full text-sm py-2 data-[state=active]:bg-white data-[state=active]:shadow-apple-card"
          >
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
          >
            <Sparkles className="w-4 h-4 mr-1" />
            AI Advice
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <MessageStats analysis={analysis} parsedChat={parsedChat} />
        </TabsContent>
        
        <TabsContent value="conflicts" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <ConflictDetection analysis={analysis} parsedChat={parsedChat} />
        </TabsContent>
        
        <TabsContent value="emojis" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <EmojiAnalysis analysis={analysis} parsedChat={parsedChat} />
        </TabsContent>
        
        <TabsContent value="advice" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <RelationshipAdvice analysis={analysis} parsedChat={parsedChat} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
