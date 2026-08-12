// Project Card Modal Functionality
(function() {
    'use strict';
    
    // Get modal elements
    const projectModal = document.getElementById('project-modal');
    const modalTitle = document.getElementById('project-modal-title');
    const modalVideo = document.getElementById('project-video');
    const modalDescription = document.getElementById('project-modal-text');
    const modalOverlay = projectModal?.querySelector('.modal-overlay');
    const modalClose = projectModal?.querySelector('.modal-close');
    
    // Get all project cards
    const projectCards = document.querySelectorAll('.project-card.clickable');
    
    // Function to open project modal
    function openProjectModal(card) {
        if (!projectModal || !card) return;
        
        // Get data from card
        const title = card.getAttribute('data-title');
        const videoSrc = card.getAttribute('data-video');
        const description = card.getAttribute('data-description');
        
        // Set modal content
        if (modalTitle) modalTitle.textContent = title || '';
        if (modalVideo && videoSrc) {
            const source = modalVideo.querySelector('source');
            if (source) source.src = videoSrc;
            modalVideo.load();
            
            // Play video after loading
            modalVideo.play().catch(err => {
                console.log('Video autoplay prevented:', err);
            });
        }
        if (modalDescription) modalDescription.textContent = description || '';
        
        // Show modal
        projectModal.classList.add('active');
        document.body.classList.add('modal-open');
        
        // Focus on close button for accessibility
        if (modalClose) {
            setTimeout(() => modalClose.focus(), 100);
        }
    }
    
    // Function to close project modal
    function closeProjectModal() {
        if (!projectModal) return;
        
        projectModal.classList.remove('active');
        document.body.classList.remove('modal-open');
        
        // Pause and reset video
        if (modalVideo) {
            modalVideo.pause();
            modalVideo.currentTime = 0;
        }
    }
    
    // Add click event listeners to all project cards
    projectCards.forEach(card => {
        // Mouse click
        card.addEventListener('click', () => {
            openProjectModal(card);
        });
        
        // Keyboard accessibility (Enter or Space)
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openProjectModal(card);
            }
        });
    });
    
    // Close modal when clicking overlay
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeProjectModal);
    }
    
    // Close modal when clicking close button
    if (modalClose) {
        modalClose.addEventListener('click', closeProjectModal);
    }
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && projectModal?.classList.contains('active')) {
            closeProjectModal();
        }
    });
    
    // Trap focus within modal for accessibility
    if (projectModal) {
        projectModal.addEventListener('keydown', function(e) {
            if (e.key !== 'Tab' || !projectModal.classList.contains('active')) return;
            
            const focusableElements = projectModal.querySelectorAll(
                'button, [href], input, select, textarea, video[controls], [tabindex]:not([tabindex="-1"])'
            );
            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else {
                // Tab
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        });
    }
    
})();
