import { NextResponse } from 'next/server';
import { connectDB } from '@/app/server/db/connect';
import Department from '@/app/server/models/Department';

// GET all departments
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('active') !== 'false';

    let query = {};
    if (isActive) {
      query.isActive = true;
    }

    const departments = await Department.find(query)
      .sort({ displayOrder: 1, name: 1 });

    return NextResponse.json({
      departments,
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}

// POST create new department
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const { name, description, displayOrder } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Department name is required' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Check if department already exists
    const existing = await Department.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { error: 'Department already exists' },
        { status: 400 }
      );
    }

    const department = await Department.create({
      name,
      slug,
      description,
      displayOrder: displayOrder || 0,
      isActive: true,
    });

    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json(
      { error: 'Failed to create department' },
      { status: 500 }
    );
  }
}
