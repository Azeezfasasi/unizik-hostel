import { unassignStudent } from '@/app/server/controllers/roomController.js';
import { authenticate, isAdmin } from '@/app/server/middleware/auth.js';

// POST /api/room/unassign - Unassign student from room
export async function POST(req) {
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      return unassignStudent(req);
    });
  });
}
