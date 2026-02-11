import PaymentMethod from '../models/PaymentMethod.js';

// Get all active payment methods
export const getAllPaymentMethods = async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    let query = {};
    if (!includeInactive) {
      query = { isActive: true };
    }

    const paymentMethods = await PaymentMethod.find(query)
      .sort({ order: 1, createdAt: -1 })
      .select('-createdBy -updatedBy');

    return {
      status: 200,
      data: paymentMethods,
    };
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return {
      status: 500,
      error: 'Failed to fetch payment methods',
    };
  }
};

// Get single payment method
export const getPaymentMethodById = async (id) => {
  try {
    const paymentMethod = await PaymentMethod.findById(id);

    if (!paymentMethod) {
      return {
        status: 404,
        error: 'Payment method not found',
      };
    }

    return {
      status: 200,
      data: paymentMethod,
    };
  } catch (error) {
    console.error('Error fetching payment method:', error);
    return {
      status: 500,
      error: 'Failed to fetch payment method',
    };
  }
};

// Create new payment method
export const createPaymentMethod = async (body) => {
  try {
    // Check if value already exists
    const existing = await PaymentMethod.findOne({
      value: body.value?.toLowerCase(),
    });
    if (existing) {
      return {
        status: 400,
        error: 'Payment method with this value already exists',
      };
    }

    const newPaymentMethod = new PaymentMethod({
      ...body,
      value: body.value?.toLowerCase(),
    });

    await newPaymentMethod.save();

    return {
      status: 201,
      data: newPaymentMethod,
    };
  } catch (error) {
    console.error('Error creating payment method:', error);
    return {
      status: 400,
      error: error.message || 'Failed to create payment method',
    };
  }
};

// Update payment method
export const updatePaymentMethod = async (body, methodId) => {
  try {
    // If value is being updated, check for duplicates
    if (body.value) {
      const existing = await PaymentMethod.findOne({
        value: body.value.toLowerCase(),
        _id: { $ne: methodId },
      });
      if (existing) {
        return {
          status: 400,
          error: 'Payment method with this value already exists',
        };
      }
    }

    const updatedPaymentMethod = await PaymentMethod.findByIdAndUpdate(
      methodId,
      {
        ...body,
        value: body.value?.toLowerCase(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedPaymentMethod) {
      return {
        status: 404,
        error: 'Payment method not found',
      };
    }

    return {
      status: 200,
      data: updatedPaymentMethod,
    };
  } catch (error) {
    console.error('Error updating payment method:', error);
    return {
      status: 400,
      error: error.message || 'Failed to update payment method',
    };
  }
};

// Delete payment method
export const deletePaymentMethod = async (methodId) => {
  try {
    const deletedPaymentMethod = await PaymentMethod.findByIdAndDelete(methodId);

    if (!deletedPaymentMethod) {
      return {
        status: 404,
        error: 'Payment method not found',
      };
    }

    return {
      status: 200,
      message: 'Payment method deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return {
      status: 500,
      error: 'Failed to delete payment method',
    };
  }
};

// Toggle payment method active status
export const togglePaymentMethodStatus = async (methodId) => {
  try {
    const paymentMethod = await PaymentMethod.findById(methodId);

    if (!paymentMethod) {
      return {
        status: 404,
        error: 'Payment method not found',
      };
    }

    paymentMethod.isActive = !paymentMethod.isActive;
    await paymentMethod.save();

    return {
      status: 200,
      data: paymentMethod,
    };
  } catch (error) {
    console.error('Error toggling payment method status:', error);
    return {
      status: 500,
      error: 'Failed to toggle payment method status',
    };
  }
};

// Get payment methods by category
export const getPaymentMethodsByCategory = async (category) => {
  try {
    const paymentMethods = await PaymentMethod.find({
      category,
      isActive: true,
    })
      .sort({ order: 1 })
      .select('-createdBy -updatedBy');

    return {
      status: 200,
      data: paymentMethods,
    };
  } catch (error) {
    console.error('Error fetching payment methods by category:', error);
    return {
      status: 500,
      error: 'Failed to fetch payment methods',
    };
  }
};
