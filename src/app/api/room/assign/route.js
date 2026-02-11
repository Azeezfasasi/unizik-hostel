import { assignRoom } from '@/app/server/controllers/roomController.js';

// POST /api/room/assign - Assign room to student
export async function POST(req) {
  return assignRoom(req);
}
