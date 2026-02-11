import MemberSupport from '@/app/server/models/Membersupport.js';
import { connectDB } from '@/app/server/db/connect.js';

/**
 * GET /api/membersupport/[id]
 * Fetch member support section by ID
 */
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const section = await MemberSupport.findById(id).lean();

    if (!section) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Member support section not found'
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
    console.error('Error fetching member support section:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch member support section'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * PUT /api/membersupport/[id]
 * Update member support section
 */
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    const section = await MemberSupport.findById(id);

    if (!section) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Member support section not found'
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Update fields
    const {
      sectionTitle,
      sectionDescription,
      supportItems,
      ctaSection,
      statsSection,
      isActive,
      updatedBy
    } = body;

    if (sectionTitle) section.sectionTitle = sectionTitle;
    if (sectionDescription) section.sectionDescription = sectionDescription;
    if (supportItems) section.supportItems = supportItems;
    if (ctaSection) section.ctaSection = { ...section.ctaSection, ...ctaSection };
    if (statsSection) section.statsSection = statsSection;
    if (isActive !== undefined) section.isActive = isActive;
    if (updatedBy) section.updatedBy = updatedBy;

    await section.save();

    return new Response(
      JSON.stringify({
        success: true,
        data: section,
        message: 'Member support section updated successfully'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error updating member support section:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to update member support section'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * DELETE /api/membersupport/[id]
 * Delete member support section
 */
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const section = await MemberSupport.findByIdAndDelete(id);

    if (!section) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Member support section not found'
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
        message: 'Member support section deleted successfully'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error deleting member support section:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to delete member support section'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
