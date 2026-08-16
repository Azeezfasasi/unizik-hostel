import { bookRoom } from '@/app/server/controllers/roomController.js';
import { authenticate } from '@/app/server/middleware/auth.js';

// POST /api/room/book - Book a room with specific bed
export async function POST(req) {
  return authenticate(req, async () => {
    return bookRoom(req);
  });
}
