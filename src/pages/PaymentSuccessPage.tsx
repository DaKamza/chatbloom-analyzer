
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnalysisCard from '@/components/AnalysisCard';

const PaymentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { productName, features } = location.state || { productName: 'Premium Plan', features: [] };
  
  useEffect(() => {
    // Redirect to dashboard after 5 seconds if state is missing
    if (!location.state) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate]);
  
  // Handle continue button click
  const handleContinue = () => {
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-apple-gray/30 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <AnalysisCard title="Thank You for Your Purchase!" gradient>
          <div className="flex flex-col items-center space-y-6 py-8">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-apple-black">Payment Successful</h2>
              <p className="text-apple-dark-gray">
                Your purchase of <span className="font-medium">{productName}</span> has been confirmed.
              </p>
            </div>
            
            {features && features.length > 0 && (
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-6 rounded-lg w-full">
                <h3 className="text-lg font-medium mb-3 text-center">Features You've Unlocked</h3>
                <ul className="space-y-2">
                  {features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="capitalize">{feature.replace(/_/g, ' ')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <Button onClick={handleContinue} className="mt-6 bg-gradient-to-r from-apple-blue to-apple-light-blue hover:from-apple-blue/90 hover:to-apple-light-blue/90 text-white">
              Continue to Dashboard <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </AnalysisCard>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
