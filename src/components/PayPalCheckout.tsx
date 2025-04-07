
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
  onSuccess,
  buttonText = "Pay with PayPal",
  variant = "default",
  className
}) => {
  const paypalButtonsRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = React.useState(false);
  const [isButtonRendered, setIsButtonRendered] = React.useState(false);
  const { user, isPremium } = useAuth();
  const paypalContainerId = `paypal-container-${hostedButtonId}`;

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
    });
  };

  // Render the hosted button
  const renderHostedButton = () => {
    if (!window.paypal || !paypalButtonsRef.current || !hostedButtonId) {
      console.log('PayPal not available or button container not found, or no hosted button ID provided');
      return;
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
      } catch (error) {
        console.error('Failed to render hosted button:', error);
        setIsButtonRendered(false);
      }
    }
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
    }
  };

  // Load the PayPal SDK when the component mounts
  useEffect(() => {
    if (!sdkReady && hostedButtonId) {
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
  }, [hostedButtonId]);

  // Initialize buttons when SDK is ready
  useEffect(() => {
    if (sdkReady && paypalButtonsRef.current && hostedButtonId) {
      console.log('SDK is ready, rendering hosted button');
      renderHostedButton();
      
      // Set a timeout to check if button was rendered
      setTimeout(() => {
        if (paypalButtonsRef.current && paypalButtonsRef.current.children.length === 0) {
          console.log('No PayPal button rendered after timeout, trying again');
          renderHostedButton();
        }
      }, 1000);
    }
  }, [sdkReady, hostedButtonId]);

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
    
    if (!hostedButtonId) {
      toast({
        title: "Payment Option Unavailable",
        description: "This payment option is currently unavailable. Please try another option.",
        variant: "destructive",
      });
      return;
    }
    
    // Open PayPal in a new window/tab
    const paypalUrl = `https://www.paypal.com/webapps/hermes?token=${hostedButtonId}&useraction=commit&mfid=1680289753873_66ae41178c77c`;
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
        {sdkReady && !isButtonRendered && (
          <div className="text-center text-sm text-gray-500">
            Loading PayPal...
          </div>
        )}
      </div>
      
      {/* Always show the fallback button */}
      <Button 
        variant={variant} 
        className={`${className} w-full cursor-pointer`}
        onClick={handleDirectPayPalClick}
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default PayPalCheckout;
