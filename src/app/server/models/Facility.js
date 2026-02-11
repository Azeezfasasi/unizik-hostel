import mongoose from 'mongoose';

const FacilityDamageReportSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  reportedAt: {
    type: Date,
    default: Date.now
  },
  repairStatus: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  repairUpdate: {
    type: String,
    default: ''
  }
});

const FacilitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Facility name is required'],
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FacilityCategory',
    required: [true, 'Facility category is required']
  },
  location: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'in-use', 'damage', 'under-repair'],
    default: 'active'
  },
  damageReports: [FacilityDamageReportSchema]
}, { timestamps: true });

const Facility = mongoose.models.Facility || mongoose.model('Facility', FacilitySchema);

export default Facility;
