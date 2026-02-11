import { getHostelById, updateHostel, deleteHostel } from '@/app/server/controllers/hostelController.js';

// GET /api/hostel/[id] - Get hostel by ID
export async function GET(req, { params }) {
  const { id } = await params;
  return getHostelById(req, id);
}

// PUT /api/hostel/[id] - Update hostel
export async function PUT(req, { params }) {
  const { id } = await params;
  return updateHostel(req, id);
}

// DELETE /api/hostel/[id] - Delete hostel
export async function DELETE(req, { params }) {
  const { id } = await params;
  return deleteHostel(req, id);
}
