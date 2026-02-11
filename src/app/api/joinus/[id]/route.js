import Joinus from '@/app/server/models/Joinus.js';
import { connectDB } from '@/app/server/db/connect';
import {
  sendStatusChangeNotification,
  sendAdminReply,
  sendAdminUpdateNotification,
} from '@/app/server/services/emailService.js';

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

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

    return new Response(
      JSON.stringify({
        success: true,
        data: application,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching application:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Error fetching application',
        error: error.message,
      }),
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const updateData = await request.json();

    // Fields that can be edited by admin
    const editableFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'dateOfBirth',
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
    filteredUpdate.lastUpdatedBy = updateData.lastUpdatedBy || 'Admin';

    const application = await Joinus.findByIdAndUpdate(id, filteredUpdate, {
      new: true,
      runValidators: true,
    });

    if (!application) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Application not found',
        }),
        { status: 404 }
      );
    }

    // Send update notification emails
    await sendAdminUpdateNotification(application, 'notes-updated');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Application updated successfully',
        data: application,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error editing application:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Error editing application',
        error: error.message,
      }),
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const application = await Joinus.findByIdAndDelete(id);

    if (!application) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Application not found',
        }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Application deleted successfully',
        data: application,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting application:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Error deleting application',
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
