import { NextResponse } from 'next/server';
import RoomRequest from '../models/RoomRequest.js';
import Room from '../models/Room.js';
import { connectDB } from '../db/connect.js';

// Get all rooms
export const getRooms = async (req) => {
    try {
        await connectDB();
        const rooms = await Room.find()
            .populate('hostelId', 'name hostelCampus')
            .populate('assignedStudents', 'firstName lastName matricNumber');
        return NextResponse.json(
            { success: true, count: rooms.length, data: rooms },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
};

// Get room by ID
export const getRoomById = async (req, roomId) => {
    try {
        await connectDB();
        const room = await Room.findById(roomId)
            .populate('hostelId', 'name hostelCampus')
            .populate('assignedStudents', 'firstName lastName matricNumber');
        if (!room) {
            return NextResponse.json(
                { success: false, message: 'Room not found' },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { success: true, data: room },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
};

// Student: get their own room requests
export const getMyRoomRequests = async (req) => {
    try {
        await connectDB();
        const userId = req.user?.id;
        
        const requests = await RoomRequest.find({ student: userId })
            .populate('student')
            .populate({
                path: 'room',
                populate: { path: 'hostelId', select: 'name' }
            })
            .sort({ createdAt: -1 });
        
        // Only return approved requests with valid room details for the card
        const formatted = requests
            .filter(r => r.status === 'approved' && r.room)
            .map(r => ({
                _id: r._id,
                status: r.status,
                bed: r.bed,
                createdAt: r.createdAt,
                student: r.student,
                room: r.room,
            }));
        
        return NextResponse.json(
            { success: true, requests: formatted },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
};

// Admin: get all room requests
export const getRoomRequests = async (req) => {
    try {
        await connectDB();
        const requests = await RoomRequest.find()
            .populate('student', 'firstName lastName email matricNumber')
            .populate({
                path: 'room',
                populate: { path: 'hostelId', select: 'name' }
            })
            .sort({ createdAt: -1 });
        
        return NextResponse.json(
            { success: true, data: requests },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
};

// Student: create a room request
export const createRoomRequest = async (req) => {
    try {
        await connectDB();
        const body = await req.json();
        const studentId = req.user?.id || body.studentId;
        const { roomId, bed } = body;
        
        if (!studentId || !roomId || typeof bed !== 'number') {
            return NextResponse.json(
                { success: false, message: 'roomId, bed, and studentId are required' },
                { status: 400 }
            );
        }
        
        // Check for duplicate pending request
        const existing = await RoomRequest.findOne({ student: studentId, room: roomId, bed, status: 'pending' });
        if (existing) {
            return NextResponse.json(
                { success: false, message: 'You already have a pending request for this bed.' },
                { status: 400 }
            );
        }
        
        // Create request with paymentStatus: 'pending'
        const request = await RoomRequest.create({ 
            student: studentId, 
            room: roomId, 
            bed, 
            status: 'pending', 
            paymentStatus: 'pending' 
        });
        
        return NextResponse.json(
            { success: true, data: request },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
};

// Admin: approve a room request
export const approveRoomRequest = async (req, requestId) => {
    try {
        await connectDB();
        const request = await RoomRequest.findById(requestId).populate('room');
        
        if (!request) {
            return NextResponse.json(
                { success: false, message: 'Request not found' },
                { status: 404 }
            );
        }
        
        if (request.status !== 'pending') {
            return NextResponse.json(
                { success: false, message: 'Request already processed' },
                { status: 400 }
            );
        }
        
        // Check if bed is available
        const room = await Room.findById(request.room._id);
        if (!room) {
            return NextResponse.json(
                { success: false, message: 'Room not found' },
                { status: 404 }
            );
        }
        
        if (room.assignedStudents[request.bed]) {
            return NextResponse.json(
                { success: false, message: 'Bed already occupied' },
                { status: 400 }
            );
        }
        
        // Assign student to bed (ensure ObjectId)
        room.assignedStudents[request.bed] = request.student._id ? request.student._id : request.student;
        room.currentOccupancy = (room.assignedStudents.filter(Boolean).length);
        await room.save();
        request.status = 'approved';
        await request.save();
        
        return NextResponse.json(
            { success: true, message: 'Request approved and student assigned', data: request },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
};

// Admin: decline a room request
export const declineRoomRequest = async (req, requestId) => {
    try {
        await connectDB();
        const request = await RoomRequest.findById(requestId);
        
        if (!request) {
            return NextResponse.json(
                { success: false, message: 'Request not found' },
                { status: 404 }
            );
        }
        
        // Allow declining both pending and approved requests
        if (request.status === 'declined') {
            return NextResponse.json(
                { success: false, message: 'Request already processed' },
                { status: 400 }
            );
        }
        
        request.status = 'declined';
        await request.save();
        
        return NextResponse.json(
            { success: true, message: 'Request declined', data: request },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
};

// Create new room
export const createRoom = async (req) => {
    try {
        await connectDB();
        const body = await req.json();
        
        const room = await Room.create(body);
        return NextResponse.json(
            { success: true, data: room },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 400 }
        );
    }
};

// Assign room to student
export const assignRoom = async (req) => {
    try {
        await connectDB();
        const body = await req.json();
        const { studentId, roomId } = body;
        
        if (!studentId || !roomId) {
            return NextResponse.json(
                { success: false, message: 'studentId and roomId are required' },
                { status: 400 }
            );
        }
        
        const room = await Room.findById(roomId);
        if (!room) {
            return NextResponse.json(
                { success: false, message: 'Room not found' },
                { status: 404 }
            );
        }
        
        // Check if room is full
        if (room.currentOccupancy >= room.capacity) {
            return NextResponse.json(
                { success: false, message: 'Room is already full' },
                { status: 400 }
            );
        }
        
        // Check if student is already assigned
        if (room.assignedStudents.includes(studentId)) {
            return NextResponse.json(
                { success: false, message: 'Student already assigned to this room' },
                { status: 400 }
            );
        }
        
        room.assignedStudents.push(studentId);
        room.currentOccupancy += 1;
        await room.save();
        
        return NextResponse.json(
            { success: true, message: 'Student assigned to room', data: room },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
};

// Student books a room (with bed index)
export const bookRoom = async (req) => {
    try {
        await connectDB();
        const body = await req.json();
        const studentId = req.user?.id || body.studentId;
        const { roomId, bedIndex } = body;
        
        if (!studentId || !roomId || typeof bedIndex !== 'number') {
            return NextResponse.json(
                { success: false, message: 'roomId, bedIndex, and studentId are required' },
                { status: 400 }
            );
        }
        
        const room = await Room.findById(roomId);
        if (!room) {
            return NextResponse.json(
                { success: false, message: 'Room not found' },
                { status: 404 }
            );
        }
        
        // Check if bedIndex is valid
        if (bedIndex < 0 || bedIndex >= room.capacity) {
            return NextResponse.json(
                { success: false, message: 'Invalid bed index' },
                { status: 400 }
            );
        }
        
        // Check if bed is already occupied
        if (room.assignedStudents[bedIndex]) {
            return NextResponse.json(
                { success: false, message: 'Bed already occupied' },
                { status: 400 }
            );
        }
        
        // Check if student is already assigned to any bed in this room
        if (room.assignedStudents.includes(studentId)) {
            return NextResponse.json(
                { success: false, message: 'You are already assigned to this room' },
                { status: 400 }
            );
        }
        
        // Assign student to the selected bed
        room.assignedStudents[bedIndex] = studentId;
        room.currentOccupancy = (room.assignedStudents.filter(Boolean).length);
        await room.save();
        
        return NextResponse.json(
            { success: true, message: 'Room booked successfully', data: room },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
};

// Update room
export const updateRoom = async (req, roomId) => {
    try {
        await connectDB();
        const body = await req.json();
        
        const room = await Room.findByIdAndUpdate(roomId, body, {
            new: true,
            runValidators: true
        });
        
        if (!room) {
            return NextResponse.json(
                { success: false, message: 'Room not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json(
            { success: true, data: room },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 400 }
        );
    }
};

// Delete room
export const deleteRoom = async (req, roomId) => {
    try {
        await connectDB();
        const room = await Room.findByIdAndDelete(roomId);
        
        if (!room) {
            return NextResponse.json(
                { success: false, message: 'Room not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json(
            { success: true, message: 'Room deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
};

// Get true room history for all students
export const getAllRoomHistory = async (req) => {
    try {
        await connectDB();
        
        // Find all room requests (approved, declined, unassigned)
        const requests = await RoomRequest.find()
            .populate('student', 'firstName lastName otherName email matricNumber dob phone emergencyContact nextOfKinName nextOfKinRelationship nextOfKinPhone nin department course level profileImage gender onboardingCompleted')
            .populate({
                path: 'room',
                populate: { path: 'hostelId', select: 'name' }
            })
            .sort({ createdAt: -1 });
        
        console.log('RoomRequest count:', requests.length);
        requests.forEach((r, i) => {
            console.log(`Request[${i}]:`, {
                status: r.status,
                student: r.student && r.student.matricNumber,
                room: r.room && r.room.roomNumber,
                hostel: r.room && r.room.hostelId && r.room.hostelId.name,
                block: r.room && r.room.roomBlock,
                floor: r.room && r.room.roomFloor,
            });
        });
        
        // Group by student
        const history = {};
        requests.forEach(r => {
            const s = r.student;
            if (!s || !s._id) return;
            if (!history[s._id]) history[s._id] = { student: s, rooms: [] };
            history[s._id].rooms.push({
                status: r.status,
                hostel: r.room?.hostelId?.name,
                block: r.room?.roomBlock,
                floor: r.room?.roomFloor,
                room: r.room?.roomNumber,
                bed: r.bed !== undefined ? `Bed ${Number(r.bed) + 1}` : '-',
                roomId: r.room?._id,
                createdAt: r.createdAt,
                requestId: r._id,
            });
        });
        
        return NextResponse.json(
            { success: true, data: Object.values(history) },
            { status: 200 }
        );
    } catch (err) {
        return NextResponse.json(
            { success: false, message: err.message },
            { status: 500 }
        );
    }
};

// Get all current allocations (students with their room details)
export const getAllAllocations = async (req) => {
    try {
        await connectDB();
        
        const rooms = await Room.find()
            .populate('hostelId', 'name hostelCampus block floor')
            .populate('assignedStudents', 'firstName lastName otherName email matricNumber dob phone emergencyContact nextOfKinName nextOfKinRelationship nextOfKinPhone nin department course level profileImage gender onboardingCompleted');
        
        // Flatten allocations: one entry per student per room
        const allocations = [];
        rooms.forEach(room => {
            room.assignedStudents.forEach((student, idx) => {
                allocations.push({
                    student,
                    hostel: room.hostelId,
                    block: room.roomBlock,
                    floor: room.roomFloor,
                    room: room.roomNumber,
                    bed: idx,
                    roomId: room._id
                });
            });
        });
        
        return NextResponse.json(
            { success: true, data: allocations },
            { status: 200 }
        );
    } catch (err) {
        return NextResponse.json(
            { success: false, message: err.message },
            { status: 500 }
        );
    }
};

// Unassign a student from a room
export const unassignStudent = async (req) => {
    try {
        await connectDB();
        const body = await req.json();
        const { roomId, studentId } = body;
        
        const room = await Room.findById(roomId);
        if (!room) {
            return NextResponse.json(
                { success: false, message: 'Room not found' },
                { status: 404 }
            );
        }
        
        // Debug logging
        console.log('Assigned students:', room.assignedStudents.map(s => s && s.toString()), 'Student to unassign:', studentId);
        
        // Use ObjectId comparison for robustness
        const idx = room.assignedStudents.findIndex(s => s && s.equals ? s.equals(studentId) : s == studentId);
        if (idx === -1) {
            return NextResponse.json(
                { success: false, message: `Student not assigned to this room. Assigned: ${room.assignedStudents.map(s => s && s.toString()).join(', ')}. Tried to unassign: ${studentId}` },
                { status: 400 }
            );
        }
        
        room.assignedStudents.splice(idx, 1);
        room.currentOccupancy = Math.max(0, room.currentOccupancy - 1);
        await room.save();
        
        return NextResponse.json(
            { success: true, message: 'Student unassigned from room' },
            { status: 200 }
        );
    } catch (err) {
        return NextResponse.json(
            { success: false, message: err.message },
            { status: 500 }
        );
    }
};

// Admin: get room requests for a specific student
export const getStudentRoomRequests = async (req, studentId) => {
    try {
        if (!studentId) {
            return NextResponse.json(
                { success: false, requests: [], message: 'Student ID is required' },
                { status: 400 }
            );
        }

        await connectDB();
        const requests = await RoomRequest.find({ student: studentId })
            .populate('student')
            .populate({
                path: 'room',
                populate: { path: 'hostelId', select: 'name hostelCampus block location' }
            })
            .sort({ createdAt: -1 });

        // Format all requests (not just approved ones for admin view)
        const formatted = requests.map(r => ({
            _id: r._id,
            status: r.status,
            bed: r.bed,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            student: r.student,
            room: r.room,
        }));

        return NextResponse.json(
            { success: true, requests: formatted },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in getStudentRoomRequests:', error);
        return NextResponse.json(
            { success: false, requests: [], message: error.message },
            { status: 500 }
        );
    }
};
