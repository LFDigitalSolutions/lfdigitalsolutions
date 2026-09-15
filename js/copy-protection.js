// Copy Protection Script

// Disable right-click context menu
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});

// Disable common copy keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Disable Ctrl+C (copy)
    if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        return false;
    }
    
    // Disable Ctrl+X (cut)
    if (e.ctrlKey && e.key === 'x') {
        e.preventDefault();
        return false;
    }
    
    // Disable Ctrl+A (select all)
    if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        return false;
    }
    
    // Disable Ctrl+U (view source)
    if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
    }
    
    // Disable Ctrl+S (save page)
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
    }
    
    // Disable F12 (developer tools)
    if (e.key === 'F12') {
        e.preventDefault();
        return false;
    }
    
    // Disable Ctrl+Shift+I (inspect element)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
    }
    
    // Disable Ctrl+Shift+J (console)
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
    }
    
    // Disable Ctrl+Shift+C (inspect element)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        return false;
    }
});

// Disable text selection drag
document.addEventListener('selectstart', function(e) {
    // Allow selection in input and textarea elements
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return true;
    }
    e.preventDefault();
    return false;
});

// Disable copy event
document.addEventListener('copy', function(e) {
    // Allow copy in input and textarea elements
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return true;
    }
    e.preventDefault();
    return false;
});

// Disable cut event
document.addEventListener('cut', function(e) {
    // Allow cut in input and textarea elements
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return true;
    }
    e.preventDefault();
    return false;
});

// Disable drag and drop
document.addEventListener('dragstart', function(e) {
    e.preventDefault();
    return false;
});
