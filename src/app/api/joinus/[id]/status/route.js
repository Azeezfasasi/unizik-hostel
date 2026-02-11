import Joinus from '@/app/server/models/Joinus.js';
import { connectDB } from '@/app/server/db/connect';
import {
  sendStatusChangeNotification,
  sendAdminReply,
  sendAdminUpdateNotification,
} from '@/app/server/services/emailService.js';

/**
 * PUT /api/joinus/[id]/status
 * Update application status
 */
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const { status, adminNotes } = await request.json();

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'under-review'];
    if (!validStatuses.includes(status)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        }),
        { status: 400 }
      );
    }

    const application = await Joinus.findById(id);

    if (!application) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Application not found',
        }),
        { status: 404 }
      );
    }

    const updatedApplication = await Joinus.findByIdAndUpdate(
      id,
      {
        status,
        adminNotes: adminNotes || application.adminNotes,
        lastUpdatedAt: new Date(),
        statusChangedAt: new Date(),
        lastUpdatedBy: 'Admin',
      },
      { new: true }
    );

    // Send status change email to member
    await sendStatusChangeNotification(updatedApplication, status);

    // Send admin notification
    await sendAdminUpdateNotification(updatedApplication, 'status-changed');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Application status updated successfully',
        data: updatedApplication,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating application status:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Error updating application status',
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
