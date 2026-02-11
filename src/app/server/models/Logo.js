import mongoose from 'mongoose';

const logoSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, 'Logo URL is required'],
    },
    publicId: {
      type: String,
      required: true, // Cloudinary public ID for deletion
    },
    width: {
      type: Number,
      default: 170,
    },
    height: {
      type: Number,
      default: 50,
    },
    alt: {
      type: String,
      default: 'CANAN USA Logo',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Logo || mongoose.model('Logo', logoSchema);
