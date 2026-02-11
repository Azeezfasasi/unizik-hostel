import { NextResponse } from 'next/server';
import { authenticate } from '@/app/server/middleware/auth.js';
import { isAdmin } from '@/app/server/middleware/auth.js';
import { connectDB } from '@/app/server/db/connect.js';
import Facility from '@/app/server/models/Facility.js';

// GET /api/facility/damage-reports - Get all damage reports
export async function GET(req) {
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      try {
        await connectDB();
        
        // Get all facilities with damage reports
        const facilities = await Facility.find({ 'damageReports.0': { $exists: true } })
          .populate('category', 'name')
          .populate('damageReports.student', 'firstName lastName email matricNumber')
          .sort({ createdAt: -1 });

        // Flatten and format damage reports
        const allReports = [];
        facilities.forEach(facility => {
          facility.damageReports.forEach(report => {
            allReports.push({
              _id: report._id,
              facilityId: facility._id,
              facilityName: facility.name,
              facilityLocation: facility.location,
              facilityStatus: facility.status,
              category: facility.category?.name,
              student: report.student,
              description: report.description,
              reportedAt: report.reportedAt,
              repairStatus: report.repairStatus,
              repairUpdate: report.repairUpdate
            });
          });
        });

        // Sort by date descending
        allReports.sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));

        return NextResponse.json(
          { success: true, data: allReports, count: allReports.length },
          { status: 200 }
        );
      } catch (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        );
      }
    });
  });
}
