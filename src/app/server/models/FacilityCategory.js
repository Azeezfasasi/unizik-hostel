import mongoose from 'mongoose';

const FacilityCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true
  }
}, { timestamps: true });

const FacilityCategory = mongoose.models.FacilityCategory || mongoose.model('FacilityCategory', FacilityCategorySchema);

export default FacilityCategory;
