import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
  {
    // Donor Information
    donorName: {
      type: String,
      required: [true, 'Donor name is required'],
      trim: true,
    },
    donorEmail: {
      type: String,
      required: [true, 'Donor email is required'],
      lowercase: true,
      validate: {
        validator: function (email) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: 'Invalid email address',
      },
    },
    donorPhone: {
      type: String,
      trim: true,
    },
    donorMessage: {
      type: String,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },

    // Donation Details
    amount: {
      type: Number,
      required: [true, 'Donation amount is required'],
      min: [1, 'Amount must be greater than 0'],
    },
    currency: {
      type: String,
      enum: ['USD', 'CAD', 'EUR', 'GBP', 'NGN'],
      default: 'USD',
    },
    donationType: {
      type: String,
      required: [true, 'Donation type is required'],
      trim: true,
      description: 'References DonationType collection value',
    },

    // Payment Information
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      trim: true,
      description: 'References PaymentMethod collection value',
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    referenceNumber: {
      type: String,
      trim: true,
    },

    // Status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },

    // Admin Fields
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
    },
    processedAt: {
      type: Date,
    },
    receiptSent: {
      type: Boolean,
      default: false,
    },
    receiptSentAt: {
      type: Date,
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Update the updatedAt field before saving
donationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient querying
donationSchema.index({ donorEmail: 1 });
donationSchema.index({ status: 1 });
donationSchema.index({ createdAt: -1 });
donationSchema.index({ donationType: 1 });

export default mongoose.models.Donation || mongoose.model('Donation', donationSchema);
