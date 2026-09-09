// Cost Approval Handler

let clientSignaturePad;

// EmailJS Configuration (same as cost-estimate)
const EMAILJS_PUBLIC_KEY = 'zUcdRXHwMWrRjcu9H';
const EMAILJS_SERVICE_ID = 'service_7bnhcpn';
const EMAILJS_TEMPLATE_ID = 'template_dnwnyhg';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize EmailJS
    emailjs.init(EMAILJS_PUBLIC_KEY);
    
    initSignaturePad();
    setTodayDate();
    initBackgroundVideo();
    setupFormSubmit();
});

function initBackgroundVideo() {
    const video = document.getElementById('bg-video');
    if (video) {
        video.play().catch(error => {
            console.log('Video autoplay prevented:', error);
            document.addEventListener('click', () => {
                video.play();
            }, { once: true });
        });
    }
}

function initSignaturePad() {
    const clientCanvas = document.getElementById('client-signature');
    if (clientCanvas) {
        const container = clientCanvas.parentElement;
        clientCanvas.width = container.offsetWidth;
        clientCanvas.height = container.offsetHeight;
        
        clientSignaturePad = new SignaturePad(clientCanvas, {
            backgroundColor: 'rgb(255, 255, 255)',
            penColor: 'rgb(30, 58, 138)'
        });
    }
}

function clearClientSig() {
    if (clientSignaturePad) {
        clientSignaturePad.clear();
    }
}

function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.querySelector('input[name="client_date"]');
    if (dateInput && !dateInput.value) {
        dateInput.value = today;
    }
}

function setupFormSubmit() {
    const form = document.getElementById('cost-approval-form');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
}

async function handleSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const submitBtn = document.getElementById('submit-authorization');
    if (submitBtn.disabled) return;
    
    // Validate required fields
    const clientName = document.querySelector('[name="client_name"]');
    const emailAddress = document.querySelector('[name="email_address"]');
    const contactNumber = document.querySelector('[name="contact_number"]');
    const projectReference = document.querySelector('[name="project_reference"]');
    const clientSigner = document.querySelector('[name="client_signer"]');
    const clientDate = document.querySelector('[name="client_date"]');
    
    const requiredFields = [
        { element: clientName, name: 'Client Name' },
        { element: emailAddress, name: 'Email Address' },
        { element: contactNumber, name: 'Contact Number' },
        { element: projectReference, name: 'Project Title/Reference' },
        { element: clientSigner, name: 'Signature over Printed Name' },
        { element: clientDate, name: 'Date' }
    ];
    
    for (const field of requiredFields) {
        if (!field.element.value.trim()) {
            field.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            field.element.focus();
            showToast('error', `Please fill in: ${field.name}`);
            return;
        }
    }
    
    // Validate all authorization checkboxes are checked
    const authCheckboxes = [
        document.querySelector('[name="auth_reviewed_estimate"]'),
        document.querySelector('[name="auth_reviewed_scope"]'),
        document.querySelector('[name="auth_confirmed_cost"]'),
        document.querySelector('[name="auth_confirmed_schedule"]'),
        document.querySelector('[name="auth_acknowledged_terms"]'),
        document.querySelector('[name="auth_proceed"]')
    ];
    
    for (const checkbox of authCheckboxes) {
        if (!checkbox.checked) {
            checkbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            showToast('error', 'Please check all authorization items to proceed');
            return;
        }
    }
    
    // Validate signature
    if (!clientSignaturePad || clientSignaturePad.isEmpty()) {
        const signatureCanvas = document.getElementById('client-signature');
        signatureCanvas.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showToast('error', 'Client signature is required');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    try {
        const clientSignature = clientSignaturePad.toDataURL('image/png');
        
        const company = document.querySelector('[name="company"]').value || 'N/A';
        const clientPosition = document.querySelector('[name="client_position"]').value || 'N/A';
        
        // Create HTML email template
        const emailHTML = createEmailHTML({
            clientName: clientName.value,
            company: company,
            emailAddress: emailAddress.value,
            contactNumber: contactNumber.value,
            projectReference: projectReference.value,
            clientSigner: clientSigner.value,
            clientPosition: clientPosition,
            clientDate: clientDate.value,
            clientSignature: clientSignature
        });
        
        // Send email to company
        await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            {
                to_email: 'lf.digitalsolutions.official@gmail.com',
                to_name: 'L.F Digital Solutions',
                subject: `Project Authorization - ${clientName.value} - ${projectReference.value}`,
                html_message: emailHTML
            }
        );
        
        // Show success modal
        showSuccessModal();
        
    } catch (error) {
        console.error('Submission error:', error);
        showToast('error', 'Submission failed. Please try again or contact us at lf.digitalsolutions.official@gmail.com');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Authorization';
    }
}

