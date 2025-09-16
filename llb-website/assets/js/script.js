// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
});

// Smooth scrolling removed for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'auto',
                block: 'start'
            });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    }
});

// Form submission
document.querySelector('.contact-form form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    const name = this.querySelector('input[type="text"]').value;
    const email = this.querySelector('input[type="email"]').value;
    const subject = this.querySelector('input[type="text"]:nth-of-type(2)').value;
    const message = this.querySelector('textarea').value;
    
    // Simple validation
    if (!name || !email || !subject || !message) {
        alert('Please fill in all fields.');
        initializeNavigation();
        initializeContactForm();
        initializeFeedbackModal();
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    // Simulate form submission
    const submitBtn = this.querySelector('.btn-primary');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        alert('Thank you for your message! We will get back to you soon.');
        this.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
});

// Intersection Observer animations removed

// Counter animation for stats
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start) + '+';
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + '+';
        }
    }
    
    updateCounter();
}

// Animate stats when they come into view
const statsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statElements = entry.target.querySelectorAll('.stat h3');
            statElements.forEach((stat, index) => {
                const values = [25, 500, 100];
                setTimeout(() => {
                    animateCounter(stat, values[index]);
                }, index * 200);
            });
            statsObserver.unobserve(entry.target);
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const statsSection = document.querySelector('.about-stats');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
});

// Add loading class to body
document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.add('loaded');
});

// Parallax effect removed

// Service card hover effects removed

// Team member card interactions
document.querySelectorAll('.team-member').forEach(member => {
    member.addEventListener('click', function() {
        // Could add modal or expanded view functionality here
        console.log('Team member clicked:', this.querySelector('h3').textContent);
    });
});

// Feedback Modal Functionality - Initialize immediately
function initializeFeedbackModal() {
    console.log('Initializing feedback modal...');
    
    const feedbackBtn = document.getElementById('feedbackBtn');
    const feedbackModal = document.getElementById('feedbackModal');
    const closeFeedback = document.getElementById('closeFeedback');
    const cancelFeedback = document.getElementById('cancelFeedback');
    const feedbackForm = document.getElementById('feedbackForm');
    const stars = document.querySelectorAll('.star');
    const ratingInput = document.getElementById('feedbackRating');
    
    console.log('Feedback button found:', feedbackBtn);
    console.log('Feedback modal found:', feedbackModal);
    
    // Stats counters (for incrementing after feedback submission)
    const statsCounters = {
        experience: document.querySelector('.stat h3'),
        clients: document.querySelectorAll('.stat h3')[1],
        compliance: document.querySelectorAll('.stat h3')[2]
    };
    
    // Open modal
    if (feedbackBtn && feedbackModal) {
        feedbackBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Feedback button clicked!');
            feedbackModal.style.display = 'flex';
            feedbackModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        });
        console.log('Event listener added to feedback button');
    } else {
        console.error('Feedback button or modal not found!');
    }
    
    // Close modal functions
    function closeModal() {
        feedbackModal.classList.remove('show');
        document.body.style.overflow = 'auto';
        resetForm();
    }
    
    if (closeFeedback) {
        closeFeedback.addEventListener('click', closeModal);
    }
    
    if (cancelFeedback) {
        cancelFeedback.addEventListener('click', closeModal);
    }
    
    // Close modal when clicking outside
    if (feedbackModal) {
        feedbackModal.addEventListener('click', function(e) {
            if (e.target === feedbackModal) {
                closeModal();
            }
        });
    }
    
    // Star rating functionality
    stars.forEach((star, index) => {
        star.addEventListener('click', function() {
            const rating = index + 1;
            ratingInput.value = rating;
            
            // Update star display
            stars.forEach((s, i) => {
                if (i < rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
        
        // Hover effect
        star.addEventListener('mouseenter', function() {
            const rating = index + 1;
            stars.forEach((s, i) => {
                if (i < rating) {
                    s.style.color = '#fbbf24';
                } else {
                    s.style.color = '#d1d5db';
                }
            });
        });
    });
    
    // Reset hover effect
    const ratingStars = document.querySelector('.rating-stars');
    if (ratingStars) {
        ratingStars.addEventListener('mouseleave', function() {
            stars.forEach((star, index) => {
                if (star.classList.contains('active')) {
                    star.style.color = '#fbbf24';
                } else {
                    star.style.color = '#d1d5db';
                }
            });
        });
    }
    
    // Form submission
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(feedbackForm);
            const feedbackData = {
                name: formData.get('name'),
                email: formData.get('email'),
                rating: formData.get('rating'),
                message: formData.get('message')
            };
            
            // Simulate form submission
            submitFeedback(feedbackData);
        });
    }
    
    function submitFeedback(data) {
        // Show loading state
        const submitBtn = feedbackForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            // Update stats based on feedback
            updateStats(data.rating);
            
            // Show success message
            showSuccessMessage();
            
            // Reset form and close modal
            setTimeout(() => {
                closeModal();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 2000);
        }, 1500);
    }
    
    function updateStats(rating) {
        // Increment satisfied clients counter
        if (statsCounters.clients) {
            const currentClients = parseInt(statsCounters.clients.textContent.replace('+', ''));
            statsCounters.clients.textContent = (currentClients + 1) + '+';
        }
        
        // If rating is 4 or 5, increment compliance rate
        if (rating >= 4 && statsCounters.compliance) {
            const currentCompliance = parseInt(statsCounters.compliance.textContent.replace('%', ''));
            if (currentCompliance < 100) {
                statsCounters.compliance.textContent = Math.min(100, currentCompliance + 1) + '%';
            }
        }
    }
    
    function showSuccessMessage() {
        const modalContent = document.querySelector('.feedback-modal-content');
        const successHTML = `
            <div class="feedback-success" style="text-align: center; padding: 40px 24px;">
                <div class="success-icon" style="font-size: 48px; color: #10b981; margin-bottom: 16px;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3 style="color: #1e293b; margin-bottom: 12px;">Thank You!</h3>
                <p style="color: #64748b; font-size: 16px;">Your feedback has been submitted successfully. We appreciate your input!</p>
            </div>
        `;
        modalContent.innerHTML = successHTML;
    }
    
    function resetForm() {
        if (feedbackForm) {
            feedbackForm.reset();
            if (ratingInput) ratingInput.value = '0';
            stars.forEach(star => {
                star.classList.remove('active');
                star.style.color = '#d1d5db';
            });
        }
        
        // Reset modal content if it was changed to success message
        setTimeout(() => {
            const modalContent = document.querySelector('.feedback-modal-content');
            if (modalContent && modalContent.querySelector('.feedback-success')) {
                location.reload(); // Simple way to reset the modal content
            }
        }, 100);
    }
}

// Initialize feedback modal when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeFeedbackModal();
});

// Also try to initialize after a short delay in case DOM isn't fully ready
setTimeout(function() {
    if (document.getElementById('feedbackBtn')) {
        initializeFeedbackModal();
    }
}, 1000);
