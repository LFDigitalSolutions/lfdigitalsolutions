# Form Submission Guide using EmailJS

This document explains how the cost estimate form submission works, so you can implement similar functionality in other projects.

---

## Overview

The form uses **EmailJS** - a service that allows you to send emails directly from client-side JavaScript without needing a backend server.

### Why EmailJS?
- ✅ No backend server required
- ✅ Free tier available (200 emails/month)
- ✅ Supports HTML email templates
- ✅ Can embed images (base64)
- ✅ Easy to set up and use

---

## Setup Process

### 1. Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### 2. Connect Email Service

1. In EmailJS Dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the connection steps
5. Note down your **Service ID** (e.g., `service_7bnhcpn`)

### 3. Create Email Template

1. Go to **Email Templates**
2. Click **Create New Template**
3. Set up your template:

**Subject:**
```
{{subject}}
```

**Content:**
```html
{{{html_message}}}
```

4. Note down your **Template ID** (e.g., `template_dnwnyhg`)

> **Important:** Use triple braces `{{{html_message}}}` to render HTML content properly, not double braces.

### 4. Get Public Key

1. Go to **Account** → **General**
2. Copy your **Public Key** (e.g., `zUcdRXHwMWrRjcu9H`)

---

## Implementation in Code

### HTML Setup

#### 1. Include EmailJS Library

```html
<!-- Add before closing </body> tag -->
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
```

#### 2. Include Signature Pad Library (Optional)

If you need signature capture:

```html
<script src="https://cdn.jsdelivr.net/npm/signature_pad@4.1.7/dist/signature_pad.umd.min.js"></script>
```

#### 3. Form Structure

```html
<form id="your-form-id">
    <input type="text" name="client_name" required>
    <input type="email" name="email_address" required>
    <textarea name="message"></textarea>
    
    <!-- Signature Canvas (Optional) -->
    <canvas id="signature-canvas"></canvas>
    
    <button type="submit">Submit</button>
</form>

<!-- Success Modal -->
<div class="success-modal" id="success-modal">
    <div class="success-modal-content">
        <h2>Thank You!</h2>
        <p>Your form has been submitted successfully.</p>
        <button onclick="window.location.href='/'">Okay</button>
    </div>
</div>
```

---

### JavaScript Setup

#### 1. Initialize EmailJS

```javascript
// Your EmailJS credentials
const EMAILJS_PUBLIC_KEY = 'your_public_key';
const EMAILJS_SERVICE_ID = 'your_service_id';
const EMAILJS_TEMPLATE_ID = 'your_template_id';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    emailjs.init(EMAILJS_PUBLIC_KEY);
});
```

#### 2. Initialize Signature Pad (Optional)

```javascript
let signaturePad;

function initSignaturePad() {
    const canvas = document.getElementById('signature-canvas');
    signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)'
    });
}

function clearSignature() {
    if (signaturePad) {
        signaturePad.clear();
    }
}
```

#### 3. Form Submission Handler

```javascript
async function handleSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    try {
        // Get form data
        const clientName = document.querySelector('[name="client_name"]').value;
        const emailAddress = document.querySelector('[name="email_address"]').value;
        const message = document.querySelector('[name="message"]').value;
        
        // Get signature as base64 (optional)
        let signatureImage = '';
        if (signaturePad && !signaturePad.isEmpty()) {
            signatureImage = signaturePad.toDataURL('image/png');
        }
        
        // Create HTML email content
        const emailHTML = createEmailHTML({
            clientName,
            emailAddress,
            message,
            signatureImage
        });
        
        // Send email via EmailJS
        await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            {
                to_email: 'your-company-email@example.com',
                to_name: 'Your Company Name',
                subject: `New Form Submission - ${clientName}`,
                html_message: emailHTML
            }
        );
        
        // Show success message
        showSuccessModal();
        
    } catch (error) {
        console.error('Submission error:', error);
        alert('Submission failed. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
    }
}
```

#### 4. Create HTML Email Template

```javascript
function createEmailHTML(data) {
    return `
<!DOCTYPE html>
<html>
<head>
<style>
    body { 
        font-family: Arial, sans-serif; 
        line-height: 1.6; 
        color: #333; 
    }
    .container { 
        max-width: 800px; 
        margin: 0 auto; 
        padding: 20px; 
        background-color: #f5f5f5; 
    }
    .content { 
        background-color: white; 
        padding: 30px; 
        border-radius: 8px; 
    }
    h1 { 
        color: #1E3A8A; 
        text-align: center; 
        border-bottom: 3px solid #1E3A8A; 
        padding-bottom: 15px; 
    }
    h2 { 
        color: #1E3A8A; 
        border-bottom: 2px solid #e0e0e0; 
        padding-bottom: 10px; 
    }
    table { 
        width: 100%; 
        border-collapse: collapse; 
        margin: 15px 0; 
    }
    td { 
        padding: 8px; 
    }
</style>
</head>
<body>
<div class="container">
<div class="content">

<h1>New Form Submission</h1>

<h2>Client Information</h2>
<table>
    <tr><td><strong>Name:</strong></td><td>${data.clientName}</td></tr>
    <tr><td><strong>Email:</strong></td><td>${data.emailAddress}</td></tr>
