# Newsletter Management System - API Documentation

## Overview
Professional Next.js newsletter management system with subscriber management, campaign automation, templates, and advanced analytics.

## Architecture

### Models
- **Subscriber**: User subscriptions with preferences and engagement tracking
- **Campaign**: Newsletter campaigns with scheduling, analytics, and edit history
- **Template**: Reusable email templates
- **ActivityLog**: Track all subscriber interactions

### Database Collections
```
Subscribers: User subscriptions and preferences
Campaigns: Newsletter campaigns and history
Templates: Email templates
ActivityLogs: User interactions and engagement
```

---

## API Endpoints

### 1. SUBSCRIBER MANAGEMENT

#### Subscribe to Newsletter
```
POST /api/newsletter?action=subscribe
Content-Type: application/json

{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "tags": ["premium", "tech"]
}

Response:
{
  "success": true,
  "message": "Successfully subscribed to newsletter",
  "subscriber": { ... }
}
```

#### Unsubscribe from Newsletter
```
POST /api/newsletter?action=unsubscribe
Content-Type: application/json

{
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "message": "Successfully unsubscribed from newsletter"
}
```

#### Get All Subscribers (Admin)
```
GET /api/newsletter?action=subscribers&page=1&limit=20&status=active&search=john&sortBy=subscribedAt

Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 20)
- status: Filter by status (active|inactive|bounced)
- search: Search by email or name
- tags: Filter by tags (array)
- sortBy: Sort field (default: subscribedAt)

Response:
{
  "success": true,
  "subscribers": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

#### Get Subscriber Details
```
GET /api/newsletter?action=subscriber&email=user@example.com

Response:
{
  "success": true,
  "subscriber": {
    "_id": "...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "subscriptionStatus": "active",
    "subscribedAt": "2024-01-15T10:30:00Z",
    "preferenceCenter": {
      "marketing": true,
      "updates": true,
      "promotions": false
    },
    "tags": ["premium", "tech"],
    "bounceCount": 0,
    "complaintCount": 0,
    "lastActivityDate": "2024-01-20T15:45:00Z"
  }
}
```

#### Update Subscriber (Admin)
```
PUT /api/newsletter?action=update-subscriber
Content-Type: application/json
Headers: x-user-role: admin

{
  "email": "user@example.com",
  "updateData": {
    "firstName": "Jonathan",
    "preferenceCenter": {
      "marketing": false,
      "updates": true,
      "promotions": true
    },
    "tags": ["premium", "tech", "enterprise"]
  }
}

Response:
{
  "success": true,
  "message": "Subscriber updated successfully",
  "subscriber": { ... }
}
```

#### Delete Subscriber (Admin)
```
DELETE /api/newsletter?action=delete-subscriber
Content-Type: application/json
Headers: x-user-role: admin

{
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "message": "Subscriber deleted successfully"
}
```

#### Bulk Import Subscribers (Admin)
```
POST /api/newsletter?action=bulk-import
Content-Type: application/json
Headers: x-user-role: admin

{
  "subscribers": [
    { "email": "user1@example.com", "firstName": "John", "lastName": "Doe", "tags": ["premium"] },
    { "email": "user2@example.com", "firstName": "Jane", "lastName": "Smith", "tags": ["standard"] }
  ]
}

Response:
{
  "success": true,
  "message": "Bulk import completed. 2 successful, 0 failed",
  "results": {
    "successful": 2,
    "failed": 0,
    "errors": []
  }
}
```

#### Bulk Update Subscribers (Admin)
```
POST /api/newsletter?action=bulk-update
Content-Type: application/json
Headers: x-user-role: admin

{
  "subscriberIds": ["id1", "id2", "id3"],
  "updateData": {
    "tags": ["updated-tag"],
    "preferenceCenter": {
      "marketing": true,
      "updates": false,
      "promotions": true
    }
  }
}

Response:
{
  "success": true,
  "message": "3 subscribers updated successfully",
  "modifiedCount": 3
}
```

#### Bulk Delete Subscribers (Admin)
```
POST /api/newsletter?action=bulk-delete
Content-Type: application/json
Headers: x-user-role: admin

