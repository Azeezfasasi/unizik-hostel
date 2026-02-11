import { getAllAllocations } from '@/app/server/controllers/roomController.js';

// GET /api/room/allocations - Get all current room allocations
export async function GET(req) {
  return getAllAllocations(req);
}
