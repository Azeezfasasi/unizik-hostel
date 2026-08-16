import { getRoomRequests, createRoomRequest, getMyRoomRequests } from '@/app/server/controllers/roomController.js';
import { authenticate, isAdmin } from '@/app/server/middleware/auth.js';

// GET /api/room/requests - Get all room requests (admin) or my requests (user)
export async function GET(req) {
  const searchParams = req.nextUrl.searchParams;
  const isMyRequests = searchParams.get('my') === 'true';

  return authenticate(req, async () => {
    if (isMyRequests) {
      return getMyRoomRequests(req);
    }
    return isAdmin(req, async () => {
      return getRoomRequests(req);
    });
  });
}

// POST /api/room/requests - Create room request
export async function POST(req) {
  return authenticate(req, async () => {
    return createRoomRequest(req);
  });
}
