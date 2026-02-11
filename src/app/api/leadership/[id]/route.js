import { NextResponse } from 'next/server';
import { connectDB } from '@/app/server/db/connect';
import Leadership from '@/app/server/models/Leadership';
import { deleteFromCloudinary } from '@/app/server/utils/cloudinaryService';

// GET single leadership member
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const leader = await Leadership.findById(id);

    if (!leader) {
      return NextResponse.json({ error: 'Leadership member not found' }, { status: 404 });
    }

    return NextResponse.json(leader);
  } catch (error) {
    console.error('Error fetching leadership:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leadership member' },
      { status: 500 }
    );
  }
}

// PUT update leadership member
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();
    const { id } = await params;

    const leader = await Leadership.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    if (!leader) {
      return NextResponse.json({ error: 'Leadership member not found' }, { status: 404 });
    }

    return NextResponse.json(leader);
  } catch (error) {
    console.error('Error updating leadership:', error);
    return NextResponse.json(
      { error: 'Failed to update leadership member' },
      { status: 500 }
    );
  }
}

// DELETE leadership member
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const leader = await Leadership.findByIdAndDelete(id);

    if (!leader) {
      return NextResponse.json({ error: 'Leadership member not found' }, { status: 404 });
    }

    // Delete image from Cloudinary if exists
    if (leader.image?.publicId) {
      try {
        await deleteFromCloudinary(leader.image.publicId);
      } catch (err) {
        console.error('Error deleting image from Cloudinary:', err);
      }
    }

    return NextResponse.json({ message: 'Leadership member deleted successfully' });
  } catch (error) {
    console.error('Error deleting leadership:', error);
    return NextResponse.json(
      { error: 'Failed to delete leadership member' },
      { status: 500 }
    );
  }
}
