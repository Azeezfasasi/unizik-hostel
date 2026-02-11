import { authenticate } from '@/app/server/middleware/auth.js';
import { getMyRoomRequests } from '@/app/server/controllers/roomController.js';

// GET /api/room/my-requests - Get user's room requests
export async function GET(req) {
  return authenticate(req, async () => {
    return getMyRoomRequests(req);
  });
}
