# 🔧 EmailJS Troubleshooting Guide

## "EmailJS service is not available" Error

This error means the EmailJS library either didn't load or isn't initialized properly. Here's how to fix it:

## 🎯 Quick Fixes

### Step 1: Use the Test Page
1. Open `test-emailjs.html` in your browser
2. Click the buttons in order:
   - **Test 1:** Test EmailJS Library
   - **Test 2:** Test Initialization
   - **Test 3:** Send Test Email
3. Check the results to see what's failing

### Step 2: Check Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the **Console** tab
3. Look for error messages
4. Common issues:

```
❌ "emailjs is not defined"
   → EmailJS library didn't load

❌ "401 Unauthorized"
   → Wrong Public Key

❌ "404 Not Found"
   → Wrong Service ID or Template ID

❌ "429 Too Many Requests"
   → Rate limit exceeded (100 emails/month on free tier)
```

## 🔍 Detailed Diagnostics

### Issue 1: EmailJS Library Not Loading

**Symptoms:**
- Console shows: "EmailJS library not loaded"
- Form shows: "EmailJS service is not available"

**Causes:**
- No internet connection
- CDN is blocked (firewall, ad blocker)
- Script tag is incorrect

**Solutions:**

1. **Check Internet Connection**
   ```
   Open any website to verify internet works
   ```

2. **Check if CDN is blocked**
   - Disable ad blockers temporarily
   - Check firewall settings
   - Try a different browser

3. **Verify Script Tag**
   Open `hire-me.html` and check line 12:
   ```html
   <script type="text/javascript" src="https://cdn.emailjs.com/sdk/2.6.4/email.min.js"></script>
   ```

4. **Test CDN Directly**
   Open this URL in your browser:
   ```
   https://cdn.emailjs.com/sdk/2.6.4/email.min.js
   ```
   You should see JavaScript code, not an error.

### Issue 2: Wrong Configuration

**Symptoms:**
- Console shows: "401 Unauthorized" or "404 Not Found"
- Email doesn't send

**Causes:**
- Incorrect Public Key
- Incorrect Service ID
- Incorrect Template ID
- Typos or extra spaces

**Solutions:**

1. **Verify Your Credentials**
   
   Open `hire-me.html` and find this section (around line 19):
   ```javascript
   const EMAILJS_CONFIG = {
       publicKey: "Aif7atVmhmC4vCzO2",      // Check this
       serviceId: "service_7evq2pa",         // Check this
       templateId: "template_u8bup9s"        // Check this
   };
   ```

2. **Get Correct Values from EmailJS Dashboard**

   **Public Key:**
   - Go to https://dashboard.emailjs.com/
   - Click **Account** → **General**
   - Copy **Public Key** (looks like: `Aif7atVmhmC4vCzO2`)

   **Service ID:**
   - Go to **Email Services**
   - Find your service
   - Copy **Service ID** (looks like: `service_abc123`)

   **Template ID:**
   - Go to **Email Templates**
   - Find your template
   - Copy **Template ID** (looks like: `template_xyz789`)

3. **Check for Typos**
   - No extra spaces before or after
   - No missing characters
   - Correct capitalization
   - Quotes are correct

### Issue 3: Service Not Connected

**Symptoms:**
- Configuration looks correct
- Still getting errors

**Causes:**
- Email service not connected in EmailJS dashboard
- Service is disabled

**Solutions:**

1. **Check Service Status**
   - Go to https://dashboard.emailjs.com/
   - Go to **Email Services**
   - Make sure your service shows "Connected"
   - If it says "Disconnected", click to reconnect

2. **Verify Service is Active**
   - Click on your service
   - Make sure it's not disabled
   - Test the connection

### Issue 4: Template Not Configured

**Symptoms:**
- 404 error when sending
- Template ID seems correct

**Causes:**
- Template doesn't exist
- Template is not saved
- Template variables don't match

**Solutions:**

1. **Verify Template Exists**
   - Go to https://dashboard.emailjs.com/
   - Go to **Email Templates**
   - Find your template
   - Make sure it's saved (not draft)

2. **Check Template Variables**
   Your template must include these variables:
   - `{{from_name}}`
   - `{{from_email}}`
   - `{{subject}}`
   - `{{service_interested}}`
   - `{{message}}`
   - `{{reply_to}}`

### Issue 5: Rate Limit Exceeded

**Symptoms:**
- Error 429
- "Too many requests"

**Causes:**
- Sent more than 100 emails this month (free tier)
- Too many requests in short time

**Solutions:**

1. **Check Usage**
   - Go to https://dashboard.emailjs.com/
   - Check your usage stats
   - See how many emails sent this month

2. **Wait or Upgrade**
   - Wait until next month (free tier resets)
   - Or upgrade to paid plan for more emails

### Issue 6: Browser Compatibility

**Symptoms:**
- Works in one browser, not another
- Console shows different errors

**Solutions:**

1. **Try Different Browser**
   - Test in Chrome
   - Test in Firefox
   - Test in Edge

