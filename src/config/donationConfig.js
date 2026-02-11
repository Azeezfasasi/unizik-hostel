/**
 * Account Details Configuration
 * Update these values with your actual bank account information
 */

export const ACCOUNT_DETAILS = {
  bankName: 'Bank of America',
  accountName: 'CANAN USA Inc.',
  accountNumber: '****1234',
  routingNumber: '****5678',
  swiftCode: 'BOAUS3N',
  ibanCode: 'N/A',
  address: '123 Main Street, New York, NY 10001',
  phone: '(555) 123-4567',
  email: 'donations@cananusa.org',
  website: 'www.cananusa.org',
};

export const DONATION_TYPES = [
  { value: 'general', label: 'General Fund', description: 'Support our general operations' },
  { value: 'building-fund', label: 'Building Fund', description: 'Help us build our facility' },
  { value: 'scholarship', label: 'Scholarship Program', description: 'Support student scholarships' },
  {
    value: 'community-outreach',
    label: 'Community Outreach',
    description: 'Help those in need',
  },
  { value: 'other', label: 'Other', description: 'Special project or initiative' },
];

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
];

export const PAYMENT_METHODS = [
  { value: 'bank-transfer', label: 'Bank Transfer' },
  { value: 'check', label: 'Check' },
  { value: 'cash', label: 'Cash' },
  { value: 'other', label: 'Other' },
];
