// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication before initializing dashboard
    checkAuthentication();
    
    // Wait for header to load before initializing dashboard functionality
    document.addEventListener('headerLoaded', function() {
        initializeDashboard();
    });
    
    // Fallback initialization if header is already loaded
    if (document.querySelector('.sidebar')) {
        initializeDashboard();
    }
});

// Check if user is authenticated
function checkAuthentication() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUser = localStorage.getItem('currentUser');
    
    if (!isLoggedIn || !currentUser) {
        // Redirect to login page
        const isInHtmlFolder = window.location.pathname.includes('/HTML/');
        if (isInHtmlFolder) {
            window.location.href = '../login.html';
        } else {
            window.location.href = 'login.html';
        }
        return false;
    }
    
    // Update user info in header if available
    try {
        const user = JSON.parse(currentUser);
        
        // Check if user has admin role - only admins can access this dashboard
        if (user.role !== 'admin') {
            // Redirect non-admin users to appropriate dashboard
            if (user.role === 'client') {
                const isInHtmlFolder = window.location.pathname.includes('/HTML/');
                if (isInHtmlFolder) {
                    window.location.href = 'client-dashboard.html';
                } else {
                    window.location.href = 'HTML/client-dashboard.html';
                }
            } else {
                // Unknown role, redirect to login
                const isInHtmlFolder = window.location.pathname.includes('/HTML/');
                if (isInHtmlFolder) {
                    window.location.href = '../login.html';
                } else {
                    window.location.href = 'login.html';
                }
            }
            return false;
        }
        
        updateUserInfo(user);
    } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid data and redirect to login
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        const isInHtmlFolder = window.location.pathname.includes('/HTML/');
        if (isInHtmlFolder) {
            window.location.href = '../login.html';
        } else {
            window.location.href = 'login.html';
        }
        return false;
    }
    
    return true;
}

// Update user information in the header
function updateUserInfo(user) {
    // Wait for header to load
    setTimeout(() => {
        const userNameElement = document.querySelector('.user-name');
        const userRoleElement = document.querySelector('.user-role');
        const userAvatarElement = document.querySelector('.user-avatar');
        
        if (userNameElement) {
            userNameElement.textContent = user.full_name || user.username || 'User';
        }
        
        if (userRoleElement) {
            userRoleElement.textContent = user.role || 'User';
        }
        
        if (userAvatarElement) {
            // Set avatar initials
            const initials = (user.full_name || user.username || 'U').charAt(0).toUpperCase();
            userAvatarElement.textContent = initials;
        }
    }, 100);
}