2. **Clear Browser Cache**
   - Clear cache and cookies
   - Hard refresh (Ctrl+F5 or Cmd+Shift+R)

3. **Disable Extensions**
   - Disable ad blockers
   - Disable privacy extensions
   - Test in incognito/private mode

## 🧪 Testing Steps

### Test 1: Basic Setup
```
1. Open test-emailjs.html
2. Check "System Checks" section
3. All should be green ✅
```

### Test 2: Library Loading
```
1. Click "Test EmailJS Library"
2. Should see: "✅ EmailJS library is loaded"
3. If not, check internet and CDN access
```

### Test 3: Initialization
```
1. Click "Test Initialization"
2. Should see: "✅ EmailJS initialized successfully!"
3. If not, check Public Key
```

### Test 4: Email Sending
```
1. Click "Send Test Email"
2. Should see: "✅ Email sent successfully!"
3. Check your email inbox
4. If failed, check Service ID and Template ID
```

## 📋 Checklist

Use this checklist to diagnose issues:

- [ ] Internet connection working
- [ ] EmailJS CDN accessible (test URL directly)
- [ ] Browser console open (F12)
- [ ] No ad blockers interfering
- [ ] Public Key is correct (no typos)
- [ ] Service ID is correct (no typos)
- [ ] Template ID is correct (no typos)
- [ ] Email service connected in dashboard
- [ ] Template exists and is saved
- [ ] Template variables match code
- [ ] Not over rate limit (check dashboard)
- [ ] Tested in different browser
- [ ] Cleared browser cache

## 🔧 Common Error Messages

### "emailjs is not defined"
```
Problem: Library didn't load
Solution: Check internet, CDN access, script tag
```

### "401 Unauthorized"
```
Problem: Wrong Public Key
Solution: Verify Public Key in dashboard
```

### "404 Not Found"
```
Problem: Wrong Service ID or Template ID
Solution: Verify IDs in dashboard
```

### "429 Too Many Requests"
```
Problem: Rate limit exceeded
Solution: Wait or upgrade plan
```

### "Failed to fetch"
```
Problem: Network error
Solution: Check internet, firewall, CORS
```

### "Service is not available"
```
Problem: EmailJS not initialized
Solution: Check library loading and initialization
```

## 🎯 Step-by-Step Debugging

### Step 1: Open Browser Console
```
1. Press F12 (or Cmd+Option+I on Mac)
2. Click "Console" tab
3. Refresh the page
4. Look for red error messages
```

### Step 2: Check What's Loaded
```
In console, type:
typeof emailjs

Should show: "object"
If shows: "undefined" → Library didn't load
```

### Step 3: Check Configuration
```
In console, type:
EMAILJS_CONFIG

Should show your configuration object
Check all three values are correct
```

### Step 4: Test Initialization
```
In console, type:
emailjs.init(EMAILJS_CONFIG.publicKey)

Should show: no error
If error: Check Public Key
```

### Step 5: Test Email Send
```
Use test-emailjs.html to send a test email
Check results for specific error messages
```

## 💡 Pro Tips

1. **Always test in test-emailjs.html first**
   - Easier to see what's wrong
   - Clear error messages
   - Step-by-step testing

2. **Check EmailJS Dashboard Logs**
   - Go to https://dashboard.emailjs.com/
   - Check logs for failed attempts
   - See exact error messages

3. **Use Browser Console**
   - Console shows detailed errors
   - Can test commands directly
   - See network requests

4. **Test with Simple Data First**
   - Use test-emailjs.html
   - Verify basic functionality
   - Then test real form

5. **Keep Credentials Handy**
   - Save your Public Key
   - Save your Service ID
   - Save your Template ID
   - Easy to verify if needed

## 🆘 Still Not Working?

If you've tried everything and it still doesn't work:

### Option 1: Use Fallback
The form automatically falls back to showing your email address:
```
hossainnazary475@gmail.com
```
Users can email you directly.

### Option 2: Check EmailJS Status
- Visit https://status.emailjs.com/
- Check if EmailJS service is down

### Option 3: Contact EmailJS Support
- Go to https://www.emailjs.com/support/
- Describe your issue
- Include error messages

### Option 4: Alternative Solutions
Consider these alternatives:
- Formspree (https://formspree.io/)
- Netlify Forms (if using Netlify)
- Google Forms
- Direct mailto link

## 📞 Getting Help

### Information to Provide
When asking for help, include:
1. Error message from console
2. Browser and version
3. What you've already tried
4. Results from test-emailjs.html
5. Screenshot of error (if possible)

### Where to Get Help
- EmailJS Docs: https://www.emailjs.com/docs/
- EmailJS Support: https://www.emailjs.com/support/
- Check the documentation files in this project

## ✅ Success Indicators

You'll know it's working when:
- ✅ No errors in console
- ✅ Form submits without error
- ✅ Green success message appears
- ✅ Email arrives in your inbox
- ✅ Form resets after submission

---

**Remember:** Use `test-emailjs.html` to diagnose issues quickly!
