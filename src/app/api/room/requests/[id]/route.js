import { approveRoomRequest, declineRoomRequest } from '@/app/server/controllers/roomController.js';
import { authenticate, isAdmin } from '@/app/server/middleware/auth.js';

// POST /api/room/requests/[id]/approve - Approve room request
export async function POST(req, { params }) {
  const { id } = await params;
  const searchParams = req.nextUrl.searchParams;
  const action = searchParams.get('action');

  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      if (action === 'decline') {
        return declineRoomRequest(req, id);
      }

      return approveRoomRequest(req, id);
    });
  });
}
