import MemberSupport from '@/app/server/models/Membersupport.js';
import { connectDB } from '@/app/server/db/connect.js';

/**
 * GET /api/membersupport
 * Fetch member support section
 */
export async function GET(request) {
  try {
    await connectDB();

    // Try to find by isActive first, then fallback to finding any document
    let section = await MemberSupport.findOne({ isActive: true }).lean();
    
    if (!section) {
      section = await MemberSupport.findOne().lean();
    }

    // Return empty object if no data, rather than 404
    if (!section) {
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
 * POST /api/membersupport
 * Create or update member support section
 */
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      sectionTitle,
      sectionDescription,
      supportItems,
      ctaSection,
      statsSection,
      isActive,
      createdBy
    } = body;

    // Validation
    if (!sectionTitle || !sectionDescription || !supportItems || supportItems.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: sectionTitle, sectionDescription, supportItems'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Find and update or create new
    let section = await MemberSupport.findOne({});

    if (section) {
      section.sectionTitle = sectionTitle;
      section.sectionDescription = sectionDescription;
      section.supportItems = supportItems;
      section.ctaSection = ctaSection || section.ctaSection;
      section.statsSection = statsSection || section.statsSection;
      section.isActive = isActive !== undefined ? isActive : true;
      section.updatedBy = createdBy;
      await section.save();
    } else {
      section = await MemberSupport.create({
        sectionTitle,
        sectionDescription,
        supportItems,
        ctaSection,
        statsSection,
        isActive: isActive !== undefined ? isActive : true,
        createdBy
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: section,
        message: 'Member support section saved successfully'
      }),
      {
        status: section ? 200 : 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error saving member support section:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to save member support section'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
