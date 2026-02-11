import mongoose from 'mongoose';

const MembershipLevelSchema = new mongoose.Schema(
  {
    levels: [
      {
        _id: false,
        id: {
          type: Number,
          required: true
        },
        title: {
          type: String,
          required: true,
          trim: true,
          maxlength: [100, 'Title cannot exceed 100 characters']
        },
        description: {
          type: String,
          required: true,
          trim: true,
          maxlength: [200, 'Description cannot exceed 200 characters']
        },
        iconName: {
          type: String,
          enum: ['Users', 'Heart', 'Church', 'Zap', 'Crown', 'Star', 'Gift', 'Shield'],
          default: 'Users'
        },
        color: {
          type: String,
          required: true,
          default: 'from-blue-500 to-blue-600'
        },
        badge: {
          type: String,
          default: null
        },
        highlighted: {
          type: Boolean,
          default: false
        }
      }
    ],
    benefits: [
      {
        _id: false,
        text: {
          type: String,
          required: true,
          trim: true,
          maxlength: [100, 'Benefit text cannot exceed 100 characters']
        }
      }
    ],
    ctaSection: {
      title: {
        type: String,
        default: 'Ready to Make a Difference?'
      },
      description: {
        type: String,
        default: 'Join our growing community of advocates and champions dedicated to Christian protection globally.'
      },
      primaryButton: {
        label: {
          type: String,
          default: 'Choose Your Membership'
        },
        link: {
          type: String,
          default: '#membership'
        }
      },
      secondaryButton: {
        label: {
          type: String,
          default: 'Learn More'
        },
        link: {
          type: String,
          default: '#'
        }
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Create indexes
MembershipLevelSchema.index({ isActive: 1, createdAt: -1 });

export default mongoose.models.MembershipLevel ||
  mongoose.model('MembershipLevel', MembershipLevelSchema);
