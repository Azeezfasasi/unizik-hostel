import Message from '@/app/server/models/Message.js';
import User from '@/app/server/models/User.js';
import { connectDB } from '@/app/server/db/connect.js';
import { authenticate } from '@/app/server/middleware/auth.js';

/**
 * GET /api/message/[id]
 * Fetch single message
 */
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const message = await Message.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .lean();

    if (!message) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Message not found'
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
        data: message
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('❌ Error fetching message:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch message'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * PUT /api/message/[id]
 * Update message (admin only)
 */
export async function PUT(request, { params }) {
  return authenticate(request, async () => {
    try {
      await connectDB();

      const { id } = await params;
      const body = await request.json();
      const userId = request.user?.id;

      // Verify user is admin
      const user = await User.findById(userId).lean();
      if (!user || (user.role !== 'admin' && user.role !== 'super admin')) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Only admins can update messages'
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Check if message exists
      const message = await Message.findById(id);
      if (!message) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Message not found'
          }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Update allowed fields
      const { text, backgroundColor, textColor, speed, displayOrder, isActive } = body;

      if (text !== undefined && text.trim().length > 0) message.text = text.trim();
      if (backgroundColor !== undefined) message.backgroundColor = backgroundColor;
      if (textColor !== undefined) message.textColor = textColor;
      if (speed !== undefined) message.speed = speed;
      if (displayOrder !== undefined) message.displayOrder = displayOrder;
      if (isActive !== undefined) message.isActive = isActive;

      await message.save();

      const updatedMessage = await message.populate('createdBy', 'firstName lastName email');

      return new Response(
        JSON.stringify({
          success: true,
          data: updatedMessage,
          message: 'Message updated successfully'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      console.error('❌ Error updating message:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message || 'Failed to update message'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  });
}

/**
 * DELETE /api/message/[id]
 * Delete message (admin only)
 */
export async function DELETE(request, { params }) {
  return authenticate(request, async () => {
    try {
      await connectDB();

      const { id } = await params;
      const userId = request.user?.id;

      // Verify user is admin
      const user = await User.findById(userId).lean();
      if (!user || (user.role !== 'admin' && user.role !== 'super admin')) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Only admins can delete messages'
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      const message = await Message.findByIdAndDelete(id);

      if (!message) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Message not found'
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
          message: 'Message deleted successfully'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      console.error('❌ Error deleting message:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message || 'Failed to delete message'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  });
}
