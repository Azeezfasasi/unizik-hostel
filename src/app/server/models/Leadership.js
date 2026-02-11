import mongoose from 'mongoose';

const LeadershipSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    position: {
      type: String,
      required: [true, 'Please provide a position'],
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    bio: {
      type: String,
      trim: true,
    },
    image: {
      url: String,
      publicId: String,
      alt: String,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    linkedin: {
      type: String,
      trim: true,
    },
    twitter: {
      type: String,
      trim: true,
    },
    responsibilities: [String],
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Delete old model if it exists and recreate it to ensure schema is fresh
if (mongoose.models.Leadership) {
  delete mongoose.models.Leadership;
}

export default mongoose.model('Leadership', LeadershipSchema);
