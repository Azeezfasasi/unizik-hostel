import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { connectDB } from "../db/connect.js";
import { sendEmailViaBrevo } from "../utils/brevoEmailService.js";

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "1d";

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
};


// 1. REGISTER - Create new user account
export const register = async (req) => {
  try {
    await connectDB();

    const body = await req.json();
    const { firstName, lastName, otherName, email, phone, matricNumber, password, confirmPassword, role } = body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { success: false, error: "All fields are required." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already registered." },
        { status: 400 }
      );
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      otherName,
      email: email.toLowerCase(),
      phone,
      matricNumber,
      password,
      role: role || "student",
      isActive: true,
    });

    // Generate token
    const token = generateToken(user);

    // --- EMAIL NOTIFICATIONS ---
    try {
      // Send welcome email to user
      await sendEmailViaBrevo({
        to: user.email,
        subject: "Welcome to Unizik Hostel Portal",
        htmlContent: `
        <div style="max-width:580px;margin:auto;border-radius:8px;border:1px solid #e0e0e0;background:#fff;overflow:hidden;font-family:'Inter',sans-serif;">
          <!-- Header section -->
          <div style="background:#00B9F1;padding:24px 0;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:2.2rem;font-weight:700;line-height:1.2;">Unizik Hostel Portal!</h1>
          </div>
          <!-- Body Section -->
          <div style="padding:32px 24px 24px 24px;">
            <div style="padding:0;color:#222;line-height:1.6;">
              <p style="font-size:1.1rem;margin-bottom:16px;">Hi ${firstName},</p>
              <h2 style="font-size:1.8rem;color:#00B9F1;margin-bottom:16px;">Your Account at Unizik Hostel Portal Has Been Created!</h2>
              <p style="font-size:1.1rem;margin-bottom:16px;">
                We are thrilled to welcome you to the Unizik Hostel Portal community! Your account has been successfully created.
              </p>
              <p style="color:#222;line-height:1.5;margin-bottom:24px;">
                You can now log in to manage your profile, view your orders, track quote requests, and explore all the services and products we offer.
              </p>
              <a href="${process.env.FRONTEND_URL || 'https://hostel-mgt-system.netlify.app'}/login" style="display:inline-block;margin:18px 0 0 0;padding:12px 28px;background:#00B9F1;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:1rem;box-shadow:0 4px 8px rgba(0, 185, 241, 0.2);">Log In to Your Account</a>
              <p style="margin-top:32px;color:#888;font-size:0.95rem;line-height:1.5;">
                If you have any questions or need assistance, please do not hesitate to contact our support team.
              </p>
              <p style="margin-top:16px;color:#888;font-size:0.95rem;line-height:1.5;">Best regards,<br/>The Unizik Hostel Portal Team</p>
            </div>
          </div>
          <!-- Footer Section -->
          <div style="background:#f0f0f0;padding:24px;text-align:center;color:#666;font-size:0.85rem;line-height:1.6;border-top:1px solid #e5e5e5;">
            <p style="margin:0 0 8px 0;">&copy; 2025 Unizik Hostel Portal. All rights reserved.</p>
            <p style="margin:0 0 8px 0;">Awka, Anambra State, Nigeria</p>
            <p style="margin:0 0 16px 0;">
              Email: <a href="mailto:info@unizikportal.edu.ng" style="color:#00B9F1;text-decoration:none;">info@unizikportal.edu.ng</a> | Phone: <a href="tel:+2348067355116" style="color:#00B9F1;text-decoration:none;">(+234) 08067355116</a>
            </p>
          </div>
        </div>
        `,
      });

      // Send notification email to admin
      if (process.env.ADMIN_EMAIL) {
        await sendEmailViaBrevo({
          to: process.env.ADMIN_EMAIL,
          subject: `New User Registration || ${user.firstName} - ${user.matricNumber || user.email}`,
          htmlContent: `
          <div style="max-width:580px;margin:auto;border-radius:8px;border:1px solid #e0e0e0;background:#fff;overflow:hidden;font-family:'Inter',sans-serif;">
            <!-- Header section -->
            <div style="background:#00B9F1;padding:24px 0;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:2.2rem;font-weight:700;line-height:1.2;">Unizik Hostel Portal!</h1>
            </div>
            <!-- Body Section -->
            <div style="padding:32px 24px 24px 24px;">
              <div style="color:#222;line-height:1.6;">
                <p style="font-size:1.1rem;margin-bottom:16px;">Hi Unizik Hostel Portal Team,</p>
                <h2 style="font-size:1.8rem;color:#00B9F1;margin-bottom:16px;">New User Registration Notification!</h2>
                <p style="font-size:1.1rem;margin-bottom:16px;">
                  A new user has successfully registered on your website. Here are their details:
                </p>
                <h3 style="font-size:1.3rem;color:#333;margin-top:24px;margin-bottom:12px;">User Information:</h3>
                <ul style="list-style:none;padding:0;margin:0;">
                  <li style="margin-bottom:8px;"><strong>First Name:</strong> ${user.firstName || 'N/A'}</li>
                  <li style="margin-bottom:8px;"><strong>Last Name:</strong> ${user.lastName || 'N/A'}</li>
                  <li style="margin-bottom:8px;"><strong>Other Name:</strong> ${user.otherName || 'N/A'}</li>
                  <li style="margin-bottom:8px;"><strong>Matric Number:</strong> ${user.matricNumber || 'N/A'}</li>
                  <li style="margin-bottom:8px;"><strong>Department:</strong> ${user.department || 'N/A'}</li>
                  <li style="margin-bottom:8px;"><strong>Level:</strong> ${user.level || 'N/A'}</li>
                  <li style="margin-bottom:8px;"><strong>Gender:</strong> ${user.gender || 'N/A'}</li>
                  <li style="margin-bottom:8px;"><strong>Date of Birth:</strong> ${user.dob || 'N/A'}</li>
                  <li style="margin-bottom:8px;"><strong>Email:</strong> ${user.email}</li>
                  <li style="margin-bottom:8px;"><strong>Phone Number:</strong> ${user.phone || 'N/A'}</li>
                  <li style="margin-bottom:8px;"><strong>Role:</strong> ${user.role || 'Student'}</li>
                  <li style="margin-bottom:8px;"><strong>Address:</strong> ${user.address || 'N/A'}</li>
                  <li style="margin-bottom:8px;"><strong>Registration Date:</strong> ${new Date(user.createdAt).toLocaleString()}</li>
                </ul>
                <p style="margin-top:24px;margin-bottom:24px;">
                  Please log in to the admin dashboard to view the user's full profile or manage user accounts.
                </p>
                <a href="${process.env.FRONTEND_URL || 'https://hostel-mgt-system.netlify.app'}/login" style="display:inline-block;margin:18px 0 0 0;padding:12px 28px;background:#00B9F1;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:1rem;box-shadow:0 4px 8px rgba(0, 185, 241, 0.2);">View User in Admin Dashboard</a>
                <p style="margin-top:32px;color:#888;font-size:0.95rem;line-height:1.5;">Best regards,<br/>The Unizik Hostel Portal Team</p>
              </div>
            </div>
            <!-- Footer Section -->
            <div style="background:#f0f0f0;padding:24px;text-align:center;color:#666;font-size:0.85rem;line-height:1.6;border-top:1px solid #e5e5e5;">
              <p style="margin:0 0 8px 0;">&copy; 2025 Hostel Management System. All rights reserved.</p>
              <p style="margin:0 0 8px 0;">Awka, Anambra State, Nigeria</p>
              <p style="margin:0 0 16px 0;">
                Email: <a href="mailto:info@unizikportal.edu.ng" style="color:#00B9F1;text-decoration:none;">info@unizikportal.edu.ng</a> | Phone: <a href="tel:+2348067355116" style="color:#00B9F1;text-decoration:none;">(+234) 08067355116</a>
              </p>
            </div>
          </div>
          `,
        });
      }
    } catch (mailError) {
      console.log("Email sending failed, but user created:", mailError.message);
    }
    // --- END EMAIL NOTIFICATIONS ---

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful. Please log in.",
        user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Registration failed.",
        details: error.message,
      },
      { status: 500 }
    );
  }
};