function initializeDashboard() {
    // Load dark mode settings
    loadDarkModeSettings();
    
    // Generate CSRF token (only if element exists)
    function generateCSRFToken() {
        const csrfElement = document.getElementById('csrf_token');
        if (csrfElement) {
            const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
            csrfElement.value = token;
            return token;
        }
        return null;
    }

    // Initialize CSRF token
    generateCSRFToken();

    // Refresh CSRF token every 10 minutes
    setInterval(generateCSRFToken, 600000);

    // User menu dropdown functionality
    document.addEventListener('click', function(e) {
        if (e.target.closest('.user-menu-btn')) {
            const userMenu = e.target.closest('.user-menu');
            const dropdown = userMenu.querySelector('.user-dropdown');
            
            if (!dropdown) {
                // Create dropdown if it doesn't exist
                const dropdownMenu = document.createElement('div');
                dropdownMenu.className = 'user-dropdown';
                dropdownMenu.innerHTML = `
                    <div class="dropdown-item" onclick="showProfile()">
                        <i class="fas fa-user"></i>
                        <span>Profile</span>
                    </div>
                    <div class="dropdown-item" onclick="showSettings()">
                        <i class="fas fa-cog"></i>
                        <span>Settings</span>
                    </div>
                    <div class="dropdown-divider"></div>
                    <div class="dropdown-item" onclick="logout()">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </div>
                `;
                userMenu.appendChild(dropdownMenu);
                
                // Add dropdown styles
                if (!document.querySelector('#user-dropdown-styles')) {
                    const styles = document.createElement('style');
                    styles.id = 'user-dropdown-styles';
                    styles.textContent = `
                        .user-menu {
                            position: relative;
                        }
                        .user-dropdown {
                            position: absolute;
                            top: 100%;
                            right: 0;
                            background: white;
                            border-radius: 6px;
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                            border: 1px solid #e2e8f0;
                            min-width: 180px;
                            z-index: 1000;
                            opacity: 0;
                            transform: translateY(-10px);
                            transition: all 0.2s ease;
                            pointer-events: none;
                        }
                        .user-dropdown.show {
                            opacity: 1;
                            transform: translateY(0);
                            pointer-events: all;
                        }
                        .dropdown-item {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            padding: 8px 12px;
                            font-size: 12px;
                            color: #64748b;
                            cursor: pointer;
                            transition: background 0.2s ease;
                        }
                        .dropdown-item:hover {
                            background: #f1f5f9;
                            color: #1e293b;
                        }
                        .dropdown-divider {
                            height: 1px;
                            background: #e2e8f0;
                            margin: 4px 0;
                        }
                    `;
                    document.head.appendChild(styles);
                }
            }
            
            const dropdownElement = userMenu.querySelector('.user-dropdown');
            dropdownElement.classList.toggle('show');
            
            // Close dropdown when clicking outside
            setTimeout(() => {
                document.addEventListener('click', function closeDropdown(event) {
                    if (!userMenu.contains(event.target)) {
                        dropdownElement.classList.remove('show');
                        document.removeEventListener('click', closeDropdown);
                    }
                });
            }, 0);
        }
    });


    // Notification bell functionality
    document.addEventListener('click', function(e) {
        if (e.target.closest('.notification-btn')) {
            const notificationBtn = e.target.closest('.notification-btn');
            const badge = notificationBtn.querySelector('.notification-badge');
            
            // Create notification panel
            let notificationPanel = document.querySelector('.notification-panel');
            if (!notificationPanel) {
                notificationPanel = document.createElement('div');
                notificationPanel.className = 'notification-panel';
                notificationPanel.innerHTML = `
                    <div class="notification-header">
                        <h3>Notifications</h3>
                        <button class="mark-all-read" onclick="markAllRead()">Mark all read</button>
                    </div>
                    <div class="notification-list">
                        <div class="notification-item unread">
                            <div class="notification-icon">
                                <i class="fas fa-user-plus"></i>
                            </div>
                            <div class="notification-content">
                                <p>New user registration: John Smith</p>
                                <span class="notification-time">2 minutes ago</span>
                            </div>
                        </div>
                        <div class="notification-item unread">
                            <div class="notification-icon">
                                <i class="fas fa-file-invoice"></i>
                            </div>
                            <div class="notification-content">
                                <p>Invoice INV-2024-001 generated</p>
                                <span class="notification-time">15 minutes ago</span>
                            </div>
                        </div>
                        <div class="notification-item">
                            <div class="notification-icon">
                                <i class="fas fa-chart-bar"></i>
                            </div>
                            <div class="notification-content">
                                <p>Monthly report completed</p>
                                <span class="notification-time">1 hour ago</span>
                            </div>
                        </div>
                    </div>
                    <div class="notification-footer">
                        <button onclick="viewAllNotifications()">View All Notifications</button>
                    </div>
                `;
                
                // Add notification panel styles
                if (!document.querySelector('#notification-panel-styles')) {
                    const styles = document.createElement('style');
                    styles.id = 'notification-panel-styles';
                    styles.textContent = `
                        .notification-panel {
                            position: fixed;
                            top: 60px;
                            right: 20px;
                            width: 320px;
                            background: white;
                            border-radius: 6px;
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                            border: 1px solid #e2e8f0;
                            z-index: 1000;
                            opacity: 0;
                            transform: translateY(-10px);
                            transition: all 0.2s ease;
                            pointer-events: none;
                            max-height: 400px;
                            overflow: hidden;
                        }
                        .notification-panel.show {
                            opacity: 1;
                            transform: translateY(0);
                            pointer-events: all;
                        }
                        .notification-header {
                            padding: 8px 12px;
                            border-bottom: 1px solid #e2e8f0;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                        }
                        .notification-header h3 {
                            font-size: 12px;
                            font-weight: 600;
                            color: #1e293b;
                        }
                        .mark-all-read {
                            background: none;
                            border: none;
                            color: #3b82f6;
                            font-size: 12px;
                            cursor: pointer;
                        }
                        .notification-list {
                            max-height: 280px;
                            overflow-y: auto;
                        }
                        .notification-item {
                            display: flex;
                            gap: 8px;
                            padding: 8px 12px;
                            border-bottom: 1px solid #f1f5f9;
                            cursor: pointer;
                            transition: background 0.2s ease;
                        }
                        .notification-item:hover {
                            background: #f8fafc;
                        }
                        .notification-item.unread {
                            background: #eff6ff;
                            border-left: 3px solid #3b82f6;
                        }
                        .notification-icon {
                            width: 24px;
                            height: 24px;
                            border-radius: 50%;
                            background: #f1f5f9;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 10px;
                            color: #64748b;
                        }
                        .notification-content p {
                            font-size: 12px;
                            color: #1e293b;
                            margin-bottom: 2px;
                        }
                        .notification-time {
                            font-size: 11px;
                            color: #64748b;
                        }
                        .notification-footer {
                            padding: 8px 12px;
                            border-top: 1px solid #e2e8f0;
                            text-align: center;
                        }
                        .notification-footer button {
                            background: none;
                            border: none;
                            color: #3b82f6;
                            font-size: 12px;
                            cursor: pointer;
                            font-weight: 500;
                        }
                    `;
                    document.head.appendChild(styles);
                }
                
                document.body.appendChild(notificationPanel);
            }
            
            notificationPanel.classList.toggle('show');
            
            // Update badge count
            if (badge) {
                const currentCount = parseInt(badge.textContent) || 0;
                if (currentCount > 0) {
                    badge.textContent = Math.max(0, currentCount - 1);
                    if (badge.textContent === '0') {
                        badge.style.display = 'none';
                    }
                }
            }
            
            // Close panel when clicking outside
            setTimeout(() => {
                document.addEventListener('click', function closePanel(event) {
                    if (!notificationPanel.contains(event.target) && !notificationBtn.contains(event.target)) {
                        notificationPanel.classList.remove('show');
                        document.removeEventListener('click', closePanel);
                    }
                });
            }, 0);
        }
    });


    // Sidebar toggle functionality
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileToggle = document.getElementById('mobileToggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');

    // Desktop sidebar toggle
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        });
    }

    // Mobile sidebar toggle
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }

    // Navigation link active state and routing
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Only prevent default for hash links (placeholder pages)
            if (href.startsWith('#')) {
                e.preventDefault();
                
                // Remove active class from all nav items
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Add active class to clicked nav item
                this.parentElement.classList.add('active');
                
                // Handle navigation routing for placeholder pages
                handleNavigation(href);
                
                // Update header title
                const headerTitle = document.querySelector('.header h1');
                const linkText = this.querySelector('span').textContent;
                headerTitle.textContent = linkText;
            }
            // For actual page links (dashboard.html, user-management.html), allow normal navigation
        });
    });

    // Navigation handler
    function handleNavigation(route) {
        // Determine base path based on current location
        const isInHtmlFolder = window.location.pathname.includes('/HTML/');
        
        // Show contextual page transition
        showPageTransition(route);
        
        switch(route) {
            case '#dashboard':
                // Already on dashboard - just show notification
                showNotification('Dashboard loaded', 'info');
                break;
            case '#users':
                // Navigate to user management page
                setTimeout(() => {
                    if (isInHtmlFolder) {
                        window.location.href = 'user-management.html';
                    } else {
                        window.location.href = 'HTML/user-management.html';
                    }
                }, 800);
                break;
            case '#accounts':
                showNotification('Chart of Accounts - Coming Soon', 'info');
                break;
            case '#transactions':
                showNotification('Transactions - Coming Soon', 'info');
                break;
            case '#reports':
                showNotification('Reports - Coming Soon', 'info');
                break;
            case '#departments':
                showNotification('Departments - Coming Soon', 'info');
                break;
            case '#settings':
                showNotification('Settings - Coming Soon', 'info');
                break;
            default:
                showNotification('Page not found', 'error');
        }
    }

    // Load dashboard stats from API
    loadDashboardStats();

    // Load dashboard stats function
    function loadDashboardStats() {
        // Determine API path based on current location
        const apiPath = window.location.pathname.includes('/HTML/') ? '../PHP-FOLDER-API/' : 'PHP-FOLDER-API/';
        
        fetch(apiPath + 'dashboard-stats.php?action=stats')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update stat cards
                    document.getElementById('activeUsers').textContent = data.data.stats.activeUsers;
                    document.getElementById('pendingTasks').textContent = data.data.stats.pendingTasks;
                    document.getElementById('activeClients').textContent = data.data.stats.activeClients;
                    document.getElementById('reportsGenerated').textContent = data.data.stats.reportsThisMonth;
                    
                    // Load recent activity separately
                    loadRecentActivity();
                } else {
                    console.error('Failed to load dashboard stats:', data.message);
                }
            })
            .catch(error => {
                console.error('Error loading dashboard stats:', error);
                // Use fallback sample data
                loadSampleStats();
            });
    }

    function loadRecentActivity() {
        const apiPath = window.location.pathname.includes('/HTML/') ? '../PHP-FOLDER-API/' : 'PHP-FOLDER-API/';
        
        fetch(apiPath + 'dashboard-stats.php?action=activity')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateRecentActivity(data.data);
                } else {
                    console.error('Failed to load recent activity:', data.message);
                }
            })
            .catch(error => {
                console.error('Error loading recent activity:', error);
            });
    }

    function loadSampleStats() {
        // Fallback sample data
        document.getElementById('activeUsers').textContent = '6';
        document.getElementById('pendingTasks').textContent = '12';
        document.getElementById('activeClients').textContent = '3';
        document.getElementById('reportsGenerated').textContent = '8';
    }

    function updateRecentActivity(activities) {
        const activityList = document.querySelector('.activity-list');
        if (activities && activities.length > 0) {
            activityList.innerHTML = activities.slice(0, 3).map(activity => `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas ${getActivityIcon(activity.type)}"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-text">${activity.description}</div>
                        <div class="activity-time" data-time="${activity.created_at}">${formatTimeAgo(activity.created_at)}</div>
                    </div>
                </div>
            `).join('');
        }
    }

    function getActivityIcon(type) {
        switch(type) {
            case 'user': return 'fa-user-plus';
            case 'report': return 'fa-file-alt';
            case 'task': return 'fa-check-circle';
            case 'client': return 'fa-building';
            default: return 'fa-info-circle';
        }
    }

    function formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        
        if (diffHours < 1) return 'Just now';
        if (diffHours === 1) return '1 hour ago';
        if (diffHours < 24) return `${diffHours} hours ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) return '1 day ago';
        return `${diffDays} days ago`;
    }
    
    // Animate stats on load
    animateStats();
    
    // Update time periodically
    updateActivityTimes();
    setInterval(updateActivityTimes, 60000); // Update every minute
}

// Global functions that need to be accessible from HTML onclick attributes
window.showProfile = function() {
    openProfileModal();
};

window.showSettings = function() {
    // Navigate to settings page
    setTimeout(() => {
        const isInHtmlFolder = window.location.pathname.includes('/HTML/');
        if (isInHtmlFolder) {
            window.location.href = 'settings.html';
        } else {
            window.location.href = 'HTML/settings.html';
        }
    }, 300);
};

window.markAllRead = function() {
    const unreadItems = document.querySelectorAll('.notification-item.unread');
    unreadItems.forEach(item => {
        item.classList.remove('unread');
    });
    showNotification('All notifications marked as read', 'success');
};

window.viewAllNotifications = function() {
    showNotification('All notifications page opened', 'info');
};

// Activity Modal Functions
window.openActivityModal = function() {
    const modal = document.getElementById('activityModal');
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Load activity data
    loadAllActivity();
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
};

window.closeActivityModal = function() {
    const modal = document.getElementById('activityModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }, 300);
};

window.refreshActivity = function() {
    showNotification('Activity refreshed', 'success');
    loadAllActivity();
};

function loadAllActivity() {
    const modalActivityList = document.getElementById('modalActivityList');
    
    // Sample activity data - in production, this would come from PHP API
    const activities = [
        {
            type: 'clients',
            icon: 'fa-building',
            action: 'New client added: ACME Corporation',
            time: '2 minutes ago',
            user: 'Admin User'
        },
        {
            type: 'tasks',
            icon: 'fa-tasks',
            action: 'Task completed: Financial audit review',
            time: '15 minutes ago',
            user: 'John Smith'
        },
        {
            type: 'reports',
            icon: 'fa-file-alt',
            action: 'Report generated: Monthly client summary',
            time: '1 hour ago',
            user: 'Admin User'
        },
        {
            type: 'users',
            icon: 'fa-user-plus',
            action: 'New user registered: Jane Doe',
            time: '2 hours ago',
            user: 'System'
        },
        {
            type: 'clients',
            icon: 'fa-handshake',
            action: 'Client meeting scheduled: TechStart Solutions',
            time: '3 hours ago',
            user: 'Admin User'
        },
        {
            type: 'tasks',
            icon: 'fa-check-circle',
            action: 'Task assigned: Quarterly tax preparation',
            time: '4 hours ago',
            user: 'Admin User'
        },
        {
            type: 'reports',
            icon: 'fa-chart-line',
            action: 'Performance report generated',
            time: '5 hours ago',
            user: 'System'
        },
        {
            type: 'users',
            icon: 'fa-user-edit',
            action: 'User profile updated: Bob Johnson',
            time: '6 hours ago',
            user: 'Bob Johnson'
        },
        {
            type: 'clients',
            icon: 'fa-file-contract',
            action: 'Contract signed: Global Trading Ltd',
            time: '1 day ago',
            user: 'Admin User'
        },
        {
            type: 'tasks',
            icon: 'fa-calendar-check',
            action: 'Task deadline reminder sent',
            time: '1 day ago',
            user: 'System'
        }
    ];
    
    modalActivityList.innerHTML = activities.map(activity => `
        <div class="modal-activity-item" data-type="${activity.type}">
            <div class="modal-activity-icon">
                <i class="fas ${activity.icon}"></i>
            </div>
            <div class="modal-activity-content">
                <p><strong>${activity.action}</strong></p>
                <span class="modal-activity-time">${activity.time} • by ${activity.user}</span>
                <span class="modal-activity-type ${activity.type}">${activity.type}</span>
            </div>
        </div>
    `).join('');
}

// Activity filter functionality
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('filter-btn')) {
        // Update active filter
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
        
        // Filter activities
        const filter = e.target.getAttribute('data-filter');
        const activities = document.querySelectorAll('.modal-activity-item');
        
        activities.forEach(activity => {
            if (filter === 'all' || activity.getAttribute('data-type') === filter) {
                activity.style.display = 'flex';
            } else {
                activity.style.display = 'none';
            }
        });
    }
});

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('activityModal');
    if (e.target === modal) {
        closeActivityModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('activityModal');
        if (modal && modal.classList.contains('show')) {
            closeActivityModal();
        }
    }
});

// Animate statistics counters
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-info h3');
    
    statNumbers.forEach(stat => {
        const text = stat.textContent;
        const number = parseInt(text.replace(/[^0-9]/g, ''));
        
        if (!isNaN(number)) {
            animateCounter(stat, number, text);
        }
    });
}

function animateCounter(element, target, originalText) {
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            const currentValue = Math.floor(start);
            element.textContent = originalText.replace(/[0-9,]+/, currentValue.toLocaleString());
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = originalText.replace(/[0-9,]+/, target.toLocaleString());
        }
    }
    
    updateCounter();
}

// Update activity timestamps
function updateActivityTimes() {
    const timeElements = document.querySelectorAll('.activity-time');
    const now = new Date();
    
    timeElements.forEach((element, index) => {
        const minutesAgo = [2, 15, 60][index] || 2;
        const timeAgo = new Date(now - minutesAgo * 60000);
        
        if (minutesAgo < 60) {
            element.textContent = `${minutesAgo} minutes ago`;
        } else {
            const hoursAgo = Math.floor(minutesAgo / 60);
            element.textContent = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
        }
    });
}

// Logout functionality
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear authentication data
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userSession');
        sessionStorage.clear();
        
        // Make API call to logout (if server is available)
        const apiPath = window.location.pathname.includes('/HTML/') ? '../PHP-FOLDER-API/' : 'PHP-FOLDER-API/';
        fetch(apiPath + 'auth.php?action=logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        }).catch(error => {
            console.log('Logout API call failed, but local logout completed');
        });
        
        // Redirect to login page
        const isInHtmlFolder = window.location.pathname.includes('/HTML/');
        if (isInHtmlFolder) {
            window.location.href = '../login.html';
        } else {
            window.location.href = 'login.html';
        }
    }
}

// Page transition function
function showPageTransition(route) {
    const transitionData = getTransitionData(route);
    
    // Create transition overlay
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    overlay.innerHTML = `
        <div class="page-transition-content">
            <div class="page-transition-icon">
                <i class="fas ${transitionData.icon}"></i>
            </div>
            <div class="page-transition-text">${transitionData.title}</div>
            <div class="page-transition-subtext">${transitionData.subtitle}</div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Show transition
    setTimeout(() => overlay.classList.add('show'), 10);
    
    // Remove after navigation
    setTimeout(() => {
        overlay.classList.remove('show');
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 400);
    }, 1200);
}

