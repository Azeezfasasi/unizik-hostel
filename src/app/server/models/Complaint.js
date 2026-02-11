import mongoose from 'mongoose';

const ComplaintSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  studentName: {
    type: String,
    required: [true, 'Student name is required']
  },
  studentEmail: {
    type: String,
    required: [true, 'Student email is required']
  },
  phone: {
    type: String
  },
  category: {
    type: String,
    enum: ['Maintenance', 'Electricity', 'Water Supply', 'Security', 'Cleanliness', 'Noise', 'Other'],
    required: [true, 'Category is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters']
  },
  location: {
    type: String,
    required: [true, 'Location/Room number is required']
  },
  status: {
    type: String,
    enum: ['Open', 'In-Progress', 'Resolved', 'Closed'],
    default: 'Open'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedToName: {
    type: String
  },
  resolution: {
    type: String
  },
  resolutionDate: {
    type: Date
  },
  attachments: [{
    type: String
  }],
  feedback: {
    type: String
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Complaint = mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);

export default Complaint;
