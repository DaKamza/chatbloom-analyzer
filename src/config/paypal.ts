
// Payment gateway configuration
// Currently using PayPal with hosted buttons

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
    // Standard PayPal checkout URLs
    directPaymentUrl: 'https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=chatbloom@mail.com&item_name=WhatsApp%20Analyzer%20Premium%20Monthly&amount=2.99&currency_code=USD'
  },
  PREMIUM_YEARLY: {
    name: 'WhatsApp Analyzer Premium Yearly',
    price: '29.99',
    id: 'premium-yearly',
    hostedButtonId: '',
    directPaymentUrl: 'https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=chatbloom@mail.com&item_name=WhatsApp%20Analyzer%20Premium%20Yearly&amount=29.99&currency_code=USD'
  },
  ONE_TIME_FEATURES: {
    name: 'WhatsApp Analyzer Premium Features',
    price: '4.99',
    id: 'one-time-features',
    hostedButtonId: 'XGKN4MK8K88GG',
    directPaymentUrl: 'https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=chatbloom@mail.com&item_name=WhatsApp%20Analyzer%20Premium%20Features&amount=4.99&currency_code=USD'
  },
  ALL_INCLUSIVE: {
    name: 'WhatsApp Analyzer All Features',
    price: '9.99',
    id: 'all-inclusive',
    hostedButtonId: 'PWKBHRC3QSM8N',
    directPaymentUrl: 'https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=chatbloom@mail.com&item_name=WhatsApp%20Analyzer%20All%20Features&amount=9.99&currency_code=USD'
  }
};

// Notes on PayPal integration:
// 1. Currently using sandbox mode for testing - switch to 'production' when ready
// 2. PayPal email address is set to "chatbloom@mail.com"
// 3. Using standard PayPal checkout URLs for direct payments
// 4. For more advanced checkout, consider implementing PayPal Checkout SDK directly