function getTransitionData(route) {
    const transitions = {
        '#dashboard': {
            icon: 'fa-tachometer-alt',
            title: 'Loading Dashboard',
            subtitle: 'Preparing your overview...'
        },
        '#users': {
            icon: 'fa-users',
            title: 'User Management',
            subtitle: 'Loading user accounts...'
        },
        '#accounts': {
            icon: 'fa-book',
            title: 'Chart of Accounts',
            subtitle: 'Organizing financial data...'
        },
        '#transactions': {
            icon: 'fa-exchange-alt',
            title: 'Transactions',
            subtitle: 'Loading transaction history...'
        },
        '#reports': {
            icon: 'fa-chart-bar',
            title: 'Reports',
            subtitle: 'Generating insights...'
        },
        '#departments': {
            icon: 'fa-building',
            title: 'Departments',
            subtitle: 'Managing departments...'
        },
        '#settings': {
            icon: 'fa-cog',
            title: 'Settings',
            subtitle: 'Configuring preferences...'
        }
    };
    
    return transitions[route] || {
        icon: 'fa-spinner',
        title: 'Loading',
        subtitle: 'Please wait...'
    };
}

// Quick action handlers
document.addEventListener('click', function(e) {
    if (e.target.closest('.action-btn')) {
        const actionBtn = e.target.closest('.action-btn');
        const actionText = actionBtn.querySelector('span').textContent;
        
        // Add visual feedback
        actionBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            actionBtn.style.transform = '';
        }, 150);
        
        showNotification(`${actionText} - Coming Soon`, 'info');
    }
});

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'info' ? 'info-circle' : type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add notification styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                padding: 8px 12px;
                border-radius: 6px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                border-left: 4px solid #3b82f6;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 12px;
                z-index: 10000;
                animation: slideIn 0.3s ease;
                max-width: 300px;
            }
            .notification.success { border-left-color: #10b981; }
            .notification.error { border-left-color: #ef4444; }
            .notification button {
                background: none;
                border: none;
                color: #64748b;
                cursor: pointer;
                padding: 2px;
                margin-left: auto;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Profile Modal Functions
window.openProfileModal = function() {
    const modal = document.getElementById('profileModal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
    document.body.style.overflow = 'hidden';
};

window.closeProfileModal = function() {
    const modal = document.getElementById('profileModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }, 300);
};

window.changeAvatar = function() {
    showNotification('Avatar change functionality - Coming Soon', 'info');
};

// Profile form submission
document.addEventListener('DOMContentLoaded', function() {
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                fullName: document.getElementById('profileFullName').value,
                username: document.getElementById('profileUsername').value,
                email: document.getElementById('profileEmail').value,
                phone: document.getElementById('profilePhone').value,
                password: document.getElementById('profilePassword').value
            };
            
            // Simulate API call
            showNotification('Profile updated successfully', 'success');
            closeProfileModal();
        });
    }
});

// Handle window resize
window.addEventListener('resize', function() {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth > 768) {
        sidebar.classList.remove('active');
    }
});

