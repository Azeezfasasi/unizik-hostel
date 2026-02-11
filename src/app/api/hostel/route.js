import { getHostels, createHostel } from '@/app/server/controllers/hostelController.js';

// GET /api/hostel - Get all hostels
export async function GET(req) {
  return getHostels(req);
}

// POST /api/hostel - Create new hostel
export async function POST(req) {
  return createHostel(req);
}
