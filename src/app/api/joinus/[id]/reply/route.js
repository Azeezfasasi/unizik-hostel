import Joinus from '@/app/server/models/Joinus.js';
import { connectDB } from '@/app/server/db/connect';
import {
  sendAdminReply,
  sendAdminUpdateNotification,
} from '@/app/server/services/emailService.js';

/**
 * POST /api/joinus/[id]/reply
 * Add admin reply to application
 */
export async function POST(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const { adminReply, adminNotes } = await request.json();

    if (!adminReply || adminReply.trim() === '') {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Admin reply cannot be empty',
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
        adminReply,
        adminNotes: adminNotes || application.adminNotes,
        lastUpdatedAt: new Date(),
        lastUpdatedBy: 'Admin',
      },
      { new: true }
    );

    // Send reply email to member
    await sendAdminReply(updatedApplication);

    // Send admin notification
    await sendAdminUpdateNotification(updatedApplication, 'reply-sent');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Reply sent successfully',
        data: updatedApplication,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error adding admin reply:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Error adding reply',
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