</table>

<h2>Message</h2>
<p style="background-color: #f9f9f9; padding: 15px;">${data.message}</p>

${data.signatureImage ? `
<h2>Signature</h2>
<p><img src="${data.signatureImage}" style="max-width: 300px; border: 1px solid #ddd; padding: 10px;" alt="Signature" /></p>
` : ''}

</div>
</div>
</body>
</html>
    `;
}
```

#### 5. Show Success Modal

```javascript
function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.add('show');
}
```

---

## CSS for Success Modal

```css
.success-modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(30, 58, 138, 0.95);
    backdrop-filter: blur(10px);
    z-index: 10000;
    justify-content: center;
    align-items: center;
}

.success-modal.show {
    display: flex;
}

.success-modal-content {
    background: white;
    padding: 40px;
    border-radius: 16px;
    text-align: center;
    max-width: 500px;
    animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(50px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.success-modal button {
    background: #1E3A8A;
    color: white;
    border: none;
    padding: 12px 40px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    margin-top: 20px;
}
```

---

## Key Features Used

### 1. **EmailJS Send Method**

```javascript
await emailjs.send(
    SERVICE_ID,      // Your service ID
    TEMPLATE_ID,     // Your template ID
    {
        to_email: 'recipient@example.com',
        subject: 'Email Subject',
        html_message: 'HTML content here'
    }
);
```

### 2. **Base64 Image Embedding**

Images (like signatures) are converted to base64 and embedded directly in the email:

```javascript
const imageBase64 = canvas.toDataURL('image/png');

// Use in email:
<img src="${imageBase64}" alt="Signature" />
```

### 3. **HTML Email Generation**

Generate the full HTML email in JavaScript code (not in EmailJS dashboard) for easier maintenance:

```javascript
const emailHTML = `
<!DOCTYPE html>
<html>
...your HTML here...
</html>
`;
```

### 4. **Form Validation with Scroll**

```javascript
const requiredFields = [
    { element: nameInput, name: 'Name' },
    { element: emailInput, name: 'Email' }
];

for (const field of requiredFields) {
    if (!field.element.value.trim()) {
        field.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        field.element.focus();
        alert(`Please fill in: ${field.name}`);
        return;
    }
}
```

---

## Important Notes

### EmailJS Template Configuration

In your EmailJS template dashboard, keep it simple:

**Subject:**
```
{{subject}}
```

**Body:**
```
{{{html_message}}}
```

> Use `{{{` triple braces `}}}` for HTML content to prevent escaping!

### Email Limitations

- **Free Tier:** 200 emails/month
- **Max Email Size:** ~5MB (including images)
- **Rate Limiting:** Avoid sending too many emails too quickly

### Security Notes

- EmailJS Public Key is safe to expose (it's meant for client-side use)
- However, consider adding reCAPTCHA to prevent spam
- EmailJS has built-in rate limiting to prevent abuse

---

## Common Issues & Solutions

### Issue 1: "Recipients address is empty"

**Solution:** Make sure you include `to_email` parameter:

```javascript
await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
    to_email: 'your-email@example.com',  // <- Don't forget this!
    subject: 'Subject',
    html_message: 'Content'
});
```

### Issue 2: HTML not rendering properly

**Solution:** Use triple braces in template:

```
{{{html_message}}}  ✅ Correct
{{html_message}}    ❌ Wrong (will escape HTML)
```

### Issue 3: Images not showing

**Solution:** Ensure images are base64 encoded:

```javascript
const imageBase64 = canvas.toDataURL('image/png');
// imageBase64 starts with "data:image/png;base64,..."
```

---

## Testing Checklist

- [ ] EmailJS credentials are correct
- [ ] Template has `{{{html_message}}}` with triple braces
- [ ] Form validation works
- [ ] Signature capture works (if used)
- [ ] Email sends successfully
- [ ] Email HTML renders correctly
- [ ] Images display in email
- [ ] Success modal appears
- [ ] Error handling works

---

## Alternative: Simple Text Email

If you don't need HTML emails, you can send plain text:

**EmailJS Template:**
```
Subject: {{subject}}
Body: {{message}}
```

**JavaScript:**
```javascript
await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
    to_email: 'recipient@example.com',
    subject: 'New Form Submission',
    message: 'Plain text message here'
});
```

---

## Resources

- **EmailJS Documentation:** [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
- **Signature Pad Library:** [https://github.com/szimek/signature_pad](https://github.com/szimek/signature_pad)
- **EmailJS Dashboard:** [https://dashboard.emailjs.com/](https://dashboard.emailjs.com/)

---

## Summary

**What you need:**
1. EmailJS account (free)
2. Service ID + Template ID + Public Key
3. Simple template in EmailJS dashboard
4. JavaScript to generate HTML email and send via EmailJS

**Key benefits:**
- No backend server needed
- Free for small projects
- Easy to implement
- Supports HTML and images

**Our implementation:**
- Service: Gmail connected to EmailJS
- Template: Simple `{{subject}}` and `{{{html_message}}}`
- Email generation: All HTML created in JavaScript
- Features: Signature capture, form validation, success modal
