
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface PayPalCheckoutProps {
  amount: string;
  productName: string;
  hostedButtonId?: string;
  directPaymentUrl: string;
  onSuccess?: () => void;
  buttonText?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  className?: string;
}

const PayPalCheckout: React.FC<PayPalCheckoutProps> = ({
  amount,
  productName,
  directPaymentUrl,
  onSuccess,
  buttonText = "Pay with PayPal",
  variant = "default",
  className
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const { user, isPremium } = useAuth();

  // Handle PayPal checkout
  const handlePayPalCheckout = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase premium features.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Use standard PayPal checkout URL
    if (directPaymentUrl) {
      try {
        // Add return URL parameter to the PayPal URL
        const returnUrl = `${window.location.origin}/payment-success`;
        const paypalUrl = `${directPaymentUrl}&return=${encodeURIComponent(returnUrl)}`;
        
        // Open PayPal in a new window/tab
        window.open(paypalUrl, '_blank');
        
        toast({
          title: "Redirecting to PayPal",
          description: "Complete your payment on PayPal, then return to this page to access your premium features.",
          variant: "default",
        });
        
        // Simulate successful checkout for demo purposes
        // In production, you would need a webhook to verify the payment
        setTimeout(() => {
          setIsLoading(false);
          
          // After payment, show instructions to the user
          toast({
            title: "Payment Instructions",
            description: "After completing your payment on PayPal, return here and click 'I've paid' to unlock your premium features.",
            variant: "default",
          });
        }, 1500);
      } catch (error) {
        console.error("PayPal checkout error:", error);
        toast({
          title: "Checkout Error",
          description: "There was an error redirecting to PayPal. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    } else {
      toast({
        title: "Payment Option Unavailable",
        description: "This payment option is currently unavailable. Please try another option.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Handle manual verification (for demo purposes)
  const handleManualVerification = () => {
    toast({
      title: "Processing...",
      description: "Verifying your payment...",
      variant: "default",
    });
    
    // In production, you would verify the payment with your backend
    setTimeout(() => {
      if (onSuccess) onSuccess();
      
      toast({
        title: "Payment Successful!",
        description: "Your premium features have been unlocked.",
        variant: "default",
      });
    }, 1500);
  };

  // If user is already premium, show a different message
  if (isPremium) {
    return (
      <div className="text-center py-2">
        <p className="text-green-600 font-medium">✓ You already have premium access</p>
      </div>
    );
  }

  return (
    <div className="paypal-button-container space-y-3">
      {/* Primary payment button */}
      <Button 
        variant={variant} 
        className={`${className} w-full cursor-pointer`}
        onClick={handlePayPalCheckout}
        disabled={isLoading}
      >
        {isLoading ? "Redirecting..." : buttonText}
      </Button>
      
      {/* "I've paid" button that appears after the user is redirected to PayPal */}
      {isLoading && (
        <Button 
          variant="outline" 
          className="w-full mt-2 cursor-pointer"
          onClick={handleManualVerification}
        >
          I've paid on PayPal
        </Button>
      )}
    </div>
  );
};

export default PayPalCheckout;
