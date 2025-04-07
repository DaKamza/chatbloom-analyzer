
// Payment gateway configuration
// Currently using PayPal with hosted buttons

// PayPal client ID for live payments
export const PAYPAL_CLIENT_ID = 'BAArDLyFaV3LoVN9n_Shk33VHan0ua9i_d90Mtj0zlTtjQTYCTVxjogcsAunbKv6mKV1swfLfP4uLJ2mxU';

// For production mode:
export const PAYPAL_ENV = 'production';

// Product configurations that can be used with any payment provider
export const PRODUCTS = {
  PREMIUM_MONTHLY: {
    name: 'WhatsApp Analyzer Premium Monthly',
    price: '2.99',
    id: 'premium-monthly',
    hostedButtonId: 'FAHVBVJHL353S'
  },
  PREMIUM_YEARLY: {
    name: 'WhatsApp Analyzer Premium Yearly',
    price: '29.99',
    id: 'premium-yearly',
    hostedButtonId: ''
  },
  ONE_TIME_FEATURES: {
    name: 'WhatsApp Analyzer Premium Features',
    price: '4.99',
    id: 'one-time-features',
    hostedButtonId: 'XGKN4MK8K88GG'
  },
  ALL_INCLUSIVE: {
    name: 'WhatsApp Analyzer All Features',
    price: '9.99',
    id: 'all-inclusive',
    hostedButtonId: 'PWKBHRC3QSM8N'
  }
};

// Your PayPal account is now configured for production payments with hosted buttons
// If you need to make changes to your PayPal setup, visit your PayPal Business account dashboard
