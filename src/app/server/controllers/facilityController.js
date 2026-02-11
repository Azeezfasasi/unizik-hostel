import { NextResponse } from 'next/server';
import Facility from '../models/Facility.js';
import FacilityCategory from '../models/FacilityCategory.js';
import { connectDB } from '../db/connect.js';

// Get all facility categories
export const getFacilityCategories = async (req) => {
  try {
    await connectDB();
    const categories = await FacilityCategory.find().sort({ createdAt: -1 });
    return NextResponse.json(
      { success: true, data: categories },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};

// Create facility category
export const createFacilityCategory = async (req) => {
  try {
    await connectDB();
    const body = await req.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existing = await FacilityCategory.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Category already exists' },
        { status: 400 }
      );
    }

    const category = await FacilityCategory.create({ name: name.trim() });
    return NextResponse.json(
      { success: true, data: category },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};

// Update facility category
export const updateFacilityCategory = async (req, categoryId) => {
  try {
    await connectDB();
    const body = await req.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Category name is required' },
        { status: 400 }
      );
    }

    const category = await FacilityCategory.findByIdAndUpdate(
      categoryId,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: category },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};

// Delete facility category
export const deleteFacilityCategory = async (req, categoryId) => {
  try {
    await connectDB();

    // Check if any facilities use this category
    const facilitiesCount = await Facility.countDocuments({ category: categoryId });
    if (facilitiesCount > 0) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete category with existing facilities' },
        { status: 400 }
      );
    }

    const category = await FacilityCategory.findByIdAndDelete(categoryId);

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Category deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};

// Get all facilities
export const getFacilities = async (req) => {
  try {
    await connectDB();
    const facilities = await Facility.find()
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    return NextResponse.json(
      { success: true, data: facilities },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};

// Get facility by ID
export const getFacilityById = async (req, facilityId) => {
  try {
    await connectDB();
    const facility = await Facility.findById(facilityId)
      .populate('category', 'name')
      .populate('damageReports.student', 'firstName lastName email');

    if (!facility) {
      return NextResponse.json(
        { success: false, message: 'Facility not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: facility },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};

// Create facility
export const createFacility = async (req) => {
  try {
    await connectDB();
    const body = await req.json();
    const { name, category, location, status } = body;

    if (!name || !name.trim() || !category) {
      return NextResponse.json(
        { success: false, message: 'Name and category are required' },
        { status: 400 }
      );
    }

    // Verify category exists
    const categoryExists = await FacilityCategory.findById(category);
    if (!categoryExists) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    const facility = await Facility.create({
      name: name.trim(),
      category,
      location: location?.trim() || '',
      status: status || 'active'
    });

    const populatedFacility = await Facility.findById(facility._id)
      .populate('category', 'name');

    return NextResponse.json(
      { success: true, data: populatedFacility },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};

// Update facility
export const updateFacility = async (req, facilityId) => {
  try {
    await connectDB();
    const body = await req.json();
    const { name, category, location, status } = body;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (category) updateData.category = category;
    if (location !== undefined) updateData.location = location?.trim() || '';
    if (status) updateData.status = status;

    const facility = await Facility.findByIdAndUpdate(
      facilityId,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name');

    if (!facility) {
      return NextResponse.json(
        { success: false, message: 'Facility not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: facility },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};

// Delete facility
export const deleteFacility = async (req, facilityId) => {
  try {
    await connectDB();
    const facility = await Facility.findByIdAndDelete(facilityId);

    if (!facility) {
      return NextResponse.json(
        { success: false, message: 'Facility not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Facility deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};

// Report damage
export const reportDamage = async (req, facilityId, description) => {
  try {
    await connectDB();
    const userId = req.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User authentication required' },
        { status: 401 }
      );
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        { success: false, message: 'Damage description is required' },
        { status: 400 }
      );
    }

    if (description.trim().length < 10) {
      return NextResponse.json(
        { success: false, message: 'Description must be at least 10 characters' },
        { status: 400 }
      );
    }

    const facility = await Facility.findById(facilityId);

    if (!facility) {
      return NextResponse.json(
        { success: false, message: 'Facility not found' },
        { status: 404 }
      );
    }

    facility.damageReports.push({
      student: userId,
      description: description.trim(),
      reportedAt: new Date(),
      repairStatus: 'Pending'
    });

    await facility.save();

    const updatedFacility = await Facility.findById(facilityId)
      .populate('category', 'name')
      .populate('damageReports.student', 'firstName lastName email');

    return NextResponse.json(
      { success: true, data: updatedFacility },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};

// Get damage reports for a facility
export const getFacilityDamageReports = async (req, facilityId) => {
  try {
    await connectDB();
    const facility = await Facility.findById(facilityId)
      .populate('damageReports.student', 'firstName lastName email');

    if (!facility) {
      return NextResponse.json(
        { success: false, message: 'Facility not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: facility.damageReports },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};

// Update damage report status
export const updateDamageReportStatus = async (req, facilityId, reportId) => {
  try {
    await connectDB();
    const body = await req.json();
    const { repairStatus, repairUpdate } = body;

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
    if (repairUpdate) report.repairUpdate = repairUpdate;

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
};
