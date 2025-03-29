
// Payment gateway configuration
// Currently using PayPal, but structured to allow easy switching to other providers

// PayPal client ID for live payments
export const PAYPAL_CLIENT_ID = 'AfNum6v6pWBwd88FyJlwWg-XzAW-oau2ibfiMYPXM9f6MzRw7GrFEIRwpMGXW-Daf_HPFBM_eKYCAce0';

// For production mode:
export const PAYPAL_ENV = 'production'; // Changed from 'sandbox' to 'production'

// Product configurations that can be used with any payment provider
export const PRODUCTS = {
  PREMIUM_MONTHLY: {
    name: 'WhatsApp Analyzer Premium Monthly',
    price: '2.99',
    id: 'premium-monthly'
  },
  PREMIUM_YEARLY: {
    name: 'WhatsApp Analyzer Premium Yearly',
    price: '29.99',
    id: 'premium-yearly'
  },
  ONE_TIME_FEATURES: {
    name: 'WhatsApp Analyzer Premium Features',
    price: '4.99',
    id: 'one-time-features'
  },
  ALL_INCLUSIVE: {
    name: 'WhatsApp Analyzer All Features',
    price: '9.99',
    id: 'all-inclusive'
  }
};

// Your PayPal account is now configured for production payments
// If you need to make changes to your PayPal setup, visit your PayPal Business account dashboard
