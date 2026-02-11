import { connectDB } from '@/app/server/db/connect';
import {
  getAllDonationTypes,
  getDonationTypeById,
  createDonationType,
  updateDonationType,
  deleteDonationType,
  toggleDonationTypeStatus,
} from '../../server/controllers/donationTypeController.js';

// GET request - Fetch all donation types
export async function GET(req) {
  try {
    await connectDB();
    const result = await getAllDonationTypes(req);
    
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
      JSON.stringify({ error: 'Failed to fetch donation types' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// POST request - Create new donation type
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const result = await createDonationType(body);
    
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
      JSON.stringify({ error: 'Failed to create donation type' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// PUT request - Update donation type
export async function PUT(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const typeId = searchParams.get('id');

    if (!typeId) {
      return new Response(
        JSON.stringify({ error: 'Donation type ID is required' }),
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
      result = await toggleDonationTypeStatus(typeId);
    } else {
      result = await updateDonationType(body, typeId);
    }

    return new Response(
      JSON.stringify(result.data || { error: result.error } || { message: result.message }),
      {
        status: result.status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update donation type' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// DELETE request - Delete donation type
export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const typeId = searchParams.get('id');

    if (!typeId) {
      return new Response(
        JSON.stringify({ error: 'Donation type ID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const result = await deleteDonationType(typeId);

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
      JSON.stringify({ error: 'Failed to delete donation type' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
