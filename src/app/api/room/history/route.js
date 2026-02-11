import { getAllRoomHistory } from '@/app/server/controllers/roomController.js';

// GET /api/room/history - Get all room history
export async function GET(req) {
  return getAllRoomHistory(req);
}
