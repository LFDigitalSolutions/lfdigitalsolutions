// Cost Estimate Handler with Multi-Page Navigation

let clientSignaturePad;
let totalCost = 0;
let selectedPackage = null;

// EmailJS Configuration
const EMAILJS_PUBLIC_KEY = 'zUcdRXHwMWrRjcu9H';
const EMAILJS_SERVICE_ID = 'service_7bnhcpn';
const EMAILJS_TEMPLATE_ID = 'template_dnwnyhg';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize EmailJS
    emailjs.init(EMAILJS_PUBLIC_KEY);
    
    setupEventListeners();
    calculateTotal();
    setTodayDate();
    initBackgroundVideo();
});

function initBackgroundVideo() {
    const video = document.getElementById('bg-video');
    if (video) {
        video.play().catch(error => {
            console.log('Video autoplay prevented:', error);
            // Fallback: try playing on user interaction
            document.addEventListener('click', () => {
                video.play();
            }, { once: true });
        });
    }
}

function setupEventListeners() {
    // Listen to all service checkboxes
    document.querySelectorAll('.service-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', calculateTotal);
    });
    
    // Listen to package radio buttons
    document.querySelectorAll('.package-radio').forEach(radio => {
        radio.addEventListener('change', calculateTotal);
    });
    
    // Form submission - use both addEventListener and check for form element
    const form = document.getElementById('cost-estimate-form');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
    
    // Also add click handler to submit button directly as backup
    const submitBtn = document.getElementById('submit-estimate');
    if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            // Only handle if form submit didn't trigger
            if (e.target.type === 'submit') {
                return; // Let form handle it
            }
            handleSubmit(e);
        });
    }
}

function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.value) {
            input.value = today;
        }
    });
}

