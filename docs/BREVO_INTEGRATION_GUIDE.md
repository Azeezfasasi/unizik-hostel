# Brevo Email Integration Guide

## Overview
This guide covers the integration of **Brevo (formerly SendinBlue)** email service with the newsletter management system.

## Table of Contents
1. [Setup Instructions](#setup-instructions)
2. [Configuration](#configuration)
3. [API Reference](#api-reference)
4. [Features](#features)
5. [Webhook Setup](#webhook-setup)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Setup Instructions

### 1. Create Brevo Account
1. Go to [Brevo.com](https://www.brevo.com)
2. Sign up for a free account
3. Verify your email address
4. Accept the terms and conditions

### 2. Get API Key
1. Log in to your Brevo account
2. Navigate to **Settings** → **API & Plugins** → **API**
3. Under "SMTP & API", click **Create a new API key** or use the existing one
4. Copy the API key (starts with `xkeysib-`)

### 3. Verify Sender Email
1. In Brevo dashboard, go to **Senders List**
2. Click **Add a Sender**
3. Enter your sender email address (e.g., `noreply@rayobengineering.com`)
4. Verify the email by clicking the link in the verification email from Brevo
5. Optional: Add SPF and DKIM records for better deliverability

### 4. Update Environment Variables

Add the following to your `.env.local` file:

```env
# Email Configuration - Brevo (SendinBlue)
EMAIL_SERVICE=brevo
BREVO_API_KEY=xkeysib-your_actual_api_key_here
BREVO_SENDER_EMAIL=noreply@rayobengineering.com
BREVO_SENDER_NAME=Rayob Engineering
NEWSLETTER_FROM_EMAIL=info@rayobengineering.com
NEWSLETTER_FROM_NAME=Rayob Engineering

# Webhook Settings (for production)
BREVO_WEBHOOK_URL=https://yourdomain.com/api/webhooks/brevo
BREVO_WEBHOOK_KEY=your_webhook_secret_key
```

### 5. Create Lists in Brevo (Optional)
1. Go to **Contacts** → **Lists**
2. Create a list named "Newsletter Subscribers"
3. Note the list ID (visible in the URL or list settings)
4. Update the `listIds` parameter in the code if using a custom list

---

## Configuration

### Email Service File
**Location**: `src/app/server/utils/brevoEmailService.js`

Key configuration variables:
```javascript
const brevoApiKey = process.env.BREVO_API_KEY;
const brevoApiUrl = 'https://api.brevo.com/v3';
```

### Newsletter Controller
**Location**: `src/app/server/controllers/newsletterController.js`

The controller imports and uses the Brevo service for:
- Subscriber subscription/unsubscription
- Campaign sending
- Contact management

---

## API Reference

### Email Functions

#### 1. `sendEmailViaBrevo(emailData)`
Sends a single email via Brevo API.

**Parameters:**
```javascript
{
  to: string | string[],                    // Recipient email(s)
  subject: string,                          // Email subject
  htmlContent: string,                      // HTML email body
  textContent?: string,                     // Plain text version
  senderEmail?: string,                     // From address
  senderName?: string,                      // From name
  cc?: string[],                            // CC recipients
  bcc?: string[],                           // BCC recipients
  replyTo?: string,                         // Reply-To address
  tags?: string[],                          // Email tags for analytics
  templateId?: number,                      // Brevo template ID
  params?: object,                          // Template variables
  attachment?: {url, name}                  // File attachment
}
```

**Example:**
```javascript
const result = await sendEmailViaBrevo({
  to: 'user@example.com',
  subject: 'Newsletter',
  htmlContent: '<h1>Hello</h1>',
  senderEmail: 'noreply@rayobengineering.com',
  senderName: 'Rayob',
  tags: ['newsletter', 'promotion'],
});
```

#### 2. `sendBulkEmailsViaBrevo(emailList)`
Sends multiple emails in bulk.

**Parameters:**
- `emailList`: Array of email objects (same structure as `sendEmailViaBrevo`)

**Response:**
```javascript
{
  successful: [
    { email: string, messageId: string }
  ],
  failed: [
    { email: string, error: string }
  ],
  totalSent: number,
  totalFailed: number
}
```

#### 3. `createBrevoContact(contactData)`
Creates or updates a contact in Brevo.

**Parameters:**
```javascript
{
  email: string,                    // Contact email (required)
  firstName?: string,               // First name
  lastName?: string,                // Last name
  listIds?: number[],               // List IDs to add contact to
  attributes?: object               // Custom attributes
}
```

#### 4. `updateBrevoContact(email, updateData)`
Updates an existing contact.

**Parameters:**
```javascript
{
  listIds?: number[],
  attributes?: object
}
```

#### 5. `deleteBrevoContact(email)`
Deletes a contact from Brevo.

#### 6. `addContactsToList(listId, contacts)`
Adds contacts to a specific list.

#### 7. `removeContactsFromList(listId, emails)`
Removes contacts from a specific list.

#### 8. `getBrevoContact(email)`
Retrieves contact details.

#### 9. `getEmailEvents(filters)`
Gets email event logs (opens, clicks, bounces, etc.).

**Parameters:**
```javascript
{
  limit?: number,           // Default 50
  offset?: number,          // Default 0
  event?: string,           // 'sent', 'open', 'click', 'bounce', 'complaint'
  email?: string,           // Filter by email
  startDate?: string,       // YYYY-MM-DD
  endDate?: string          // YYYY-MM-DD
}
```

#### 10. `verifyBrevoApiKey()`
Verifies the API key and logs account information.

---

## Features

### 1. **Bulk Email Sending**
- Send to multiple subscribers efficiently
- Automatic rate limiting (10ms delay between emails)
- Retry mechanism for failed sends

### 2. **Contact Management**
- Auto-sync subscribers with Brevo contacts
- Auto-delete when subscribers are removed
- Support for custom attributes and lists

### 3. **Email Tracking**
- Message ID logging for tracking
- Event logging (sent, opened, clicked, bounced)
- Integration-ready for webhook updates

### 4. **Campaign Analytics**
- Open rates tracking
- Click rates tracking
- Bounce tracking
- Complaint tracking

### 5. **List Management**
- Support for multiple lists
- Add/remove contacts from lists
- Segment subscribers by tags

### 6. **Error Handling**
- Graceful degradation (Brevo failures don't stop newsletter)
- Detailed error reporting
- Failed send tracking

---

## Webhook Setup

### Purpose
Brevo webhooks update email events (opens, clicks, bounces) in real-time.

### Steps

1. **Create Webhook Endpoint** (optional, for production)
   ```javascript
   // src/app/api/webhooks/brevo/route.js
   export async function POST(request) {
     const data = await request.json();
     
     // Handle webhook events
     // Event types: sent, open, click, bounce, complaint, unsubscribe
     
     return Response.json({ received: true });
   }
   ```

2. **Configure in Brevo**
   - Dashboard → Settings → Webhooks
   - Add webhook URL: `https://yourdomain.com/api/webhooks/brevo`
   - Select events: Opens, Clicks, Bounces, Complaints, Unsubscribes
   - Add custom header for authentication (optional)

3. **Update Analytics**
   ```javascript
   // When receiving webhook events, update campaign analytics
   campaign.openCount += 1;
   campaign.clickCount += 1;
   campaign.bounceCount += 1;
   await campaign.save();
   ```

---

## Testing

### 1. Verify API Key
```javascript
import { verifyBrevoApiKey } from '@/app/server/utils/brevoEmailService';

const isValid = await verifyBrevoApiKey();
console.log(isValid); // true/false
```

### 2. Send Test Email
```javascript
import { sendEmailViaBrevo } from '@/app/server/utils/brevoEmailService';

const result = await sendEmailViaBrevo({
  to: 'test@example.com',
  subject: 'Test Newsletter',
  htmlContent: '<h1>Test Email</h1><p>This is a test.</p>',
  senderEmail: 'noreply@rayobengineering.com',
  senderName: 'Rayob',
});

console.log(result);
```

### 3. Test Bulk Send
```javascript
const subscribers = [
  { email: 'user1@example.com' },
  { email: 'user2@example.com' },
];

const emails = subscribers.map(sub => ({
  to: sub.email,
  subject: 'Test Bulk Email',
  htmlContent: '<h1>Hello</h1>',
}));

const results = await sendBulkEmailsViaBrevo(emails);
console.log(`Sent: ${results.totalSent}, Failed: ${results.totalFailed}`);
```

### 4. Test Contact Sync
```javascript
import { createBrevoContact } from '@/app/server/utils/brevoEmailService';

const result = await createBrevoContact({
  email: 'newuser@example.com',
  firstName: 'John',
  lastName: 'Doe',
});

console.log(result);
```

---

## Troubleshooting

### Issue: "BREVO_API_KEY is not configured"
**Solution**: Ensure the API key is set in `.env.local` and the server has been restarted.

### Issue: Emails not sending
**Check:**
1. API key is valid and active
2. Sender email is verified in Brevo
3. Recipient email is valid
4. Account hasn't exceeded rate limits
5. Check browser console for error details

### Issue: Contacts not syncing
**Check:**
1. Brevo contact creation/update logic is working
2. No duplicate email addresses in system
3. List IDs are correct (default is 1)
4. Check Brevo dashboard for contact creation logs

### Issue: High bounce rate
**Solutions:**
1. Verify email list quality
2. Check sender reputation in Brevo dashboard
3. Use double opt-in for subscriptions
4. Remove bounced emails from future sends
5. Add SPF/DKIM records to sender domain

### Issue: Rate limiting
**Note**: Brevo has rate limits:
- Free plan: 300 emails/day
- Paid plans: Higher limits based on subscription

**Solution**: Spread out large campaigns or upgrade plan.

### Debugging
Enable detailed logging:
```javascript
// Add to brevoEmailService.js
console.log('API Call:', { method, url, payload });
console.log('Response:', { status, data });
```

---

## Migration from Nodemailer

### Changes Made
1. **Removed**: Nodemailer configuration and dependencies
2. **Added**: Brevo email service utility (`brevoEmailService.js`)
3. **Updated**: Newsletter controller to use Brevo functions
4. **Updated**: Contact sync on subscribe/unsubscribe/delete

### Backward Compatibility
- The API endpoints remain the same
- Frontend code doesn't need changes
- Database schema unchanged

### Performance Comparison
| Metric | Nodemailer | Brevo |
|--------|-----------|-------|
| Email sending | Direct SMTP | Brevo API |
| Reliability | Depends on SMTP | 99.9% uptime |
| Deliverability | Basic | Enhanced |
| Analytics | None | Built-in |
| Rate limits | Flexible | Plan-based |

---

## Best Practices

### 1. **Email Verification**
```javascript
// Always verify sender domain
// Add SPF record: v=spf1 include:sendingdomain.brevo.com ~all
// Add DKIM: Configure in Brevo dashboard
```

### 2. **List Management**
```javascript
// Remove bounced addresses
// Implement re-engagement campaigns
// Maintain clean email lists
// Use segmentation for targeted campaigns
```

### 3. **Testing**
```javascript
// Always test with test@example.com first
// Check email rendering in different clients
// Test unsubscribe links
// Verify headers and sender info
```

### 4. **Monitoring**
```javascript
// Monitor open/click rates
// Track bounce rates
// Alert on failures
// Review delivery reports regularly
```

### 5. **Rate Limiting**
```javascript
// Spread out large sends
// Use scheduled campaigns
// Implement queue system for very large lists
// Monitor account usage
```

---

## Additional Resources

- [Brevo API Documentation](https://developers.brevo.com/)
- [Email Best Practices](https://www.brevo.com/blog/email-best-practices/)
- [Deliverability Guide](https://www.brevo.com/deliverability/)
- [SMTP Configuration](https://www.brevo.com/guide/smtp-configuration/)

---

## Support

For issues or questions:
1. Check Brevo dashboard for account status
2. Review API documentation
3. Check error logs in application
4. Contact Brevo support for account issues
