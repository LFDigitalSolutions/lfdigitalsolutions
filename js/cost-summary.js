// Cost Summary Handler

class CostSummary {
  constructor() {
    this.data = null;
    this.companySignaturePad = null;
    this.clientSignaturePad = null;
    this.subtotal = 0;
    this.discount = 0;
    this.finalTotal = 0;
    
    this.init();
  }
  
  init() {
    // Load data from sessionStorage
    this.loadData();
    
    // Generate document number and date
    this.generateDocInfo();
    
    // Initialize signature pads
    this.initSignaturePads();
    
    // Setup discount calculation
    this.setupDiscountCalculation();
    
    // Setup form submission
    this.setupSubmission();
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('company-date').value = today;
    document.getElementById('client-date').value = today;
  }
  
  loadData() {
    const savedData = sessionStorage.getItem('costEstimateData');
    
    if (!savedData) {
      alert('No cost estimate data found. Redirecting to cost estimate page...');
      window.location.href = 'cost-estimate.html';
      return;
    }
    
    this.data = JSON.parse(savedData);
    this.populateClientInfo();
    this.populateServices();
    this.calculateTotals();
  }
  
  generateDocInfo() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    const docNumber = `${year}${month}${day}${random}`;
    
    document.getElementById('doc-number').textContent = docNumber;
    
