import Welcome from '@/app/server/models/Welcome.js';
import { connectDB } from '@/app/server/db/connect.js';

/**
 * GET /api/welcome
 * Fetch all active welcome sections sorted by order
 */
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const query = includeInactive ? {} : { isActive: true };
    const sections = await Welcome.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return new Response(
      JSON.stringify({
        success: true,
        data: sections,
        count: sections.length
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching welcome sections:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch welcome sections'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * POST /api/welcome
 * Create new welcome section
 */
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      title,
      description1,
      description2,
      image,
      button,
      order,
      isActive,
      createdBy
    } = body;

    // Validation
    if (!title || !description1 || !button?.label || !button?.href) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: title, description1, button.label, button.href'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const section = await Welcome.create({
      title,
      description1,
      description2: description2 || '',
      image,
      button,
      order: order !== undefined ? order : 0,
      isActive: isActive !== undefined ? isActive : true,
      createdBy
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: section,
        message: 'Welcome section created successfully'
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error creating welcome section:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create welcome section'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
