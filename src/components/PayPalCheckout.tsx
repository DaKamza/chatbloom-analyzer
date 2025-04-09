
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  // Handle PayPal checkout
  const handlePayPalCheckout = () => {
    // First check if user is logged in
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase premium features.",
        variant: "destructive",
      });
      // Redirect to auth page
      navigate('/auth');
      return;
    }
    
    setIsLoading(true);
    
    // Use PayPal.me links for direct checkout
    if (directPaymentUrl) {
      try {
        // Store purchase info in localStorage for retrieval after redirection
        localStorage.setItem('pendingPurchase', JSON.stringify({
          productName,
          amount,
          timestamp: new Date().toISOString(),
          userId: user.id
        }));
        
        // Open PayPal in a new window/tab
        window.open(directPaymentUrl, '_blank');
        
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
  const handleManualVerification = async () => {
    toast({
      title: "Processing...",
      description: "Verifying your payment...",
      variant: "default",
    });
    
    try {
      // Get the pending purchase from localStorage
      const pendingPurchase = localStorage.getItem('pendingPurchase');
      if (!pendingPurchase) {
        throw new Error("No pending purchase found");
      }

      const purchase = JSON.parse(pendingPurchase);
      
      // Generate a unique transaction ID
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      // Call the Supabase function to verify payment and update user status
      const { data, error } = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            transaction_id: transactionId,
            product_name: purchase.productName,
            amount: purchase.amount,
            user_id: user?.id
          })
        }
      ).then(res => res.json());
      
      if (error) {
        throw error;
      }

      // Clear the pending purchase
      localStorage.removeItem('pendingPurchase');
      
      // Call the onSuccess callback if provided
      if (onSuccess) onSuccess();
      
      // Show a success message
      toast({
        title: "Payment Successful!",
        description: "Your premium features have been unlocked.",
        variant: "default",
      });
      
      // Redirect to thank you page
      navigate('/payment-success', { 
        state: { 
          productName: purchase.productName,
          features: data?.features || [] 
        } 
      });
      
    } catch (error) {
      console.error("Payment verification error:", error);
      toast({
        title: "Verification Failed",
        description: "There was an error verifying your payment. Please contact support.",
        variant: "destructive",
      });
    }
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
