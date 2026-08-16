import { getAllRoomHistory } from '@/app/server/controllers/roomController.js';
import { authenticate, isAdmin } from '@/app/server/middleware/auth.js';

// GET /api/room/history - Get all room history
export async function GET(req) {
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      return getAllRoomHistory(req);
    });
  });
}
