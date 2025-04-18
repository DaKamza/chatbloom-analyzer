
// Payment gateway configuration
// Currently using PayPal with direct payment links

// PayPal client ID for sandbox environment (for testing)
export const PAYPAL_CLIENT_ID = 'AYFGfKUlOIENKXCbrS9iX7Pl4cJM9wYWHhbvAQXxczaXGiXndPaUJsGbeNiy6xVCfbDRT8nGtEOUsABZ';

// For testing mode:
export const PAYPAL_ENV = 'sandbox';

// Product configurations that can be used with any payment provider
export const PRODUCTS = {
  PREMIUM_MONTHLY: {
    name: 'WhatsApp Analyzer Premium Monthly',
    price: '2.99',
    id: 'premium-monthly',
    hostedButtonId: 'FAHVBVJHL353S',
    // Updated PayPal checkout URL format for buyer checkout (not seller login)
    directPaymentUrl: 'https://www.paypal.com/paypalme/TheNerdSolutionZA/2.99'
  },
  PREMIUM_YEARLY: {
    name: 'WhatsApp Analyzer Premium Yearly',
    price: '29.99',
    id: 'premium-yearly',
    hostedButtonId: '',
    directPaymentUrl: 'https://www.paypal.com/paypalme/TheNerdSolutionZA/29.99'
  },
  ONE_TIME_FEATURES: {
    name: 'WhatsApp Analyzer Premium Features',
    price: '4.99',
    id: 'one-time-features',
    hostedButtonId: 'XGKN4MK8K88GG',
    directPaymentUrl: 'https://www.paypal.com/paypalme/TheNerdSolutionZA/4.99'
  },
  ALL_INCLUSIVE: {
    name: 'WhatsApp Analyzer All Features',
    price: '9.99',
    id: 'all-inclusive',
    hostedButtonId: 'PWKBHRC3QSM8N',
    directPaymentUrl: 'https://www.paypal.com/paypalme/TheNerdSolutionZA/9.99'
  }
};

// Notes on PayPal integration:
// 1. Currently using PayPal.me links for direct payments
// 2. PayPal username is set to "TheNerdSolutionZA" 
// 3. For sandbox testing, create a separate PayPal sandbox account
// 4. For more advanced checkout, consider implementing PayPal Checkout SDK directly
