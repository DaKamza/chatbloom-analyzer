
import React, { useState } from 'react';
import Header from '@/components/Header';
import UploadSection from '@/components/UploadSection';
import Dashboard from '@/components/Dashboard';
import { ParsedChat } from '@/utils/chatParser';
import { analyzeChatData, ChatAnalysis } from '@/utils/analyzeData';

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
            <div className="text-center mb-10 animate-fade-in">
              <h1 className="text-4xl font-bold mb-4 text-apple-black">
                Analyze Your WhatsApp Conversations
              </h1>
              <p className="text-xl text-apple-dark-gray max-w-2xl mx-auto">
                Upload your chat and get detailed insights about conversation patterns, 
                response times, and relationship dynamics.
              </p>
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
      </footer>
    </div>
  );
};

export default Index;
