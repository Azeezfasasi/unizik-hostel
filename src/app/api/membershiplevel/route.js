import MembershipLevel from '@/app/server/models/MembershipLevel.js';
import { connectDB } from '@/app/server/db/connect.js';

/**
 * GET /api/membershiplevel
 * Fetch membership levels
 */
export async function GET(request) {
  try {
    await connectDB();

    let data = await MembershipLevel.findOne({ isActive: true }).lean();
    
    if (!data) {
      data = await MembershipLevel.findOne().lean();
    }

    if (!data) {
      return new Response(
        JSON.stringify({
          success: true,
          data: null
        }),
        {
          status: 200,
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
 * POST /api/membershiplevel
 * Create or update membership levels
 */
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { levels, benefits, ctaSection, isActive } = body;

    // Validation
    if (!levels || levels.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: levels array'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Find and update or create new
    let data = await MembershipLevel.findOne({});

    if (data) {
      data.levels = levels;
      data.benefits = benefits || data.benefits;
      data.ctaSection = ctaSection || data.ctaSection;
      data.isActive = isActive !== undefined ? isActive : true;
      await data.save();
    } else {
      data = await MembershipLevel.create({
        levels,
        benefits,
        ctaSection,
        isActive: isActive !== undefined ? isActive : true
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        data,
        message: 'Membership levels saved successfully'
      }),
      {
        status: data ? 200 : 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error saving membership levels:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to save membership levels'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