{
  "subscriberIds": ["id1", "id2", "id3"]
}

Response:
{
  "success": true,
  "message": "3 subscribers deleted successfully",
  "deletedCount": 3
}
```

---

### 2. CAMPAIGN MANAGEMENT

#### Create Campaign (Admin)
```
POST /api/newsletter?action=create-campaign
Content-Type: application/json
Headers: x-user-role: admin, x-user-id: user123

{
  "title": "Spring Promotion 2024",
  "subject": "Special Offer Inside - 50% Off",
  "content": "Dear subscriber...",
  "htmlContent": "<html><body>...</body></html>",
  "description": "Spring promotional campaign",
  "campaignType": "promotional",
  "senderEmail": "marketing@rayobengineering.com",
  "senderName": "Rayob Marketing Team",
  "recipients": {
    "type": "segment",
    "selectedSegments": ["premium", "tech"],
    "selectedTags": [],
    "selectedSubscribers": []
  },
  "attachments": [
    { "name": "offer.pdf", "url": "https://...", "size": 1024 }
  ]
}

Response:
{
  "success": true,
  "message": "Campaign created successfully",
  "campaign": {
    "_id": "campaign123",
    "title": "Spring Promotion 2024",
    "status": "draft",
    "createdAt": "2024-01-20T10:00:00Z",
    ...
  }
}
```

#### Send Campaign Now (Admin)
```
POST /api/newsletter?action=send-campaign
Content-Type: application/json
Headers: x-user-role: admin, x-user-id: user123

{
  "campaignId": "campaign123"
}

Response:
{
  "success": true,
  "message": "Newsletter sent to 500 subscribers",
  "campaign": { ... },
  "statistics": {
    "sentCount": 500,
    "failedCount": 2,
    "totalRecipients": 502,
    "errors": [
      { "email": "invalid@test.com", "error": "Invalid email format" }
    ]
  }
}
```

#### Schedule Campaign (Admin)
```
POST /api/newsletter?action=schedule-campaign
Content-Type: application/json
Headers: x-user-role: admin, x-user-id: user123

{
  "campaignId": "campaign123",
  "scheduledFor": "2024-02-15T09:00:00Z"
}

Response:
{
  "success": true,
  "message": "Campaign scheduled successfully",
  "campaign": {
    "status": "scheduled",
    "scheduledFor": "2024-02-15T09:00:00Z",
    ...
  }
}
```

#### Edit Campaign (Admin)
```
PUT /api/newsletter?action=edit-campaign
Content-Type: application/json
Headers: x-user-role: admin, x-user-id: user123

{
  "campaignId": "campaign123",
  "updateData": {
    "title": "Updated Title",
    "subject": "Updated Subject",
    "content": "Updated content here..."
  }
}

Response:
{
  "success": true,
  "message": "Campaign updated successfully",
  "campaign": { ... }
}
```

#### Get Campaign Details (Admin)
```
GET /api/newsletter/campaign123?type=campaign

Response:
{
  "success": true,
  "campaign": {
    "_id": "campaign123",
    "title": "Spring Promotion 2024",
    "subject": "Special Offer Inside - 50% Off",
    "content": "...",
    "status": "sent",
    "sentAt": "2024-01-25T10:00:00Z",
    "sentCount": 500,
    "openCount": 150,
    "clickCount": 45,
    "bounceCount": 2,
    "complaintCount": 1,
    "unsubscribeCount": 5,
    "editHistory": [
      {
        "editedAt": "2024-01-20T15:30:00Z",
        "editedBy": { "name": "Admin User", "email": "admin@..." },
        "changes": { "subject": "Old Subject" }
      }
    ],
    "sender": { "name": "Admin", "email": "admin@..." }
  }
}
```

#### Get All Campaigns (Admin)
```
GET /api/newsletter?action=campaigns&status=sent&page=1&limit=20&search=promotion

