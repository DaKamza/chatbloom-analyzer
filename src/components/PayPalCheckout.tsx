
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { PAYPAL_CLIENT_ID, PAYPAL_ENV } from '@/config/paypal';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface PayPalCheckoutProps {
  amount: string;
  productName: string;
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
  onSuccess,
  buttonText = "Pay with PayPal",
  variant = "default",
  className
}) => {
  const paypalButtonsRef = useRef<HTMLDivElement>(null);
  const paypalInitialized = useRef(false);
  const [sdkReady, setSdkReady] = React.useState(false);
  const { user, isPremium } = useAuth();

  // Helper to load PayPal SDK script
  const loadPayPalScript = () => {
    return new Promise<void>((resolve, reject) => {
      // Remove any existing PayPal scripts to avoid conflicts
      const existingScript = document.querySelector('script[data-namespace="paypal-js"]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
      script.setAttribute('data-namespace', 'paypal-js');
      script.async = true;
      
      script.onload = () => {
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

  const processPayment = async (orderData: any) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase premium features.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Call our edge function to verify and process the payment
      const { data, error } = await supabase.functions.invoke("verify-payment", {
        body: {
          transaction_id: orderData.id,
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

  const initializePayPalButtons = () => {
    if (!window.paypal || !paypalButtonsRef.current || paypalInitialized.current) return;

    try {
      // Clear any existing content
      if (paypalButtonsRef.current) {
        paypalButtonsRef.current.innerHTML = '';
      }

      paypalInitialized.current = true;
      
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'paypal'
        },
        createOrder: (_data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                description: productName,
                amount: {
                  value: amount
                }
              }
            ],
            application_context: {
              shipping_preference: 'NO_SHIPPING'
            }
          });
        },
        onApprove: async (_data: any, actions: any) => {
          const order = await actions.order.capture();
          console.log('Payment successful:', order);
          
          // Process the payment in our backend
          await processPayment(order);
        },
        onError: (err: any) => {
          console.error('PayPal error:', err);
          toast({
            title: "Payment Failed",
            description: "There was an issue processing your payment. Please try again.",
            variant: "destructive",
          });
        },
        onCancel: () => {
          toast({
            title: "Payment Cancelled",
            description: "You've cancelled the payment process. You can try again anytime.",
            variant: "default",
          });
        }
      }).render(paypalButtonsRef.current);
    } catch (error) {
      console.error('Failed to initialize PayPal buttons:', error);
      paypalInitialized.current = false;
    }
  };

  useEffect(() => {
    // Load the PayPal SDK when the component mounts
    loadPayPalScript()
      .then(() => {
        console.log('PayPal SDK loaded successfully');
        // The SDK is now loaded, will be initialized in the next useEffect
      })
      .catch(err => {
        console.error('Failed to load PayPal SDK:', err);
        toast({
          title: "Payment System Error",
          description: "Unable to load payment system. Please try again later.",
          variant: "destructive",
        });
      });

    // Cleanup function
    return () => {
      paypalInitialized.current = false;
    };
  }, []);

  // Initialize buttons when SDK is ready
  useEffect(() => {
    if (sdkReady && paypalButtonsRef.current) {
      initializePayPalButtons();
    }
  }, [sdkReady]);

  // If user is already premium, show a different message
  if (isPremium) {
    return (
      <div className="text-center py-2">
        <p className="text-green-600 font-medium">✓ You already have premium access</p>
      </div>
    );
  }

  // Fallback button for when PayPal doesn't load
  const handleFallbackClick = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase premium features.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Payment System Loading",
      description: "Please wait a moment and try again...",
      variant: "default",
    });
    
    // Attempt to reload the SDK
    loadPayPalScript().then(() => {
      // SDK will be reinitialized via the sdkReady useEffect
    });
  };

  return (
    <div className="paypal-button-container">
      <div ref={paypalButtonsRef} className="paypal-buttons"></div>
      {!sdkReady && (
        <Button 
          variant={variant} 
          className={`${className} paypal-fallback-button`}
          onClick={handleFallbackClick}
        >
          {buttonText}
        </Button>
      )}
      <style>{`
        .paypal-fallback-button {
          display: block;
        }
        .paypal-buttons:not(:empty) + .paypal-fallback-button {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default PayPalCheckout;
