
import React, { useState } from 'react';
import Header from '@/components/Header';
import UploadSection from '@/components/UploadSection';
import Dashboard from '@/components/Dashboard';
import { ParsedChat } from '@/utils/chatParser';
import { analyzeChatData, ChatAnalysis } from '@/utils/analyzeData';
import { MessageSquare, Sparkles, AlertTriangle } from 'lucide-react';

const Index = () => {
  const [parsedChat, setParsedChat] = useState<ParsedChat | null>(null);
  const [analysis, setAnalysis] = useState<ChatAnalysis | null>(null);

  const handleChatDataParsed = (data: ParsedChat) => {
    setParsedChat(data);
    const chatAnalysis = analyzeChatData(data);
    setAnalysis(chatAnalysis);
    
    // Scroll to the results (smoothly)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setParsedChat(null);
    setAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-apple-gray/30">
      <Header />
      
      <main className="min-h-[calc(100vh-88px)] py-6 px-4 md:px-6">
        {!parsedChat || !analysis ? (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <MessageSquare className="h-16 w-16 text-apple-blue" />
                  <Sparkles className="h-6 w-6 text-amber-400 absolute -top-1 -right-1" />
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-4 text-apple-black">
                <span className="bg-gradient-to-r from-apple-blue to-apple-light-blue bg-clip-text text-transparent">
                  Analyze Your WhatsApp Conversations
                </span>
              </h1>
              <p className="text-xl text-apple-dark-gray max-w-2xl mx-auto">
                Upload your chat and get detailed insights about conversation patterns, 
                response times, relationship dynamics, and conflict resolution advice.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <div className="flex items-center bg-white/70 px-4 py-2 rounded-full shadow-sm">
                  <span className="w-3 h-3 bg-apple-blue rounded-full mr-2"></span>
                  <span className="text-sm">Message Stats</span>
                </div>
                <div className="flex items-center bg-white/70 px-4 py-2 rounded-full shadow-sm">
                  <span className="w-3 h-3 bg-red-400 rounded-full mr-2"></span>
                  <span className="text-sm">Conflict Detection</span>
                </div>
                <div className="flex items-center bg-white/70 px-4 py-2 rounded-full shadow-sm">
                  <span className="w-3 h-3 bg-green-400 rounded-full mr-2"></span>
                  <span className="text-sm">AI Relationship Advice</span>
                </div>
                <div className="flex items-center bg-white/70 px-4 py-2 rounded-full shadow-sm">
                  <span className="w-3 h-3 bg-purple-400 rounded-full mr-2"></span>
                  <span className="text-sm">Emotion Analysis</span>
                </div>
              </div>
            </div>
            
            <UploadSection onChatDataParsed={handleChatDataParsed} />
          </div>
        ) : (
          <Dashboard 
            analysis={analysis} 
            parsedChat={parsedChat} 
            onReset={handleReset} 
          />
        )}
      </main>
      
      <footer className="py-6 px-4 text-center text-apple-dark-gray text-sm">
        <p>WhatsApp Chat Analyzer • All data is processed locally on your device</p>
        <p className="mt-1 text-xs">Uses AI to analyze communication patterns and provide insights</p>
      </footer>
    </div>
  );
};

export default Index;
