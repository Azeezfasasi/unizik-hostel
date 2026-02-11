import Team from '@/app/server/models/Team.js';
import { connectDB } from '@/app/server/db/connect.js';

/**
 * GET /api/team
 * Fetch all active team members sorted by order
 */
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const query = includeInactive ? {} : { isActive: true };
    const teamMembers = await Team.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return new Response(
      JSON.stringify({
        success: true,
        data: teamMembers,
        count: teamMembers.length
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching team members:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch team members'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * POST /api/team
 * Create new team member
 */
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    if (!body.name || !body.position || !body.photo?.url) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Please provide name, position, and photo URL'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const teamMember = await Team.create(body);

    return new Response(
      JSON.stringify({
        success: true,
        data: teamMember,
        message: 'Team member created successfully'
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error creating team member:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create team member'
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
