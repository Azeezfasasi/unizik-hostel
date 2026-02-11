import { connectDB } from '@/app/server/db/connect';
import Logo from '@/app/server/models/Logo';
import { deleteFromCloudinary } from '@/app/server/utils/cloudinaryService';

export async function GET(request) {
  try {
    await connectDB();

    const logo = await Logo.findOne({ isActive: true }).sort({ createdAt: -1 });

    if (!logo) {
      // Return default logo if none exists
      return Response.json({
        logo: null,
        message: 'No active logo found',
      });
    }

    return Response.json({ logo });
  } catch (error) {
    console.error('Error fetching logo:', error);
    return Response.json(
      { error: 'Failed to fetch logo' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const { url, publicId, width, height, alt } = await request.json();

    if (!url || !publicId) {
      return Response.json(
        { error: 'Logo URL and publicId are required' },
        { status: 400 }
      );
    }

    // Deactivate previous logos
    await Logo.updateMany({ isActive: true }, { isActive: false });

    // Create new logo
    const newLogo = await Logo.create({
      url,
      publicId,
      width: width || 170,
      height: height || 50,
      alt: alt || 'UNIZIK Hostel Logo',
      isActive: true,
    });

    return Response.json(
      { success: true, logo: newLogo },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating logo:', error);
    return Response.json(
      { error: 'Failed to create logo' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();

    const { id, width, height, alt } = await request.json();

    if (!id) {
      return Response.json(
        { error: 'Logo ID is required' },
        { status: 400 }
      );
    }

    const logo = await Logo.findByIdAndUpdate(
      id,
      {
        width: width || logo.width,
        height: height || logo.height,
        alt: alt || logo.alt,
      },
      { new: true, runValidators: true }
    );

    if (!logo) {
      return Response.json(
        { error: 'Logo not found' },
        { status: 404 }
      );
    }

    return Response.json({ success: true, logo });
  } catch (error) {
    console.error('Error updating logo:', error);
    return Response.json(
      { error: 'Failed to update logo' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json(
        { error: 'Logo ID is required' },
        { status: 400 }
      );
    }

    const logo = await Logo.findByIdAndDelete(id);

    if (!logo) {
      return Response.json(
        { error: 'Logo not found' },
        { status: 404 }
      );
    }

    // Delete from Cloudinary
    if (logo.publicId) {
      await deleteFromCloudinary(logo.publicId);
    }

    return Response.json({ success: true, message: 'Logo deleted' });
  } catch (error) {
    console.error('Error deleting logo:', error);
    return Response.json(
      { error: 'Failed to delete logo' },
      { status: 500 }
    );
  }
}
