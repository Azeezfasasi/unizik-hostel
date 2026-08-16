import { getRoomById, updateRoom, deleteRoom } from '@/app/server/controllers/roomController.js';
import { authenticate, isAdmin } from '@/app/server/middleware/auth.js';

// GET /api/room/[id] - Get room by ID (public access - basic room info only)
export async function GET(req, { params }) {
  const { id } = await params;
  return getRoomById(req, id);
}

// PUT /api/room/[id] - Update room
export async function PUT(req, { params }) {
  const { id } = await params;
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      return updateRoom(req, id);
    });
  });
}

// DELETE /api/room/[id] - Delete room
export async function DELETE(req, { params }) {
  const { id } = await params;
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      return deleteRoom(req, id);
    });
  });
}
