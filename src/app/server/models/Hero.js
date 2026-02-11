import mongoose from 'mongoose';

const HeroSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters']
    },
    subtitle: {
      type: String,
      required: [true, 'Please add a subtitle'],
      trim: true,
      maxlength: [500, 'Subtitle cannot be more than 500 characters']
    },
    cta: {
      label: {
        type: String,
        required: [true, 'Please add a CTA label'],
        trim: true,
        maxlength: [50, 'CTA label cannot be more than 50 characters']
      },
      href: {
        type: String,
        required: [true, 'Please add a CTA link'],
        trim: true
      }
    },
    bg: {
      type: String,
      default: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      description: 'Background gradient or color'
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
    order: {
      type: Number,
      default: 0,
      description: 'Display order in carousel'
    },
    isActive: {
      type: Boolean,
      default: true,
      description: 'Whether this slide is active and should be displayed'
    },
    createdBy: {
      type: String,
      trim: true,
      description: 'Admin user who created this slide'
    },
    updatedBy: {
      type: String,
      trim: true,
      description: 'Admin user who last updated this slide'
    }
  },
  {
    timestamps: true,
    collection: 'hero_slides'
  }
);

// Index for faster queries
HeroSchema.index({ order: 1, isActive: 1 });
HeroSchema.index({ createdAt: -1 });

export default mongoose.models.Hero || mongoose.model('Hero', HeroSchema);
