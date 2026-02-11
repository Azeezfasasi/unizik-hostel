import mongoose from 'mongoose';

const WhyChooseUsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [150, 'Title cannot be more than 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    order: {
      type: Number,
      default: 0,
      description: 'Display order in grid'
    },
    isActive: {
      type: Boolean,
      default: true,
      description: 'Whether this feature is active and should be displayed'
    },
    createdBy: {
      type: String,
      trim: true,
      description: 'Admin user who created this feature'
    },
    updatedBy: {
      type: String,
      trim: true,
      description: 'Admin user who last updated this feature'
    }
  },
  {
    timestamps: true,
    collection: 'why_choose_us_features'
  }
);

// Index for faster queries
WhyChooseUsSchema.index({ order: 1, isActive: 1 });
WhyChooseUsSchema.index({ createdAt: -1 });

export default mongoose.models.WhyChooseUs || mongoose.model('WhyChooseUs', WhyChooseUsSchema);
