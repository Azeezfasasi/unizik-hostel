import mongoose from 'mongoose';

const paymentMethodSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      description: 'Machine-readable identifier (e.g., bank-transfer)',
    },
    label: {
      type: String,
      required: true,
      description: 'Display name (e.g., Bank Transfer)',
    },
    description: {
      type: String,
      default: '',
      description: 'Detailed explanation of the payment method',
    },
    icon: {
      type: String,
      default: 'CreditCard',
      description: 'Lucide icon name for UI display',
    },
    category: {
      type: String,
      enum: ['bank', 'digital', 'check', 'cash', 'other'],
      default: 'other',
      description: 'Category of payment method',
    },
    isActive: {
      type: Boolean,
      default: true,
      description: 'Toggle visibility in forms',
    },
    order: {
      type: Number,
      default: 0,
      description: 'Display order in dropdowns (lower numbers appear first)',
    },
    requiresReference: {
      type: Boolean,
      default: false,
      description: 'Whether this method requires a reference number',
    },
    minAmount: {
      type: Number,
      default: null,
      description: 'Minimum donation amount for this method',
    },
    maxAmount: {
      type: Number,
      default: null,
      description: 'Maximum donation amount for this method',
    },
    supportedCurrencies: {
      type: [String],
      default: ['USD', 'CAD', 'EUR', 'GBP', 'NGN'],
      description: 'List of supported currencies for this payment method',
    },
    processingTime: {
      type: String,
      default: 'Instant',
      description: 'Expected processing time (e.g., "1-3 business days")',
    },
    fees: {
      type: Number,
      default: 0,
      description: 'Processing fee as a percentage',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      description: 'User who created this payment method',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      description: 'User who last updated this payment method',
    },
  },
  {
    timestamps: true,
    collection: 'paymentMethods',
  }
);

// Index for efficient queries
paymentMethodSchema.index({ isActive: 1, order: 1 });
paymentMethodSchema.index({ value: 1 });

const PaymentMethod =
  mongoose.models.PaymentMethod ||
  mongoose.model('PaymentMethod', paymentMethodSchema);

export default PaymentMethod;
