import ContactDetails from '@/app/server/models/Contactdetails.js';
import { connectDB } from '@/app/server/db/connect.js';

/**
 * GET /api/contactdetails
 * Fetch all active contact details
 */
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const query = includeInactive ? {} : { isActive: true };
    const contactDetails = await ContactDetails.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return new Response(
      JSON.stringify({
        success: true,
        data: contactDetails,
        count: contactDetails.length
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
 * POST /api/contactdetails
 * Create new contact details
 */
export async function POST(request) {
  try {
    await connectDB();

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
      createdBy
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

    const contactDetail = await ContactDetails.create({
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
      isActive: isActive !== undefined ? isActive : true,
      createdBy
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: contactDetail,
        message: 'Contact details created successfully'
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error creating contact details:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create contact details'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
