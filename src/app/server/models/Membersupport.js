import mongoose from 'mongoose';

const MemberSupportSchema = new mongoose.Schema(
  {
    sectionTitle: {
      type: String,
      required: [true, 'Please add a section title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
      default: 'What Members Support'
    },
    sectionDescription: {
      type: String,
      required: [true, 'Please add a section description'],
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    supportItems: [
      {
        _id: false,
        title: {
          type: String,
          required: true,
          trim: true,
          maxlength: [100, 'Item title cannot exceed 100 characters']
        },
        text: {
          type: String,
          required: true,
          trim: true,
          maxlength: [200, 'Item text cannot exceed 200 characters']
        },
        iconName: {
          type: String,
          enum: [
            'FaBuilding',
            'FaHandshake',
            'FaBalanceScale',
            'FaFolderOpen',
            'FaGraduationCap',
            'FaGlobe',
            'FaHeart',
            'FaShieldAlt',
            'FaUsers',
            'FaBriefcase',
            'FaBook',
            'FaCross'
          ],
          default: 'FaBuilding'
        },
        color: {
          type: String,
          required: true,
          default: 'from-blue-500 to-blue-600'
        },
        lightBg: {
          type: String,
          required: true,
          default: 'bg-blue-50'
        }
      }
    ],
    ctaSection: {
      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: [200, 'CTA title cannot exceed 200 characters'],
        default: 'Your Partnership Strengthens the Global Church'
      },
      description: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'CTA description cannot exceed 500 characters'],
        default: 'Join thousands of advocates committed to protecting persecuted Christians worldwide.'
      },
      buttonLabel: {
        type: String,
        required: true,
        trim: true,
        maxlength: [50, 'Button label cannot exceed 50 characters'],
        default: 'Become a Member Today'
      },
      buttonLink: {
        type: String,
        trim: true,
        default: '/join-us'
      }
    },
    statsSection: [
      {
        _id: false,
        number: {
          type: String,
          required: true,
          maxlength: [20, 'Number cannot exceed 20 characters']
        },
        title: {
          type: String,
          required: true,
          trim: true,
          maxlength: [100, 'Stat title cannot exceed 100 characters']
        },
        description: {
          type: String,
          required: true,
          trim: true,
          maxlength: [200, 'Stat description cannot exceed 200 characters']
        },
        color: {
          type: String,
          enum: ['blue', 'purple', 'green', 'red', 'orange', 'pink', 'teal'],
          default: 'blue'
        }
      }
    ],
    isActive: {
      type: Boolean,
      default: true,
      description: 'Whether this section is active and should be displayed'
    },
    createdBy: {
      type: String,
      trim: true,
      description: 'Admin user who created this'
    },
    updatedBy: {
      type: String,
      trim: true,
      description: 'Admin user who last updated this'
    }
  },
  {
    timestamps: true,
    collection: 'member_support_sections'
  }
);

// Index for faster queries
MemberSupportSchema.index({ isActive: 1, createdAt: -1 });

export default mongoose.models.MemberSupport || mongoose.model('MemberSupport', MemberSupportSchema);
