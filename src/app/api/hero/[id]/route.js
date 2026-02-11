import Hero from '@/app/server/models/Hero.js';
import { connectDB } from '@/app/server/db/connect.js';

/**
 * GET /api/hero/[id]
 * Fetch single hero slide
 */
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const slide = await Hero.findById(id).lean();

    if (!slide) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Hero slide not found'
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
        data: slide
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching hero slide:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch hero slide'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * PUT /api/hero/[id]
 * Update hero slide
 */
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    const slide = await Hero.findById(id);

    if (!slide) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Hero slide not found'
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Update fields
    const { title, subtitle, cta, bg, image, order, isActive, updatedBy } = body;

    if (title) slide.title = title;
    if (subtitle) slide.subtitle = subtitle;
    if (cta) slide.cta = { ...slide.cta, ...cta };
    if (bg) slide.bg = bg;
    if (image) slide.image = { ...slide.image, ...image };
    if (order !== undefined) slide.order = order;
    if (isActive !== undefined) slide.isActive = isActive;
    if (updatedBy) slide.updatedBy = updatedBy;

    await slide.save();

    return new Response(
      JSON.stringify({
        success: true,
        data: slide,
        message: 'Hero slide updated successfully'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error updating hero slide:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to update hero slide'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * DELETE /api/hero/[id]
 * Delete hero slide
 */
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const slide = await Hero.findByIdAndDelete(id);

    if (!slide) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Hero slide not found'
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
        data: slide,
        message: 'Hero slide deleted successfully'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error deleting hero slide:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to delete hero slide'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