// 2. LOGIN - Authenticate user
export const login = async (req) => {
  try {
    await connectDB();

    const body = await req.json();
    const { identifier, password } = body;

    // Validation
    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: "Email/Matric and password are required" },
        { status: 400 }
      );
    }

    // Find user by email or matricNumber
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { matricNumber: identifier },
      ],
    }).select("+password");

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials." },
        { status: 400 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: "Your account is disabled. Contact support." },
        { status: 403 }
      );
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials." },
        { status: 400 }
      );
    }

    // Generate token
    const token = generateToken(user);

    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
        token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Login failed.",
        details: error.message,
      },
      { status: 500 }
    );
  }
};

// 3. REQUEST PASSWORD RESET
export const requestPasswordReset = async (req) => {
  try {
    await connectDB();

    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 400 }
      );
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'https://hostel-mgt-system.netlify.app'}/resetpassword/${token}`;
      
      await sendEmailViaBrevo({
        to: user.email,
        subject: `Password Reset for ${user.firstName} ${user.lastName}`,
        htmlContent: `
        <div style="max-width:580px;margin:auto;border-radius:8px;border:1px solid #e0e0e0;background:#fff;overflow:hidden;font-family:'Inter',sans-serif;">
          <!-- Header Section -->
          <div style="background:#00B9F1;padding:24px 0;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:2.2rem;font-weight:700;line-height:1.2;">Unizik Hostel Portal</h1>
          </div>
          <!-- Body Section -->
          <div style="padding:32px 24px 24px 24px;">
            <p style="font-size:1.1rem;margin-bottom:16px;">Hi ${user.firstName},</p>
            <h2 style="font-size:1.8rem;color:#00B9F1;margin-bottom:16px;">Password Reset Request for Your Account</h2>
            <p style="font-size:1.1rem;margin-bottom:16px;">
              We received a request to reset the password for your Unizik Hostel Portal account.
            </p>
            <p style="color:#222;line-height:1.5;margin-bottom:24px;">
              To reset your password, please click the button below. This link is valid for <strong>1 hour</strong> only.
            </p>
            <a href="${resetUrl}" style="display:inline-block;margin:18px 0 0 0;padding:12px 28px;background:#00B9F1;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:1rem;box-shadow:0 4px 8px rgba(0, 185, 241, 0.2);">Reset Your Password</a>
            <p style="font-size:0.95rem;color:#555;margin-top:32px;line-height:1.5;">
              If you did not request a password reset, please ignore this email. Your password will remain unchanged.
              For security reasons, do not share this link with anyone.
            </p>
            <p style="margin-top:32px;color:#888;font-size:0.95rem;line-height:1.5;">Best regards,<br/>Unizik Hostel Portal Team</p>
          </div>
          <!-- Footer Section -->
          <div style="background:#f0f0f0;padding:24px;text-align:center;color:#666;font-size:0.85rem;line-height:1.6;border-top:1px solid #e5e5e5;">
            <p style="margin:0 0 8px 0;">&copy; 2025 Unizik Hostel Portal. All rights reserved.</p>
            <p style="margin:0 0 8px 0;">Awka, Anambra State, Nigeria</p>
            <p style="margin:0 0 16px 0;">
              Email: <a href="mailto:info@unizikportal.edu.ng" style="color:#00B9F1;text-decoration:none;">info@unizikportal.edu.ng</a> | Phone: <a href="tel:+2348067355116" style="color:#00B9F1;text-decoration:none;">(+234) 08067355116</a>
            </p>
          </div>
        </div>
        `,
      });
    } catch (mailError) {
      console.log("Email sending failed:", mailError.message);
    }

    return NextResponse.json(
      { success: true, message: "Password reset email sent. Check your inbox." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Request password reset error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send reset email.",
        details: error.message,
      },
      { status: 500 }
    );
  }
};

// 4. RESET PASSWORD
export const resetPassword = async (req) => {
  try {
    await connectDB();

    const body = await req.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Token and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token." },
        { status: 400 }
      );
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Generate new token for auto-login
    const newToken = generateToken(user);

    return NextResponse.json(
      {
        success: true,
        message: "Password has been reset successfully.",
        token: newToken,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reset password.",
        details: error.message,
      },
      { status: 500 }
    );
  }
};

// 5. GET PROFILE - Get own profile
export const getProfile = async (req, userId) => {
  try {
    await connectDB();

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch profile.",
        details: error.message,
      },
      { status: 500 }
    );
  }
};

// 6. UPDATE PROFILE - Update own profile
export const updateProfile = async (req, userId) => {
  try {
    await connectDB();

    const body = await req.json();
    const updates = { ...body };

    // Prevent changing sensitive fields
    delete updates.role;
    delete updates.isActive;
    delete updates.email;
    delete updates.matricNumber;
    if (updates.password) delete updates.password;

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Profile updated successfully", user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update profile.",
        details: error.message,
      },
      { status: 500 }
    );
  }
};

// 7. ADMIN: GET ALL USERS
export const getAllUsers = async (req) => {
  try {
    await connectDB();

    const users = await User.find().select("-password");
    return NextResponse.json(
      { success: true, users, data: users },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get all users error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users.",
        details: error.message,
      },
      { status: 500 }
    );
  }
};

// 7.5 ADMIN: CREATE USER BY ADMIN
export const createUserByAdmin = async (req) => {
  try {
    await connectDB();

    const body = await req.json();
    const { firstName, lastName, otherName, email, phone, matricNumber, password, role } = body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { success: false, error: "All required fields must be provided: firstName, lastName, email, password" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already registered." },
        { status: 400 }
      );
    }

    // Create user with role assignment
    const user = await User.create({
      firstName,
      lastName,
      otherName,
      email: email.toLowerCase(),
      phone,
      matricNumber,
      password,
      role: role || "student",
      isActive: true,
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json(
      { 
        success: true, 
        message: "User created successfully",
        user: userResponse 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create user by admin error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create user.",
        details: error.message,
      },
      { status: 500 }
    );
  }
};

// 8. ADMIN: GET ALL ADMINS
export const getAllAdmins = async (req) => {
  try {
    await connectDB();

    const admins = await User.find({ role: { $in: ["admin", "super admin"] } }).select(
      "firstName lastName email"
    );
    return NextResponse.json(
      { success: true, admins },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get all admins error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch admin users.",
      },
      { status: 500 }
    );
  }
};

// 9. ADMIN: EDIT USER
export const editUser = async (req, userId) => {
  try {
    await connectDB();

    const body = await req.json();
    const updates = { ...body };

    if (updates.password) delete updates.password;

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "User updated successfully", user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Edit user error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to edit user.",
        details: error.message,
      },
      { status: 500 }
    );
  }
};

// 9. ADMIN: CHANGE USER ROLE
export const changeUserRole = async (req, userId) => {
  try {
    await connectDB();

    const body = await req.json();
    const { role } = body;

    // Validate role
    const validRoles = ['student', 'staff', 'admin', 'super admin'];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: `Invalid role. Valid roles are: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "User role updated successfully", user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Change user role error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to change user role.",
        details: error.message,
      },
      { status: 500 }
    );
  }
};

