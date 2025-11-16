// Main JavaScript for Customer Site - Tushar Electronics

// Send Product Inquiry Function
window.sendProductInquiry = function(productId, productName) {
    const inquiryModal = document.getElementById('inquiryModal');
    if (inquiryModal) {
        const productIdInput = document.getElementById('inquiryProductId');
        const productNameInput = document.getElementById('inquiryProductName');
        const displayProductName = document.getElementById('displayProductName');
        const displayProductId = document.getElementById('displayProductId');
        
        if (productIdInput) {
            productIdInput.value = productId;
        }
        if (productNameInput) {
            productNameInput.value = productName || '';
        }
        if (displayProductName) {
            displayProductName.value = productName || 'Product';
        }
        if (displayProductId) {
            displayProductId.value = productId;
        }
        
        const modal = new bootstrap.Modal(inquiryModal);
        modal.show();
    } else {
        window.location.href = '/contact?product=' + productId;
    }
};

// Newsletter Subscription
document.getElementById('newsletterForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    
    try {
        const response = await fetch('/newsletter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        
        const result = await response.json();
        if (result.success) {
            showNotification(result.message, 'success');
            e.target.reset();
        } else {
            showNotification(result.message, 'danger');
        }
    } catch (error) {
        showNotification('Failed to subscribe. Please try again.', 'danger');
    }
});

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Handle image loading errors - show placeholder
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            // If image fails to load, try to show a placeholder
            if (!this.src.includes('placeholder') && !this.src.includes('data:')) {
                this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                this.style.backgroundColor = '#f0f0f0';
            }
        });
    });
    
    // Carousel initialization is handled in page-specific scripts
    // to ensure Bootstrap is fully loaded
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
