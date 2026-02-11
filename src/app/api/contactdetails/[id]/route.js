import ContactDetails from '@/app/server/models/Contactdetails.js';
import { connectDB } from '@/app/server/db/connect.js';

/**
 * GET /api/contactdetails/[id]
 * Fetch a specific contact details by ID
 */
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const contactDetail = await ContactDetails.findById(id);

    if (!contactDetail) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Contact details not found'
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: contactDetail
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching contact details:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch contact details'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * PUT /api/contactdetails/[id]
 * Update contact details
 */
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const {
      phone,
      whatsapp,
      email,
      location,
      latitude,
      longitude,
      businessHours,
      facebookUrl,
      linkedinUrl,
      instagramUrl,
      isActive,
      updatedBy
    } = body;

    // Validation
    if (!phone || !whatsapp || !email || !location || !businessHours) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: phone, whatsapp, email, location, businessHours'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const contactDetail = await ContactDetails.findByIdAndUpdate(
      id,
      {
        phone,
        whatsapp,
        email,
        location,
        latitude,
        longitude,
        businessHours,
        facebookUrl,
        linkedinUrl,
        instagramUrl,
        isActive: isActive !== undefined ? isActive : undefined,
        updatedBy
      },
      { new: true, runValidators: true }
    );

    if (!contactDetail) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Contact details not found'
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: contactDetail,
        message: 'Contact details updated successfully'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error updating contact details:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to update contact details'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * DELETE /api/contactdetails/[id]
 * Delete contact details
 */
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const contactDetail = await ContactDetails.findByIdAndDelete(id);

    if (!contactDetail) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Contact details not found'
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: contactDetail,
        message: 'Contact details deleted successfully'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error deleting contact details:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to delete contact details'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
