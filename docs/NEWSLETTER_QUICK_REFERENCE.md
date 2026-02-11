# Newsletter System - Quick Reference Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install nodemailer mongoose
```

### 2. Configure Environment
```bash
cp .env.newsletter.example .env.local
# Edit .env.local with your values
```

### 3. Verify Database Connection
```javascript
import { connectDB } from '@/utils/db';
await connectDB(); // Should log: ✅ MongoDB connected
```

---

## 📚 API Quick Reference

### Subscribe User
```javascript
import { subscriberAPI } from '@/utils/newsletter-api';

await subscriberAPI.subscribe(
  'user@example.com',
  'John',
  'Doe',
  ['general']
);
```

### Get All Subscribers (Admin)
```javascript
const result = await subscriberAPI.getAllSubscribers(
  page = 1,
  limit = 20,
  status = 'active',
  search = '',
  tags = [],
  token
);
```

### Create Campaign (Admin)
```javascript
const campaign = await campaignAPI.create({
  title: 'Spring Sale',
  subject: 'Special Offer',
  content: 'Dear customer...',
  recipients: { type: 'all' },
}, token);
```

### Send Campaign Now (Admin)
```javascript
const result = await campaignAPI.send(campaignId, token);
// result.statistics contains: sentCount, failedCount, errors
```

### Schedule Campaign (Admin)
```javascript
await campaignAPI.schedule(
  campaignId,
  new Date('2024-02-15T09:00:00Z'),
  token
);
```

### Get Campaign Analytics (Admin)
```javascript
const analytics = await campaignAPI.getAnalytics(campaignId, token);
// Returns: openRate, clickRate, bounceRate, etc.
```

### Update Subscriber (Admin)
```javascript
await subscriberAPI.updateSubscriber(
  'user@example.com',
  {
    firstName: 'Jonathan',
    preferenceCenter: { marketing: false }
  },
  token
);
```

### Delete Subscriber (Admin)
```javascript
await subscriberAPI.deleteSubscriber('user@example.com', token);
```

### Bulk Import (Admin)
```javascript
await subscriberAPI.bulkImport([
  { email: 'user1@example.com', firstName: 'John' },
  { email: 'user2@example.com', firstName: 'Jane' }
], token);
```

### Get Statistics (Admin)
```javascript
const stats = await statisticsAPI.getAll(token);
// Returns: subscriber counts, campaign counts, engagement metrics
```

---

## 🔐 Authentication Headers

All admin operations require:
```javascript
headers: {
  'x-user-role': 'admin',
  'x-user-id': 'user123',
  // or
  'Authorization': 'Bearer your_jwt_token'
}
```

---

## 📊 Subscriber Model

```javascript
{
  _id: ObjectId,
  email: String (unique, lowercase),
  firstName: String,
  lastName: String,
  subscriptionStatus: 'active|inactive|bounced',
  subscribedAt: Date,
  unsubscribedAt: Date,
  preferenceCenter: {
    marketing: Boolean,
    updates: Boolean,
    promotions: Boolean
  },
  tags: [String],
  bounceCount: Number,
  complaintCount: Number,
  lastActivityDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📧 Campaign Model

```javascript
{
  _id: ObjectId,
  title: String,
  subject: String,
  content: String,
  htmlContent: String,
  status: 'draft|scheduled|sent|paused|archived',
  sender: ObjectId (User ref),
  recipients: {
    type: 'all|segment|list|individual',
    selectedSegments: [String],
    selectedTags: [String],
    selectedSubscribers: [ObjectId]
  },
  scheduledFor: Date,
  sentAt: Date,
  sentCount: Number,
  openCount: Number,
  clickCount: Number,
  bounceCount: Number,
  complaintCount: Number,
  unsubscribeCount: Number,
  failedCount: Number,
  analytics: {
    openRate: Number,
    clickRate: Number,
    // ... other rates
  },
  editHistory: [{
    editedAt: Date,
    editedBy: ObjectId (User ref),
    changes: Mixed
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎯 Common Use Cases

### Subscribe User with Form
```javascript
const handleSubscribe = async (e) => {
  e.preventDefault();
  const result = await subscriberAPI.subscribe(
    email,
    firstName,
    lastName
  );
  if (result.success) {
    alert('Successfully subscribed!');
  }
};
```

### Create & Send Campaign
```javascript
// 1. Create draft
const campaign = await campaignAPI.create({
  title: 'My Campaign',
  subject: 'Subject',
  content: 'Content',
  recipients: { type: 'all' }
}, token);

// 2. Send immediately
await campaignAPI.send(campaign._id, token);

// OR 2. Schedule for later
await campaignAPI.schedule(
  campaign._id,
  '2024-02-15T09:00:00Z',
  token
);
```

### Manage Subscribers
```javascript
// Get all subscribers
const result = await subscriberAPI.getAllSubscribers(1, 20, 'active');

// Update subscriber
await subscriberAPI.updateSubscriber(
  'email@example.com',
  { tags: ['premium', 'vip'] },
  token
);

// Delete subscriber
await subscriberAPI.deleteSubscriber('email@example.com', token);
```

### Bulk Operations
```javascript
// Import from CSV
const subscribers = parseCSV(csvFile);
await subscriberAPI.bulkImport(subscribers, token);

// Update multiple
await subscriberAPI.bulkUpdate(
  ['id1', 'id2', 'id3'],
  { tags: ['updated'] },
  token
);

// Delete multiple
await subscriberAPI.bulkDelete(['id1', 'id2'], token);
```

### Campaign Analytics
```javascript
const analytics = await campaignAPI.getAnalytics(campaignId, token);

console.log(`Open Rate: ${analytics.openRate}%`);
console.log(`Click Rate: ${analytics.clickRate}%`);
console.log(`Bounce Rate: ${analytics.bounceRate}%`);
```

---

## ⚙️ Environment Variables

**Required:**
```env
MONGODB_URI=mongodb+srv://...
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Optional:**
```env
NEWSLETTER_FROM_EMAIL=noreply@example.com
NEWSLETTER_FROM_NAME=Your Company
EMAIL_SERVICE=gmail
JWT_SECRET=your_secret
```

---

## 🧪 Testing Endpoints

### Test Subscribe
```bash
curl -X POST http://localhost:3000/api/newsletter?action=subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Test Get Subscribers (Admin)
```bash
curl http://localhost:3000/api/newsletter?action=subscribers \
  -H "x-user-role: admin"
```

### Test Send Campaign (Admin)
```bash
curl -X POST http://localhost:3000/api/newsletter?action=send-campaign \
  -H "Content-Type: application/json" \
  -H "x-user-role: admin" \
  -H "x-user-id: admin123" \
  -d '{"campaignId": "campaign_id_here"}'
```

---

## 🔧 Configuration

### Email Service
**Gmail (Development)**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password
```

**SendGrid (Production)**
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxxxx
```

### Recipient Types

| Type | Description | Example |
|------|-------------|---------|
| `all` | All active subscribers | `{ type: 'all' }` |
| `segment` | By tags/segments | `{ type: 'segment', selectedSegments: ['premium'] }` |
| `list` | By specific tags | `{ type: 'list', selectedTags: ['vip'] }` |
| `individual` | Specific subscribers | `{ type: 'individual', selectedSubscribers: ['id1', 'id2'] }` |

---

## 📱 Response Format

**Success Response**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

**Error Response**
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

---

## 🚨 Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Email required` | Missing email field | Add email to request body |
| `Unauthorized` | Not admin | Add `x-user-role: admin` header |
| `Subscriber not found` | Invalid email | Verify email exists |
| `Campaign already sent` | Trying to edit sent campaign | Can only edit draft campaigns |
| `No active subscribers` | All subscribers inactive/bounced | Check subscriber statuses |
| `SMTP connection error` | Email config wrong | Verify EMAIL_USER and EMAIL_PASS |
| `MongoDB connection failed` | Invalid connection string | Check MONGODB_URI format |

---

## 💡 Best Practices

1. ✅ Always validate email format before submitting
2. ✅ Use segments/tags for targeted campaigns
3. ✅ Test campaigns with small list before sending all
4. ✅ Monitor bounce rates and clean up bounced emails
5. ✅ Respect subscriber preferences in preference center
6. ✅ Schedule campaigns during optimal engagement times
7. ✅ Use templates for consistent branding
8. ✅ Track analytics to improve future campaigns
9. ✅ Implement rate limiting for API calls
10. ✅ Keep edit history for audit trail

---

## 📊 Database Indexes

For best performance, create these indexes:

```javascript
// In MongoDB
db.subscribers.createIndex({ email: 1 });
db.subscribers.createIndex({ subscriptionStatus: 1 });
db.subscribers.createIndex({ tags: 1 });
db.subscribers.createIndex({ subscribedAt: -1 });

db.campaigns.createIndex({ status: 1 });
db.campaigns.createIndex({ sender: 1 });
db.campaigns.createIndex({ createdAt: -1 });

db.activitylogs.createIndex({ subscriberId: 1 });
db.activitylogs.createIndex({ campaignId: 1 });
db.activitylogs.createIndex({ createdAt: -1 });
```

---

## 🔗 File Locations

```
Newsletter System Files:
├── src/app/server/models/Newsletter.js              (4 models)
├── src/app/server/controllers/newsletterController.js (25+ functions)
├── src/app/api/newsletter/route.js                  (Main routes)
├── src/app/api/newsletter/[id]/route.js             (Dynamic routes)
├── src/utils/newsletter-api.js                      (Frontend API utilities)
├── NEWSLETTER_API_DOCUMENTATION.md                  (Complete API docs)
├── NEWSLETTER_SETUP_GUIDE.md                        (Setup instructions)
├── NEWSLETTER_QUICK_REFERENCE.md                    (This file)
└── .env.newsletter.example                          (Environment template)
```

---

## 📞 Support

For issues or questions:
1. Check NEWSLETTER_API_DOCUMENTATION.md for detailed API info
2. Review NEWSLETTER_SETUP_GUIDE.md for setup help
3. Check error messages in browser console
4. Verify .env.local configuration
5. Test endpoints with provided cURL examples

---

Last Updated: November 22, 2025
Version: 1.0.0