// 10. ADMIN: DELETE USER
export const deleteUser = async (req, userId) => {
  try {
    await connectDB();

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "User deleted." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete user.",
        details: error.message,
      },
      { status: 500 }
    );
  }
};

// 11. ADMIN: DISABLE USER
export const disableUser = async (req, userId) => {
  try {
    await connectDB();

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "User disabled." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Disable user error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to disable user.",
        details: error.message,
      },
      { status: 500 }
    );
  }
};

// 12. ADMIN: ENABLE USER
export const enableUser = async (req, userId) => {
  try {
    await connectDB();

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "User enabled." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Enable user error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to enable user.",
        details: error.message,
      },
      { status: 500 }
    );
  }
};

// 12.5 ADMIN: TOGGLE USER STATUS
export const toggleUserStatus = async (req, userId) => {
  try {
    await connectDB();

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    // Parse body safely - handle empty or malformed JSON
    let body = {};
    try {
      const contentType = req.headers?.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const bodyText = await req.clone().text();
        if (bodyText) {
          body = JSON.parse(bodyText);
        }
      }
    } catch (parseError) {
      console.warn("Warning: Could not parse request body", parseError.message);
    }

    // If isActive is provided use it, otherwise toggle the current status
    const newStatus = body.isActive !== undefined ? body.isActive : !user.isActive;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive: newStatus },
      { new: true }
    ).select("-password");

    return NextResponse.json(
      { 
        success: true, 
        message: newStatus ? "User activated." : "User deactivated.",
        data: updatedUser
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Toggle user status error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to toggle user status.",
        details: error.message,
      },
      { status: 500 }
    );
  }
};

