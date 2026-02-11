import mongoose from 'mongoose';

const WelcomeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters']
    },
    description1: {
      type: String,
      required: [true, 'Please add first description'],
      trim: true,
      maxlength: [1000, 'Description 1 cannot be more than 1000 characters']
    },
    description2: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description 2 cannot be more than 1000 characters'],
      default: ''
    },
    image: {
      src: {
        type: String,
        trim: true,
        description: 'Image URL or path'
      },
      alt: {
        type: String,
        trim: true,
        maxlength: [200, 'Image alt text cannot be more than 200 characters'],
        description: 'Alt text for accessibility'
      }
    },
    button: {
      label: {
        type: String,
        required: [true, 'Please add button label'],
        trim: true,
        maxlength: [50, 'Button label cannot be more than 50 characters']
      },
      href: {
        type: String,
        required: [true, 'Please add button link'],
        trim: true
      }
    },
    order: {
      type: Number,
      default: 0,
      description: 'Display order for multiple sections'
    },
    isActive: {
      type: Boolean,
      default: true,
      description: 'Whether this section is active and should be displayed'
    },
    createdBy: {
      type: String,
      trim: true,
      description: 'Admin user who created this section'
    },
    updatedBy: {
      type: String,
      trim: true,
      description: 'Admin user who last updated this section'
    }
  },
  {
    timestamps: true,
    collection: 'welcome_sections'
  }
);

// Index for faster queries
WelcomeSchema.index({ order: 1, isActive: 1 });
WelcomeSchema.index({ createdAt: -1 });

export default mongoose.models.Welcome || mongoose.model('Welcome', WelcomeSchema);
