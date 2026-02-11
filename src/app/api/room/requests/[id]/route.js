import { approveRoomRequest, declineRoomRequest } from '@/app/server/controllers/roomController.js';

// POST /api/room/requests/[id]/approve - Approve room request
export async function POST(req, { params }) {
  const { id } = await params;
  const searchParams = req.nextUrl.searchParams;
  const action = searchParams.get('action');

  if (action === 'decline') {
    return declineRoomRequest(req, id);
  }
  
  return approveRoomRequest(req, id);
}
