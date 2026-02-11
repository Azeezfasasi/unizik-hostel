import Joinus from '@/app/server/models/Joinus.js';
import { connectDB } from '@/app/server/db/connect';

/**
 * GET /api/joinus/stats/overview
 * Get application statistics for admin dashboard
 */
export async function GET(request) {
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

    // Get recent applications
    const recentApplications = await Joinus.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return new Response(
      JSON.stringify({
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
          recentApplications,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Error fetching statistics',
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
