# Email Delivery Troubleshooting Guide

## Issue: Emails Not Being Received

### ✅ What We've Fixed
1. Added `NEXT_PUBLIC_APP_URL` to `.env.local` (was missing)
2. Added detailed console logging for email errors
3. Improved error visibility for debugging

---

## 🔴 Critical Issue: Domain Authentication Required

Your Brevo account shows that **domain verification is NOT complete**. This is the most likely reason emails aren't being delivered.

### What You Need to Do:

1. **Add DNS Records to Your Domain Registrar**
   
   You have the Brevo codes ready:
   
   **Brevo Code (TXT Record):**
   - Name: `@` (or leave blank)
   - Value: `brevo-code:9f54e3c7bd7353026b8ca15315cda10`
   
   **DKIM Record (TXT Record):**
   - Name: `mail._domainkey`
   - Value: `k=rsa;p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQc...` (full value from Brevo)
   
   **DMARC Record (TXT Record):**
   - Name: `_dmarc`
   - Value: From Brevo dashboard

2. **Where to Add These:**
   - Go to your domain registrar (GoDaddy, Namecheap, Google Domains, etc.)
   - Find DNS/DNS Records settings
   - Add the TXT records above
   - **Wait 24-48 hours** for DNS to propagate

3. **Verify in Brevo:**
   - Once DNS records are added, go to Brevo Dashboard
   - Domains → rayobengineering.com
   - Click "Verify" or "Check DNS"
   - Wait for verification to complete

---

## 🔍 How to Debug Email Sending

### Check Console Logs

After subscribing, check your server console logs. You should see:

**✓ Success:**
```
✓ Welcome email sent to: test@example.com Message ID: <message-id>
```

**❌ Error:**
```
❌ Welcome email send failed: { success: false, error: '...' }
❌ Error sending welcome email: Error message details
```

### Common Error Messages:

| Error | Solution |
|-------|----------|
| `From email not authenticated` | Complete domain verification above |
| `Invalid sender email` | Ensure `BREVO_SENDER_EMAIL` is verified in Brevo |
| `API key invalid` | Check `BREVO_API_KEY` in `.env.local` is correct |
| `Contact not found` | Contact might be on suppression list - check Brevo dashboard |

---

## ✅ Verification Checklist

- [ ] DNS records added to domain registrar (TXT records)
- [ ] Domain verified in Brevo dashboard (status: Verified)
- [ ] `BREVO_API_KEY` is set in `.env.local`
- [ ] `BREVO_SENDER_EMAIL` (info@rayobengineering.com) is verified in Brevo
- [ ] `NEXT_PUBLIC_APP_URL` is set to your domain or `http://localhost:3000`
- [ ] Server logs show email success messages (not errors)
- [ ] Check Brevo dashboard → Sent Emails tab for delivery status

---

## 🧪 Test Email Sending

### Method 1: Via Admin Dashboard
1. Go to Send Newsletter page
2. Create a test campaign
3. Send to yourself
4. Check console logs for errors
5. Check Brevo dashboard for delivery status

### Method 2: Direct API Test (Optional)
Create a test file to verify Brevo connectivity:

```javascript
// test-brevo.js
import { sendEmailViaBrevo } from './src/app/server/utils/brevoEmailService.js';

const result = await sendEmailViaBrevo({
  to: 'your-email@example.com',
  subject: 'Test Email',
  htmlContent: '<h1>Test</h1>',
  senderEmail: 'info@rayobengineering.com',
  senderName: 'Rayob Engineering',
});

console.log('Result:', result);
```

---

## 📊 Check Brevo Dashboard

1. **Contacts Tab:**
   - Search for subscriber email
   - Verify status is "Active" (not suppressed)
   - Check attributes (firstName, lastName, tags)

2. **Sent Emails Tab:**
   - Look for campaign sends
   - Check delivery status (Delivered, Bounced, etc.)
   - Click for detailed logs

3. **Transactional Tab:**
   - Shows individual email sends (like welcome emails)
   - Check status: Sent, Bounced, Opened, Clicked

---

## 🚀 Production Deployment

When deploying to production:

1. Update `.env.local` to:
   ```
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

2. Ensure domain is fully verified

3. Monitor first campaigns closely using Brevo dashboard

4. Set up Brevo webhooks (optional) for event tracking:
   ```
   BREVO_WEBHOOK_URL=https://yourdomain.com/api/webhooks/brevo
   ```

---

## Need More Help?

- **Brevo Documentation:** https://help.brevo.com/
- **DNS Setup Guide:** Check your domain registrar's support articles
- **Check Server Logs:** Look for console output with email send details
