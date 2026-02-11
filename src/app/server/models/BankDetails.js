import mongoose from 'mongoose';

const bankDetailsSchema = new mongoose.Schema(
  {
    bankName: {
      type: String,
      required: [true, 'Bank name is required'],
      trim: true,
    },
    accountName: {
      type: String,
      required: [true, 'Account holder name is required'],
      trim: true,
    },
    accountNumber: {
      type: String,
      required: [true, 'Account number is required'],
      trim: true,
    },
    routingNumber: {
      type: String,
      trim: true,
    },
    swiftCode: {
      type: String,
      trim: true,
    },
    ibanCode: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    website: {
      type: String,
      trim: true,
    },
    accountType: {
      type: String,
      enum: ['checking', 'savings', 'business'],
      default: 'business',
    },
    currency: {
      type: String,
      default: 'USD',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one active bank account details document exists
bankDetailsSchema.pre('save', async function (next) {
  if (this.isActive) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  this.lastUpdatedAt = new Date();
  next();
});

// Create or retrieve the model
const BankDetails = mongoose.models.BankDetails || mongoose.model('BankDetails', bankDetailsSchema);

export default BankDetails;
