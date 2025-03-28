
import React from 'react';
import { Sparkles, Zap, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnalysisCard from './AnalysisCard';

interface UpgradePromptsProps {
  type?: 'basic' | 'pay-per-feature' | 'subscription';
}

const UpgradePrompts: React.FC<UpgradePromptsProps> = ({ type = 'basic' }) => {
  const handleUpgrade = () => {
    console.log('Upgrade clicked:', type);
    // Here you would implement the actual upgrade flow
    alert('This is a demo - in a real app, this would redirect to a payment page');
  };

  if (type === 'basic') {
    return (
      <AnalysisCard title="Premium Deep Insights" gradient>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-apple-black">Your chat analysis is ready! 🎉</h3>
              <p className="text-apple-dark-gray">Here's what we found:</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white/50 p-3 rounded-lg">
              <p className="text-sm">✅ Who texts first?</p>
            </div>
            <div className="bg-white/50 p-3 rounded-lg">
              <p className="text-sm">✅ Most used words</p>
            </div>
            <div className="bg-white/50 p-3 rounded-lg">
              <p className="text-sm">✅ Chat duration</p>
            </div>
            <div className="bg-white/50 p-3 rounded-lg">
              <p className="text-sm">✅ Emoji trends</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-lg mt-4">
            <h4 className="text-base font-medium mb-2">📊 Want to unlock deeper insights?</h4>
            <p className="text-sm mb-3">
              Upgrade to Premium Deep Insights to access:
            </p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>Sentiment & Mood Analysis</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>Conflict Detection & Causes</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>Who is more invested?</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>Personalized AI Relationship Advice</span>
              </li>
            </ul>
            <div className="text-center">
              <p className="text-sm font-medium mb-3">🔥 Upgrade now & get 50% off for first-time users! 🔥</p>
              <Button 
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                onClick={handleUpgrade}
              >
                <Sparkles className="w-4 h-4 mr-2" /> Upgrade to Premium
              </Button>
            </div>
          </div>
        </div>
      </AnalysisCard>
    );
  }
  
  if (type === 'pay-per-feature') {
    return (
      <AnalysisCard title="Advanced Chat Analysis" gradient>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-apple-black">Unlock Advanced Chat Analysis for a one-time fee!</h3>
              <p className="text-apple-dark-gray">🔓 Get exclusive insights:</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white/50 p-3 rounded-lg">
              <p className="text-sm">✅ Toxicity Warning – Detect unhealthy communication patterns</p>
            </div>
            <div className="bg-white/50 p-3 rounded-lg">
              <p className="text-sm">✅ Mood Graphs – Visualize emotional highs and lows</p>
            </div>
            <div className="bg-white/50 p-3 rounded-lg">
              <p className="text-sm">✅ Conflict Trends – Identify patterns in arguments</p>
            </div>
            <div className="bg-white/50 p-3 rounded-lg">
              <p className="text-sm">✅ Engagement Report – See who puts more effort</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-4 rounded-lg mt-4">
            <div className="text-center">
              <p className="text-sm font-medium mb-3">🎁 Limited-time offer: Unlock all for just $4.99!</p>
              <Button 
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                onClick={handleUpgrade}
              >
                <Zap className="w-4 h-4 mr-2" /> Unlock Now
              </Button>
            </div>
          </div>
        </div>
      </AnalysisCard>
    );
  }
  
  if (type === 'subscription') {
    return (
      <AnalysisCard title="AI-Powered Relationship Advice" gradient>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-red-500 shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-apple-black">Want ongoing AI-powered relationship advice based on your chats?</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white/50 p-3 rounded-lg">
              <p className="text-sm">✅ Weekly chat insights & suggestions</p>
            </div>
            <div className="bg-white/50 p-3 rounded-lg">
              <p className="text-sm">✅ AI-powered conversation coaching</p>
            </div>
            <div className="bg-white/50 p-3 rounded-lg">
              <p className="text-sm">✅ Personalized tips to improve texting habits</p>
            </div>
            <div className="bg-white/50 p-3 rounded-lg">
              <p className="text-sm">✅ Monthly Toxicity & Balance Reports</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-100 to-pink-100 p-4 rounded-lg mt-4">
            <div className="text-center">
              <p className="text-sm font-medium mb-3">🎯 Subscribe now for just $2.99/month and get a 7-day free trial!</p>
              <div className="flex gap-3 justify-center">
                <Button 
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-50"
                  onClick={() => handleUpgrade()}
                >
                  Start Free Trial
                </Button>
                <Button 
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
                  onClick={() => handleUpgrade()}
                >
                  <Heart className="w-4 h-4 mr-2" /> Subscribe Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AnalysisCard>
    );
  }
  
  return null;
};

export default UpgradePrompts;
