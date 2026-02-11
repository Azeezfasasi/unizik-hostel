import mongoose from 'mongoose';

const CampusSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Campus name is required'],
        unique: true,
        trim: true
    },
    code: {
        type: String,
        required: [true, 'Campus code is required'],
        unique: true,
        trim: true
    },
    location: {
        type: String,
        required: [true, 'Campus location is required'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.models.Campus || mongoose.model('Campus', CampusSchema);
