import { authenticate } from '@/app/server/middleware/auth.js';
import { getRooms, createRoom } from '@/app/server/controllers/roomController.js';

// GET /api/room - Get all rooms (public access)
export async function GET(req) {
  return getRooms(req);
}

// POST /api/room - Create new room (requires authentication)
export async function POST(req) {
  return authenticate(req, async () => {
    return createRoom(req);
  });
}
