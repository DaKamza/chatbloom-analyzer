
import React from 'react';
import AnalysisCard from './AnalysisCard';
import { ChatAnalysis } from '@/utils/analyzeData';
import { useIsMobile } from '@/hooks/use-mobile';
import { ParsedChat } from '@/utils/chatParser';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface MessageStatsProps {
  analysis: ChatAnalysis;
  parsedChat: ParsedChat;
}

const MessageStats: React.FC<MessageStatsProps> = ({ analysis, parsedChat }) => {
  const isMobile = useIsMobile();
  const participants = parsedChat.participants;
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Convert response time from ms to minutes
  const formatResponseTime = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60));
    if (minutes < 60) {
      return `${minutes} min${minutes !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(minutes / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
  };
  
  // Prepare data for charts
  const messageDistributionData = participants.map(participant => ({
    name: participant,
    messages: analysis.messageCountByParticipant[participant],
    percentage: analysis.messagePercentageByParticipant[participant]
  }));
  
  const wordDistributionData = participants.map(participant => ({
    name: participant,
    words: analysis.wordCountByParticipant[participant]
  }));
  
  const avgMessageLengthData = participants.map(participant => ({
    name: participant,
    length: analysis.averageMessageLengthByParticipant[participant]
  }));
  
  const conversationStarterData = participants.map(participant => ({
    name: participant,
    starters: analysis.conversationStarters[participant].count,
    percentage: analysis.conversationStarters[participant].percentage
  }));
  
  const avgResponseTimeData = participants.map(participant => ({
    name: participant,
    time: analysis.responseTime[participant].average / (1000 * 60) // Convert ms to minutes
  }));
  
  // Simplified pie data for mobile
  const messagesPieData = participants.map(participant => ({
    name: participant,
    value: analysis.messagePercentageByParticipant[participant]
  }));
  
  // Compute colors
  const colors = ['#0071E3', '#4D90FE', '#34C759', '#FF3B30'];
  
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <AnalysisCard 
          title="Chat Overview" 
          className="md:col-span-2"
          gradient
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/50 p-4 rounded-lg">
              <p className="text-xs text-apple-dark-gray mb-1">Total Messages</p>
              <p className="text-2xl font-medium text-apple-black">{analysis.totalMessages.toLocaleString()}</p>
            </div>
            <div className="bg-white/50 p-4 rounded-lg">
              <p className="text-xs text-apple-dark-gray mb-1">Chat Duration</p>
              <p className="text-2xl font-medium text-apple-black">
                {analysis.chatDuration.days} days
              </p>
            </div>
            <div className="bg-white/50 p-4 rounded-lg">
              <p className="text-xs text-apple-dark-gray mb-1">First Message</p>
              <p className="text-lg font-medium text-apple-black">{formatDate(parsedChat.startDate)}</p>
            </div>
            <div className="bg-white/50 p-4 rounded-lg">
              <p className="text-xs text-apple-dark-gray mb-1">Last Message</p>
              <p className="text-lg font-medium text-apple-black">{formatDate(parsedChat.endDate)}</p>
            </div>
          </div>
        </AnalysisCard>
        
        <AnalysisCard title="Message Distribution">
          {isMobile ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={messagesPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {messagesPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={messageDistributionData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, name === 'messages' ? 'Messages' : 'Percentage']} />
                <Bar dataKey="messages" fill="#0071E3" name="Messages">
                  {messageDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="mt-4 grid grid-cols-2 gap-4">
            {participants.map((participant, index) => (
              <div key={participant} className="bg-white/50 p-3 rounded-lg">
                <p className="text-xs text-apple-dark-gray mb-1">
                  {participant}
                </p>
                <p className="text-lg font-medium text-apple-black">
                  {analysis.messageCountByParticipant[participant].toLocaleString()} 
                  <span className="text-xs text-apple-dark-gray ml-1">
                    ({analysis.messagePercentageByParticipant[participant]}%)
                  </span>
                </p>
              </div>
            ))}
          </div>
        </AnalysisCard>
        
        <AnalysisCard title="Who Texts First?">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={conversationStarterData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                name === 'percentage' ? `${value}%` : value, 
                name === 'percentage' ? 'Percentage' : 'Count'
              ]} />
              <Bar dataKey="percentage" fill="#34C759" name="Percentage">
                {conversationStarterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {participants.map((participant, index) => (
              <div key={participant} className="bg-white/50 p-3 rounded-lg">
                <p className="text-xs text-apple-dark-gray mb-1">
                  {participant}
                </p>
                <p className="text-lg font-medium text-apple-black">
                  {analysis.conversationStarters[participant].count.toLocaleString()} 
                  <span className="text-xs text-apple-dark-gray ml-1">
                    ({analysis.conversationStarters[participant].percentage}%)
                  </span>
                </p>
              </div>
            ))}
          </div>
        </AnalysisCard>
        
        <AnalysisCard title="Response Time">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={avgResponseTimeData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${Math.round(Number(value))} mins`, 'Avg. Response Time']} />
              <Bar dataKey="time" fill="#FF3B30" name="Response Time">
                {avgResponseTimeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {participants.map((participant, index) => (
              <div key={participant} className="bg-white/50 p-3 rounded-lg">
                <p className="text-xs text-apple-dark-gray mb-1">
                  {participant}
                </p>
                <p className="text-lg font-medium text-apple-black">
                  {analysis.responseTime[participant].count > 0 
                    ? formatResponseTime(analysis.responseTime[participant].average)
                    : 'N/A'}
                </p>
              </div>
            ))}
          </div>
        </AnalysisCard>
        
        <AnalysisCard title="Word Count">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={wordDistributionData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [value.toLocaleString(), 'Total Words']} />
              <Bar dataKey="words" fill="#FF9500">
                {wordDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {participants.map((participant, index) => (
              <div key={participant} className="bg-white/50 p-3 rounded-lg">
                <p className="text-xs text-apple-dark-gray mb-1">
                  {participant}
                </p>
                <p className="text-lg font-medium text-apple-black">
                  {analysis.wordCountByParticipant[participant].toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </AnalysisCard>
        
        <AnalysisCard title="Message Length">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={avgMessageLengthData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [value, 'Avg. Characters']} />
              <Bar dataKey="length" fill="#5856D6">
                {avgMessageLengthData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {participants.map((participant, index) => (
              <div key={participant} className="bg-white/50 p-3 rounded-lg">
                <p className="text-xs text-apple-dark-gray mb-1">
                  {participant}
                </p>
                <p className="text-lg font-medium text-apple-black">
                  {analysis.averageMessageLengthByParticipant[participant]} chars
                </p>
              </div>
            ))}
          </div>
        </AnalysisCard>
      </div>
      
      <AnalysisCard 
        title="Most Used Words" 
        className="mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {participants.map((participant, index) => (
            <div key={participant}>
              <h4 className="text-sm font-medium mb-3 text-apple-black">{participant}</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.mostFrequentWordsPerParticipant[participant].map(({ word, count }) => (
                  <div 
                    key={word} 
                    className="bg-white px-3 py-1 rounded-full text-sm border border-apple-gray/20"
                    style={{
                      backgroundColor: `${colors[index % colors.length]}10`,
                      borderColor: `${colors[index % colors.length]}30`,
                    }}
                  >
                    {word} <span className="text-xs font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </AnalysisCard>
      
      <AnalysisCard 
        title="Relationship Insights" 
        className="mb-6"
        gradient
      >
        <div className="space-y-4">
          {participants.length === 2 && (
            <>
              <div className="p-4 rounded-lg bg-white/50">
                <h4 className="text-sm font-medium mb-2 text-apple-black">Who Initiates More?</h4>
                <p className="text-sm text-apple-dark-gray">
                  {analysis.conversationStarters[participants[0]].percentage > 
                   analysis.conversationStarters[participants[1]].percentage ? (
                    <span>
                      <strong>{participants[0]}</strong> initiates conversations more often ({analysis.conversationStarters[participants[0]].percentage}% of the time).
                    </span>
                  ) : (
                    <span>
                      <strong>{participants[1]}</strong> initiates conversations more often ({analysis.conversationStarters[participants[1]].percentage}% of the time).
                    </span>
                  )}
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-white/50">
                <h4 className="text-sm font-medium mb-2 text-apple-black">Response Dynamics</h4>
                <p className="text-sm text-apple-dark-gray">
                  {analysis.responseTime[participants[0]].average < 
                   analysis.responseTime[participants[1]].average ? (
                    <span>
                      <strong>{participants[0]}</strong> typically responds faster (in about {formatResponseTime(analysis.responseTime[participants[0]].average)}).
                    </span>
                  ) : (
                    <span>
                      <strong>{participants[1]}</strong> typically responds faster (in about {formatResponseTime(analysis.responseTime[participants[1]].average)}).
                    </span>
                  )}
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-white/50">
                <h4 className="text-sm font-medium mb-2 text-apple-black">Communication Style</h4>
                <p className="text-sm text-apple-dark-gray">
                  {analysis.averageMessageLengthByParticipant[participants[0]] > 
                   analysis.averageMessageLengthByParticipant[participants[1]] ? (
                    <span>
                      <strong>{participants[0]}</strong> tends to write longer messages (average {analysis.averageMessageLengthByParticipant[participants[0]]} characters).
                    </span>
                  ) : (
                    <span>
                      <strong>{participants[1]}</strong> tends to write longer messages (average {analysis.averageMessageLengthByParticipant[participants[1]]} characters).
                    </span>
                  )}
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-white/50">
                <h4 className="text-sm font-medium mb-2 text-apple-black">Emoji Usage</h4>
                <p className="text-sm text-apple-dark-gray">
                  {analysis.emojiUsage.byParticipant[participants[0]] > 
                   analysis.emojiUsage.byParticipant[participants[1]] ? (
                    <span>
                      <strong>{participants[0]}</strong> uses emojis more frequently ({analysis.emojiUsage.byParticipant[participants[0]]} messages with emojis).
                    </span>
                  ) : (
                    <span>
                      <strong>{participants[1]}</strong> uses emojis more frequently ({analysis.emojiUsage.byParticipant[participants[1]]} messages with emojis).
                    </span>
                  )}
                </p>
              </div>
            </>
          )}
          
          <div className="p-4 rounded-lg bg-white/50">
            <h4 className="text-sm font-medium mb-2 text-apple-black">Chat Health</h4>
            <p className="text-sm text-apple-dark-gray">
              Your conversation has lasted for {analysis.chatDuration.days} days, with a total of {analysis.totalMessages} messages exchanged.
              {participants.length === 2 && (
                <>
                  {Math.abs(analysis.messagePercentageByParticipant[participants[0]] - 
                           analysis.messagePercentageByParticipant[participants[1]]) > 20 ? (
                    <span> There appears to be an imbalance in messaging volume, which might be worth discussing.</span>
                  ) : (
                    <span> The conversation seems balanced in terms of participation.</span>
                  )}
                </>
              )}
            </p>
          </div>
        </div>
      </AnalysisCard>
    </div>
  );
};

export default MessageStats;
