import { NextRequest, NextResponse } from 'next/server';
import { authenticate, isAdmin } from '@/app/server/middleware/auth.js';
import {
  getSubscriber,
  updateSubscriber,
  deleteSubscriber,
  adminUnsubscribeSubscriber,
  getCampaign,
  getCampaignAnalytics,
  editCampaign,
  deleteCampaign,
  pauseCampaign,
} from '@/app/server/controllers/newsletterController.js';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'campaign';
    const action = url.searchParams.get('action');

    // GET /api/newsletter/[id]?type=campaign&action=analytics (admin only)
    if (type === 'campaign' && action === 'analytics') {
      return authenticate(request, async () => {
        return isAdmin(request, async () => {
          const result = await getCampaignAnalytics(id);
          return NextResponse.json(result);
        });
      });
    }

    // GET /api/newsletter/[id]?type=campaign (admin only)
    if (type === 'campaign') {
      return authenticate(request, async () => {
        return isAdmin(request, async () => {
          const result = await getCampaign(id);
          return NextResponse.json(result);
        });
      });
    }

    // GET /api/newsletter/[id]?type=subscriber
    // Public: allows subscribers to view their own data
    if (type === 'subscriber') {
      const result = await getSubscriber(id);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, error: 'Invalid type parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Newsletter GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'campaign';
    const action = url.searchParams.get('action');
    const body = await request.json();

    // PUT /api/newsletter/[id]?type=subscriber (admin only)
    if (type === 'subscriber') {
      return authenticate(request, async () => {
        return isAdmin(request, async () => {
          const result = await updateSubscriber(id, body);
          return NextResponse.json(result);
        });
      });
    }

    // PUT /api/newsletter/[id]?type=campaign (admin only)
    if (type === 'campaign') {
      return authenticate(request, async () => {
        return isAdmin(request, async () => {
          const userId = request.user.id;

          // PUT /api/newsletter/[id]?type=campaign&action=pause
          if (action === 'pause') {
            const result = await pauseCampaign(id);
            return NextResponse.json(result);
          }

          // PUT /api/newsletter/[id]?type=campaign (edit campaign)
          const result = await editCampaign(id, body, userId);
          return NextResponse.json(result);
        });
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid type parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Newsletter PUT error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'campaign';

    return authenticate(request, async () => {
      return isAdmin(request, async () => {
        // DELETE /api/newsletter/[id]?type=subscriber
        if (type === 'subscriber') {
          const result = await deleteSubscriber(id);
          return NextResponse.json(result);
        }

        // DELETE /api/newsletter/[id]?type=campaign
        if (type === 'campaign') {
          const result = await deleteCampaign(id);
          return NextResponse.json(result);
        }

        return NextResponse.json(
          { success: false, error: 'Invalid type parameter' },
          { status: 400 }
        );
      });
    });
  } catch (error) {
    console.error('Newsletter DELETE error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
