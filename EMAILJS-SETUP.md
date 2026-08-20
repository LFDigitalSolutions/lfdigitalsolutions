# EmailJS Setup Guide for L.F Digital Solutions

## Why EmailJS?
✅ Supports file attachments (signature images)  
✅ 200 free emails/month  
✅ Custom HTML email templates  
✅ No backend required  
✅ More reliable than Web3Forms  

---

## Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click **"Sign Up"** (top right)
3. Create account with your email (or use Google/GitHub login)
4. Verify your email address

---

## Step 2: Add Email Service (Connect Your Gmail)

1. In EmailJS Dashboard, click **"Email Services"** (left sidebar)
2. Click **"Add New Service"**
3. Select **"Gmail"** (recommended)
4. Click **"Connect Account"**
5. Sign in with your Gmail: **lf.digitalsolutions.official@gmail.com**
6. Allow EmailJS permissions
7. Give it a Service Name: `"lf_digital_gmail"`
8. Click **"Create Service"**
9. **COPY the Service ID** (e.g., `service_abc123`) - you'll need this later

---

## Step 3: Create Email Template

1. Click **"Email Templates"** (left sidebar)
2. Click **"Create New Template"**
3. Template Name: `"cost_estimate_form"`
4. **Replace the default template** with this:

### Email Template Content:

**Subject Line:**
```
{{subject_prefix}} Cost Estimate - {{client_name}}
```

**Email Body (use the template editor):**
```
═══════════════════════════════════════════════════════════
WEB DEVELOPMENT SERVICE COST ESTIMATE
L.F DIGITAL SOLUTIONS
═══════════════════════════════════════════════════════════

Dear {{to_name}},

Thank you for your interest in L.F Digital Solutions. Below is your cost estimate.

───────────────────────────────────────────────────────────
CLIENT INFORMATION
───────────────────────────────────────────────────────────
Client Name: {{client_name}}
Company: {{company}}
Contact Number: {{contact_number}}
Email Address: {{email_address}}
Project Title: {{project_title}}
Project Category: {{project_category}}

───────────────────────────────────────────────────────────
SELECTED SERVICES & PRICING
───────────────────────────────────────────────────────────
Selected Package: {{selected_package}}

Services:
{{services_list}}

TOTAL ESTIMATED COST: ₱{{total_cost}}

───────────────────────────────────────────────────────────
PROJECT DETAILS
───────────────────────────────────────────────────────────
Preferred Completion Date: {{preferred_completion_date}}

Project Description:
{{project_description}}

Required Features: {{required_features}}

Design Preferences:
  Preferred Colors: {{preferred_colors}}
  Preferred Style: {{preferred_style}}
  Reference Websites: {{reference_websites}}

Additional Notes:
{{additional_notes}}

───────────────────────────────────────────────────────────
CLIENT SIGNATURE
───────────────────────────────────────────────────────────
Name: {{client_signer}}
Position: {{client_position}}
Company: {{client_company_sig}}
Date: {{client_date}}

[Signature Image Attached]

═══════════════════════════════════════════════════════════

This is a preliminary cost estimate. Final pricing will be 
confirmed after detailed project discussion and approval.

Thank you for considering L.F Digital Solutions!

Best regards,
L.F Digital Solutions Team
San Antonio, Roxas ext., Digos City, Davao del Sur
Mobile: 0966 759 0644 / 0967 470 1338
Email: lf.digitalsolutions.official@gmail.com
```

5. Click **"Save"**
6. **COPY the Template ID** (e.g., `template_xyz789`) - you'll need this later

---

## Step 4: Get Your Public Key

1. Click **"Account"** (left sidebar)
2. Scroll to **"API Keys"** section
3. **COPY your Public Key** (e.g., `AbCd1234EfGh5678`)

---

## Step 5: Update Your Code

Open `js/cost-estimate.js` and replace these values at the top:

```javascript
// EmailJS Configuration
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY_HERE';     // From Step 4
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID_HERE';     // From Step 2
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID_HERE';   // From Step 3
```

### Example:
```javascript
const EMAILJS_PUBLIC_KEY = 'AbCd1234EfGh5678';
const EMAILJS_SERVICE_ID = 'service_abc123';
const EMAILJS_TEMPLATE_ID = 'template_xyz789';
```

---

## Step 6: Test the Form

1. Save all files
2. Open `cost-estimate.html` in your browser
3. Fill out the form completely
4. Sign the signature pad
5. Click **"Submit Quotation"**
6. Check both emails:
   - Client email (the one you entered in the form)
   - Company email (lf.digitalsolutions.official@gmail.com)

---

## Troubleshooting

### Error: "Public key is required"
- Make sure you replaced `YOUR_PUBLIC_KEY` with your actual public key

### Error: "Service not found"
- Check that your Service ID is correct
- Make sure the service is active in EmailJS dashboard

### Error: "Template not found"
- Check that your Template ID is correct
- Make sure the template is saved in EmailJS dashboard

### Emails not arriving
- Check spam/junk folder
- Verify your Gmail is connected in EmailJS
- Check EmailJS dashboard for error logs

### Signature not showing in email
- EmailJS supports attachments, but make sure the signature is being captured
- Check browser console for errors

---

## Features After Setup

✅ Client receives confirmation email with all details  
✅ Company receives copy at lf.digitalsolutions.official@gmail.com  
✅ Signature image can be included in email  
✅ Professional formatted emails  
✅ 200 emails/month free  
✅ No more "null" data issues  
✅ No more duplicate emails  

---

## Need Help?

EmailJS Documentation: https://www.emailjs.com/docs/
EmailJS Support: https://www.emailjs.com/support/

---

**Created for L.F Digital Solutions**  
Date: August 20, 2026