function selectPackage(packageId) {
    const radio = document.getElementById(packageId);
    if (!radio) return;
    
    // If clicking the already-selected package, deselect it
    if (radio.checked) {
        radio.checked = false;
        selectedPackage = null;
        
        // Remove visual state from all cards
        document.querySelectorAll('.package-card').forEach(card => {
            card.classList.remove('selected');
        });
    } else {
        // Select the new package
        radio.checked = true;
        selectedPackage = radio.value;
        
        // Update card visual state
        document.querySelectorAll('.package-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        const card = radio.closest('.package-card');
        if (card) {
            card.classList.add('selected');
        }
    }
    
    // Recalculate total
    calculateTotal();
}

function calculateTotal() {
    let total = 0;
    
    // Calculate from checkboxes (EXCEPT maintenance plans)
    const checkboxes = document.querySelectorAll('.service-checkbox:checked');
    checkboxes.forEach(checkbox => {
        // Skip maintenance plan checkboxes (they have names starting with "maintenance_")
        if (checkbox.name && checkbox.name.startsWith('maintenance_')) {
            return; // Skip this checkbox
        }
        
        const price = parseFloat(checkbox.getAttribute('data-price')) || 0;
        total += price;
    });
    
    // Calculate from package (radio buttons)
    const selectedRadio = document.querySelector('.package-radio:checked');
    if (selectedRadio) {
        const price = parseFloat(selectedRadio.getAttribute('data-price')) || 0;
        total += price;
        selectedPackage = selectedRadio.value;
    }
    
    totalCost = total;
    
    // Update all displays
    document.getElementById('subtotal-amount').textContent = `₱${formatNumber(total)}`;
    document.getElementById('total-amount').textContent = `₱${formatNumber(total)}`;
    
    // Update page 3 displays if they exist
    const finalSubtotal = document.getElementById('final-subtotal');
    const finalTotal = document.getElementById('final-total');
    const selectedPackageDisplay = document.getElementById('selected-package-display');
    const estimatedBudgetDisplay = document.getElementById('estimated-budget-display');
    
    if (finalSubtotal) finalSubtotal.textContent = `₱${formatNumber(total)}`;
    if (finalTotal) finalTotal.textContent = `₱${formatNumber(total)}`;
    if (selectedPackageDisplay) selectedPackageDisplay.value = selectedPackage || 'None selected';
    if (estimatedBudgetDisplay) estimatedBudgetDisplay.value = `₱${formatNumber(total)}`;
    
    // Auto-determine project category
    autoDetermineCategory();
}

function autoDetermineCategory() {
    // Get checkboxes
    const categoryBusiness = document.getElementById('category_business');
    const categoryPortfolio = document.getElementById('category_portfolio');
    const categoryCustom = document.getElementById('category_custom');
    const categoryOther = document.getElementById('category_other');
    const categoryOtherList = document.getElementById('category_other_list');
    
    // If these elements don't exist yet (page 3 not loaded), return
    if (!categoryBusiness) return;
    
    // Reset all
    categoryBusiness.checked = false;
    categoryPortfolio.checked = false;
    categoryCustom.checked = false;
    categoryOther.checked = false;
    if (categoryOtherList) categoryOtherList.textContent = '';
    
    // Check what's selected
    const selectedRadio = document.querySelector('.package-radio:checked');
    const servicesSelected = document.querySelectorAll('input[name^="service_"]:checked');
    const addonsSelected = document.querySelectorAll('input[name^="addon_"]:checked');
    
    const hasPackage = selectedRadio !== null;
    const hasServices = servicesSelected.length > 0;
    const hasAddons = addonsSelected.length > 0;
    
    // Priority Logic:
    
    // 1. If they selected from multiple tables (Package + Services, or Package + Add-ons, or all three) → Custom System
    if ((hasPackage && hasServices) || (hasPackage && hasAddons) || (hasServices && hasAddons)) {
        categoryCustom.checked = true;
        return;
    }
    
    // 2. If ONLY a package is selected
    if (hasPackage && !hasServices && !hasAddons) {
        const packageValue = selectedRadio.value;
        
        // Starter Package → Portfolio
        if (packageValue === 'Starter') {
            categoryPortfolio.checked = true;
        }
        // Business packages → Business Website
        else if (['Basic Business', 'Professional', 'Business Pro', 'Enterprise', 'Agricultural Management System'].includes(packageValue)) {
            categoryBusiness.checked = true;
        }
        return;
    }
    
    // 3. If ONLY services from Table 1 are selected → Custom System
    if (hasServices && !hasPackage && !hasAddons) {
        categoryCustom.checked = true;
        return;
    }
    
    // 4. If ONLY add-ons from Table 3 are selected → Other (with list)
    if (hasAddons && !hasPackage && !hasServices) {
        categoryOther.checked = true;
        
        // Get add-on names and display as comma-separated list
        const addonNames = [];
        addonsSelected.forEach(addon => {
            const row = addon.closest('tr');
            if (row) {
                const addonName = row.querySelectorAll('td')[1]?.textContent.trim();
                if (addonName) {
                    addonNames.push(addonName);
                }
            }
        });
        
        if (categoryOtherList && addonNames.length > 0) {
            categoryOtherList.textContent = addonNames.join(', ');
        }
        return;
    }
}

function formatNumber(num) {
    return num.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function goToPage2() {
    // Validate that at least ONE item is selected from Page 1 tables
    const hasPackage = document.querySelector('.package-radio:checked') !== null;
    const hasServices = document.querySelectorAll('input[name^="service_"]:checked').length > 0;
    const hasAddons = document.querySelectorAll('input[name^="addon_"]:checked').length > 0;
    
    if (!hasPackage && !hasServices && !hasAddons) {
        showToast('error', 'Please select at least one service, package, or add-on before continuing.');
        return;
    }
    
    // Hide page 1, show page 2
    document.getElementById('cost-estimate-form').style.display = 'none';
    document.getElementById('page-2').style.display = 'block';
    window.scrollTo(0, 0);
}

function goBackToPage1() {
    // Show page 1, hide page 2
    document.getElementById('cost-estimate-form').style.display = 'block';
    document.getElementById('page-2').style.display = 'none';
    window.scrollTo(0, 0);
}

function goToPage3() {
    // Hide page 2, show page 3
    document.getElementById('page-2').style.display = 'none';
    document.getElementById('page-3').style.display = 'block';
    window.scrollTo(0, 0);
    
    // Initialize signature pads
    initSignaturePads();
    
    // Update final displays
    calculateTotal();
}

function goBackToPage2() {
    // Show page 2, hide page 3
    document.getElementById('page-2').style.display = 'block';
    document.getElementById('page-3').style.display = 'none';
    window.scrollTo(0, 0);
}

function initSignaturePads() {
    // Client signature pad only
    const clientCanvas = document.getElementById('client-signature');
    if (clientCanvas && !clientSignaturePad) {
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

async function handleSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const submitBtn = document.getElementById('submit-estimate');
    if (submitBtn.disabled) return;
    
    if (!clientSignaturePad || clientSignaturePad.isEmpty()) {
        showToast('error', 'Client signature is required');
        return;
    }
    
    const clientName = document.querySelector('[name="client_name"]').value;
    const contactNumber = document.querySelector('[name="contact_number"]').value;
    const emailAddress = document.querySelector('[name="email_address"]').value;
    const clientSigner = document.querySelector('[name="client_signer"]').value;
    const clientDate = document.querySelector('[name="client_date"]').value;
    
    if (!clientName || !contactNumber || !emailAddress || !clientSigner || !clientDate) {
        showToast('error', 'Please fill in all required fields');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    try {
        const clientSignature = clientSignaturePad.toDataURL('image/png');
        
        const company = document.querySelector('[name="company"]').value || 'N/A';
        const projectTitle = document.querySelector('[name="project_title_details"]').value || 'N/A';
        const preferredDate = document.querySelector('[name="preferred_completion_date"]').value || 'Not specified';
        const projectDescription = document.querySelector('[name="project_description"]').value || 'Not provided';
        const preferredColors = document.querySelector('[name="preferred_colors"]').value || 'Not specified';
        const referenceWebsites = document.querySelector('[name="reference_websites"]').value || 'None provided';
        const additionalNotes = document.querySelector('[name="additional_notes"]').value || 'None';
        const clientPosition = document.querySelector('[name="client_position"]').value || 'N/A';
        const clientCompany = document.querySelector('[name="client_company_sig"]').value || 'N/A';
        
        const services = getSelectedServices();
        const servicesHTML = services.map(s => `<tr><td style="padding: 8px;">${s.name}</td><td style="padding: 8px; text-align: right;">₱${formatNumber(s.price)}</td></tr>`).join('');
        
        const projectCategory = getProjectCategoryText();
        const requiredFeatures = getRequiredFeaturesText();
        const preferredStyle = getPreferredStyleText();
        
        // Create HTML email template IN CODE
        const emailHTML = createEmailHTML({
            clientName, company, contactNumber, emailAddress, projectTitle, projectCategory,
            selectedPackage: selectedPackage || 'None', servicesHTML, totalCost,
            preferredDate, projectDescription, requiredFeatures, preferredColors,
            preferredStyle, referenceWebsites, additionalNotes, clientSigner,
            clientPosition, clientCompany, clientDate, clientSignature
        });
        
        // Send ONLY to COMPANY (you will manually send final quotation to client)
        await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            {
                to_email: 'lf.digitalsolutions.official@gmail.com',
                subject: `New Cost Estimate Request - ${clientName}`,
                html_message: emailHTML,
                message: emailHTML,
                client_name: clientName,
                client_email: emailAddress,
                client_phone: contactNumber,
                company: company,
                total_cost: formatNumber(totalCost)
            }
        );
        
        // Show success modal instead of toast
        showSuccessModal();
        
    } catch (error) {
        console.error('Submission error:', error);
        showToast('error', 'Submission failed. Please try again or contact us at lf.digitalsolutions.official@gmail.com');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Quotation';
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
.services-table { background-color: #f9f9f9; }
.services-table td { border-bottom: 1px solid #e0e0e0; }
.total { font-size: 18px; font-weight: bold; color: #1E3A8A; text-align: right; margin-top: 15px; }
.note { background-color: #fffbeb; border: 2px solid #fbbf24; padding: 20px; border-radius: 8px; margin-top: 30px; }
.footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 13px; }
</style>
</head>
<body>
<div class="container">
<div class="content">

<h1>WEB DEVELOPMENT SERVICE COST ESTIMATE</h1>
<p style="text-align: center; color: #666;">L.F DIGITAL SOLUTIONS</p>

<h2>CLIENT INFORMATION</h2>
<table>
<tr><td><strong>Client Name:</strong></td><td>${data.clientName}</td></tr>
<tr><td><strong>Company:</strong></td><td>${data.company}</td></tr>
<tr><td><strong>Contact Number:</strong></td><td>${data.contactNumber}</td></tr>
<tr><td><strong>Email:</strong></td><td>${data.emailAddress}</td></tr>
<tr><td><strong>Project Category:</strong></td><td>${data.projectCategory}</td></tr>
</table>

<h2>SELECTED SERVICES & PRICING</h2>
<p><strong>Selected Package:</strong> ${data.selectedPackage}</p>
<table class="services-table">
${data.servicesHTML}
</table>
<div class="total">TOTAL ESTIMATED COST: ₱${formatNumber(data.totalCost)}</div>

<h2>PROJECT DETAILS</h2>
<p><strong>Project Title:</strong> ${data.projectTitle}</p>
<p><strong>Preferred Completion Date:</strong> ${data.preferredDate}</p>
<p><strong>Project Description:</strong></p>
<p style="background-color: #f9f9f9; padding: 15px;">${data.projectDescription}</p>
<p><strong>Required Features:</strong> ${data.requiredFeatures}</p>
<p><strong>Preferred Colors:</strong> ${data.preferredColors}</p>
<p><strong>Preferred Style:</strong> ${data.preferredStyle}</p>
<p><strong>Reference Websites:</strong> ${data.referenceWebsites}</p>
<p><strong>Additional Notes:</strong> ${data.additionalNotes}</p>

<h2>CLIENT SIGNATURE</h2>
<table>
<tr><td><strong>Name:</strong></td><td>${data.clientSigner}</td></tr>
<tr><td><strong>Position:</strong></td><td>${data.clientPosition}</td></tr>
<tr><td><strong>Company:</strong></td><td>${data.clientCompany}</td></tr>
<tr><td><strong>Date:</strong></td><td>${data.clientDate}</td></tr>
</table>
<p style="margin-top: 15px;"><img src="${data.clientSignature}" style="max-width: 300px; border: 1px solid #ddd; padding: 10px;" alt="Client Signature" /></p>

<div class="note">
<p style="margin: 0; color: #92400e;"><strong>Note:</strong> This is a preliminary cost estimate. Final pricing will be confirmed after detailed project discussion and approval.</p>
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

function getSelectedServices() {
    const services = [];
    
    // Get services from checkboxes (excluding maintenance)
    document.querySelectorAll('.service-checkbox:checked').forEach(checkbox => {
        // Skip maintenance checkboxes
        if (checkbox.name && checkbox.name.startsWith('maintenance_')) {
            return;
        }
        
        const row = checkbox.closest('tr');
        let serviceName = checkbox.name.replace(/_/g, ' ').replace('service ', '').replace('addon ', '');
        
        if (row) {
            const cells = row.querySelectorAll('td');
            if (cells[1]) {
                serviceName = cells[1].textContent.trim();
            }
        }
        
        const price = parseFloat(checkbox.getAttribute('data-price')) || 0;
        services.push({ name: serviceName, price: price });
    });
    
    // Get selected package
    const selectedRadio = document.querySelector('.package-radio:checked');
    if (selectedRadio) {
        const price = parseFloat(selectedRadio.getAttribute('data-price')) || 0;
        services.push({ name: `Package: ${selectedRadio.value}`, price: price });
    }
    
    return services;
}

function createEmailMessage(formData, services) {
    let servicesText = services.map(s => `  • ${s.name} - ₱${formatNumber(s.price)}`).join('\n');
    
    return `
═══════════════════════════════════════════════════════════
WEB DEVELOPMENT SERVICE COST ESTIMATE
L.F DIGITAL SOLUTIONS
═══════════════════════════════════════════════════════════

───────────────────────────────────────────────────────────
CLIENT INFORMATION
───────────────────────────────────────────────────────────
Client Name: ${formData.get('client_name')}
Company: ${formData.get('company') || 'N/A'}
Contact Number: ${formData.get('contact_number')}
Email Address: ${formData.get('email_address')}
Project Category: ${getProjectCategory(formData)}

───────────────────────────────────────────────────────────
SELECTED SERVICES & PRICING
───────────────────────────────────────────────────────────

${servicesText}

TOTAL ESTIMATED COST: ₱${formatNumber(totalCost)}

───────────────────────────────────────────────────────────
PROJECT DETAILS
───────────────────────────────────────────────────────────

Selected Package: ${selectedPackage || 'None'}
Preferred Completion Date: ${formData.get('preferred_completion_date') || 'Not specified'}

Project Description:
${formData.get('project_description') || 'Not provided'}

Required Features: ${getRequiredFeatures(formData)}

Design Preferences:
  Preferred Colors: ${formData.get('preferred_colors') || 'Not specified'}
  Preferred Style: ${getPreferredStyle(formData)}
  Reference Websites: ${formData.get('reference_websites') || 'None provided'}

Additional Notes:
${formData.get('additional_notes') || 'None'}

───────────────────────────────────────────────────────────
CLIENT SIGNATURE
───────────────────────────────────────────────────────────

CLIENT:
  Name: ${formData.get('client_signer')}
  Position: ${formData.get('client_position') || 'N/A'}
  Company: ${formData.get('client_company_sig') || 'N/A'}
  Date: ${formData.get('client_date')}

Client signature is attached as an image.

═══════════════════════════════════════════════════════════

This is a preliminary cost estimate. Final pricing will be 
confirmed after detailed project discussion and approval.

Thank you for considering L.F Digital Solutions!
    `;
}

function getProjectCategory(formData) {
    const categories = [];
    if (document.getElementById('category_business')?.checked) categories.push('Business Website');
    if (document.getElementById('category_portfolio')?.checked) categories.push('Portfolio');
    if (document.getElementById('category_custom')?.checked) categories.push('Custom System');
    if (document.getElementById('category_other')?.checked) {
        const otherList = document.getElementById('category_other_list')?.textContent;
        if (otherList) {
            categories.push(`Other: ${otherList}`);
        } else {
            categories.push('Other');
        }
    }
    return categories.join(', ') || 'Not specified';
}

function getProjectCategoryText() {
    const categories = [];
    if (document.getElementById('category_business')?.checked) categories.push('Business Website');
    if (document.getElementById('category_portfolio')?.checked) categories.push('Portfolio');
    if (document.getElementById('category_custom')?.checked) categories.push('Custom System');
    if (document.getElementById('category_other')?.checked) {
        const otherList = document.getElementById('category_other_list')?.textContent;
        if (otherList) {
            categories.push(`Other: ${otherList}`);
        } else {
            categories.push('Other');
        }
    }
    return categories.join(', ') || 'Not specified';
}

function getRequiredFeaturesText() {
    const features = [];
    const featureFields = ['user_login', 'admin', 'user_mgmt', 'inventory', 'reports', 'booking', 'forms', 'gallery', 'contact', 'responsive', 'database'];
    featureFields.forEach(field => {
        const checkbox = document.querySelector(`[name="feature_${field}"]`);
        if (checkbox && checkbox.checked) {
            features.push(field.replace(/_/g, ' '));
        }
    });
    const otherCheckbox = document.querySelector('[name="feature_other"]');
    const otherText = document.querySelector('[name="feature_other_text"]');
    if (otherCheckbox && otherCheckbox.checked && otherText && otherText.value) {
        features.push(otherText.value);
    }
    return features.join(', ') || 'Not specified';
}

function getPreferredStyleText() {
    const styles = [];
    const styleFields = ['minimalist', 'modern', 'professional', 'corporate', 'creative'];
    styleFields.forEach(field => {
        const checkbox = document.querySelector(`[name="style_${field}"]`);
        if (checkbox && checkbox.checked) {
            styles.push(field);
        }
    });
    const otherCheckbox = document.querySelector('[name="style_other"]');
    const otherText = document.querySelector('[name="style_other_text"]');
    if (otherCheckbox && otherCheckbox.checked && otherText && otherText.value) {
        styles.push(otherText.value);
    }
    return styles.join(', ') || 'Not specified';
}

function createEmailMessageFromObject(data, signatureDataURL) {
    let servicesText = data.services.map(s => `  • ${s.name} - ₱${formatNumber(s.price)}`).join('\n');
    
    // Extract just a portion of the signature for reference (not the full base64)
    const signaturePreview = signatureDataURL.substring(0, 100) + '... (signature data truncated for email)';
    
    return `
═══════════════════════════════════════════════════════════
WEB DEVELOPMENT SERVICE COST ESTIMATE
L.F DIGITAL SOLUTIONS
═══════════════════════════════════════════════════════════

───────────────────────────────────────────────────────────
CLIENT INFORMATION
───────────────────────────────────────────────────────────
Client Name: ${data.client_name}
Company: ${data.company || 'N/A'}
Contact Number: ${data.contact_number}
Email Address: ${data.email_address}
Project Title: ${data.project_title || 'N/A'}
Project Category: ${data.project_category}

───────────────────────────────────────────────────────────
SELECTED SERVICES & PRICING
───────────────────────────────────────────────────────────

${servicesText}

TOTAL ESTIMATED COST: ₱${formatNumber(data.total_cost)}

───────────────────────────────────────────────────────────
PROJECT DETAILS
───────────────────────────────────────────────────────────

Selected Package: ${data.selected_package}
Preferred Completion Date: ${data.preferred_completion_date || 'Not specified'}

Project Description:
${data.project_description || 'Not provided'}

Required Features: ${data.required_features}

Design Preferences:
  Preferred Colors: ${data.preferred_colors || 'Not specified'}
  Preferred Style: ${data.preferred_style}
  Reference Websites: ${data.reference_websites || 'None provided'}

Additional Notes:
${data.additional_notes || 'None'}

───────────────────────────────────────────────────────────
CLIENT SIGNATURE
───────────────────────────────────────────────────────────

CLIENT:
  Name: ${data.client_signer}
  Position: ${data.client_position || 'N/A'}
  Company: ${data.client_company_sig || 'N/A'}
  Date: ${data.client_date}

Note: Digital signature was provided by the client.
Signature data: ${signaturePreview}

═══════════════════════════════════════════════════════════

This is a preliminary cost estimate. Final pricing will be 
confirmed after detailed project discussion and approval.

Thank you for considering L.F Digital Solutions!
    `;
}



function showToast(type, message) {
    const container = document.getElementById('toast-container');
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
    
    // No auto-redirect - user clicks button to go back
}
