
// PayPal configuration
// In production, you'd use real client IDs provided by PayPal
// For now, we're using sandbox (test) mode

// PayPal provides a 'sb' (sandbox) client ID for testing
export const PAYPAL_CLIENT_ID = 'sb'; // Replace with your actual PayPal client ID in production

// For development (sandbox) mode:
export const PAYPAL_ENV = 'sandbox'; // Use 'production' for live payments

// If your app needs to track different products/price points:
export const PAYPAL_PRODUCTS = {
  PREMIUM_MONTHLY: {
    name: 'WhatsApp Analyzer Premium Monthly',
    price: '2.99'
  },
  PREMIUM_YEARLY: {
    name: 'WhatsApp Analyzer Premium Yearly',
    price: '29.99'
  },
  ONE_TIME_FEATURES: {
    name: 'WhatsApp Analyzer Premium Features',
    price: '4.99'
  },
  ALL_INCLUSIVE: {
    name: 'WhatsApp Analyzer All Features',
    price: '9.99'
  }
};
