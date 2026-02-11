import CompanyOverview from '@/app/server/models/Companyoverview.js';
import { connectDB } from '@/app/server/db/connect.js';

/**
 * GET /api/company-overview
 * Fetch company overview data
 */
export async function GET(request) {
  try {
    await connectDB();

    let overview = await CompanyOverview.findOne({ isPublished: true }).lean();

    // If no published overview exists, try to get any overview
    if (!overview) {
      overview = await CompanyOverview.findOne().lean();
    }

    if (!overview) {
      return new Response(
        JSON.stringify({
          success: true,
          data: null,
          message: 'No company overview found'
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
        data: overview
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching company overview:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch company overview'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * POST /api/company-overview
 * Create new company overview (only one allowed)
 */
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    // Check if overview already exists
    const existingOverview = await CompanyOverview.findOne();
    if (existingOverview) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Company overview already exists. Please use PUT to update.'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const overview = await CompanyOverview.create(body);

    return new Response(
      JSON.stringify({
        success: true,
        data: overview,
        message: 'Company overview created successfully'
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error creating company overview:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create company overview'
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
