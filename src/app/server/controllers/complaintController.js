import { NextResponse } from 'next/server';
import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import { connectDB } from '../db/connect.js';

// Get all complaints (with filters)
export const getAllComplaints = async (req) => {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const complaints = await Complaint.find(filter)
      .populate('studentId', 'firstName lastName email phone')
      .populate('assignedTo', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, data: complaints },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};

// Get complaints for a specific student
export const getStudentComplaints = async (req, studentId) => {
  try {
    await connectDB();
    const complaints = await Complaint.find({ studentId })
      .populate('assignedTo', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, data: complaints },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};

// Get single complaint
export const getComplaintById = async (req, complaintId) => {
  try {
    await connectDB();
    const complaint = await Complaint.findById(complaintId)
      .populate('studentId', 'firstName lastName email phone')
      .populate('assignedTo', 'firstName lastName email');

    if (!complaint) {
      return NextResponse.json(
        { success: false, message: 'Complaint not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: complaint },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};

// Create new complaint
export const createComplaint = async (req) => {
  try {
    await connectDB();
    const body = await req.json();
    const { studentId, studentName, studentEmail, category, description, location, phone, priority } = body;

    // Validation
    if (!studentId || !studentName || !studentEmail || !category || !description || !location) {
      return NextResponse.json(
        { success: false, message: 'All required fields must be filled' },
        { status: 400 }
      );
    }

    if (description.length < 10) {
      return NextResponse.json(
        { success: false, message: 'Description must be at least 10 characters' },
        { status: 400 }
      );
    }

    const complaint = await Complaint.create({
      studentId,
      studentName,
      studentEmail,
      category,
      description,
      location,
      phone: phone || '',
      priority: priority || 'Medium',
      status: 'Open'
    });

    return NextResponse.json(
      { success: true, data: complaint },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};

// Update complaint
export const updateComplaint = async (req, complaintId) => {
  try {
    await connectDB();
    const body = await req.json();
    const { status, assignedTo, assignedToName, resolution, resolutionDate, priority } = body;

    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      {
        status,
        assignedTo,
        assignedToName,
        resolution,
        resolutionDate,
        priority
      },
      { new: true, runValidators: true }
    );

    if (!complaint) {
      return NextResponse.json(
        { success: false, message: 'Complaint not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: complaint },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};

// Delete complaint
export const deleteComplaint = async (req, complaintId) => {
  try {
    await connectDB();
    const complaint = await Complaint.findByIdAndDelete(complaintId);

    if (!complaint) {
      return NextResponse.json(
        { success: false, message: 'Complaint not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Complaint deleted successfully', data: complaint },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};

// Add feedback to complaint
export const addFeedback = async (req, complaintId) => {
  try {
    await connectDB();
    const body = await req.json();
    const { feedback, rating } = body;

    if (!feedback || !rating) {
      return NextResponse.json(
        { success: false, message: 'Feedback and rating are required' },
        { status: 400 }
      );
    }

    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      { feedback, rating },
      { new: true }
    );

    if (!complaint) {
      return NextResponse.json(
        { success: false, message: 'Complaint not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: complaint },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};
