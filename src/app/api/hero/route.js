import Hero from '@/app/server/models/Hero.js';
import { connectDB } from '@/app/server/db/connect.js';

/**
 * GET /api/hero
 * Fetch all active hero slides sorted by order
 */
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const query = includeInactive ? {} : { isActive: true };
    const slides = await Hero.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return new Response(
      JSON.stringify({
        success: true,
        data: slides,
        count: slides.length
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch hero slides'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * POST /api/hero
 * Create new hero slide
 */
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { title, subtitle, cta, bg, image, order, isActive, createdBy } = body;

    // Validation
    if (!title || !subtitle || !cta?.label || !cta?.href) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: title, subtitle, cta.label, cta.href'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const slide = await Hero.create({
      title,
      subtitle,
      cta,
      bg,
      image,
      order: order !== undefined ? order : 0,
      isActive: isActive !== undefined ? isActive : true,
      createdBy
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: slide,
        message: 'Hero slide created successfully'
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error creating hero slide:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create hero slide'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
