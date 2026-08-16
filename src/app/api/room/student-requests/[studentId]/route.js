import { authenticate, isAdmin } from '@/app/server/middleware/auth.js'
import { getStudentRoomRequests } from '@/app/server/controllers/roomController.js'

// GET /api/room/student-requests/[studentId] - Get student's room requests (admin only)
export async function GET(request, { params }) {
  const { studentId } = await params

  return authenticate(request, async () => {
    return isAdmin(request, async () => {
      try {
        const result = await getStudentRoomRequests(request, studentId)
        return result
      } catch (error) {
        console.error('Error in GET /api/room/student-requests/[studentId]:', error)
        return Response.json({ error: error.message }, { status: 500 })
      }
    })
  })
}
