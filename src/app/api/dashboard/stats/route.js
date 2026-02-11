import { authenticate, isAdmin } from "@/app/server/middleware/auth.js";
import User from "@/app/server/models/User.js";
import Hostel from "@/app/server/models/Hostel.js";
import Room from "@/app/server/models/Room.js";
import { connectDB } from "@/app/server/db/connect.js";
import { NextResponse } from "next/server";

// GET /api/dashboard/stats
// Fetch campus management statistics
export async function GET(req) {
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      try {
        await connectDB();

        // Fetch all hostels and rooms to calculate campus count (unique hostelCampus values)
        const [
          allHostels,
          totalRooms,
          totalStudents,
          totalStaff,
          totalAdmin,
          totalSuperAdmin,
          studentsByGender,
          allRooms,
        ] = await Promise.all([
          Hostel.find({}),
          Room.countDocuments(),
          User.countDocuments({ role: "student" }),
          User.countDocuments({ role: "staff" }),
          User.countDocuments({ role: "admin" }),
          User.countDocuments({ role: "super admin" }),
          User.aggregate([
            { $match: { role: "student" } },
            {
              $group: {
                _id: "$gender",
                count: { $sum: 1 },
              },
            },
          ]),
          Room.find({}),
        ]);

        // Count unique campuses from hostelCampus field
        const uniqueCampuses = new Set(allHostels.map((h) => h.hostelCampus));
        const campusCount = uniqueCampuses.size;

        // Calculate total beds and occupied beds
        // Total beds = sum of all room capacities
        // Occupied beds = sum of currentOccupancy for all rooms
        const totalBeds = allRooms.reduce((sum, room) => sum + (room.capacity || 0), 0);
        const occupiedBeds = allRooms.reduce((sum, room) => sum + (room.currentOccupancy || room.assignedStudents?.length || 0), 0);
        const availableBeds = totalBeds - occupiedBeds;

        // Parse gender counts
        const maleStudents = studentsByGender.find((g) => g._id === "Male")?.count || 0;
        const femaleStudents = studentsByGender.find((g) => g._id === "Female")?.count || 0;

        const stats = {
          campus: campusCount,
          hostel: allHostels.length,
          availableBeds: availableBeds,
          occupiedBeds: occupiedBeds,
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
            stats,
            timestamp: new Date().toISOString(),
          },
          { status: 200 }
        );
      } catch (error) {
        console.error("Dashboard stats error:", error);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to fetch dashboard statistics",
            error: error.message,
          },
          { status: 500 }
        );
      }
    });
  });
}

