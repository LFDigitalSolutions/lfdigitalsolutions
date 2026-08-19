// Cost Estimate Form Handler

class CostEstimateForm {
  constructor() {
    this.form = document.getElementById('cost-estimate-form');
    this.canvas = document.getElementById('signature-canvas');
    this.signaturePad = null;
    this.totalAmount = 0;
    
    this.init();
  }
  
  init() {
    // Generate document number
    this.generateDocNumber();
    
    // Initialize signature pad
    this.initSignaturePad();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initial cost calculation
    this.calculateTotal();
  }
  
  generateDocNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    const docNumber = `${year}${month}${day}${random}`;
    
    document.getElementById('doc-number').textContent = docNumber;
  }
  
  initSignaturePad() {
    // Set canvas size
    const container = this.canvas.parentElement;
    this.canvas.width = container.offsetWidth;
    this.canvas.height = container.offsetHeight;
    
    // Initialize signature pad
    this.signaturePad = new SignaturePad(this.canvas, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(30, 58, 138)'
    });
    
    // Clear button
    document.getElementById('clear-signature').addEventListener('click', () => {
      this.signaturePad.clear();
    });
    
    // Resize handler
    window.addEventListener('resize', () => {
      const data = this.signaturePad.toData();
      const container = this.canvas.parentElement;
      this.canvas.width = container.offsetWidth;
      this.canvas.height = container.offsetHeight;
      this.signaturePad.fromData(data);
    });
  }
  
  setupEventListeners() {
    // Listen to all checkboxes for cost calculation
    const checkboxes = document.querySelectorAll('.service-checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => this.calculateTotal());
    });
    
    // Form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }
  
  calculateTotal() {
    let total = 0;
    
    // Get all checked service checkboxes
    const checkboxes = document.querySelectorAll('.service-checkbox:checked');
    checkboxes.forEach(checkbox => {
      const price = parseFloat(checkbox.getAttribute('data-price')) || 0;
      total += price;
    });
    
    this.totalAmount = total;
    
    // Update display
    document.getElementById('subtotal-amount').textContent = `₱${this.formatNumber(total)}`;
    document.getElementById('total-amount').textContent = `₱${this.formatNumber(total)}`;
  }
  
  formatNumber(num) {
    return num.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  
  async handleSubmit(e) {
    e.preventDefault();
    
    // Validate signature
    if (this.signaturePad.isEmpty()) {
      this.showToast('error', 'Please provide your signature before submitting');
      return;
    }
    
    // Check if at least one service is selected
    const selectedServices = document.querySelectorAll('.service-checkbox:checked');
    if (selectedServices.length === 0) {
      this.showToast('error', 'Please select at least one service or package');
      return;
    }
    
    // Show loading state
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    
    try {
      // Get signature as data URL
      const signatureDataURL = this.signaturePad.toDataURL('image/png');
      
      // Collect form data
      const formData = new FormData(this.form);
      
      // Add signature
      formData.append('signature', signatureDataURL);
      
      // Add selected services list
      const services = this.getSelectedServices();
      formData.append('selected_services', JSON.stringify(services));
      
      // Add total cost
      formData.append('total_cost', this.totalAmount);
      
      // Add document number
      formData.append('document_number', document.getElementById('doc-number').textContent);
      
      // Web3Forms configuration
      formData.append('access_key', 'd8cf9868-4e3e-4f15-a360-baa51ebd245a');
      formData.append('subject', `Cost Estimate Request - ${formData.get('client_name')}`);
      formData.append('from_name', 'L.F Digital Solutions Cost Estimate');
      
      // Email to client (their email from form)
      formData.append('email', formData.get('email'));
      
      // Send to Web3Forms
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Success - now send to company email
        await this.sendToCompanyEmail(formData, signatureDataURL, services);
        
        this.showToast('success', 'Your cost estimate request has been submitted successfully! We\'ll contact you soon.');
        
        // Clear form after 3 seconds
        setTimeout(() => {
          this.form.reset();
          this.signaturePad.clear();
          this.calculateTotal();
        }, 3000);
      } else {
        throw new Error('Submission failed');
      }
      
    } catch (error) {
      console.error('Submission error:', error);
      this.showToast('error', 'Something went wrong. Please try again or contact us at lf.digitalsolutions.official@gmail.com');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Cost Estimate Request';
    }
  }
  
  async sendToCompanyEmail(formData, signature, services) {
    // Create a new FormData for company email
    const companyFormData = new FormData();
    
    // Add all original form fields
    for (let [key, value] of formData.entries()) {
      companyFormData.append(key, value);
    }
    
    // Override email to company email
    companyFormData.set('email', 'lf.digitalsolutions.official@gmail.com');
    companyFormData.set('subject', `[COMPANY COPY] Cost Estimate - ${formData.get('client_name')}`);
    
    // Create detailed message
    const detailedMessage = this.formatEmailMessage(formData, services);
    companyFormData.append('message', detailedMessage);
    
    // Send to Web3Forms
    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: companyFormData
      });
    } catch (error) {
      console.error('Company email send error:', error);
    }
  }
  
  formatEmailMessage(formData, services) {
    let message = `
===========================================
COST ESTIMATE REQUEST
Document No: LFDS-CE-2026-${document.getElementById('doc-number').textContent}
===========================================

CLIENT INFORMATION:
-------------------
Name: ${formData.get('client_name')}
Company: ${formData.get('company') || 'N/A'}
Email: ${formData.get('email')}
Phone: ${formData.get('phone')}
Project Name: ${formData.get('project_name') || 'N/A'}
Project Type: ${formData.get('project_type') || 'N/A'}

SELECTED SERVICES:
------------------
${services.map(s => `• ${s.name} - ₱${this.formatNumber(s.price)}`).join('\n')}

ESTIMATED COST:
---------------
Total: ₱${this.formatNumber(this.totalAmount)}

PROJECT DETAILS:
----------------
Timeline: ${formData.get('timeline') || 'Not specified'}
Additional Requirements: ${formData.get('requirements') || 'None provided'}

TARGET AUDIENCE:
----------------
${this.getCheckedValues('audience_').join(', ') || 'Not specified'}

DESIGN PREFERENCES:
-------------------
${this.getCheckedValues('design_').join(', ') || 'Not specified'}

===========================================
NOTE: Signature is included as attachment
===========================================
    `;
    
    return message;
  }
  
  getSelectedServices() {
    const services = [];
    const checkboxes = document.querySelectorAll('.service-checkbox:checked');
    
    checkboxes.forEach(checkbox => {
      const price = parseFloat(checkbox.getAttribute('data-price')) || 0;
      const name = this.getServiceName(checkbox);
      
      services.push({
        name: name,
        price: price
      });
    });
    
    return services;
  }
  
  getServiceName(checkbox) {
    // Try to get from table row
    const row = checkbox.closest('tr');
    if (row) {
      const nameCell = row.querySelector('.service-name');
      if (nameCell) return nameCell.textContent.trim();
    }
    
    // Try to get from package card
    const packageCard = checkbox.closest('.package-card');
    if (packageCard) {
      const packageName = packageCard.querySelector('.package-name');
      if (packageName) return packageName.textContent.trim();
    }
    
    // Try to get from checkbox item
    const checkboxItem = checkbox.closest('.checkbox-item');
    if (checkboxItem) {
      const label = checkboxItem.querySelector('label');
      if (label) {
        // Extract just the service name, remove price
        return label.textContent.split(' - ₱')[0].trim();
      }
    }
    
    // Fallback to checkbox name
    return checkbox.name.replace(/_/g, ' ').replace('service ', '').replace('pkg ', '').replace('addon ', '').replace('maintenance ', '');
  }
  
  getCheckedValues(prefix) {
    const values = [];
    const checkboxes = document.querySelectorAll(`input[name^="${prefix}"]:checked`);
    
    checkboxes.forEach(checkbox => {
      const label = checkbox.nextElementSibling || checkbox.closest('label');
      if (label) {
        values.push(label.textContent.trim());
      }
    });
    
    return values;
  }
  
  showToast(type, message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
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
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 5000);
  }
}

// Package card toggle helper
function togglePackage(packageId) {
  const checkbox = document.getElementById(packageId);
  if (checkbox) {
    checkbox.checked = !checkbox.checked;
    checkbox.dispatchEvent(new Event('change'));
    
    // Update card visual state
    const card = checkbox.closest('.package-card');
    if (card) {
      if (checkbox.checked) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new CostEstimateForm();
  });
} else {
  new CostEstimateForm();
}
