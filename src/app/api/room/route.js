import { authenticate } from '@/app/server/middleware/auth.js';
import { getRooms, createRoom } from '@/app/server/controllers/roomController.js';

// GET /api/room - Get all rooms
export async function GET(req) {
  return authenticate(req, async () => {
    return getRooms(req);
  });
}

// POST /api/room - Create new room
export async function POST(req) {
  return authenticate(req, async () => {
    return createRoom(req);
  });
}
