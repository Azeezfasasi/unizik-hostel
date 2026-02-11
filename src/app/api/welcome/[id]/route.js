import Welcome from '@/app/server/models/Welcome.js';
import { connectDB } from '@/app/server/db/connect.js';

/**
 * GET /api/welcome/[id]
 * Fetch single welcome section
 */
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const section = await Welcome.findById(id).lean();

    if (!section) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Welcome section not found'
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
        data: section
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching welcome section:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch welcome section'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * PUT /api/welcome/[id]
 * Update welcome section
 */
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    const section = await Welcome.findById(id);

    if (!section) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Welcome section not found'
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Update fields
    const {
      title,
      description1,
      description2,
      image,
      button,
      order,
      isActive,
      updatedBy
    } = body;

    if (title) section.title = title;
    if (description1) section.description1 = description1;
    if (description2 !== undefined) section.description2 = description2;
    if (image) section.image = { ...section.image, ...image };
    if (button) section.button = { ...section.button, ...button };
    if (order !== undefined) section.order = order;
    if (isActive !== undefined) section.isActive = isActive;
    if (updatedBy) section.updatedBy = updatedBy;

    await section.save();

    return new Response(
      JSON.stringify({
        success: true,
        data: section,
        message: 'Welcome section updated successfully'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error updating welcome section:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to update welcome section'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * DELETE /api/welcome/[id]
 * Delete welcome section
 */
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const section = await Welcome.findByIdAndDelete(id);

    if (!section) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Welcome section not found'
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
        data: section,
        message: 'Welcome section deleted successfully'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error deleting welcome section:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to delete welcome section'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
