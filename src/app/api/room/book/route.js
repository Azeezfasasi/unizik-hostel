import { bookRoom } from '@/app/server/controllers/roomController.js';

// POST /api/room/book - Book a room with specific bed
export async function POST(req) {
  return bookRoom(req);
}
