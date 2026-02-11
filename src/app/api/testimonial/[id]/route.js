import Testimonial from '@/app/server/models/Testimonial.js';
import { connectDB } from '@/app/server/db/connect.js';

/**
 * GET /api/testimonial/[id]
 * Fetch single testimonial by ID
 */
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const testimonial = await Testimonial.findById(id).lean();

    if (!testimonial) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Testimonial not found'
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
        data: testimonial
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch testimonial'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * PUT /api/testimonial/[id]
 * Update testimonial by ID
 */
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    const testimonial = await Testimonial.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true
    }).lean();

    if (!testimonial) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Testimonial not found'
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
        data: testimonial,
        message: 'Testimonial updated successfully'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to update testimonial'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * DELETE /api/testimonial/[id]
 * Delete testimonial by ID
 */
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const testimonial = await Testimonial.findByIdAndDelete(id).lean();

    if (!testimonial) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Testimonial not found'
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
        message: 'Testimonial deleted successfully'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to delete testimonial'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
