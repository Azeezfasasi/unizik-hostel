import WhyChooseUs from '@/app/server/models/whychooseus.js';
import { connectDB } from '@/app/server/db/connect.js';

/**
 * GET /api/whychooseus
 * Fetch all active why choose us features sorted by order
 */
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const query = includeInactive ? {} : { isActive: true };
    const features = await WhyChooseUs.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return new Response(
      JSON.stringify({
        success: true,
        data: features,
        count: features.length
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching why choose us features:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch why choose us features'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * POST /api/whychooseus
 * Create new why choose us feature
 */
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { title, description, order, isActive, createdBy } = body;

    // Validation
    if (!title || !description) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: title, description'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const feature = await WhyChooseUs.create({
      title,
      description,
      order: order !== undefined ? order : 0,
      isActive: isActive !== undefined ? isActive : true,
      createdBy
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: feature,
        message: 'Feature created successfully'
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error creating why choose us feature:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create why choose us feature'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
