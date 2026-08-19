// Cost Estimate Handler with Multi-Page Navigation

let clientSignaturePad;
let totalCost = 0;
let selectedPackage = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    calculateTotal();
    setTodayDate();
});

function setupEventListeners() {
    // Listen to all service checkboxes
    document.querySelectorAll('.service-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', calculateTotal);
    });
    
    // Listen to package radio buttons
    document.querySelectorAll('.package-radio').forEach(radio => {
        radio.addEventListener('change', calculateTotal);
    });
    
    // Form submission
    const form = document.getElementById('cost-estimate-form');
    form.addEventListener('submit', handleSubmit);
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
    
    // Validate client signature only
    if (!clientSignaturePad || clientSignaturePad.isEmpty()) {
        showToast('error', 'Client signature is required');
        return;
    }
    
    // Validate required fields on page 3
    const clientName = document.querySelector('[name="client_name"]').value;
    const contactNumber = document.querySelector('[name="contact_number"]').value;
    const emailAddress = document.querySelector('[name="email_address"]').value;
    const clientSigner = document.querySelector('[name="client_signer"]').value;
    const clientDate = document.querySelector('[name="client_date"]').value;
    
    if (!clientName || !contactNumber || !emailAddress || !clientSigner || !clientDate) {
        showToast('error', 'Please fill in all required fields');
        return;
    }
    
    // Show loading
    const submitBtn = document.getElementById('submit-estimate');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    try {
        // Get client signature
        const clientSignature = clientSignaturePad.toDataURL('image/png');
        
        // Collect all form data
        const formData = new FormData(document.getElementById('cost-estimate-form'));
        
        // Add signature
        formData.append('client_signature', clientSignature);
        
        // Add selected services
        const services = getSelectedServices();
        formData.append('selected_services', JSON.stringify(services));
        formData.append('total_cost', totalCost);
        formData.append('selected_package', selectedPackage || 'None');
        
        // Web3Forms configuration
        formData.append('access_key', 'd8cf9868-4e3e-4f15-a360-baa51ebd245a');
        formData.append('subject', `Cost Estimate - ${clientName}`);
        formData.append('from_name', 'L.F Digital Solutions - Cost Estimate');
        
        // Create detailed message
        const message = createEmailMessage(formData, services);
        formData.append('message', message);
        
        // Send to client email
        formData.set('email', emailAddress);
        
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Send to company email
            await sendToCompanyEmail(formData, message, clientSignature);
            
            showToast('success', 'Cost estimate submitted successfully! Confirmation emails have been sent.');
            
            // Redirect to homepage after 3 seconds
            setTimeout(() => {
                window.location.href = '/';
            }, 3000);
        } else {
            throw new Error('Submission failed');
        }
        
    } catch (error) {
        console.error('Submission error:', error);
        showToast('error', 'Submission failed. Please try again or contact us at lf.digitalsolutions.official@gmail.com');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Cost Estimate';
    }
}

function getSelectedServices() {
    const services = [];
    
    // Get services from checkboxes
    document.querySelectorAll('.service-checkbox:checked').forEach(checkbox => {
        const row = checkbox.closest('tr');
        let serviceName = checkbox.name.replace(/_/g, ' ').replace('service ', '').replace('addon ', '').replace('maintenance ', '');
        
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

function getRequiredFeatures(formData) {
    const features = [];
    const featureFields = ['user_login', 'admin', 'user_mgmt', 'inventory', 'reports', 'booking', 'forms', 'gallery', 'contact', 'responsive', 'database'];
    featureFields.forEach(field => {
        if (formData.get(`feature_${field}`)) {
            features.push(field.replace(/_/g, ' '));
        }
    });
    const other = formData.get('feature_other_text');
    if (other) features.push(other);
    return features.join(', ') || 'Not specified';
}

function getPreferredStyle(formData) {
    const styles = [];
    const styleFields = ['minimalist', 'modern', 'professional', 'corporate', 'creative'];
    styleFields.forEach(field => {
        if (formData.get(`style_${field}`)) {
            styles.push(field);
        }
    });
    const other = formData.get('style_other_text');
    if (other) styles.push(other);
    return styles.join(', ') || 'Not specified';
}

async function sendToCompanyEmail(formData, message, clientSignature) {
    const companyFormData = new FormData();
    
    companyFormData.append('access_key', 'd8cf9868-4e3e-4f15-a360-baa51ebd245a');
    companyFormData.append('subject', `[COMPANY COPY] Cost Estimate - ${formData.get('client_name')}`);
    companyFormData.append('from_name', 'L.F Digital Solutions - Cost Estimate');
    companyFormData.append('email', 'lf.digitalsolutions.official@gmail.com');
    companyFormData.append('message', message);
    companyFormData.append('client_signature', clientSignature);
    
    await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: companyFormData
    });
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
