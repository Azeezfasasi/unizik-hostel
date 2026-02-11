import { NextResponse } from 'next/server';
import { connectDB } from '@/app/server/db/connect';
import Department from '@/app/server/models/Department';

// GET single department
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const department = await Department.findById(id);

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(department);
  } catch (error) {
    console.error('Error fetching department:', error);
    return NextResponse.json(
      { error: 'Failed to fetch department' },
      { status: 500 }
    );
  }
}

// PUT update department
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const { name, description, displayOrder, isActive } = body;

    const department = await Department.findByIdAndUpdate(
      id,
      {
        name,
        description,
        displayOrder,
        isActive,
      },
      { new: true, runValidators: true }
    );

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(department);
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json(
      { error: 'Failed to update department' },
      { status: 500 }
    );
  }
}

// DELETE department
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    // Check if any leadership members use this department
    const Leadership = require('@/app/server/models/Leadership').default;
    const leadershipCount = await Leadership.countDocuments({ department: id });
    
    if (leadershipCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete department. ${leadershipCount} leadership member(s) are assigned to this department.` },
        { status: 400 }
      );
    }

    const department = await Department.findByIdAndDelete(id);

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      { error: 'Failed to delete department' },
      { status: 500 }
    );
  }
}
