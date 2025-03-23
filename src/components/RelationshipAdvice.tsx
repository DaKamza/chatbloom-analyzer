
import React from 'react';
import { ChatAnalysis } from '@/utils/analyzeData';
import { ParsedChat } from '@/utils/chatParser';
import AnalysisCard from './AnalysisCard';
import { 
  Heart, 
  Timer, 
  MessageSquareText, 
  Sparkles, 
  Clock, 
  TrendingUp,
  UserCheck,
  MessagesSquare 
} from 'lucide-react';

interface RelationshipAdviceProps {
  analysis: ChatAnalysis;
  parsedChat: ParsedChat;
}

const RelationshipAdvice: React.FC<RelationshipAdviceProps> = ({ analysis, parsedChat }) => {
  const participants = parsedChat.participants;
  
  // Calculate imbalance percentages
  const messageImbalance = Math.abs(
    analysis.messagePercentageByParticipant[participants[0]] - 
    analysis.messagePercentageByParticipant[participants[1]]
  );
  
  const responseTimeImbalance = Math.abs(
    analysis.responseTime[participants[0]].average - 
    analysis.responseTime[participants[1]].average
  ) / Math.max(
    analysis.responseTime[participants[0]].average,
    analysis.responseTime[participants[1]].average
  ) * 100;
  
  const initiationImbalance = Math.abs(
    analysis.conversationStarters[participants[0]].percentage - 
    analysis.conversationStarters[participants[1]].percentage
  );
  
  // Format response time in a readable way
  const formatResponseTime = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60));
    if (minutes < 60) {
      return `${minutes} min${minutes !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(minutes / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
  };
  
  // Generate advice based on metrics
  const generateAdvice = () => {
    const advice: Array<{icon: React.ReactNode, title: string, description: string}> = [];
    
    // Message balance advice
    if (messageImbalance > 20) {
      const lessActivePerson = 
        analysis.messagePercentageByParticipant[participants[0]] < 
        analysis.messagePercentageByParticipant[participants[1]] 
          ? participants[0] 
          : participants[1];
      
      advice.push({
        icon: <MessageSquareText className="w-6 h-6 text-blue-500" />,
        title: "Balance the Conversation",
        description: `There's a significant imbalance in how much each person messages. ${lessActivePerson} could try being more engaged in the conversation.`
      });
    }
    
    // Response time advice
    const slowerResponder = 
      analysis.responseTime[participants[0]].average > 
      analysis.responseTime[participants[1]].average 
        ? participants[0] 
        : participants[1];
    
    if (responseTimeImbalance > 50) {
      advice.push({
        icon: <Timer className="w-6 h-6 text-amber-500" />,
        title: "Response Time",
        description: `${slowerResponder} tends to take longer to respond. Try to acknowledge messages sooner, even with a brief reply if you're busy.`
      });
    }
    
    // Conversation starters advice
    if (initiationImbalance > 30) {
      const lessInitiatingPerson = 
        analysis.conversationStarters[participants[0]].percentage < 
        analysis.conversationStarters[participants[1]].percentage 
          ? participants[0] 
          : participants[1];
      
      advice.push({
        icon: <MessagesSquare className="w-6 h-6 text-purple-500" />,
        title: "Initiate More Often",
        description: `${lessInitiatingPerson} rarely starts conversations. Try to initiate chats more frequently to create a more balanced dynamic.`
      });
    }
    
    // Message length advice
    const personWithShorterMessages = 
      analysis.averageMessageLengthByParticipant[participants[0]] < 
      analysis.averageMessageLengthByParticipant[participants[1]] 
        ? participants[0] 
        : participants[1];
    
    if (Math.abs(
      analysis.averageMessageLengthByParticipant[participants[0]] - 
      analysis.averageMessageLengthByParticipant[participants[1]]
    ) > 20) {
      advice.push({
        icon: <TrendingUp className="w-6 h-6 text-green-500" />,
        title: "Message Depth",
        description: `${personWithShorterMessages} tends to send shorter messages. Consider sharing more details and thoughts in your texts.`
      });
    }
    
    // Emoji usage advice
    if (Math.abs(
      analysis.emojiUsage.byParticipant[participants[0]] - 
      analysis.emojiUsage.byParticipant[participants[1]]
    ) > 20) {
      const personWithFewerEmojis = 
        analysis.emojiUsage.byParticipant[participants[0]] < 
        analysis.emojiUsage.byParticipant[participants[1]] 
          ? participants[0] 
          : participants[1];
      
      advice.push({
        icon: <Heart className="w-6 h-6 text-red-500" />,
        title: "Emotional Expression",
        description: `${personWithFewerEmojis} uses fewer emojis and expressions. Consider using more emotional indicators to convey your feelings.`
      });
    }
    
    // General positive advice
    advice.push({
      icon: <UserCheck className="w-6 h-6 text-teal-500" />,
      title: "Healthy Chat Pattern",
      description: "You maintain regular communication and respond to each other consistently. This shows a solid foundation for your relationship."
    });
    
    advice.push({
      icon: <Clock className="w-6 h-6 text-indigo-500" />,
      title: "Patience Is Key",
      description: `Remember that different people have different texting habits. ${slowerResponder} might be busy or prefer to think before responding.`
    });
    
    return advice;
  };
  
  const advice = generateAdvice();
  
  return (
    <div className="space-y-6">
      <AnalysisCard 
        title="AI Relationship Insights" 
        gradient
        className="md:col-span-2"
      >
        <div className="bg-white/70 p-5 rounded-lg border border-apple-blue/10">
          <div className="flex gap-3 items-start mb-4">
            <Sparkles className="w-6 h-6 text-apple-blue shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-apple-black">Your Conversation Health</h3>
              <p className="text-apple-dark-gray">
                Based on {analysis.totalMessages.toLocaleString()} messages over {analysis.chatDuration.days} days
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <p>
              Your conversation shows {messageImbalance <= 15 ? "good" : "some imbalance in"} message distribution. 
              {participants.length === 2 && (
                <>
                  {" "}
                  {participants[0]} sends {analysis.messagePercentageByParticipant[participants[0]]}% of messages 
                  while {participants[1]} sends {analysis.messagePercentageByParticipant[participants[1]]}%.
                </>
              )}
            </p>
            
            <p>
              {participants.length === 2 && (
                <>
                  {participants[0]} typically responds in {formatResponseTime(analysis.responseTime[participants[0]].average)} 
                  while {participants[1]} responds in {formatResponseTime(analysis.responseTime[participants[1]].average)}.
                </>
              )}
            </p>
            
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mt-4">
              <div 
                className="h-full bg-gradient-to-r from-red-400 via-amber-400 to-green-400"
                style={{ width: `${Math.min(100, 100 - messageImbalance)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-apple-dark-gray">
              <span>Needs Attention</span>
              <span>Balanced</span>
            </div>
          </div>
        </div>
      </AnalysisCard>
      
      <AnalysisCard title="Relationship Advice">
        <div className="space-y-5">
          {advice.map((item, index) => (
            <div key={index} className="flex gap-4 p-4 bg-white/50 rounded-lg">
              <div className="shrink-0 mt-1">
                {item.icon}
              </div>
              <div>
                <h4 className="text-base font-medium text-apple-black mb-1">{item.title}</h4>
                <p className="text-sm text-apple-dark-gray">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </AnalysisCard>
      
      <AnalysisCard title="Communication Strengths">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2 text-apple-black">Consistent Communication</h4>
            <p className="text-sm text-apple-dark-gray">
              You've maintained conversation over {analysis.chatDuration.days} days with regular exchanges.
            </p>
          </div>
          
          <div className="bg-white/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2 text-apple-black">Engagement Level</h4>
            <p className="text-sm text-apple-dark-gray">
              With {(analysis.totalMessages / analysis.chatDuration.days).toFixed(1)} messages per day on average, 
              you show consistent interest in staying connected.
            </p>
          </div>
          
          {/* Add more strength cards based on the data */}
          <div className="bg-white/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2 text-apple-black">Vocabulary Richness</h4>
            <p className="text-sm text-apple-dark-gray">
              You use a diverse range of words, showing thoughtfulness in your communication.
            </p>
          </div>
          
          <div className="bg-white/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2 text-apple-black">Expression</h4>
            <p className="text-sm text-apple-dark-gray">
              Your use of {analysis.emojiUsage.total} emojis shows emotional expressiveness in your chat.
            </p>
          </div>
        </div>
      </AnalysisCard>
    </div>
  );
};

export default RelationshipAdvice;
