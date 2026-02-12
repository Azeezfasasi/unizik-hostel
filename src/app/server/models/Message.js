import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Message text is required'],
        trim: true,
        maxlength: [500, 'Message cannot exceed 500 characters']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    displayOrder: {
        type: Number,
        default: 0
    },
    backgroundColor: {
        type: String,
        default: '#1e40af' // Default blue color
    },
    textColor: {
        type: String,
        default: '#ffffff' // Default white text
    },
    speed: {
        type: String,
        enum: ['slow', 'normal', 'fast'],
        default: 'normal'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
