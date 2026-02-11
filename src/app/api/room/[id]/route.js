import { getRoomById, updateRoom, deleteRoom } from '@/app/server/controllers/roomController.js';

// GET /api/room/[id] - Get room by ID
export async function GET(req, { params }) {
  const { id } = await params;
  return getRoomById(req, id);
}

// PUT /api/room/[id] - Update room
export async function PUT(req, { params }) {
  const { id } = await params;
  return updateRoom(req, id);
}

// DELETE /api/room/[id] - Delete room
export async function DELETE(req, { params }) {
  const { id } = await params;
  return deleteRoom(req, id);
}
