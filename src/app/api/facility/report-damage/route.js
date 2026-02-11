import { NextResponse } from 'next/server';
import { authenticate } from '@/app/server/middleware/auth.js';
import { reportDamage } from '@/app/server/controllers/facilityController.js';

// POST /api/facility/report-damage - Report facility damage
export async function POST(req) {
  return authenticate(req, async () => {
    try {
      const body = await req.json();
      const { facility: facilityId, description } = body;

      if (!facilityId) {
        return NextResponse.json(
          { success: false, message: 'Facility ID is required' },
          { status: 400 }
        );
      }

      return await reportDamage(req, facilityId, description);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }
  });
}