// 13. ADMIN: RESET USER PASSWORD
export const resetUserPassword = async (req, userId) => {
  try {
    await connectDB();

    const body = await req.json();
    const { newPassword } = body;

    if (!newPassword) {
      return NextResponse.json(
        { success: false, error: "New password is required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    user.password = newPassword;
    await user.save();

    return NextResponse.json(
      { success: true, message: "Password reset successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset user password error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reset password.",
        details: error.message,
      },
      { status: 500 }
    );
  }
};

// ALIAS EXPORTS FOR ROUTE COMPATIBILITY
// These are alias exports to match the expected function names in API routes

// Alias: forgotPassword → requestPasswordReset
export const forgotPassword = requestPasswordReset;

// Alias: getUserProfile → getProfile
export const getUserProfile = async (req) => {
  const userId = req.user?.id;
  return getProfile(req, userId);
};

// Alias: updateUserProfile → updateProfile
export const updateUserProfile = async (req) => {
  const userId = req.user?.id;
  return updateProfile(req, userId);
};

// 14. UPDATE PASSWORD - Change password (authenticated user)
export const updatePassword = async (req) => {
  try {
    await connectDB();

    const body = await req.json();
    const { currentPassword, newPassword, confirmPassword } = body;
    const userId = req.user?.id;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: "All fields are required." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "New passwords do not match" },
        { status: 400 }
      );
    }

    // Find user with password
    const user = await User.findById(userId).select("+password");

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordMatch = await user.comparePassword(currentPassword);

    if (!isPasswordMatch) {
      return NextResponse.json(
        {
          success: false,
          error: "Current password is incorrect",
        },
        { status: 401 }
      );
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Password updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update password error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update password.",
        details: error.message,
      },
      { status: 500 }
    );
  }
};

// 15. VERIFY EMAIL - Confirm email address
export const verifyEmail = async (req) => {
  try {
    await connectDB();

    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Verification token is required." },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token." },
        { status: 400 }
      );
    }

    // Mark user as verified/active (since we don't have email verification in this model)
    user.isActive = true;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Email verification failed.",
        details: error.message,
      },
      { status: 500 }
    );
  }
};

// 16. LOGOUT - Clear session/logout
export const logout = async (req) => {
  try {
    return NextResponse.json(
      {
        success: true,
        message: "Logout successful",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Logout failed.",
        details: error.message,
      },
      { status: 500 }
    );
  }
};
