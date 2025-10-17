# EmailJS Integration Instructions for GGUF Loader Hire Me Page

## Overview

The hire-me.html page now includes an enhanced EmailJS integration with:
- Easy configuration at the top of the file
- Real-time form validation
- Better error handling and user feedback
- Loading states and status messages
- Accessibility improvements

## Quick Setup Process

### 1. Sign up for EmailJS
- Go to https://www.emailjs.com/
- Create a free account (100 emails/month on free tier)

### 2. Connect an Email Service
- Go to **Email Services** in your EmailJS dashboard
- Click **Add New Service**
- Choose your email provider (Gmail, Outlook, Yahoo, etc.)
- Follow the authentication steps
- **Copy the Service ID** (e.g., "service_abc123")

### 3. Get Your Public Key
- Go to **Account** → **General**
- Find your **Public Key** in the API Keys section
- **Copy the Public Key** (e.g., "Aif7atVmhmC4vCzO2")

### 4. Create Email Template
- Go to **Email Templates**
- Click **Create New Template**
- Use the template configuration below

### 5. Update Configuration in hire-me.html

Find this section near the top of the file (around line 10):

```javascript
const EMAILJS_CONFIG = {
    publicKey: "YOUR_PUBLIC_KEY",      // Replace with your Public Key
    serviceId: "YOUR_SERVICE_ID",      // Replace with your Service ID
    templateId: "YOUR_TEMPLATE_ID"     // Replace with your Template ID
};
```

Replace the three values with your actual EmailJS credentials.

## Email Template Configuration

### Template Settings

**Template Name:** Contact Form Submission

**Subject Line:** 
```
New Contact: {{subject}} - from {{from_name}}
```

**Email Body:**
```html
<h2>New Contact Form Submission</h2>

<p>You have received a new message from your GGUF Loader website:</p>

<table style="border-collapse: collapse; width: 100%; max-width: 600px;">
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f8f9fa; font-weight: bold;">Name:</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{from_name}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f8f9fa; font-weight: bold;">Email:</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{from_email}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f8f9fa; font-weight: bold;">Subject:</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{subject}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f8f9fa; font-weight: bold;">Service:</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{service_interested}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f8f9fa; font-weight: bold;">Message:</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{message}}</td>
  </tr>
</table>

<p style="margin-top: 20px;">
  <strong>Reply to:</strong> <a href="mailto:{{reply_to}}">{{reply_to}}</a>
</p>

<hr style="margin: 20px 0;">
<p style="color: #6c757d; font-size: 0.9em;">
  This message was sent from the GGUF Loader contact form at https://ggufloader.github.io/hire-me.html
</p>
```

### Template Variables (Auto-Reply Settings)

Make sure these variables are configured in your template:

| Variable Name | Description |
|--------------|-------------|
| `from_name` | Sender's name |
| `from_email` | Sender's email address |
| `subject` | Message subject |
| `service_interested` | Selected service type |
| `message` | Message content |
| `reply_to` | Reply-to email (same as from_email) |

### Optional: Auto-Reply to Sender

You can set up an auto-reply in EmailJS:
1. In your template, enable **Auto-Reply**
2. Set the reply-to address as `{{from_email}}`
3. Create a friendly confirmation message

## Features of the Enhanced Form

### 1. Real-Time Validation
- Fields validate as users type
- Clear error messages appear below invalid fields
- Visual indicators (red borders) for errors

### 2. Status Messages
- Success: Green banner with confirmation
- Error: Red banner with specific error details
- Info: Blue banner for general information

### 3. Loading States
- Button shows spinner while sending
- Button is disabled during submission
- Prevents duplicate submissions

### 4. Error Handling
- Specific error messages for different failure types
- Fallback to direct email if EmailJS fails
- Console logging for debugging

### 5. Accessibility
- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader friendly
- Focus management

## Testing Your Setup

1. Open hire-me.html in a browser
2. Fill out the form with test data
3. Submit the form
4. Check for:
   - Success message appears
   - Email arrives in your inbox
   - Form resets after successful submission

## Troubleshooting

### Common Issues

**Error 401 (Unauthorized)**
- Check that your Public Key is correct
- Verify the key is active in EmailJS dashboard

**Error 404 (Not Found)**
- Verify Service ID is correct
- Verify Template ID is correct
- Check that the service is connected and active

**Error 429 (Too Many Requests)**
- You've hit the rate limit (100 emails/month on free tier)
- Wait a few minutes or upgrade your plan

**EmailJS library not loading**
- Check your internet connection
- Verify the CDN link is correct
- Check browser console for errors

### Debug Mode

Open browser console (F12) to see:
- EmailJS initialization status
- Form submission attempts
- Detailed error messages

## Fallback Options

If EmailJS is not working, users can still contact you via:
1. Direct email link: `hossainnazary475@gmail.com`
2. GitHub profile link
3. LinkedIn (if added)

## Security Notes

- Never commit your EmailJS credentials to public repositories
- The Public Key is safe to expose (it's meant for client-side use)
- Consider adding reCAPTCHA for spam protection
- Monitor your EmailJS dashboard for unusual activity

## Upgrading EmailJS

Free tier includes:
- 100 emails/month
- 2 email services
- 2 email templates

Paid plans offer:
- More emails per month
- More services and templates
- Priority support
- Custom branding removal

## Additional Resources

- EmailJS Documentation: https://www.emailjs.com/docs/
- EmailJS Dashboard: https://dashboard.emailjs.com/
- Support: https://www.emailjs.com/support/