Query Parameters:
- status: Filter by status (draft|scheduled|sent|paused|archived)
- page: Page number (default: 1)
- limit: Items per page (default: 20)
- search: Search in title and subject
- sortBy: Sort field (default: createdAt)

Response:
{
  "success": true,
  "campaigns": [...],
  "pagination": { ... }
}
```

#### Get Campaign Analytics (Admin)
```
GET /api/newsletter/campaign123?type=campaign&action=analytics

Response:
{
  "success": true,
  "analytics": {
    "totalSent": 500,
    "opens": 150,
    "clicks": 45,
    "bounces": 2,
    "complaints": 1,
    "unsubscribes": 5,
    "openRate": "30.00",
    "clickRate": "9.00",
    "bounceRate": "0.40",
    "complaintRate": "0.20",
    "unsubscribeRate": "1.00"
  },
  "activityLogs": [
    {
      "eventType": "opened",
      "subscriberId": "sub123",
      "createdAt": "2024-01-25T10:05:00Z"
    },
    {
      "eventType": "clicked",
      "subscriberId": "sub124",
      "link": "https://example.com/offer",
      "createdAt": "2024-01-25T10:10:00Z"
    }
  ]
}
```

#### Pause Campaign (Admin)
```
PUT /api/newsletter/campaign123?type=campaign&action=pause
Headers: x-user-role: admin

Response:
{
  "success": true,
  "message": "Campaign paused successfully",
  "campaign": { "status": "paused", ... }
}
```

#### Delete Campaign (Admin)
```
DELETE /api/newsletter?action=delete-campaign
Content-Type: application/json
Headers: x-user-role: admin

{
  "campaignId": "campaign123"
}

Response:
{
  "success": true,
  "message": "Campaign deleted successfully"
}
```

---

### 3. TEMPLATE MANAGEMENT

#### Create Template (Admin)
```
POST /api/newsletter?action=create-template
Content-Type: application/json
Headers: x-user-role: admin, x-user-id: user123

{
  "name": "Welcome Email",
  "description": "Welcome template for new subscribers",
  "content": "Welcome {{firstName}}...",
  "htmlContent": "<html><body>Welcome {{firstName}}...</body></html>",
  "category": "informational",
  "variables": ["firstName", "lastName", "email"],
  "isDefault": true
}

Response:
{
  "success": true,
  "message": "Template created successfully",
  "template": { ... }
}
```

#### Get All Templates (Admin)
```
GET /api/newsletter?action=templates&category=promotional&page=1&limit=20

Query Parameters:
- category: Filter by category
- page: Page number (default: 1)
- limit: Items per page (default: 20)

Response:
{
  "success": true,
  "templates": [...],
  "pagination": { ... }
}
```

---

### 4. NEWSLETTER STATISTICS

#### Get Newsletter Statistics (Admin)
```
GET /api/newsletter?action=statistics

Response:
{
  "success": true,
  "statistics": {
    "subscribers": {
      "total": 1000,
      "inactive": 50,
      "bounced": 10
    },
    "campaigns": {
      "total": 25,
      "sent": 20
    },
    "engagement": {
      "totalOpens": 3500,
      "totalClicks": 850
    }
  }
}
```

---

## Authentication & Authorization

### Admin Requirements
All admin endpoints require:
```
Headers:
x-user-role: admin
x-user-id: user123
```

### Implement with Your Auth System
Update the `requireAdmin()` function in your routes to match your authentication system:
```javascript
const requireAdmin = (req) => {
  // Example with JWT
  const token = req.headers.get('authorization')?.split(' ')[1];
  const decoded = verifyToken(token);
  return decoded?.role === 'admin';
};

