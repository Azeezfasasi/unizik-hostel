import mongoose from 'mongoose';

const TestimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    position: {
      type: String,
      required: [true, 'Please add a position/title'],
      trim: true,
      maxlength: [150, 'Position cannot exceed 150 characters']
    },
    message: {
      type: String,
      required: [true, 'Please add a testimonial message'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters']
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
      default: 5
    },
    image: {
      url: {
        type: String,
        default: null
      },
      alt: {
        type: String,
        default: null
      }
    },
    order: {
      type: Number,
      default: 0
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
TestimonialSchema.index({ order: 1, isActive: 1 });
TestimonialSchema.index({ createdAt: -1 });

export default mongoose.models.Testimonial ||
  mongoose.model('Testimonial', TestimonialSchema);
