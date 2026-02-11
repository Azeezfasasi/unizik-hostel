import mongoose from 'mongoose';

const donationTypeSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: [true, 'Donation type value is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    label: {
      type: String,
      required: [true, 'Donation type label is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      default: 'Heart',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Create or retrieve the model
const DonationType = mongoose.models.DonationType || mongoose.model('DonationType', donationTypeSchema);

export default DonationType;