const getUserId = (req) => {
  const token = req.headers.get('authorization')?.split(' ')[1];
  const decoded = verifyToken(token);
  return decoded?.userId;
};
```

---

## Subscriber Preferences

### Preference Center
Each subscriber can control their email preferences:
```javascript
{
  "preferenceCenter": {
    "marketing": true,      // Marketing emails
    "updates": true,        // Product updates
    "promotions": false     // Special promotions
  }
}
```

### Subscription Status
- **active**: Receiving newsletters
- **inactive**: Unsubscribed by user
- **bounced**: Email bounced repeatedly

---

## Campaign Recipient Types

### 1. All Subscribers
Sends to all active subscribers
```javascript
{
  "recipients": {
    "type": "all"
  }
}
```

### 2. By Segment
Sends to subscribers with specific tags
```javascript
{
  "recipients": {
    "type": "segment",
    "selectedSegments": ["premium", "tech"]
  }
}
```

### 3. By Tags
Sends to subscribers with specific tags
```javascript
{
  "recipients": {
    "type": "list",
    "selectedTags": ["enterprise", "vip"]
  }
}
```

### 4. Individual Subscribers
Sends to specific subscribers
```javascript
{
  "recipients": {
    "type": "individual",
    "selectedSubscribers": ["id1", "id2", "id3"]
  }
}
```

---

## Campaign Status Flow

```
Draft → Scheduled → Sent
              ↓
            Paused
              ↓
           Archived
```

---

## Email Configuration

Set these environment variables:
```
MONGODB_URI=your_mongodb_connection_string
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
NEWSLETTER_FROM_EMAIL=noreply@rayobengineering.com
NEXT_PUBLIC_APP_URL=https://yourapp.com
```

---

## Error Handling

All endpoints return consistent error responses:
```json
{
  "success": false,
  "error": "Error message describing the issue"
}
```

HTTP Status Codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized (not admin)
- 404: Not Found
- 500: Server Error

---

## Best Practices

1. **Always validate user input** on the frontend before sending
2. **Use pagination** for large datasets (limit: 20-50)
3. **Implement rate limiting** for email sending
4. **Monitor bounce rates** and clean up bounced subscribers regularly
5. **Test campaigns** with a small segment before sending to all subscribers
6. **Schedule campaigns** during optimal engagement times
7. **Track analytics** to improve future campaigns
8. **Maintain preference center** to respect subscriber choices
9. **Use segments/tags** for targeted campaigns
10. **Keep templates updated** and test HTML rendering

---

## Usage Examples

### Example 1: Subscribe to Newsletter (Frontend)
```javascript
const subscribe = async (email, firstName, lastName) => {
  const response = await fetch('/api/newsletter?action=subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      firstName,
      lastName,
      tags: ['general']
    })
  });
  return response.json();
};
```

### Example 2: Send Newsletter Campaign (Admin)
```javascript
const sendCampaign = async (campaignId) => {
  const response = await fetch('/api/newsletter?action=send-campaign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': 'admin',
      'x-user-id': userId
    },
    body: JSON.stringify({ campaignId })
  });
  return response.json();
};
```

### Example 3: Get Subscribers (Admin)
```javascript
const getSubscribers = async (page = 1, status = 'active') => {
  const response = await fetch(
    `/api/newsletter?action=subscribers&page=${page}&limit=20&status=${status}`,
    {
      headers: {
        'x-user-role': 'admin',
        'x-user-id': userId
      }
    }
  );
  return response.json();
};
```

---

## Advanced Features

### 1. Edit History Tracking
All campaign edits are tracked with timestamps and user information for audit purposes.

### 2. Analytics & Metrics
Comprehensive analytics including:
- Open rates
- Click rates
- Bounce rates
- Complaint rates
- Unsubscribe rates

### 3. Activity Logging
All subscriber interactions are logged:
- Subscriptions
- Unsubscriptions
- Opens
- Clicks
- Bounces
- Complaints

### 4. Bulk Operations
Efficiently manage large subscriber lists:
- Bulk import
- Bulk update
- Bulk delete

### 5. Email Preferences
Subscribers can control their email preferences:
- Marketing emails
- Product updates
- Promotional content

---

## Future Enhancements

- Email delivery retry logic
- A/B testing campaigns
- Automated email sequences
- Subscriber segmentation based on behavior
- Email template builder UI
- SMTP integration options
- Webhook support for external systems
- SMS notifications
- Push notifications
- Advanced reporting and dashboards

---

For more information or support, please contact your development team.
