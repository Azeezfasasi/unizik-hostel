import { getAllAllocations } from '@/app/server/controllers/roomController.js';
import { authenticate, isAdmin } from '@/app/server/middleware/auth.js';

// GET /api/room/allocations - Get all current room allocations
export async function GET(req) {
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      return getAllAllocations(req);
    });
  });
}
