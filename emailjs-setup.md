# EmailJS Integration Instructions for GGUF Loader Hire Me Page

## Setup Process

1. **Sign up for EmailJS**
   - Go to https://www.emailjs.com/
   - Create a free account

2. **Connect an Email Service**
   - Go to Email Services in your EmailJS dashboard
   - Connect your email provider (Gmail, Outlook, etc.)
   - Follow the authentication steps

3. **Get Your Keys**
   - Go to Account → API Keys
   - Copy your Public Key (replace "YOUR_PUBLIC_KEY" in the code)

4. **Get Service ID**
   - Go to Email Services
   - Find your connected service and copy its ID (replace "YOUR_SERVICE_ID" in the code)

5. **Create Email Template**
   - Go to Email Templates
   - Create a new template with the details below

## Email Template Configuration

**Template Name:** Contact Form Message

**Template ID:** (system generated, replace "YOUR_TEMPLATE_ID" in the code)

**Template Content:**
```
Subject: New Contact Form Submission - {{subject}}

Dear Hussain,

You have received a new message from your website contact form:

From: {{from_name}}
Email: {{from_email}}
Service Interested In: {{service_interested}}
Subject: {{subject}}

Message:
{{message}}

Please respond to the sender at {{from_email}} when possible.

Best regards,
GGUF Loader Contact Form
```

**Template Variables:**
- from_name (Display Name: Name)
- from_email (Display Name: Email)
- subject (Display Name: Subject)
- service_interested (Display Name: Service Interested In)
- message (Display Name: Message)

## Required Code Updates

In the hire-me.html file, replace the placeholder values:
- Replace "YOUR_PUBLIC_KEY" with your actual EmailJS public key
- Replace "YOUR_SERVICE_ID" with your actual email service ID
- Replace "YOUR_TEMPLATE_ID" with your actual template ID

## Alternative Contact Method

If EmailJS is not working, you can always fall back to the mailto link method by reverting to the previous JavaScript code.