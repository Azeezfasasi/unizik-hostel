import mongoose from 'mongoose';

const BlogCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  }
}, { timestamps: true });

// Auto-generate slug from name before saving
BlogCategorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
  }
  next();
});

const BlogCategory = mongoose.models.BlogCategory || mongoose.model('BlogCategory', BlogCategorySchema);

export default BlogCategory;
