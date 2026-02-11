import Joinus from '@/app/server/models/Joinus.js';
import { connectDB } from '@/app/server/db/connect';
import {
  sendApplicationConfirmation,
  sendAdminNotification,
} from '@/app/server/services/emailService.js';

export async function POST(request) {
  try {
    await connectDB();

    const formData = await request.json();

    // Validate required fields
    const requiredFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'gender',
      'country',
      'state',
      'city',
      'membershipType',
      'interests',
      // 'skills',
      // 'specialSkills',
      'motivation',
      'howHeardAbout',
      'agreeToTerms',
    ];

    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
        }),
        { status: 400 }
      );
    }

    // Create new application
    const newApplication = await Joinus.create(formData);

    // Send confirmation email to member
    await sendApplicationConfirmation(newApplication);

    // Send admin notification
    await sendAdminNotification(newApplication);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Application submitted successfully',
        data: newApplication,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating application:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Error submitting application',
        error: error.message,
      }),
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy');
    const order = searchParams.get('order') || 'desc';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    if (status) {
      query.status = status;
    }

    // Build sort
    let sortQuery = {};
    if (sortBy) {
      sortQuery[sortBy] = order === 'asc' ? 1 : -1;
    } else {
      sortQuery.createdAt = order === 'asc' ? 1 : -1;
    }

    const applications = await Joinus.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Joinus.countDocuments(query);

    return new Response(
      JSON.stringify({
        success: true,
        data: applications,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: page,
          pageSize: limit,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching applications:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Error fetching applications',
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
