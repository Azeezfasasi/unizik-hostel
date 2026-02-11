import { connectDB } from '@/app/server/db/connect';
import Gallery from '@/app/server/models/Gallery';

export async function POST(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const { liked, userId } = await request.json();

    if (!id) {
      return Response.json(
        { error: 'Gallery ID is required' },
        { status: 400 }
      );
    }

    const gallery = await Gallery.findById(id);
    if (!gallery) {
      return Response.json(
        { error: 'Gallery not found' },
        { status: 404 }
      );
    }

    // Initialize likes array if it doesn't exist
    if (!gallery.likes) {
      gallery.likes = [];
    }

    const userIdentifier = userId || 'anonymous';

    if (liked) {
      // Add like if not already present
      if (!gallery.likes.includes(userIdentifier)) {
        gallery.likes.push(userIdentifier);
      }
    } else {
      // Remove like
      gallery.likes = gallery.likes.filter(id => id !== userIdentifier);
    }

    await gallery.save();

    return Response.json({
      success: true,
      likeCount: gallery.likes.length,
      liked: gallery.likes.includes(userIdentifier),
    });
  } catch (error) {
    console.error('Error updating like:', error);
    return Response.json(
      { error: 'Failed to update like' },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const gallery = await Gallery.findById(id).select('likes');
    if (!gallery) {
      return Response.json(
        { error: 'Gallery not found' },
        { status: 404 }
      );
    }

    const userIdentifier = userId || 'anonymous';
    const likes = gallery.likes || [];
    const isLiked = likes.includes(userIdentifier);

    return Response.json({
      likeCount: likes.length,
      isLiked,
    });
  } catch (error) {
    console.error('Error fetching likes:', error);
    return Response.json(
      { error: 'Failed to fetch likes' },
      { status: 500 }
    );
  }
}
