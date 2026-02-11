import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    otherName: {
      type: String,
      trim: true,
    },
    dob: {
      type: String,
    },
    gender: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    emergencyContact: {
      type: String,
      trim: true,
    },
    nextOfKinName: {
      type: String,
      trim: true,
    },
    nextOfKinRelationship: {
      type: String,
      trim: true,
    },
    nextOfKinPhone: {
      type: String,
      trim: true,
    },
    nin: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    localGovernment: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
    },
    matricNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    profileImage: {
      type: String,
      default: null,
    },
    campusName: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    faculty: {
      type: String,
      trim: true,
    },
    course: {
      type: String,
      trim: true,
    },
    level: {
      type: String,
      trim: true,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },

    // Authentication
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: Date,

    // Authorization
    role: {
      type: String,
      enum: ["super admin", "admin", "student", "staff"],
      default: "student",
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Metadata
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for frequently queried fields
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ matricNumber: 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get full name
userSchema.methods.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

export default mongoose.models.User || mongoose.model("User", userSchema);
