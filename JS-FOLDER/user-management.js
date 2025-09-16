// User Management JavaScript
document.addEventListener('DOMContentLoaded', function() {
    let currentPage = 1;
    let totalPages = 1;
    let currentUsers = [];
    let editingUserId = null;

    // Initialize user management
    loadUsers();
    setupEventListeners();
    setupNavigation();
    loadDarkModeSettings();

    function setupEventListeners() {
        // Add User button
        document.getElementById('addUserBtn').addEventListener('click', function() {
            openAddUserModal();
        });

        // Search functionality
        document.getElementById('userSearch').addEventListener('input', debounce(function() {
            currentPage = 1;
            loadUsers();
        }, 300));

        // Filter functionality
        document.getElementById('roleFilter').addEventListener('change', function() {
            currentPage = 1;
            loadUsers();
        });

        document.getElementById('statusFilter').addEventListener('change', function() {
            currentPage = 1;
            loadUsers();
        });

        // Form submission
        document.getElementById('userForm').addEventListener('submit', function(e) {
            e.preventDefault();
            saveUser();
        });
    }

    function setupNavigation() {
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
                    if (headerTitle) {
                        headerTitle.textContent = linkText;
                    }
                }
                // For actual page links (dashboard.html, user-management.html), allow normal navigation
            });
        });
    }

    // Navigation handler
    function handleNavigation(route) {
        // Determine base path based on current location
        const isInHtmlFolder = window.location.pathname.includes('/HTML/');
        
        // Show contextual page transition
        showPageTransition(route);
        
        switch(route) {
            case '#dashboard':
                // Navigate to dashboard page
                setTimeout(() => {
                    if (isInHtmlFolder) {
                        window.location.href = 'dashboard.html';
                    } else {
                        window.location.href = 'HTML/dashboard.html';
                    }
                }, 800);
                break;
            case '#users':
                // Already on user management - just show notification
                showNotification('User Management loaded', 'info');
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

    // Load users from API
    function loadUsers() {
        const search = document.getElementById('userSearch')?.value || '';
        const roleFilter = document.getElementById('roleFilter')?.value || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';

        // Show loading state
        const tbody = document.getElementById('usersTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading users...</td></tr>';
        }

        // Determine API path based on current location
        const apiPath = window.location.pathname.includes('/HTML/') ? '../PHP-FOLDER-API/' : 'PHP-FOLDER-API/';
        
        // Build query parameters
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (roleFilter) params.append('role', roleFilter);
        if (statusFilter) params.append('status', statusFilter);
        params.append('page', currentPage);

        fetch(apiPath + 'users.php?' + params.toString())
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Filter out Admin users from API response
                    const filteredUsers = (data.data || []).filter(user => user.role !== 'Admin');
                    currentUsers = filteredUsers;
                    displayUsers(currentUsers);
                    updatePagination(data.pagination || { total: currentUsers.length });
                } else {
                    console.error('Failed to load users:', data.message);
                    loadSampleUsers();
                }
            })
            .catch(error => {
                console.error('Error loading users:', error);
                // Immediately load sample data instead of waiting for API
                loadSampleUsers();
            });
    }

    function loadSampleUsers() {
        // Fallback sample data - load immediately without timeout
        console.log('Loading sample users as fallback...');
        
        const search = document.getElementById('userSearch')?.value || '';
        const roleFilter = document.getElementById('roleFilter')?.value || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';
        
        const sampleUsers = [
                {
                    id: 1,
                    username: 'quads',
                    full_name: 'Quads Administrator',
                    email: 'kristinedais01@gmail.com',
                    phone: '+1234567890',
                    role: 'Admin',
                    status: 'Active',
                    department: 'Administration',
                    last_login: '2024-01-15 14:30:00',
                    created_at: '2024-01-01 09:00:00'
                },
                {
                    id: 2,
                    username: 'coadmin',
                    full_name: 'Co-Administrator',
                    email: 'coadmin@example.com',
                    phone: '+1234567892',
                    role: 'Co-Admin',
                    status: 'Active',
                    department: 'Operations',
                    last_login: '2024-01-14 16:45:00',
                    created_at: '2024-01-02 10:00:00'
                },
                {
                    id: 4,
                    username: 'client1',
                    full_name: 'John Smith',
                    email: 'contact@acmecorp.com',
                    phone: '+1234567896',
                    role: 'Client',
                    status: 'Active',
                    department: 'ACME Corporation',
                    last_login: '2024-01-15 08:20:00',
                    created_at: '2024-01-05 14:30:00'
                },
                {
                    id: 5,
                    username: 'client2',
                    full_name: 'Jane Doe',
                    email: 'admin@techstart.com',
                    phone: '+1234567897',
                    role: 'Client',
                    status: 'Active',
                    department: 'TechStart Solutions',
                    last_login: '2024-01-13 11:30:00',
                    created_at: '2024-01-06 09:15:00'
                },
                {
                    id: 6,
                    username: 'client3',
                    full_name: 'Bob Johnson',
                    email: 'finance@globalltd.com',
                    phone: '+1234567898',
                    role: 'Client',
                    status: 'Pending',
                    department: 'Global Trading Ltd',
                    last_login: null,
                    created_at: '2024-01-14 15:20:00'
                }
            ];

            // Apply filters and exclude Admin users from the list
            let filteredUsers = sampleUsers.filter(user => {
                // Exclude Admin users from the main user list
                const isNotAdmin = user.role !== 'Admin';
                
                const matchesSearch = !search || 
                    user.full_name.toLowerCase().includes(search.toLowerCase()) ||
                    user.username.toLowerCase().includes(search.toLowerCase()) ||
                    user.email.toLowerCase().includes(search.toLowerCase());
                
                const matchesRole = !roleFilter || user.role === roleFilter;
                const matchesStatus = !statusFilter || user.status === statusFilter;

                return isNotAdmin && matchesSearch && matchesRole && matchesStatus;
            });

        currentUsers = filteredUsers;
        displayUsers(filteredUsers);
        updatePagination(filteredUsers.length);
    }

    // Display users in table
    function displayUsers(users) {
        const tbody = document.getElementById('usersTableBody');
        
        if (!tbody) {
            console.error('Users table body not found');
            return;
        }
        
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="no-data">No users found</td></tr>';
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>
                    <div class="user-info">
                        <div class="user-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="user-details">
                            <div class="user-name">${user.full_name}</div>
                            <div class="user-username">@${user.username}</div>
                        </div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td>
                    <span class="role-badge ${user.role.toLowerCase()}">${user.role}</span>
                </td>
                <td>
                    <span class="status-badge ${user.status.toLowerCase()}">${user.status}</span>
                </td>
                <td>${user.last_login ? formatDateTime(user.last_login) : 'Never'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="editUser(${user.id})" title="Edit User">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon danger" onclick="deleteUser(${user.id})" title="Delete User">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Update pagination info
    function updatePagination(totalUsers) {
        const paginationInfo = document.getElementById('paginationInfo');
        const currentPageSpan = document.getElementById('currentPage');
        
        const start = totalUsers > 0 ? 1 : 0;
        const end = totalUsers;
        
        paginationInfo.textContent = `${start}-${end} of ${totalUsers}`;
        currentPageSpan.textContent = currentPage;
        
        // For now, disable pagination buttons since we're showing all results
        document.getElementById('prevPage').disabled = true;
        document.getElementById('nextPage').disabled = true;
    }

    // Global functions for modal operations
    window.openAddUserModal = function() {
        editingUserId = null;
        document.getElementById('modalTitle').textContent = 'Add New User';
        document.getElementById('saveButtonText').textContent = 'Save User';
        document.getElementById('userForm').reset();
        document.getElementById('passwordGroup').style.display = 'block';
        document.getElementById('password').required = true;
        
        // Hide status field for new users (auto-set to Active)
        document.getElementById('statusGroup').style.display = 'none';
        document.getElementById('status').value = 'Active';
        
        const modal = document.getElementById('userModal');
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
        document.body.style.overflow = 'hidden';
    };

    window.editUser = function(userId) {
        const user = currentUsers.find(u => u.id === userId);
        if (!user) return;

        editingUserId = userId;
        document.getElementById('modalTitle').textContent = 'Edit User';
        document.getElementById('saveButtonText').textContent = 'Update User';
        
        // Populate form
        document.getElementById('userId').value = user.id;
        document.getElementById('fullName').value = user.full_name;
        document.getElementById('username').value = user.username;
        document.getElementById('email').value = user.email;
        document.getElementById('phone').value = user.phone || '';
        document.getElementById('role').value = user.role;
        document.getElementById('status').value = user.status;
        document.getElementById('department').value = user.department || '';
        
        // Hide password field for editing
        document.getElementById('passwordGroup').style.display = 'none';
        document.getElementById('password').required = false;
        
        // Show status field for editing users
        document.getElementById('statusGroup').style.display = 'block';
        
        const modal = document.getElementById('userModal');
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
        document.body.style.overflow = 'hidden';
    };

    window.deleteUser = function(userId) {
        const user = currentUsers.find(u => u.id === userId);
        if (!user) return;

        document.getElementById('deleteUserInfo').innerHTML = `
            <div class="user-delete-preview">
                <strong>${user.full_name}</strong><br>
                <small>${user.email} • ${user.role}</small>
            </div>
        `;

        const modal = document.getElementById('deleteModal');
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
        document.body.style.overflow = 'hidden';
        
        // Store user ID for deletion
        modal.dataset.userId = userId;
    };

    window.closeUserModal = function() {
        const modal = document.getElementById('userModal');
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    };

    window.closeDeleteModal = function() {
        const modal = document.getElementById('deleteModal');
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    };

    window.saveUser = function() {
        const form = document.getElementById('userForm');
        if (!form) {
            showNotification('Form not found', 'error');
            return;
        }
        
        // Get form values
        const formData = {
            userId: document.getElementById('userId')?.value || '',
            fullName: document.getElementById('fullName')?.value?.trim() || '',
            username: document.getElementById('username')?.value?.trim() || '',
            email: document.getElementById('email')?.value?.trim() || '',
            phone: document.getElementById('phone')?.value?.trim() || '',
            role: document.getElementById('role').value,
            status: document.getElementById('status').value,
            department: document.getElementById('department').value.trim(),
            password: document.getElementById('password').value
        };

        // Validation
        const errors = [];
        
        if (!formData.fullName) errors.push('Full Name is required');
        if (!formData.username) errors.push('Username is required');
        if (!formData.email) errors.push('Email is required');
        if (!formData.role) errors.push('Role is required');
        if (!formData.status) errors.push('Status is required');
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            errors.push('Please enter a valid email address');
        }
        
        // Username validation (alphanumeric and underscore only)
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (formData.username && !usernameRegex.test(formData.username)) {
            errors.push('Username can only contain letters, numbers, and underscores');
        }
        
        // Password validation for new users
        if (!editingUserId && !formData.password) {
            errors.push('Password is required for new users');
        }
        
        if (formData.password && formData.password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }

        // Show validation errors
        if (errors.length > 0) {
            showNotification(errors.join('. '), 'error');
            return;
        }

        // Check for duplicate username/email (in sample data)
        const existingUser = currentUsers.find(user => 
            user.id != formData.userId && 
            (user.username.toLowerCase() === formData.username.toLowerCase() || 
             user.email.toLowerCase() === formData.email.toLowerCase())
        );
        
        if (existingUser) {
            showNotification('Username or email already exists', 'error');
            return;
        }

        // Show loading state
        const saveButton = document.querySelector('#userModal .btn-primary');
        const originalText = saveButton.innerHTML;
        saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        saveButton.disabled = true;

        // Prepare API data
        const apiData = {
            username: formData.username,
            email: formData.email,
            full_name: formData.fullName,
            role: formData.role,
            status: formData.status
        };
        
        if (formData.password) {
            apiData.password = formData.password;
        }

        // API call to save user
        const apiPath = window.location.pathname.includes('/HTML/') ? '../PHP-FOLDER-API/' : 'PHP-FOLDER-API/';
        const url = apiPath + 'users.php' + (editingUserId ? `?id=${editingUserId}` : '');
        const method = editingUserId ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (editingUserId) {
                    showNotification('User updated successfully', 'success');
                } else {
                    showNotification('User created successfully', 'success');
                }
                closeUserModal();
                loadUsers(); // Reload users from API
            } else {
                showNotification(data.message || 'Failed to save user', 'error');
            }
        })
        .catch(error => {
            console.error('Error saving user:', error);
            // Fallback to sample data update for demo
            if (editingUserId) {
                const userIndex = currentUsers.findIndex(u => u.id == editingUserId);
                if (userIndex !== -1) {
                    currentUsers[userIndex] = {
                        ...currentUsers[userIndex],
                        full_name: formData.fullName,
                        username: formData.username,
                        email: formData.email,
                        role: formData.role,
                        status: formData.status,
                        phone: formData.phone,
                        department: formData.department
                    };
                    displayUsers(currentUsers);
                    showNotification('User updated successfully (demo mode)', 'success');
                }
            } else {
                const newUser = {
                    id: Math.max(...currentUsers.map(u => u.id)) + 1,
                    full_name: formData.fullName,
                    username: formData.username,
                    email: formData.email,
                    role: formData.role,
                    status: formData.status,
                    phone: formData.phone,
                    department: formData.department,
                    last_login: null,
                    created_at: new Date().toISOString()
                };
                currentUsers.unshift(newUser);
                displayUsers(currentUsers);
                updatePagination(currentUsers.length);
                showNotification('User created successfully (demo mode)', 'success');
            }
            closeUserModal();
        })
        .finally(() => {
            // Reset button state
            saveButton.innerHTML = originalText;
            saveButton.disabled = false;
        });
    };

    window.confirmDeleteUser = function() {
        const modal = document.getElementById('deleteModal');
        const userId = modal.dataset.userId;
        
        // Show loading state
        const deleteButton = document.querySelector('#deleteModal .btn-danger');
        const originalText = deleteButton.innerHTML;
        deleteButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
        deleteButton.disabled = true;
        
        // API call to delete user
        const apiPath = window.location.pathname.includes('/HTML/') ? '../PHP-FOLDER-API/' : 'PHP-FOLDER-API/';
        
        fetch(apiPath + `users.php?id=${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('User deleted successfully', 'success');
                loadUsers(); // Reload users from API
            } else {
                showNotification(data.message || 'Failed to delete user', 'error');
            }
        })
        .catch(error => {
            console.error('Error deleting user:', error);
            // Fallback to sample data deletion for demo
            const userIndex = currentUsers.findIndex(u => u.id == userId);
            if (userIndex !== -1) {
                currentUsers.splice(userIndex, 1);
                displayUsers(currentUsers);
                updatePagination(currentUsers.length);
                showNotification('User deleted successfully (demo mode)', 'success');
            }
        })
        .finally(() => {
            // Reset button state
            deleteButton.innerHTML = originalText;
            deleteButton.disabled = false;
            closeDeleteModal();
        });
    };

    window.changePage = function(direction) {
        // Pagination functionality would go here
        // For now, it's disabled since we show all results
    };

    // Utility functions
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    // Show notification function
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    function getNotificationIcon(type) {
        switch(type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            default: return 'fa-info-circle';
        }
    }

    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            if (e.target.id === 'userModal') {
                closeUserModal();
            } else if (e.target.id === 'deleteModal') {
                closeDeleteModal();
            }
        }
    });

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

    // Close modals with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const userModal = document.getElementById('userModal');
            const deleteModal = document.getElementById('deleteModal');
            
            if (userModal && userModal.classList.contains('show')) {
                closeUserModal();
            } else if (deleteModal && deleteModal.classList.contains('show')) {
                closeDeleteModal();
            }
        }
    });
});
