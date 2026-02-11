import WhyChooseUs from '@/app/server/models/whychooseus.js';
import { connectDB } from '@/app/server/db/connect.js';

/**
 * GET /api/whychooseus/[id]
 * Fetch a specific why choose us feature by ID
 */
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const feature = await WhyChooseUs.findById(id);

    if (!feature) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Feature not found'
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
        data: feature
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching why choose us feature:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch why choose us feature'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * PUT /api/whychooseus/[id]
 * Update a why choose us feature
 */
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { title, description, order, isActive, updatedBy } = body;

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

    const feature = await WhyChooseUs.findByIdAndUpdate(
      id,
      {
        title,
        description,
        order: order !== undefined ? order : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        updatedBy
      },
      { new: true, runValidators: true }
    );

    if (!feature) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Feature not found'
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
        data: feature,
        message: 'Feature updated successfully'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error updating why choose us feature:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to update why choose us feature'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * DELETE /api/whychooseus/[id]
 * Delete a why choose us feature
 */
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const feature = await WhyChooseUs.findByIdAndDelete(id);

    if (!feature) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Feature not found'
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
        data: feature,
        message: 'Feature deleted successfully'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error deleting why choose us feature:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to delete why choose us feature'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
