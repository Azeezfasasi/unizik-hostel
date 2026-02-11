import { getRoomRequests, createRoomRequest, getMyRoomRequests } from '@/app/server/controllers/roomController.js';

// GET /api/room/requests - Get all room requests (admin) or my requests (user)
export async function GET(req) {
  const searchParams = req.nextUrl.searchParams;
  const isMyRequests = searchParams.get('my') === 'true';
  
  if (isMyRequests) {
    return getMyRoomRequests(req);
  }
  return getRoomRequests(req);
}

// POST /api/room/requests - Create room request
export async function POST(req) {
  return createRoomRequest(req);
}
