
import React from 'react';
import { ChatAnalysis } from '@/utils/analyzeData';
import { ParsedChat } from '@/utils/chatParser';
import AnalysisCard from './AnalysisCard';
import { Smile, Award, Heart, TrendingUp } from 'lucide-react';

interface EmojiAnalysisProps {
  analysis: ChatAnalysis;
  parsedChat: ParsedChat;
}

const EmojiAnalysis: React.FC<EmojiAnalysisProps> = ({ analysis, parsedChat }) => {
  const { emojiUsage } = analysis;
  const participants = parsedChat.participants;
  
  // Extract the top emojis from the analysis
  const topEmojis = analysis.mostFrequentEmojis || [];
  
  // Function to render a percentage bar
  const renderPercentageBar = (percentage: number) => (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-apple-blue to-apple-light-blue"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <AnalysisCard 
        title="Emoji Usage Overview" 
        gradient
        className="md:col-span-2"
      >
        <div className="bg-white/70 p-5 rounded-lg border border-apple-blue/10">
          <div className="flex gap-3 items-start mb-4">
            <Smile className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-apple-black">Emoji Expression</h3>
              <p className="text-apple-dark-gray">
                Your chat contains {emojiUsage.total} emojis across {analysis.totalMessages} messages
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            {participants.map(participant => (
              <div key={participant} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{participant}</span>
                  <span className="text-sm text-apple-dark-gray">
                    {emojiUsage.byParticipant[participant]} emojis
                  </span>
                </div>
                {renderPercentageBar(
                  (emojiUsage.byParticipant[participant] / emojiUsage.total) * 100
                )}
              </div>
            ))}
          </div>
          
          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-apple-dark-gray">
              On average, {(emojiUsage.total / analysis.totalMessages * 100).toFixed(1)}% of 
              messages contain emojis, showing how emotions are expressed in your conversation.
            </p>
          </div>
        </div>
      </AnalysisCard>

      <AnalysisCard title="Most Used Emojis">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {topEmojis.length > 0 ? (
            topEmojis.slice(0, 8).map((emoji, index) => (
              <div key={index} className="bg-white/50 rounded-lg p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
                <div className="text-2xl">{emoji.emoji}</div>
                <div>
                  <div className="text-sm font-medium">{emoji.count} times</div>
                  <div className="text-xs text-apple-dark-gray">
                    {(emoji.count / emojiUsage.total * 100).toFixed(1)}% of all emojis
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-6 text-apple-dark-gray">
              <Smile className="w-10 h-10 mx-auto mb-2 text-apple-gray" />
              <p>No emojis found in your chat</p>
            </div>
          )}
        </div>
      </AnalysisCard>

      <AnalysisCard title="Emoji Insights">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/50 p-4 rounded-lg flex gap-3">
            <Award className="w-5 h-5 text-amber-500 shrink-0 mt-1" />
            <div>
              <h4 className="text-sm font-medium mb-1 text-apple-black">Emoji Champion</h4>
              <p className="text-sm text-apple-dark-gray">
                {participants.reduce((champion, participant) => 
                  emojiUsage.byParticipant[participant] > emojiUsage.byParticipant[champion] 
                    ? participant 
                    : champion, 
                  participants[0]
                )} uses emojis the most often.
              </p>
            </div>
          </div>
          
          <div className="bg-white/50 p-4 rounded-lg flex gap-3">
            <Heart className="w-5 h-5 text-red-500 shrink-0 mt-1" />
            <div>
              <h4 className="text-sm font-medium mb-1 text-apple-black">Emotional Expression</h4>
              <p className="text-sm text-apple-dark-gray">
                The use of emojis in your chat shows a {
                  emojiUsage.total > analysis.totalMessages * 0.1 
                    ? "high" 
                    : emojiUsage.total > analysis.totalMessages * 0.05 
                    ? "moderate" 
                    : "low"
                } level of emotional expression.
              </p>
            </div>
          </div>
          
          <div className="bg-white/50 p-4 rounded-lg flex gap-3">
            <TrendingUp className="w-5 h-5 text-green-500 shrink-0 mt-1" />
            <div>
              <h4 className="text-sm font-medium mb-1 text-apple-black">Conversation Tone</h4>
              <p className="text-sm text-apple-dark-gray">
                {emojiUsage.total > 0 
                  ? "Your frequent use of emojis suggests a friendly and informal conversation tone."
                  : "Your limited use of emojis suggests a more formal conversation tone."}
              </p>
            </div>
          </div>
        </div>
      </AnalysisCard>
    </div>
  );
};

export default EmojiAnalysis;
