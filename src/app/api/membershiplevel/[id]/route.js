import MembershipLevel from '@/app/server/models/MembershipLevel.js';
import { connectDB } from '@/app/server/db/connect.js';

/**
 * GET /api/membershiplevel/[id]
 * Fetch single membership level by ID
 */
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const data = await MembershipLevel.findById(id).lean();

    if (!data) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Membership levels not found'
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
        data
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching membership levels:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch membership levels'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * PUT /api/membershiplevel/[id]
 * Update membership levels by ID
 */
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    const data = await MembershipLevel.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true
    }).lean();

    if (!data) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Membership levels not found'
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
        data,
        message: 'Membership levels updated successfully'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error updating membership levels:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to update membership levels'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * DELETE /api/membershiplevel/[id]
 * Delete membership levels by ID
 */
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const data = await MembershipLevel.findByIdAndDelete(id).lean();

    if (!data) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Membership levels not found'
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
        message: 'Membership levels deleted successfully'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error deleting membership levels:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to delete membership levels'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
