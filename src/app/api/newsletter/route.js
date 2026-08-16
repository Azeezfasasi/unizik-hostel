import { NextRequest, NextResponse } from 'next/server';
import { authenticate, isAdmin } from '@/app/server/middleware/auth.js';
import {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  getAllSubscribers,
  getSubscriber,
  updateSubscriber,
  deleteSubscriber,
  createCampaign,
  sendNewsletter,
  scheduleCampaign,
  editCampaign,
  deleteCampaign,
  getAllCampaigns,
  getCampaignAnalytics,
  createTemplate,
  getAllTemplates,
  getNewsletterStatistics,
  bulkImportSubscribers,
  bulkDeleteSubscribers,
  bulkUpdateSubscribers,
} from '@/app/server/controllers/newsletterController.js';

// ============================================
// SUBSCRIBER ENDPOINTS
// ============================================

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const action = url.searchParams.get('action');

    // GET /api/newsletter?action=subscribers (admin only - full subscriber list/PII)
    if (action === 'subscribers') {
      return authenticate(request, async () => {
        return isAdmin(request, async () => {
          const page = parseInt(url.searchParams.get('page')) || 1;
          const limit = parseInt(url.searchParams.get('limit')) || 20;
          const status = url.searchParams.get('status');
          const search = url.searchParams.get('search') || '';
          const tags = url.searchParams.getAll('tags');
          const sortBy = url.searchParams.get('sortBy') || 'subscribedAt';

          const result = await getAllSubscribers({
            status,
            page,
            limit,
            search,
            tags,
            sortBy,
          });

          return NextResponse.json(result);
        });
      });
    }

    // GET /api/newsletter?action=subscriber&email=user@example.com
    // Public: allows a subscriber to look up their own subscription by email
    if (action === 'subscriber') {
      const email = url.searchParams.get('email');

      if (!email) {
        return NextResponse.json(
          { success: false, error: 'Email parameter required' },
          { status: 400 }
        );
      }

      const result = await getSubscriber(email);
      return NextResponse.json(result);
    }

    // GET /api/newsletter?action=campaigns (admin only)
    if (action === 'campaigns') {
      return authenticate(request, async () => {
        return isAdmin(request, async () => {
          const page = parseInt(url.searchParams.get('page')) || 1;
          const limit = parseInt(url.searchParams.get('limit')) || 20;
          const status = url.searchParams.get('status');
          const search = url.searchParams.get('search') || '';

          const result = await getAllCampaigns({
            status,
            page,
            limit,
            search,
          });

          return NextResponse.json(result);
        });
      });
    }

    // GET /api/newsletter?action=statistics (admin only)
    if (action === 'statistics') {
      return authenticate(request, async () => {
        return isAdmin(request, async () => {
          const result = await getNewsletterStatistics();
          return NextResponse.json(result);
        });
      });
    }

    // GET /api/newsletter?action=templates (admin only)
    if (action === 'templates') {
      return authenticate(request, async () => {
        return isAdmin(request, async () => {
          const page = parseInt(url.searchParams.get('page')) || 1;
          const limit = parseInt(url.searchParams.get('limit')) || 20;
          const category = url.searchParams.get('category');

          const result = await getAllTemplates({
            page,
            limit,
            category,
          });

          return NextResponse.json(result);
        });
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
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

export async function POST(request) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const body = await request.json();

    // POST /api/newsletter?action=subscribe (public)
    if (action === 'subscribe') {
      const result = await subscribeToNewsletter(body);
      return NextResponse.json(result);
    }

    // POST /api/newsletter?action=unsubscribe (public)
    if (action === 'unsubscribe') {
      const { email } = body;

      if (!email) {
        return NextResponse.json(
          { success: false, error: 'Email required' },
          { status: 400 }
        );
      }

      const result = await unsubscribeFromNewsletter(email);
      return NextResponse.json(result);
    }

    // POST /api/newsletter?action=create-campaign (admin only)
    if (action === 'create-campaign') {
      return authenticate(request, async () => {
        return isAdmin(request, async () => {
          const userId = request.user.id;
          const result = await createCampaign(body, userId);
          return NextResponse.json(result);
        });
      });
    }

    // POST /api/newsletter?action=send-campaign (admin only)
    if (action === 'send-campaign') {
      return authenticate(request, async () => {
        return isAdmin(request, async () => {
          const { campaignId } = body;

          if (!campaignId) {
            return NextResponse.json(
              { success: false, error: 'Campaign ID required' },
              { status: 400 }
            );
          }

          const userId = request.user.id;
          const result = await sendNewsletter(campaignId, userId);
          return NextResponse.json(result);
        });
      });
    }

    // POST /api/newsletter?action=schedule-campaign (admin only)
    if (action === 'schedule-campaign') {
      return authenticate(request, async () => {
        return isAdmin(request, async () => {
          const { campaignId, scheduledFor } = body;

          if (!campaignId || !scheduledFor) {
            return NextResponse.json(
              { success: false, error: 'Campaign ID and scheduled time required' },
              { status: 400 }
            );
          }

          const userId = request.user.id;
          const result = await scheduleCampaign(campaignId, scheduledFor, userId);
          return NextResponse.json(result);
        });
      });
    }

    // POST /api/newsletter?action=create-template (admin only)
    if (action === 'create-template') {
      return authenticate(request, async () => {
        return isAdmin(request, async () => {
          const userId = request.user.id;
          const result = await createTemplate(body, userId);
          return NextResponse.json(result);
        });
      });
    }

    // POST /api/newsletter?action=bulk-import (admin only)
    if (action === 'bulk-import') {
      return authenticate(request, async () => {
        return isAdmin(request, async () => {
          const { subscribers } = body;

          if (!Array.isArray(subscribers)) {
            return NextResponse.json(
              { success: false, error: 'Subscribers must be an array' },
              { status: 400 }
            );
          }

          const result = await bulkImportSubscribers(subscribers);
          return NextResponse.json(result);
        });
      });
    }

    // POST /api/newsletter?action=bulk-update (admin only)
    if (action === 'bulk-update') {
      return authenticate(request, async () => {
        return isAdmin(request, async () => {
          const { subscriberIds, updateData } = body;

          if (!Array.isArray(subscriberIds)) {
            return NextResponse.json(
              { success: false, error: 'Subscriber IDs must be an array' },
              { status: 400 }
            );
          }

          const result = await bulkUpdateSubscribers(subscriberIds, updateData);
          return NextResponse.json(result);
        });
      });
    }

    // POST /api/newsletter?action=bulk-delete (admin only)
    if (action === 'bulk-delete') {
      return authenticate(request, async () => {
        return isAdmin(request, async () => {
          const { subscriberIds } = body;

          if (!Array.isArray(subscriberIds)) {
            return NextResponse.json(
              { success: false, error: 'Subscriber IDs must be an array' },
              { status: 400 }
            );
          }

          const result = await bulkDeleteSubscribers(subscriberIds);
          return NextResponse.json(result);
        });
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Newsletter POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const body = await request.json();

    // PUT /api/newsletter?action=update-subscriber (admin only)
    if (action === 'update-subscriber') {
      return authenticate(request, async () => {
        return isAdmin(request, async () => {
          const { email, updateData } = body;

          if (!email) {
            return NextResponse.json(
              { success: false, error: 'Email required' },
              { status: 400 }
            );
          }

          const result = await updateSubscriber(email, updateData);
          return NextResponse.json(result);
        });
      });
    }

    // PUT /api/newsletter?action=edit-campaign (admin only)
    if (action === 'edit-campaign') {
      return authenticate(request, async () => {
        return isAdmin(request, async () => {
          const { campaignId, updateData } = body;

          if (!campaignId) {
            return NextResponse.json(
              { success: false, error: 'Campaign ID required' },
              { status: 400 }
            );
          }

          const userId = request.user.id;
          const result = await editCampaign(campaignId, updateData, userId);
          return NextResponse.json(result);
        });
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
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

export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const body = await request.json();

    // DELETE /api/newsletter?action=delete-subscriber (admin only)
    if (action === 'delete-subscriber') {
      return authenticate(request, async () => {
        return isAdmin(request, async () => {
          const { email } = body;

          if (!email) {
            return NextResponse.json(
              { success: false, error: 'Email required' },
              { status: 400 }
            );
          }

          const result = await deleteSubscriber(email);
          return NextResponse.json(result);
        });
      });
    }

    // DELETE /api/newsletter?action=delete-campaign (admin only)
    if (action === 'delete-campaign') {
      return authenticate(request, async () => {
        return isAdmin(request, async () => {
          const { campaignId } = body;

          if (!campaignId) {
            return NextResponse.json(
              { success: false, error: 'Campaign ID required' },
              { status: 400 }
            );
          }

          const result = await deleteCampaign(campaignId);
          return NextResponse.json(result);
        });
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Newsletter DELETE error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
