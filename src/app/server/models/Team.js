import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a team member name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    position: {
      type: String,
      required: [true, 'Please add a position'],
      trim: true,
      maxlength: [150, 'Position cannot exceed 150 characters']
    },
    photo: {
      url: {
        type: String,
        required: [true, 'Please add a photo URL']
      },
      alt: {
        type: String,
        default: 'Team member photo',
        maxlength: [200, 'Alt text cannot exceed 200 characters']
      }
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters']
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
  { collection: 'team_members' }
);

TeamSchema.index({ order: 1, isActive: 1 });
TeamSchema.index({ createdAt: -1 });

const Team = mongoose.models.Team || mongoose.model('Team', TeamSchema);

export default Team;
