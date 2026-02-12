import Message from '@/app/server/models/Message.js';
import User from '@/app/server/models/User.js';
import { connectDB } from '@/app/server/db/connect.js';
import { authenticate } from '@/app/server/middleware/auth.js';

/**
 * GET /api/message
 * Fetch all active messages sorted by display order
 */
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const query = includeInactive ? {} : { isActive: true };
    const messages = await Message.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .populate('createdBy', 'firstName lastName email')
      .lean();

    return new Response(
      JSON.stringify({
        success: true,
        data: messages,
        count: messages.length
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch messages'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * POST /api/message
 * Create new message (admin only)
 */
export async function POST(request) {
  return authenticate(request, async () => {
    try {
      await connectDB();

      const body = await request.json();
      const { text, backgroundColor, textColor, speed, displayOrder } = body;
      const userId = request.user?.id;

      // Verify user is admin
      const user = await User.findById(userId).lean();
      if (!user || (user.role !== 'admin' && user.role !== 'super admin')) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Only admins can create messages'
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Validation
      if (!text || text.trim().length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Message text is required'
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      const message = await Message.create({
        text: text.trim(),
        backgroundColor: backgroundColor || '#1e40af',
        textColor: textColor || '#ffffff',
        speed: speed || 'normal',
        displayOrder: displayOrder || 0,
        isActive: true,
        createdBy: userId
      });

      const populatedMessage = await message.populate('createdBy', 'firstName lastName email');

      return new Response(
        JSON.stringify({
          success: true,
          data: populatedMessage,
          message: 'Message created successfully'
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      console.error('❌ Error creating message:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message || 'Failed to create message'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  });
}