function createEmailHTML(data) {
    return `
<!DOCTYPE html>
<html>
<head>
<style>
body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
.container { max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
.content { background-color: white; padding: 30px; border-radius: 8px; }
h1 { color: #1E3A8A; text-align: center; border-bottom: 3px solid #1E3A8A; padding-bottom: 15px; }
h2 { color: #1E3A8A; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px; margin-top: 30px; }
table { width: 100%; border-collapse: collapse; margin: 15px 0; }
td { padding: 8px; }
.authorization { background-color: #f0f7ff; border: 2px solid #1E3A8A; padding: 20px; border-radius: 8px; margin: 20px 0; }
.footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 13px; }
</style>
</head>
<body>
<div class="container">
<div class="content">

<h1>PROJECT COST SUMMARY & PAYMENT AUTHORIZATION</h1>
<p style="text-align: center; color: #666;">L.F DIGITAL SOLUTIONS</p>

<h2>CLIENT INFORMATION</h2>
<table>
<tr><td><strong>Client Name:</strong></td><td>${data.clientName}</td></tr>
<tr><td><strong>Company:</strong></td><td>${data.company}</td></tr>
<tr><td><strong>Email:</strong></td><td>${data.emailAddress}</td></tr>
<tr><td><strong>Contact Number:</strong></td><td>${data.contactNumber}</td></tr>
<tr><td><strong>Project Reference:</strong></td><td>${data.projectReference}</td></tr>
</table>

<h2>PROJECT AUTHORIZATION</h2>
<div class="authorization">
<p style="margin-bottom: 15px;"><strong>The Client has confirmed the following:</strong></p>
<p style="margin: 8px 0;">✓ Reviewed the approved Cost Estimate</p>
<p style="margin: 8px 0;">✓ Reviewed the project scope and deliverables</p>
<p style="margin: 8px 0;">✓ Confirmed the total project cost</p>
<p style="margin: 8px 0;">✓ Confirmed the payment schedule</p>
<p style="margin: 8px 0;">✓ Acknowledged the applicable terms and conditions</p>
<p style="margin: 8px 0;">✓ Authorized L.F Digital Solutions to proceed upon receipt of the required initial payment</p>
</div>

<h2>CLIENT SIGNATURE</h2>
<table>
<tr><td><strong>Name:</strong></td><td>${data.clientSigner}</td></tr>
<tr><td><strong>Position:</strong></td><td>${data.clientPosition}</td></tr>
<tr><td><strong>Date:</strong></td><td>${data.clientDate}</td></tr>
</table>
<p style="margin-top: 15px;"><img src="${data.clientSignature}" style="max-width: 300px; border: 1px solid #ddd; padding: 10px;" alt="Client Signature" /></p>

<div style="background: #fffbeb; border: 2px solid #fbbf24; padding: 20px; border-radius: 8px; margin-top: 30px;">
<p style="margin: 0; color: #92400e;"><strong>Next Steps:</strong> The client has authorized the project. Please confirm receipt of the initial payment to begin development.</p>
</div>

<div class="footer">
<p><strong>L.F DIGITAL SOLUTIONS</strong></p>
<p>San Antonio, Roxas ext., Digos City, Davao del Sur</p>
<p>Mobile: 0966 759 0644 / 0967 470 1338</p>
<p>Email: lf.digitalsolutions.official@gmail.com</p>
</div>

</div>
</div>
</body>
</html>
    `;
}

function showToast(type, message) {
    const container = document.getElementById('toast-container');
    
    // Remove any existing toasts of the same type
    const existingToasts = container.querySelectorAll(`.toast.${type}`);
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '✓' : '✕';
    const title = type === 'success' ? 'Success!' : 'Error';
    
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div>${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(toast);
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 5000);
}

function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.add('show');
}
