
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
  const [sdkReady, setSdkReady] = React.useState(false);
  const [isButtonRendered, setIsButtonRendered] = React.useState(false);
  const { user, isPremium } = useAuth();

  // Helper to load PayPal SDK script
  const loadPayPalScript = () => {
    return new Promise<void>((resolve, reject) => {
      console.log('Loading PayPal SDK with client ID:', PAYPAL_CLIENT_ID);
      
      // Remove any existing PayPal scripts to avoid conflicts
      const existingScript = document.querySelector('script[data-namespace="paypal-js"]');
      if (existingScript) {
        existingScript.remove();
        console.log('Removed existing PayPal script');
      }

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&disable-funding=credit,card`;
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
      console.log("Processing payment with order data:", orderData);
      
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
    if (!window.paypal || !paypalButtonsRef.current) {
      console.log('PayPal not available or button container not found');
      return;
    }
    
    // Clear any existing content
    if (paypalButtonsRef.current) {
      paypalButtonsRef.current.innerHTML = '';
      console.log('Cleared PayPal button container');
    }

    try {
      console.log('Initializing PayPal buttons with amount:', amount);
      
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal'
        },
        createOrder: (_data: any, actions: any) => {
          console.log('Creating PayPal order for amount:', amount);
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
          console.log('Payment approved, capturing order...');
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
          console.log('Payment cancelled by user');
          toast({
            title: "Payment Cancelled",
            description: "You've cancelled the payment process. You can try again anytime.",
            variant: "default",
          });
        },
        onRender: () => {
          console.log('PayPal buttons rendered successfully');
          setIsButtonRendered(true);
        }
      }).render(paypalButtonsRef.current);
      
      console.log('PayPal render function called');
    } catch (error) {
      console.error('Failed to initialize PayPal buttons:', error);
      setIsButtonRendered(false);
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
    if (sdkReady && paypalButtonsRef.current) {
      console.log('SDK is ready, initializing PayPal buttons');
      initializePayPalButtons();
      
      // Set a timeout to check if buttons were rendered
      setTimeout(() => {
        if (paypalButtonsRef.current && paypalButtonsRef.current.children.length === 0) {
          console.log('No PayPal buttons rendered after timeout, forcing re-render');
          initializePayPalButtons();
        }
      }, 1000);
    }
  }, [sdkReady, amount]);

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
      {/* PayPal buttons will render here */}
      <div 
        ref={paypalButtonsRef} 
        className="paypal-buttons mb-3 min-h-[40px] flex items-center justify-center" 
        data-amount={amount}
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
        onClick={() => {
          if (!user) {
            toast({
              title: "Authentication Required",
              description: "Please log in to purchase premium features.",
              variant: "destructive",
            });
            return;
          }
          
          if (!sdkReady) {
            // If SDK is not ready, try loading it again
            loadPayPalScript();
            toast({
              title: "Payment System Loading",
              description: "Please wait a moment while we connect to PayPal...",
              variant: "default",
            });
          } else {
            // If SDK is ready but buttons aren't shown, reinitialize
            initializePayPalButtons();
            toast({
              title: "Opening PayPal",
              description: "Redirecting to PayPal for secure payment...",
              variant: "default",
            });
            
            // Attempt to open PayPal in a popup if buttons don't render
            if (!isButtonRendered) {
              const checkoutUrl = `https://www.paypal.com/checkoutnow?token=EC-${productName.replace(/\s+/g, '')}-${Date.now()}`;
              window.open(checkoutUrl, '_blank');
            }
          }
        }}
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default PayPalCheckout;
