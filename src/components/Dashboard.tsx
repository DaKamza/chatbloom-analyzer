
import React from 'react';
import { ChatAnalysis } from '@/utils/analyzeData';
import { ParsedChat } from '@/utils/chatParser';
import MessageStats from './MessageStats';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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
          <h2 className="text-2xl font-semibold text-apple-black">Analysis Results</h2>
          <p className="text-apple-dark-gray">
            {parsedChat.participants.join(' & ')} • {analysis.totalMessages.toLocaleString()} messages
          </p>
        </div>
        
        <button
          onClick={onReset}
          className="px-4 py-2 rounded-lg text-apple-blue hover:bg-apple-blue/5 transition-colors"
        >
          Analyze Another Chat
        </button>
      </div>
      
      {hasLimitedData && (
        <Alert className="mb-6">
          <AlertTitle>Limited Data Analysis</AlertTitle>
          <AlertDescription>
            Your chat contains fewer than 50 messages. For more comprehensive insights, 
            try uploading a chat with more messages.
          </AlertDescription>
        </Alert>
      )}
      
      <MessageStats analysis={analysis} parsedChat={parsedChat} />
    </div>
  );
};

export default Dashboard;
