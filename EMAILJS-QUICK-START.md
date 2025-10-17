# EmailJS Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Create EmailJS Account
Visit https://www.emailjs.com/ and sign up (free tier: 100 emails/month)

### Step 2: Connect Your Email
1. Dashboard → **Email Services** → **Add New Service**
2. Choose Gmail/Outlook/Yahoo
3. Authenticate your email
4. **Copy the Service ID** (looks like: `service_abc123`)

### Step 3: Get Your Public Key
1. Dashboard → **Account** → **General**
2. Find **Public Key** in API Keys section
3. **Copy the Public Key** (looks like: `Aif7atVmhmC4vCzO2`)

### Step 4: Create Email Template
1. Dashboard → **Email Templates** → **Create New Template**
2. **Template Name:** Contact Form
3. **Subject:** `New Contact: {{subject}} - from {{from_name}}`
4. **Content:** (paste the template below)
5. **Copy the Template ID** (looks like: `template_xyz789`)

#### Template Content:
```
New message from {{from_name}}

Email: {{from_email}}
Subject: {{subject}}
Service: {{service_interested}}

Message:
{{message}}

---
Reply to: {{reply_to}}
```

### Step 5: Update hire-me.html
Open `hire-me.html` and find this section (around line 10):

```javascript
const EMAILJS_CONFIG = {
    publicKey: "YOUR_PUBLIC_KEY",      // Paste your Public Key here
    serviceId: "YOUR_SERVICE_ID",      // Paste your Service ID here
    templateId: "YOUR_TEMPLATE_ID"     // Paste your Template ID here
};
```

Replace the three values with your actual credentials.

### Step 6: Test It!
1. Open `hire-me.html` in a browser
2. Fill out the form
3. Click "Send Message"
4. Check your email inbox

## ✅ What You Get

### Enhanced Features
- ✓ Real-time form validation
- ✓ Clear error messages
- ✓ Loading spinner during submission
- ✓ Success/error status messages
- ✓ Automatic form reset after success
- ✓ Accessibility compliant (ARIA labels)
- ✓ Mobile responsive
- ✓ Spam protection ready

### User Experience
- Fields validate as users type
- Red borders show invalid fields
- Green success banner on submission
- Red error banner with helpful messages
- Button disables during submission
- Smooth animations and transitions

### Error Handling
- Specific error messages for different failures
- Fallback to direct email if EmailJS fails
- Console logging for debugging
- Rate limit detection
- Network error handling

## 🔧 Configuration Location

The configuration is at the **top of hire-me.html** for easy access:

```html
<script type="text/javascript">
    const EMAILJS_CONFIG = {
        publicKey: "Aif7atVmhmC4vCzO2",      // Your Public Key
        serviceId: "service_7evq2pa",         // Your Service ID
        templateId: "template_u8bup9s"        // Your Template ID
    };
</script>
```

## 🐛 Troubleshooting

### "EmailJS library failed to load"
- Check internet connection
- Verify CDN link is working
- Check browser console for errors

### Error 401 (Unauthorized)
- Double-check your Public Key
- Make sure it's copied correctly (no extra spaces)

### Error 404 (Not Found)
- Verify Service ID is correct
- Verify Template ID is correct
- Check that service is active in dashboard

### Error 429 (Too Many Requests)
- You've hit the 100 emails/month limit
- Wait or upgrade to paid plan

### Form submits but no email received
- Check spam/junk folder
- Verify email service is connected in dashboard
- Check EmailJS dashboard logs

## 📧 Template Variables

Your template must include these variables:

| Variable | Description |
|----------|-------------|
| `{{from_name}}` | Sender's name |
| `{{from_email}}` | Sender's email |
| `{{subject}}` | Message subject |
| `{{service_interested}}` | Selected service |
| `{{message}}` | Message content |
| `{{reply_to}}` | Reply-to address |

## 🎨 Customization

### Change Button Text
Find this line in hire-me.html:
```html
<span class="button-text">Send Message</span>
```

### Change Success Message
Find this line in the JavaScript:
```javascript
showStatus('✓ Thank you for your message! I will get back to you as soon as possible.', 'success');
```

### Change Colors
Edit the CSS in the `<style>` section:
```css
.form-status.success {
    background: #d4edda;  /* Light green */
    color: #155724;       /* Dark green */
}
```

## 🔒 Security

- ✓ Public Key is safe to expose (designed for client-side)
- ✓ No sensitive credentials in code
- ✓ EmailJS handles authentication server-side
- ✓ Consider adding reCAPTCHA for spam protection

## 📊 Monitoring

Check your EmailJS dashboard to:
- View sent emails
- Monitor usage (emails sent/remaining)
- Check error logs
- View delivery status

## 🆙 Upgrading

Free tier limitations:
- 100 emails/month
- 2 email services
- 2 email templates

Paid plans offer:
- More emails (1,000 - 100,000/month)
- More services and templates
- Priority support
- Remove EmailJS branding

## 📚 Resources

- **EmailJS Docs:** https://www.emailjs.com/docs/
- **Dashboard:** https://dashboard.emailjs.com/
- **Support:** https://www.emailjs.com/support/
- **Full Setup Guide:** See `emailjs-setup.md`

## 💡 Tips

1. **Test First:** Use your own email to test before going live
2. **Monitor Usage:** Check dashboard regularly to avoid hitting limits
3. **Backup Plan:** Keep direct email link as fallback
4. **Template Testing:** Use EmailJS template tester before deploying
5. **Error Logging:** Check browser console for debugging info

## 🎯 Next Steps

After setup:
1. Test the form thoroughly
2. Check email delivery
3. Verify error handling works
4. Test on mobile devices
5. Monitor first few submissions
6. Consider adding reCAPTCHA if needed

---

**Need Help?** Check `emailjs-setup.md` for detailed instructions or visit https://www.emailjs.com/docs/
