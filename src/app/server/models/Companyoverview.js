import mongoose from 'mongoose';

const CoreValueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a value name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    description: {
      type: String,
      required: [true, 'Please add a value description'],
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters']
    },
    iconType: {
      type: String,
      default: 'circle'
    },
    colorClass: {
      type: String,
      enum: ['blue-900', 'amber-600', 'green-700', 'red-600', 'purple-600'],
      default: 'blue-900'
    }
  },
  { _id: true }
);

const CompanyOverviewSchema = new mongoose.Schema(
  {
    // Who We Are Section
    whoWeAre: {
      title: {
        type: String,
        default: 'Who We Are',
        maxlength: [100, 'Title cannot exceed 100 characters']
      },
      paragraphs: [
        {
          type: String,
          maxlength: [500, 'Each paragraph cannot exceed 500 characters']
        }
      ]
    },

    // Vision Section
    vision: {
      title: {
        type: String,
        default: 'Our Vision',
        maxlength: [100, 'Title cannot exceed 100 characters']
      },
      description: {
        type: String,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
      }
    },

    // Mission Section
    mission: {
      title: {
        type: String,
        default: 'Our Mission',
        maxlength: [100, 'Title cannot exceed 100 characters']
      },
      description: {
        type: String,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
      }
    },

    // Core Values Section
    coreValues: {
      title: {
        type: String,
        default: 'Our Core Values',
        maxlength: [100, 'Title cannot exceed 100 characters']
      },
      values: [CoreValueSchema]
    },

    // Image
    image: {
      url: {
        type: String,
        default: '/images/placeholder.png'
      },
      alt: {
        type: String,
        default: 'UNIZIK Hostel Overview',
        maxlength: [200, 'Alt text cannot exceed 200 characters']
      }
    },

    isPublished: {
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
  { collection: 'company_overview' }
);

// Ensure only one document exists
CompanyOverviewSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await mongoose.model('CompanyOverview').countDocuments();
    if (count >= 1) {
      throw new Error('Only one company overview document is allowed');
    }
  }
  next();
});

CompanyOverviewSchema.index({ createdAt: -1 });

const CompanyOverview =
  mongoose.models.CompanyOverview ||
  mongoose.model('CompanyOverview', CompanyOverviewSchema);

export default CompanyOverview;
