import Joinus from '../models/Joinus.js';
import { connectDB } from '../db/connect.js';
import {
  sendApplicationConfirmation,
  sendStatusChangeNotification,
  sendAdminReply,
  sendAdminNotification,
  sendAdminUpdateNotification,
} from '../services/emailService.js';

/**
 * Create a new membership application
 */
export const createApplication = async (req, res) => {
  try {
    await connectDB();

    const applicationData = req.body;

    // Validate required fields
    const requiredFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'gender',
      'country',
      'state',
      'city',
      'membershipType',
      'interests',
      // 'skills',
      // 'specialSkills',
      'motivation',
      'howHeardAbout',
      'agreeToTerms',
    ];

    const missingFields = requiredFields.filter(field => !applicationData[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    // Create new application
    const newApplication = await Joinus.create(applicationData);

    // Send confirmation email to member
    await sendApplicationConfirmation(newApplication);

    // Send admin notification
    await sendAdminNotification(newApplication);

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: newApplication,
    });
  } catch (error) {
    console.error('Error creating application:', error);
    return res.status(500).json({
      success: false,
      message: 'Error submitting application',
      error: error.message,
    });
  }
};

/**
 * Get all membership applications (Admin)
 */
export const getAllApplications = async (req, res) => {
  try {
    await connectDB();

    // Verify admin authentication (you should implement proper auth)
    const { status, sortBy, order = 'desc', page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = {};
    if (status) {
      query.status = status;
    }

    // Build sort
    let sortQuery = {};
    if (sortBy) {
      sortQuery[sortBy] = order === 'asc' ? 1 : -1;
    } else {
      sortQuery.createdAt = order === 'asc' ? 1 : -1;
    }

    const applications = await Joinus.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Joinus.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        total,
        pages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        pageSize: limitNum,
      },
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message,
    });
  }
};

/**
 * Get single application by ID
 */
export const getApplicationById = async (req, res) => {
  try {
    await connectDB();

    const { id } = req.params;

    const application = await Joinus.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message,
    });
  }
};

/**
 * Update application status (Admin)
 */
export const updateApplicationStatus = async (req, res) => {
  try {
    await connectDB();

    const { id } = req.params;
    const { status, adminNotes } = req.body;

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'under-review'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const application = await Joinus.findByIdAndUpdate(
      id,
      {
        status,
        adminNotes: adminNotes || application?.adminNotes,
        lastUpdatedAt: new Date(),
        statusChangedAt: new Date(),
        lastUpdatedBy: req.user?.name || 'Admin',
      },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Send status change email to member
    await sendStatusChangeNotification(application, status);

    // Send admin notification
    await sendAdminUpdateNotification(application, 'status-changed');

    return res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      data: application,
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating application status',
      error: error.message,
    });
  }
};

/**
 * Add admin reply to application
 */
export const addAdminReply = async (req, res) => {
  try {
    await connectDB();

    const { id } = req.params;
    const { adminReply, adminNotes } = req.body;

    if (!adminReply || adminReply.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Admin reply cannot be empty',
      });
    }

    const application = await Joinus.findByIdAndUpdate(
      id,
      {
        adminReply,
        adminNotes: adminNotes || undefined,
        lastUpdatedAt: new Date(),
        lastUpdatedBy: req.user?.name || 'Admin',
      },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Send reply email to member
    await sendAdminReply(application);

    // Send admin notification
    await sendAdminUpdateNotification(application, 'reply-sent');

    return res.status(200).json({
      success: true,
      message: 'Reply sent successfully',
      data: application,
    });
  } catch (error) {
    console.error('Error adding admin reply:', error);
    return res.status(500).json({
      success: false,
      message: 'Error adding reply',
      error: error.message,
    });
  }
};

/**
 * Edit application details (Admin)
 */
export const editApplication = async (req, res) => {
  try {
    await connectDB();

    const { id } = req.params;
    const updateData = req.body;

    // Fields that can be edited by admin
    const editableFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'dateOfBirth',
      'gender',
      'country',
      'state',
      'city',
      'placeOfOrigin',
      'membershipType',
      'interests',
      'skills',
      'motivation',
      'howHeardAbout',
      'adminNotes',
      'status',
    ];

    // Filter update data to only editable fields
    const filteredUpdate = {};
    editableFields.forEach(field => {
      if (field in updateData) {
        filteredUpdate[field] = updateData[field];
      }
    });

    filteredUpdate.lastUpdatedAt = new Date();
    filteredUpdate.lastUpdatedBy = req.user?.name || 'Admin';

    const application = await Joinus.findByIdAndUpdate(id, filteredUpdate, {
      new: true,
      runValidators: true,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Send update notification email to member
    await sendAdminUpdateNotification(application, 'notes-updated');

    // Send admin notification
    await sendAdminUpdateNotification(application, 'notes-updated');

    return res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      data: application,
    });
  } catch (error) {
    console.error('Error editing application:', error);
    return res.status(500).json({
      success: false,
      message: 'Error editing application',
      error: error.message,
    });
  }
};

/**
 * Delete application (Admin)
 */
export const deleteApplication = async (req, res) => {
  try {
    await connectDB();

    const { id } = req.params;

    const application = await Joinus.findByIdAndDelete(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Application deleted successfully',
      data: application,
    });
  } catch (error) {
    console.error('Error deleting application:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting application',
      error: error.message,
    });
  }
};

/**
 * Get application statistics (Admin)
 */
export const getApplicationStats = async (req, res) => {
  try {
    await connectDB();

    const totalApplications = await Joinus.countDocuments();
    const pendingApplications = await Joinus.countDocuments({ status: 'pending' });
    const underReviewApplications = await Joinus.countDocuments({
      status: 'under-review',
    });
    const approvedApplications = await Joinus.countDocuments({ status: 'approved' });
    const rejectedApplications = await Joinus.countDocuments({ status: 'rejected' });

    // Get membership type breakdown
    const membershipTypeBreakdown = await Joinus.aggregate([
      {
        $group: {
          _id: '$membershipType',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get top interests
    const topInterests = await Joinus.aggregate([
      { $unwind: '$interests' },
      {
        $group: {
          _id: '$interests',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalApplications,
        byStatus: {
          pending: pendingApplications,
          underReview: underReviewApplications,
          approved: approvedApplications,
          rejected: rejectedApplications,
        },
        membershipTypeBreakdown,
        topInterests,
      },
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message,
    });
  }
};
