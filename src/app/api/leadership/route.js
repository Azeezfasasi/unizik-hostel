import { NextResponse } from 'next/server';
import { connectDB } from '@/app/server/db/connect';
import Leadership from '@/app/server/models/Leadership';
import Department from '@/app/server/models/Department';

// GET all leadership members
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20')));

    let query = { isActive: true };

    if (department && department.trim()) {
      query.department = department;
    }

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Leadership.countDocuments(query);
    const leaders = await Leadership.find(query)
      .populate('department')
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      leaders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching leadership:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch leadership members' },
      { status: 500 }
    );
  }
}

// POST create new leadership member
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.name || !body.position) {
      return NextResponse.json(
        { error: 'Name and position are required' },
        { status: 400 }
      );
    }

    const newLeader = new Leadership(body);
    const saved = await newLeader.save();

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('Error creating leadership:', error);
    return NextResponse.json(
      { error: 'Failed to create leadership member' },
      { status: 500 }
    );
  }
}
