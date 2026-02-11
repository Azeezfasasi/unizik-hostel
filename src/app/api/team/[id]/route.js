import Team from '@/app/server/models/Team.js';
import { connectDB } from '@/app/server/db/connect.js';

/**
 * GET /api/team/[id]
 * Fetch single team member by ID
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const teamMember = await Team.findById(id).lean();

    if (!teamMember) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Team member not found'
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
        data: teamMember
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching team member:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch team member'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * PUT /api/team/[id]
 * Update team member by ID
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const body = await request.json();

    const teamMember = await Team.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true
    });

    if (!teamMember) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Team member not found'
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
        data: teamMember,
        message: 'Team member updated successfully'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error updating team member:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to update team member'
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * DELETE /api/team/[id]
 * Delete team member by ID
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const teamMember = await Team.findByIdAndDelete(id);

    if (!teamMember) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Team member not found'
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
        data: teamMember,
        message: 'Team member deleted successfully'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error deleting team member:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to delete team member'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
