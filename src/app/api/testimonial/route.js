import Testimonial from '@/app/server/models/Testimonial.js';
import { connectDB } from '@/app/server/db/connect.js';

/**
 * GET /api/testimonial
 * Fetch all active testimonials sorted by order
 */
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const query = includeInactive ? {} : { isActive: true };
    const testimonials = await Testimonial.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return new Response(
      JSON.stringify({
        success: true,
        data: testimonials,
        count: testimonials.length
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch testimonials'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * POST /api/testimonial
 * Create new testimonial
 */
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, position, message, rating, image, order, isActive } = body;

    // Validation
    if (!name || !position || !message) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: name, position, message'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const testimonial = await Testimonial.create({
      name,
      position,
      message,
      rating: rating || 5,
      image: image || {},
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: testimonial,
        message: 'Testimonial created successfully'
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create testimonial'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
