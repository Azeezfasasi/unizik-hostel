import { NextResponse } from 'next/server';
import Hostel from '../models/Hostel.js';
import Room from '../models/Room.js';
import User from '../models/User.js';
import { connectDB } from '../db/connect.js';

// Get all hostels
export const getHostels = async (req) => {
    try {
        await connectDB();
        const hostels = await Hostel.find();
        return NextResponse.json(
            { success: true, count: hostels.length, data: hostels },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
};

// Get public stats (available beds, occupied beds, hostels count, campuses)
export const getPublicStats = async (req) => {
    try {
        await connectDB();

        // Hostels
        const hostels = await Hostel.find();
        const hostelCount = hostels.length;

        // Rooms
        const rooms = await Room.find();
        let availableBeds = 0;
        let occupiedBeds = 0;
        rooms.forEach(r => {
            const vacant = r.capacity - (r.currentOccupancy || 0);
            availableBeds += r.status === 'available' ? vacant : 0;
            occupiedBeds += r.currentOccupancy || 0;
        });

        // Campuses (unique campusName from users)
        const campuses = await User.distinct('campusName', { campusName: { $nin: [null, ''] } });
        const campusCount = campuses.length;

        return NextResponse.json(
            {
                hostels: hostelCount,
                availableBeds,
                occupiedBeds,
                campuses: campusCount
            },
            { status: 200 }
        );
    } catch (err) {
        return NextResponse.json(
            { success: false, error: 'Failed to fetch stats', details: err.message },
            { status: 500 }
        );
    }
};

// Get hostel by ID
export const getHostelById = async (req, hostelId) => {
    try {
        await connectDB();
        const hostel = await Hostel.findById(hostelId);
        if (!hostel) {
            return NextResponse.json(
                { success: false, message: 'Hostel not found' },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { success: true, data: hostel },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
};

// Create new hostel
export const createHostel = async (req) => {
    try {
        await connectDB();
        const body = await req.json();

        const hostel = await Hostel.create(body);
        return NextResponse.json(
            { success: true, data: hostel },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 400 }
        );
    }
};

// Update hostel
export const updateHostel = async (req, hostelId) => {
    try {
        await connectDB();
        const body = await req.json();

        const hostel = await Hostel.findByIdAndUpdate(hostelId, body, {
            new: true,
            runValidators: true
        });
        if (!hostel) {
            return NextResponse.json(
                { success: false, message: 'Hostel not found' },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { success: true, data: hostel },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 400 }
        );
    }
};

// Delete hostel
export const deleteHostel = async (req, hostelId) => {
    try {
        await connectDB();
        const hostel = await Hostel.findByIdAndDelete(hostelId);
        if (!hostel) {
            return NextResponse.json(
                { success: false, message: 'Hostel not found' },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { success: true, message: 'Hostel deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
};

