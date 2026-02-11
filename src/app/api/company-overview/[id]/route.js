import Companyoverview from '@/app/server/models/Companyoverview.js';
import { connectDB } from '@/app/server/db/connect.js';

/**
 * GET /api/company-overview/[id]
 * Fetch single company overview by ID
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const overview = await Companyoverview.findById(id).lean();

    if (!overview) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Company overview not found'
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
 * PUT /api/company-overview/[id]
 * Update company overview by ID
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const body = await request.json();

    const overview = await Companyoverview.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true
    });

    if (!overview) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Company overview not found'
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
        data: overview,
        message: 'Company overview updated successfully'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error updating company overview:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to update company overview'
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * DELETE /api/company-overview/[id]
 * Delete company overview by ID
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const overview = await Companyoverview.findByIdAndDelete(id);

    if (!overview) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Company overview not found'
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
        data: overview,
        message: 'Company overview deleted successfully'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error deleting company overview:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to delete company overview'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
