import { connectDB } from '@/app/server/db/connect';
import {
  getAllPaymentMethods,
  getPaymentMethodById,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  togglePaymentMethodStatus,
  getPaymentMethodsByCategory,
} from '../../server/controllers/paymentMethodController.js';

// GET request - Fetch all payment methods
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    let result;
    if (category) {
      result = await getPaymentMethodsByCategory(category);
    } else {
      result = await getAllPaymentMethods(req);
    }

    return new Response(
      JSON.stringify(result.data || { error: result.error }),
      {
        status: result.status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch payment methods' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// POST request - Create new payment method
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const result = await createPaymentMethod(body);

    return new Response(
      JSON.stringify(result.data || { error: result.error }),
      {
        status: result.status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create payment method' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// PUT request - Update payment method
export async function PUT(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const methodId = searchParams.get('id');

    if (!methodId) {
      return new Response(
        JSON.stringify({ error: 'Payment method ID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if this is a status toggle request
    const isToggleStatus = searchParams.get('toggleStatus') === 'true';

    let result;
    if (isToggleStatus) {
      result = await togglePaymentMethodStatus(methodId);
    } else {
      result = await updatePaymentMethod(body, methodId);
    }

    return new Response(
      JSON.stringify(
        result.data || { error: result.error } || { message: result.message }
      ),
      {
        status: result.status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update payment method' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// DELETE request - Delete payment method
export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const methodId = searchParams.get('id');

    if (!methodId) {
      return new Response(
        JSON.stringify({ error: 'Payment method ID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const result = await deletePaymentMethod(methodId);

    return new Response(
      JSON.stringify(result.message || { error: result.error }),
      {
        status: result.status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete payment method' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
