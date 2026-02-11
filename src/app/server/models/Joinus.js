import mongoose from 'mongoose';

const joinusSchema = new mongoose.Schema(
  {
    // Personal Information (Step 1)
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: false,
    },

    gender: {
      type: String,
      required: true,
    },

    // Location & Background (Step 2)
    country: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    placeOfOrigin: {
      type: String,
      trim: true,
    },

    // Interests & Involvement (Step 3)
    membershipType: {
      type: String,
      enum: ['regular', 'student', 'corporate'],
      default: 'regular',
    },
    interests: [
      {
        type: String,
      },
    ],
    skills: {
      type: String,
      trim: true,
    },
    specialSkills: {
      type: String,
      trim: true,
    },

    // Why Join (Step 4)
    motivation: {
      type: String,
      required: true,
      trim: true,
    },
    howHeardAbout: {
      type: String,
      enum: ['social_media', 'friend_family', 'church', 'website', 'event', 'news', 'other'],
      required: true,
    },

    // Agreement (Step 5)
    agreeToTerms: {
      type: Boolean,
      default: false,
    },
    agreeToContact: {
      type: Boolean,
      default: false,
    },

    // Admin Fields
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'under-review'],
      default: 'pending',
    },
    adminNotes: {
      type: String,
      trim: true,
    },
    adminReply: {
      type: String,
      trim: true,
    },
    lastUpdatedBy: {
      type: String, // Admin name or ID
    },
    lastUpdatedAt: {
      type: Date,
    },
    statusChangedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Joinus || mongoose.model('Joinus', joinusSchema);
