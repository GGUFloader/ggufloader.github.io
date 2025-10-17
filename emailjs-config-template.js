// ============================================
// EmailJS Configuration Template
// ============================================
// Copy this configuration to the top of your hire-me.html file
// Replace the placeholder values with your actual EmailJS credentials
// Get your credentials from: https://dashboard.emailjs.com/

const EMAILJS_CONFIG = {
    // Your EmailJS Public Key
    // Found at: Account → General → API Keys
    publicKey: "YOUR_PUBLIC_KEY_HERE",
    
    // Your EmailJS Service ID
    // Found at: Email Services → Your Service → Service ID
    serviceId: "YOUR_SERVICE_ID_HERE",
    
    // Your EmailJS Template ID
    // Found at: Email Templates → Your Template → Template ID
    templateId: "YOUR_TEMPLATE_ID_HERE"
};

// ============================================
// How to Get Your Credentials
// ============================================

/*
STEP 1: Get Public Key
1. Go to https://dashboard.emailjs.com/
2. Click on "Account" in the left sidebar
3. Go to "General" tab
4. Copy your "Public Key" from the API Keys section
5. Replace "YOUR_PUBLIC_KEY_HERE" above

STEP 2: Get Service ID
1. Go to "Email Services" in the left sidebar
2. If you don't have a service, click "Add New Service"
3. Connect your email provider (Gmail, Outlook, etc.)
4. Copy the "Service ID" (e.g., "service_abc123")
5. Replace "YOUR_SERVICE_ID_HERE" above

STEP 3: Get Template ID
1. Go to "Email Templates" in the left sidebar
2. Click "Create New Template"
3. Set up your template (see emailjs-setup.md for template content)
4. Copy the "Template ID" (e.g., "template_xyz789")
5. Replace "YOUR_TEMPLATE_ID_HERE" above

STEP 4: Update hire-me.html
1. Open hire-me.html
2. Find the EMAILJS_CONFIG section (around line 10)
3. Replace the placeholder values with your actual credentials
4. Save the file
5. Test the form!
*/

// ============================================
// Example Configuration (DO NOT USE AS-IS)
// ============================================

/*
const EMAILJS_CONFIG = {
    publicKey: "Aif7atVmhmC4vCzO2",      // Example - replace with yours
    serviceId: "service_7evq2pa",         // Example - replace with yours
    templateId: "template_u8bup9s"        // Example - replace with yours
};
*/

// ============================================
// Testing Your Configuration
// ============================================

/*
After updating the configuration:

1. Open hire-me.html in a web browser
2. Open browser console (F12)
3. Look for "EmailJS initialized successfully" message
4. Fill out the contact form with test data
5. Submit the form
6. Check for success message
7. Check your email inbox for the test message

If you see errors:
- 401 Error: Check your Public Key
- 404 Error: Check your Service ID and Template ID
- Other errors: See emailjs-setup.md for troubleshooting
*/