    const dateIssued = now.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    document.getElementById('date-issued').textContent = dateIssued;
  }
  
  populateClientInfo() {
    document.getElementById('client-name').textContent = this.data.client_name || '-';
    document.getElementById('company').textContent = this.data.company || 'N/A';
    document.getElementById('project-name').textContent = this.data.project_name || 'N/A';
    document.getElementById('project-type').textContent = this.data.project_type || 'N/A';
    document.getElementById('phone').textContent = this.data.phone || '-';
    document.getElementById('email').textContent = this.data.email || '-';
    
    // Pre-fill client signature name
    document.getElementById('client-signer-name').value = this.data.client_name || '';
  }
  
  populateServices() {
    const tbody = document.getElementById('services-breakdown');
    tbody.innerHTML = '';
    
    if (this.data.services && this.data.services.length > 0) {
      this.data.services.forEach(service => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${service.name}</td>
          <td style="text-align: right;">₱${this.formatNumber(service.price)}</td>
        `;
        tbody.appendChild(row);
      });
    }
  }
  
  calculateTotals() {
    this.subtotal = this.data.total_cost || 0;
    this.discount = 0;
    this.updateDisplay();
  }
  
  setupDiscountCalculation() {
    const discountInput = document.getElementById('discount-amount');
    
    discountInput.addEventListener('input', () => {
      this.discount = parseFloat(discountInput.value) || 0;
      this.updateDisplay();
    });
  }
  
  updateDisplay() {
    this.finalTotal = Math.max(0, this.subtotal - this.discount);
    
    document.getElementById('subtotal-display').textContent = `₱${this.formatNumber(this.subtotal)}`;
    document.getElementById('discount-display').textContent = this.formatNumber(this.discount);
    document.getElementById('total-display').textContent = `₱${this.formatNumber(this.finalTotal)}`;
    document.getElementById('total-amount-large').textContent = `₱${this.formatNumber(this.finalTotal)}`;
    
    // Update amount in words
    document.getElementById('amount-words').textContent = this.numberToWords(this.finalTotal);
    
    // Update payment schedule
    const payment50 = Math.round(this.finalTotal * 0.5);
    const payment30 = Math.round(this.finalTotal * 0.3);
    const payment20 = this.finalTotal - payment50 - payment30; // Remainder to avoid rounding errors
    
    document.getElementById('payment-50').textContent = `₱${this.formatNumber(payment50)}`;
    document.getElementById('payment-30').textContent = `₱${this.formatNumber(payment30)}`;
    document.getElementById('payment-20').textContent = `₱${this.formatNumber(payment20)}`;
    document.getElementById('payment-total').textContent = `₱${this.formatNumber(this.finalTotal)}`;
  }
  
  formatNumber(num) {
    return num.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  
  numberToWords(num) {
    if (num === 0) return 'Zero Pesos';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    const convert = (n) => {
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
      if (n < 1000000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
      return convert(Math.floor(n / 1000000)) + ' Million' + (n % 1000000 ? ' ' + convert(n % 1000000) : '');
    };
    
    return convert(num) + ' Pesos';
  }
  
  initSignaturePads() {
    // Company signature pad
    const companyCanvas = document.getElementById('company-signature-canvas');
    const companyContainer = companyCanvas.parentElement;
    companyCanvas.width = companyContainer.offsetWidth;
    companyCanvas.height = companyContainer.offsetHeight;
    
    this.companySignaturePad = new SignaturePad(companyCanvas, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(30, 58, 138)'
    });
    
    // Client signature pad
    const clientCanvas = document.getElementById('client-signature-canvas');
    const clientContainer = clientCanvas.parentElement;
    clientCanvas.width = clientContainer.offsetWidth;
    clientCanvas.height = clientContainer.offsetHeight;
    
    this.clientSignaturePad = new SignaturePad(clientCanvas, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(30, 58, 138)'
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
      const companyData = this.companySignaturePad.toData();
      companyCanvas.width = companyContainer.offsetWidth;
      companyCanvas.height = companyContainer.offsetHeight;
      this.companySignaturePad.fromData(companyData);
      
      const clientData = this.clientSignaturePad.toData();
      clientCanvas.width = clientContainer.offsetWidth;
      clientCanvas.height = clientContainer.offsetHeight;
      this.clientSignaturePad.fromData(clientData);
    });
  }
  
  setupSubmission() {
    const submitBtn = document.getElementById('submit-btn');
    
    submitBtn.addEventListener('click', async () => {
      // Validate authorization checkboxes
      const authCheckboxes = document.querySelectorAll('.authorization-item input[type="checkbox"]');
      let allChecked = true;
      
      authCheckboxes.forEach(checkbox => {
        if (!checkbox.checked) {
          allChecked = false;
        }
      });
      
      if (!allChecked) {
        this.showToast('error', 'Please check all authorization items to proceed');
        return;
      }
      
      // Validate signatures
      if (this.companySignaturePad.isEmpty()) {
        this.showToast('error', 'L.F Digital Solutions signature is required');
        return;
      }
      
      if (this.clientSignaturePad.isEmpty()) {
        this.showToast('error', 'Client signature is required');
        return;
      }
      
      // Validate signature info
      const companySignerName = document.getElementById('company-signer-name').value;
      const companyCofounder = document.getElementById('company-cofounder').value;
      const companyDate = document.getElementById('company-date').value;
      const clientSignerName = document.getElementById('client-signer-name').value;
      const clientDate = document.getElementById('client-date').value;
      
      if (!companySignerName || !companyCofounder || !companyDate || !clientSignerName || !clientDate) {
        this.showToast('error', 'Please fill in all signature information');
        return;
      }
      
      // Show loading
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing...';
      
      try {
        await this.submitSummary();
        
        this.showToast('success', 'Cost Summary submitted successfully! Confirmation emails have been sent.');
        
        // Clear session data
        setTimeout(() => {
          sessionStorage.removeItem('costEstimateData');
          window.location.href = 'index.html';
        }, 3000);
        
      } catch (error) {
        console.error('Submission error:', error);
        this.showToast('error', 'Submission failed. Please try again or contact us at lf.digitalsolutions.official@gmail.com');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Cost Summary & Authorization';
      }
    });
  }
  
  async submitSummary() {
    // Get signatures as data URLs
    const companySignature = this.companySignaturePad.toDataURL('image/png');
    const clientSignature = this.clientSignaturePad.toDataURL('image/png');
    
    // Collect discount info
    const discountType = document.getElementById('discount-type').value;
    const discountAmount = this.discount;
    
    // Collect signature info
    const companySignerName = document.getElementById('company-signer-name').value;
    const companyCofounder = document.getElementById('company-cofounder').value;
    const companyDate = document.getElementById('company-date').value;
    const clientSignerName = document.getElementById('client-signer-name').value;
    const clientPosition = document.getElementById('client-position').value;
    const clientDate = document.getElementById('client-date').value;
    
    // Create detailed message
    const message = this.formatEmailMessage(
      discountType, discountAmount,
      companySignerName, companyCofounder, companyDate,
      clientSignerName, clientPosition, clientDate
    );
    
    // Prepare form data for Web3Forms
    const formData = new FormData();
    formData.append('access_key', 'd8cf9868-4e3e-4f15-a360-baa51ebd245a');
    formData.append('subject', `Project Cost Summary - ${this.data.client_name}`);
    formData.append('from_name', 'L.F Digital Solutions - Cost Summary');
    formData.append('message', message);
    
    // Add signatures as attachments
    formData.append('company_signature', companySignature);
    formData.append('client_signature', clientSignature);
    
    // Send to client email
    formData.append('email', this.data.email);
    
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error('Email submission failed');
    }
    
    // Send to company email
    await this.sendToCompanyEmail(message, companySignature, clientSignature);
  }
  
  async sendToCompanyEmail(message, companySignature, clientSignature) {
    const formData = new FormData();
    formData.append('access_key', 'd8cf9868-4e3e-4f15-a360-baa51ebd245a');
    formData.append('subject', `[COMPANY COPY] Project Cost Summary - ${this.data.client_name}`);
    formData.append('from_name', 'L.F Digital Solutions - Cost Summary');
    formData.append('email', 'lf.digitalsolutions.official@gmail.com');
    formData.append('message', message);
    formData.append('company_signature', companySignature);
    formData.append('client_signature', clientSignature);
    
    await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    });
  }
  
  formatEmailMessage(discountType, discountAmount, companySignerName, companyCofounder, companyDate, clientSignerName, clientPosition, clientDate) {
    const docNumber = document.getElementById('doc-number').textContent;
    const dateIssued = document.getElementById('date-issued').textContent;
    
    let servicesText = '';
    if (this.data.services) {
      servicesText = this.data.services.map(s => `  • ${s.name} - ₱${this.formatNumber(s.price)}`).join('\n');
    }
    
    const payment50 = Math.round(this.finalTotal * 0.5);
    const payment30 = Math.round(this.finalTotal * 0.3);
    const payment20 = this.finalTotal - payment50 - payment30;
    
    return `
═══════════════════════════════════════════════════════════
PROJECT COST SUMMARY & PAYMENT AUTHORIZATION
═══════════════════════════════════════════════════════════

DOCUMENT NO.: LFDS-PCS-2026-${docNumber}
DATE ISSUED: ${dateIssued}

───────────────────────────────────────────────────────────
CLIENT INFORMATION
───────────────────────────────────────────────────────────
Client Name: ${this.data.client_name}
Company: ${this.data.company || 'N/A'}
Email: ${this.data.email}
Phone: ${this.data.phone}
Project Name: ${this.data.project_name || 'N/A'}
Project Type: ${this.data.project_type || 'N/A'}

───────────────────────────────────────────────────────────
APPROVED PROJECT COST
───────────────────────────────────────────────────────────

SELECTED SERVICES:
${servicesText}

COST BREAKDOWN:
Subtotal:                     ₱${this.formatNumber(this.subtotal)}
Discount:                   - ₱${this.formatNumber(discountAmount)}
                              ────────────────
TOTAL PROJECT COST:           ₱${this.formatNumber(this.finalTotal)}

Amount in Words: ${this.numberToWords(this.finalTotal)}

${discountType ? `Discount Type: ${discountType}` : ''}

───────────────────────────────────────────────────────────
PAYMENT SCHEDULE
───────────────────────────────────────────────────────────

Initial / Down Payment (50%):  ₱${this.formatNumber(payment50)}
  Due: Upon project confirmation

Development Milestone (30%):   ₱${this.formatNumber(payment30)}
  Due: Upon agreed milestone

Final Payment (20%):           ₱${this.formatNumber(payment20)}
  Due: Before final turnover

TOTAL:                         ₱${this.formatNumber(this.finalTotal)}

───────────────────────────────────────────────────────────
SIGNATURES
───────────────────────────────────────────────────────────

L.F DIGITAL SOLUTIONS:
Authorized Signature: ${companySignerName}
Co-Founder: ${companyCofounder}
Date: ${companyDate}

CLIENT:
Signature: ${clientSignerName}
${clientPosition ? `Position: ${clientPosition}` : ''}
Date: ${clientDate}

───────────────────────────────────────────────────────────

Both signatures are attached as images.

This document confirms that the Client has reviewed and authorized
L.F Digital Solutions to proceed with the project upon receipt of
the required initial payment.

═══════════════════════════════════════════════════════════
    `;
  }
  
  showToast(type, message) {
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
}

// Clear signature functions
function clearCompanySignature() {
  const canvas = document.getElementById('company-signature-canvas');
  const pad = new SignaturePad(canvas);
  pad.clear();
  window.location.reload(); // Reload to reinitialize
}

function clearClientSignature() {
  const canvas = document.getElementById('client-signature-canvas');
  const pad = new SignaturePad(canvas);
  pad.clear();
  window.location.reload(); // Reload to reinitialize
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new CostSummary();
  });
} else {
  new CostSummary();
}
