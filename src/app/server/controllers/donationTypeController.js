import DonationType from '../models/DonationType.js';

// Get all active donation types
export const getAllDonationTypes = async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    let query = {};
    if (!includeInactive) {
      query = { isActive: true };
    }

    const donationTypes = await DonationType.find(query)
      .sort({ order: 1, createdAt: -1 })
      .select('-createdBy -updatedBy');

    return {
      status: 200,
      data: donationTypes,
    };
  } catch (error) {
    console.error('Error fetching donation types:', error);
    return {
      status: 500,
      error: 'Failed to fetch donation types',
    };
  }
};

// Get single donation type
export const getDonationTypeById = async (id) => {
  try {
    const donationType = await DonationType.findById(id);

    if (!donationType) {
      return {
        status: 404,
        error: 'Donation type not found',
      };
    }

    return {
      status: 200,
      data: donationType,
    };
  } catch (error) {
    console.error('Error fetching donation type:', error);
    return {
      status: 500,
      error: 'Failed to fetch donation type',
    };
  }
};

// Create new donation type
export const createDonationType = async (body) => {
  try {
    // Check if value already exists
    const existing = await DonationType.findOne({ value: body.value?.toLowerCase() });
    if (existing) {
      return {
        status: 400,
        error: 'Donation type with this value already exists',
      };
    }

    const newDonationType = new DonationType({
      ...body,
      value: body.value?.toLowerCase(),
    });

    await newDonationType.save();

    return {
      status: 201,
      data: newDonationType,
    };
  } catch (error) {
    console.error('Error creating donation type:', error);
    return {
      status: 400,
      error: error.message || 'Failed to create donation type',
    };
  }
};

// Update donation type
export const updateDonationType = async (body, typeId) => {
  try {
    // If value is being updated, check for duplicates
    if (body.value) {
      const existing = await DonationType.findOne({
        value: body.value.toLowerCase(),
        _id: { $ne: typeId },
      });
      if (existing) {
        return {
          status: 400,
          error: 'Donation type with this value already exists',
        };
      }
    }

    const updatedDonationType = await DonationType.findByIdAndUpdate(
      typeId,
      {
        ...body,
        value: body.value?.toLowerCase(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedDonationType) {
      return {
        status: 404,
        error: 'Donation type not found',
      };
    }

    return {
      status: 200,
      data: updatedDonationType,
    };
  } catch (error) {
    console.error('Error updating donation type:', error);
    return {
      status: 400,
      error: error.message || 'Failed to update donation type',
    };
  }
};

// Delete donation type
export const deleteDonationType = async (typeId) => {
  try {
    const deletedDonationType = await DonationType.findByIdAndDelete(typeId);

    if (!deletedDonationType) {
      return {
        status: 404,
        error: 'Donation type not found',
      };
    }

    return {
      status: 200,
      message: 'Donation type deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting donation type:', error);
    return {
      status: 500,
      error: 'Failed to delete donation type',
    };
  }
};

// Toggle donation type active status
export const toggleDonationTypeStatus = async (typeId) => {
  try {
    const donationType = await DonationType.findById(typeId);

    if (!donationType) {
      return {
        status: 404,
        error: 'Donation type not found',
      };
    }

    donationType.isActive = !donationType.isActive;
    await donationType.save();

    return {
      status: 200,
      data: donationType,
    };
  } catch (error) {
    console.error('Error toggling donation type status:', error);
    return {
      status: 500,
      error: 'Failed to toggle donation type status',
    };
  }
};
