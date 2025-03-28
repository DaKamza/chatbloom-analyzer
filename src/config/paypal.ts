
// Payment gateway configuration
// Currently using PayPal, but structured to allow easy switching to other providers

// PayPal provides a 'sb' (sandbox) client ID for testing
export const PAYPAL_CLIENT_ID = 'sb'; // Replace with your actual PayPal client ID in production

// For development (sandbox) mode:
export const PAYPAL_ENV = 'sandbox'; // Use 'production' for live payments

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

// Instructions for switching to production:
// 1. Create a PayPal Business account at https://www.paypal.com/business
// 2. Once approved, get your live Client ID from the PayPal Developer Dashboard
// 3. Replace PAYPAL_CLIENT_ID with your live Client ID
// 4. Change PAYPAL_ENV to 'production'
