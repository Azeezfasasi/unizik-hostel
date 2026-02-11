import mongoose from 'mongoose';

const ContactDetailsSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
      trim: true,
      maxlength: [20, 'Phone cannot be more than 20 characters']
    },
    whatsapp: {
      type: String,
      required: [true, 'Please add a WhatsApp number'],
      trim: true,
      maxlength: [20, 'WhatsApp cannot be more than 20 characters']
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
      trim: true,
      maxlength: [200, 'Location cannot be more than 200 characters']
    },
    latitude: {
      type: Number,
      description: 'Latitude coordinate for map display'
    },
    longitude: {
      type: Number,
      description: 'Longitude coordinate for map display'
    },
    businessHours: {
      type: String,
      required: [true, 'Please add business hours'],
      trim: true,
      maxlength: [100, 'Business hours cannot be more than 100 characters']
    },
    facebookUrl: {
      type: String,
      trim: true,
      description: 'Facebook profile URL'
    },
    linkedinUrl: {
      type: String,
      trim: true,
      description: 'LinkedIn profile URL'
    },
    instagramUrl: {
      type: String,
      trim: true,
      description: 'Instagram profile URL'
    },
    isActive: {
      type: Boolean,
      default: true,
      description: 'Whether this contact details is active'
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
    collection: 'contact_details'
  }
);

// Ensure only one contact details document exists
ContactDetailsSchema.index({ isActive: 1 });

export default mongoose.models.ContactDetails || mongoose.model('ContactDetails', ContactDetailsSchema);
