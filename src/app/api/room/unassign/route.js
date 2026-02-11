import { unassignStudent } from '@/app/server/controllers/roomController.js';

// POST /api/room/unassign - Unassign student from room
export async function POST(req) {
  return unassignStudent(req);
}
