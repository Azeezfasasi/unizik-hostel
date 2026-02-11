import { NextResponse } from 'next/server';
import { connectDB } from '../db/connect.js';
import Campus from '../models/Campus.js';
import Hostel from '../models/Hostel.js';
import Room from '../models/Room.js';
import User from '../models/User.js';

export const getDashboardStats = async (req) => {
  try {
    await connectDB();

    // Fetch all statistics
    const [
      campusCount,
      hostelCount,
      totalRooms,
      totalStudents,
      totalStaff,
      totalAdmin,
      totalSuperAdmin,
      studentsByGender
    ] = await Promise.all([
      Campus.countDocuments(),
      Hostel.countDocuments(),
      Room.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'staff' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'super admin' }),
      User.aggregate([
        { $match: { role: 'student' } },
        {
          $group: {
            _id: '$gender',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Calculate occupied and available beds
    const occupiedRooms = await Room.countDocuments({ occupiedBy: { $exists: true, $ne: null } });
    const availableRooms = totalRooms - occupiedRooms;

    // Parse gender counts
    const maleStudents = studentsByGender.find(g => g._id === 'Male')?.count || 0;
    const femaleStudents = studentsByGender.find(g => g._id === 'Female')?.count || 0;

    const stats = {
      campus: campusCount,
      hostel: hostelCount,
      availableBeds: availableRooms,
      occupiedBeds: occupiedRooms,
      totalStudents: totalStudents,
      maleStudents: maleStudents,
      femaleStudents: femaleStudents,
      totalStaff: totalStaff,
      totalAdmin: totalAdmin,
      totalSuperAdmin: totalSuperAdmin,
    };

    return NextResponse.json(
      {
        success: true,
        stats: stats,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message
      },
      { status: 500 }
    );
  }
};
