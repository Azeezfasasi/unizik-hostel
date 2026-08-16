import { assignRoom } from '@/app/server/controllers/roomController.js';
import { authenticate, isAdmin } from '@/app/server/middleware/auth.js';

// POST /api/room/assign - Assign room to student
export async function POST(req) {
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      return assignRoom(req);
    });
  });
}
