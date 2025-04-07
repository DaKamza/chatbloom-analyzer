
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { PAYPAL_CLIENT_ID } from '@/config/paypal';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface PayPalCheckoutProps {
  amount: string;
  productName: string;
  hostedButtonId: string;
  directPaymentUrl?: string;
  onSuccess?: () => void;
  buttonText?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  className?: string;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

const PayPalCheckout: React.FC<PayPalCheckoutProps> = ({
  amount,
  productName,
  hostedButtonId,
  directPaymentUrl,
  onSuccess,
  buttonText = "Pay with PayPal",
  variant = "default",
  className
}) => {
  const paypalButtonsRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = React.useState(false);
  const [isButtonRendered, setIsButtonRendered] = React.useState(false);
  const [hasAttemptedRender, setHasAttemptedRender] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { user, isPremium } = useAuth();
  const paypalContainerId = `paypal-container-${hostedButtonId || 'direct'}`;

  // Helper to load PayPal SDK script with hosted buttons component
  const loadPayPalScript = () => {
    return new Promise<void>((resolve, reject) => {
      console.log('Loading PayPal SDK with hosted buttons...');
      
      // Remove any existing PayPal scripts to avoid conflicts
      const existingScript = document.querySelector('script[data-namespace="paypal-js"]');
      if (existingScript) {
        existingScript.remove();
        console.log('Removed existing PayPal script');
      }

      try {
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&components=hosted-buttons&disable-funding=venmo&currency=USD`;
        script.setAttribute('data-namespace', 'paypal-js');
        script.async = true;
        
        script.onload = () => {
          console.log('PayPal SDK loaded successfully');
          setSdkReady(true);
          resolve();
        };
        
        script.onerror = (err) => {
          console.error('PayPal SDK could not be loaded', err);
          reject(err);
        };
        
        document.body.appendChild(script);
      } catch (error) {
        console.error('Error loading PayPal script:', error);
        reject(error);
      }
    });
  };

  // Render the hosted button
  const renderHostedButton = () => {
    if (!window.paypal || !paypalButtonsRef.current) {
      console.log('PayPal not available or button container not found');
      return false;
    }
    
    if (!hostedButtonId) {
      console.log('No hosted button ID provided');
      return false;
    }
    
    // Clear any existing content
    if (paypalButtonsRef.current) {
      paypalButtonsRef.current.innerHTML = '';
      console.log('Cleared PayPal button container');
      
      // Create a container div for the hosted button
      const containerDiv = document.createElement('div');
      containerDiv.id = paypalContainerId;
      paypalButtonsRef.current.appendChild(containerDiv);
      
      try {
        console.log(`Rendering hosted button with ID: ${hostedButtonId}`);
        window.paypal.HostedButtons({
          hostedButtonId: hostedButtonId,
        }).render(`#${paypalContainerId}`);
        setIsButtonRendered(true);
        console.log('Hosted button rendered successfully');
        return true;
      } catch (error) {
        console.error('Failed to render hosted button:', error);
        setIsButtonRendered(false);
        return false;
      }
    }
    return false;
  };

  const processPayment = async (orderId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase premium features.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      console.log("Processing payment with order ID:", orderId);
      
      // Call our edge function to verify and process the payment
      const { data, error } = await supabase.functions.invoke("verify-payment", {
        body: {
          transaction_id: orderId,
          product_name: productName,
          amount: amount,
          user_id: user.id
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      console.log("Payment verification response:", data);
      
      if (data.success) {
        toast({
          title: "Payment Successful!",
          description: `Your premium features (${data.features.join(", ")}) have been unlocked.`,
          variant: "default",
        });
        
        if (onSuccess) onSuccess();
      } else {
        throw new Error(data.error || "Payment verification failed");
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      toast({
        title: "Payment Processing Error",
        description: error.message || "There was an issue activating your premium features.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load the PayPal SDK when the component mounts
  useEffect(() => {
    if (!sdkReady) {
      console.log('Loading PayPal SDK on component mount...');
      loadPayPalScript()
        .then(() => {
          console.log('PayPal SDK loaded successfully on component mount');
        })
        .catch(err => {
          console.error('Failed to load PayPal SDK on component mount:', err);
          toast({
            title: "Payment System Error",
            description: "Unable to load payment system. Please try again later.",
            variant: "destructive",
          });
        });
    }
  }, []);

  // Initialize buttons when SDK is ready
  useEffect(() => {
    if (sdkReady && paypalButtonsRef.current && !hasAttemptedRender) {
      console.log('SDK is ready, rendering hosted button');
      setHasAttemptedRender(true);
      const renderSuccess = renderHostedButton();
      
      // Set a timeout to check if button was rendered
      if (!renderSuccess) {
        setTimeout(() => {
          if (paypalButtonsRef.current && paypalButtonsRef.current.children.length === 0) {
            console.log('No PayPal button rendered after timeout');
            setIsButtonRendered(false);
          }
        }, 1000);
      }
    }
  }, [sdkReady, hostedButtonId, hasAttemptedRender]);

  // Handle direct click via fallback button
  const handleDirectPayPalClick = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase premium features.",
        variant: "destructive",
      });
      return;
    }
    
    if (!hostedButtonId && !directPaymentUrl) {
      toast({
        title: "Payment Option Unavailable",
        description: "This payment option is currently unavailable. Please try another option.",
        variant: "destructive",
      });
      return;
    }
    
    // Open PayPal in a new window/tab
    const paypalUrl = directPaymentUrl || `https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=${hostedButtonId}`;
    window.open(paypalUrl, '_blank');
    
    toast({
      title: "Redirecting to PayPal",
      description: "You're being redirected to PayPal to complete your purchase.",
      variant: "default",
    });
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
    <div className="paypal-button-container">
      {/* PayPal hosted buttons will render here */}
      <div 
        ref={paypalButtonsRef} 
        className="paypal-buttons mb-3 min-h-[50px] flex items-center justify-center" 
        data-amount={amount}
        data-hosted-button-id={hostedButtonId}
      >
        {sdkReady && hasAttemptedRender && !isButtonRendered && (
          <div className="text-center text-sm text-gray-500">
            Using default checkout option
          </div>
        )}
      </div>
      
      {/* Always show the fallback button */}
      <Button 
        variant={variant} 
        className={`${className} w-full cursor-pointer`}
        onClick={handleDirectPayPalClick}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : buttonText}
      </Button>
    </div>
  );
};

export default PayPalCheckout;
