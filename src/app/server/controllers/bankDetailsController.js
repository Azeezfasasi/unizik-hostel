import BankDetails from '../models/BankDetails.js';
import { connectDB } from '../../../utils/db';

// Get all bank details or active one
export const getBankDetails = async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    let query = { isActive: true };
    if (activeOnly === false) {
      query = {};
    }

    const bankDetails = await BankDetails.findOne(query).populate('updatedBy', 'name email');

    if (!bankDetails) {
      // Return empty default if none exists
      return {
        status: 200,
        data: {
          bankName: '',
          accountName: '',
          accountNumber: '',
          routingNumber: '',
          swiftCode: '',
          ibanCode: '',
          address: '',
          phone: '',
          email: '',
          website: '',
          accountType: 'business',
          currency: 'USD',
          isActive: true,
          notes: '',
        },
      };
    }

    return {
      status: 200,
      data: bankDetails,
    };
  } catch (error) {
    console.error('Error fetching bank details:', error);
    return {
      status: 500,
      error: 'Failed to fetch bank details',
    };
  }
};

// Create new bank details
export const createBankDetails = async (body) => {
  try {
    const newBankDetails = new BankDetails({
      ...body,
      isActive: true,
    });

    await newBankDetails.save();

    return {
      status: 201,
      data: newBankDetails,
    };
  } catch (error) {
    console.error('Error creating bank details:', error);
    return {
      status: 400,
      error: error.message || 'Failed to create bank details',
    };
  }
};

// Update bank details
export const updateBankDetails = async (body, detailsId = null) => {
  try {
    let query = {};
    if (detailsId) {
      query = { _id: detailsId };
    } else {
      // Update the active one
      query = { isActive: true };
    }

    let updatedBankDetails = await BankDetails.findOneAndUpdate(
      query,
      {
        ...body,
        lastUpdatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    // If no existing record found, create a new one
    if (!updatedBankDetails) {
      const newBankDetails = new BankDetails({
        ...body,
        isActive: true,
      });
      updatedBankDetails = await newBankDetails.save();
    }

    return {
      status: 200,
      data: updatedBankDetails,
    };
  } catch (error) {
    console.error('Error updating bank details:', error);
    return {
      status: 400,
      error: error.message || 'Failed to update bank details',
    };
  }
};

// Delete bank details
export const deleteBankDetails = async (detailsId) => {
  try {
    const deletedBankDetails = await BankDetails.findByIdAndDelete(detailsId);

    if (!deletedBankDetails) {
      return {
        status: 404,
        error: 'Bank details not found',
      };
    }

    return {
      status: 200,
      message: 'Bank details deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting bank details:', error);
    return {
      status: 500,
      error: 'Failed to delete bank details',
    };
  }
};
