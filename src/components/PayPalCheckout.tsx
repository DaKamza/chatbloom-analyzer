
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { PAYPAL_CLIENT_ID, PAYPAL_ENV } from '@/config/paypal';

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

  // Helper to load PayPal SDK script
  const loadPayPalScript = () => {
    // Check if script is already added
    if (document.querySelector('script[data-namespace="paypal-js"]')) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
      script.setAttribute('data-namespace', 'paypal-js');
      script.onload = () => resolve();
      script.onerror = (err) => reject(err);
      document.body.appendChild(script);
    });
  };

  const initializePayPalButtons = () => {
    if (!window.paypal || !paypalButtonsRef.current || paypalInitialized.current) return;

    paypalInitialized.current = true;
    
    window.paypal.Buttons({
      createOrder: (_data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [
            {
              description: productName,
              amount: {
                value: amount
              }
            }
          ]
        });
      },
      onApprove: async (_data: any, actions: any) => {
        const order = await actions.order.capture();
        console.log('Payment successful:', order);
        toast({
          title: "Payment Successful!",
          description: "Your premium features have been unlocked.",
          variant: "default",
        });
        if (onSuccess) onSuccess();
      },
      onError: (err: any) => {
        console.error('PayPal error:', err);
        toast({
          title: "Payment Failed",
          description: "There was an issue processing your payment. Please try again.",
          variant: "destructive",
        });
      }
    }).render(paypalButtonsRef.current);
  };

  useEffect(() => {
    if (paypalButtonsRef.current) {
      loadPayPalScript().then(() => {
        initializePayPalButtons();
      }).catch(err => {
        console.error('Failed to load PayPal SDK:', err);
        toast({
          title: "Payment System Error",
          description: "Unable to load payment system. Please try again later.",
          variant: "destructive",
        });
      });
    }

    return () => {
      paypalInitialized.current = false;
    };
  }, [paypalButtonsRef.current]);

  // Fallback button for when PayPal doesn't load
  const handleFallbackClick = () => {
    if (!window.paypal) {
      toast({
        title: "Payment System Loading",
        description: "Please wait a moment and try again...",
        variant: "default",
      });
      loadPayPalScript().then(() => {
        initializePayPalButtons();
      });
    }
  };

  return (
    <div className="paypal-button-container">
      <div ref={paypalButtonsRef} className="paypal-buttons"></div>
      <Button 
        variant={variant} 
        className={`${className} paypal-fallback-button`}
        onClick={handleFallbackClick}
      >
        {buttonText}
      </Button>
      <style jsx>{`
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
