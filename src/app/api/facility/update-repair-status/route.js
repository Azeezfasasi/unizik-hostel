import { NextResponse } from 'next/server';
import { authenticate } from '@/app/server/middleware/auth.js';
import { isAdmin } from '@/app/server/middleware/auth.js';
import { connectDB } from '@/app/server/db/connect.js';
import Facility from '@/app/server/models/Facility.js';

// PATCH /api/facility/update-repair-status - Update damage report repair status
export async function PATCH(req) {
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      try {
        const body = await req.json();
        const { facilityId, reportId, repairStatus, repairUpdate } = body;

        if (!facilityId || !reportId) {
          return NextResponse.json(
            { success: false, message: 'Facility ID and Report ID are required' },
            { status: 400 }
          );
        }

        await connectDB();

        const facility = await Facility.findById(facilityId);
        if (!facility) {
          return NextResponse.json(
            { success: false, message: 'Facility not found' },
            { status: 404 }
          );
        }

        const report = facility.damageReports.id(reportId);
        if (!report) {
          return NextResponse.json(
            { success: false, message: 'Damage report not found' },
            { status: 404 }
          );
        }

        if (repairStatus) report.repairStatus = repairStatus;
        if (repairUpdate !== undefined) report.repairUpdate = repairUpdate;

        await facility.save();

        return NextResponse.json(
          { success: true, data: report },
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