// Load and apply dark mode settings
function loadDarkModeSettings() {
    const settings = JSON.parse(localStorage.getItem('accountingSettings') || '{}');
    const themeMode = settings.themeMode || 'light';
    
    applyThemeMode(themeMode);
}

// Apply theme mode function
function applyThemeMode(mode) {
    const body = document.body;
    const dashboardContainer = document.querySelector('.dashboard-container');
    const mainContent = document.querySelector('.main-content');
    
    // Remove existing theme classes
    body.classList.remove('dark-theme');
    if (dashboardContainer) dashboardContainer.classList.remove('dark-theme');
    if (mainContent) mainContent.classList.remove('dark-theme');
    
    if (mode === 'dark') {
        body.classList.add('dark-theme');
        if (dashboardContainer) dashboardContainer.classList.add('dark-theme');
        if (mainContent) mainContent.classList.add('dark-theme');
    } else if (mode === 'auto') {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            body.classList.add('dark-theme');
            if (dashboardContainer) dashboardContainer.classList.add('dark-theme');
            if (mainContent) mainContent.classList.add('dark-theme');
        }
    }
}

// Listen for storage changes to sync dark mode across tabs
window.addEventListener('storage', function(e) {
    if (e.key === 'accountingSettings') {
        loadDarkModeSettings();
    }
});

// Listen for system theme changes
if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        const settings = JSON.parse(localStorage.getItem('accountingSettings') || '{}');
        if (settings.themeMode === 'auto') {
            loadDarkModeSettings();
        }
    });
}

// Initialize tooltips for icons
document.querySelectorAll('[title]').forEach(element => {
    element.addEventListener('mouseenter', function() {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = this.getAttribute('title');
        tooltip.style.cssText = `
            position: absolute;
            background: #1e293b;
            color: white;
            padding: 4px 6px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 10000;
            pointer-events: none;
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = this.getBoundingClientRect();
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
        
        this.addEventListener('mouseleave', function() {
            if (tooltip.parentElement) {
                tooltip.remove();
            }
        }, { once: true });
    });
});
