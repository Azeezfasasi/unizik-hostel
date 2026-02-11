import { getPublicStats } from '@/app/server/controllers/hostelController.js';

// GET /api/hostel/stats - Get public statistics
export async function GET(req) {
  return getPublicStats(req);
}
