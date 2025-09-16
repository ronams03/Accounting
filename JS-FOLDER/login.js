// Login JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // Load dark mode settings
    loadDarkModeSettings();


    // Form submission handler
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });

    // Password toggle functionality
    window.togglePassword = function() {
        const passwordField = document.getElementById('password');
        const toggleIcon = document.getElementById('toggleIcon');
        
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            toggleIcon.classList.remove('fa-eye');
            toggleIcon.classList.add('fa-eye-slash');
        } else {
            passwordField.type = 'password';
            toggleIcon.classList.remove('fa-eye-slash');
            toggleIcon.classList.add('fa-eye');
        }
    };

    // Handle login process
    function handleLogin() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // Basic validation
        if (!username || !password) {
            showError('Please enter both username and password.');
            return;
        }

        // Show loading
        showLoading(true);
        hideMessages();

        // Prepare login data
        const loginData = {
            username: username,
            password: password
        };

        // Make API call to authenticate
        fetch('PHP-FOLDER-API/auth.php?action=login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        })
        .then(response => response.json())
        .then(data => {
            showLoading(false);
            
            if (data.success) {
                // Success - store user data and redirect based on role
                if (data.data && data.data.user) {
                    localStorage.setItem('currentUser', JSON.stringify(data.data.user));
                    localStorage.setItem('isLoggedIn', 'true');
                    
                    // Determine redirect URL based on user role
                    const user = data.data.user;
                    let redirectUrl;
                    
                    if (user.role === 'client') {
                        redirectUrl = 'HTML/client-dashboard.html';
                        showSuccess('Login successful! Redirecting to client portal...');
                    } else if (user.role === 'admin') {
                        redirectUrl = 'HTML/dashboard.html';
                        showSuccess('Login successful! Redirecting to admin dashboard...');
                    } else {
                        redirectUrl = 'HTML/dashboard.html'; // Default fallback
                        showSuccess('Login successful! Redirecting to dashboard...');
                    }
                    
                    setTimeout(() => {
                        window.location.href = redirectUrl;
                    }, 1500);
                } else {
                    showError('Login successful but user data is missing.');
                }
            } else {
                showError(data.message || 'Invalid username or password. Please try again.');
            }
        })
        .catch(error => {
            showLoading(false);
            console.error('Login error:', error);
            
            // Fallback authentication for development/testing
            if ((username.toLowerCase() === 'quads' && password === 'quads123') || 
                (username.toLowerCase() === 'kristinedais01@gmail.com' && password === 'quads123') ||
                (username.toLowerCase() === 'admin' && password === 'admin123') ||
                (username.toLowerCase() === 'namoc' && password === 'namoc123') ||
                (username.toLowerCase() === 'client_acme' && password === 'client123') ||
                (username.toLowerCase() === 'client_techstart' && password === 'client123')) {
                
                // Create mock user data for fallback
                const mockUser = {
                    id: 1,
                    username: username,
                    email: username.includes('@') ? username : username + '@example.com',
                    role: username.includes('client') ? 'client' : 'admin',
                    full_name: username.charAt(0).toUpperCase() + username.slice(1)
                };
                
                localStorage.setItem('currentUser', JSON.stringify(mockUser));
                localStorage.setItem('isLoggedIn', 'true');
                
                // Role-based redirect for fallback authentication
                let redirectUrl;
                if (mockUser.role === 'client') {
                    redirectUrl = 'HTML/client-dashboard.html';
                    showSuccess('Login successful! Redirecting to client portal...');
                } else {
                    redirectUrl = 'HTML/dashboard.html';
                    showSuccess('Login successful! Redirecting to admin dashboard...');
                }
                
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 1500);
            } else {
                showError('Unable to connect to server. Please check your credentials and try again.');
            }
        });
    }


    // Show/hide loading overlay
    function showLoading(show) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }

    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }

    // Show success message
    function showSuccess(message) {
        successMessage.textContent = message;
        successMessage.style.display = 'block';
        errorMessage.style.display = 'none';
        
        // Auto-hide after 3 seconds (unless it's a redirect message)
        if (!message.includes('Redirecting')) {
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 3000);
        }
    }

    // Hide all messages
    function hideMessages() {
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';
    }

    // Remember me functionality
    const rememberMeCheckbox = document.getElementById('remember_me');
    
    // Load saved credentials if remember me was checked
    if (localStorage.getItem('rememberMe') === 'true') {
        const savedUsername = localStorage.getItem('savedUsername');
        if (savedUsername) {
            usernameInput.value = savedUsername;
            rememberMeCheckbox.checked = true;
        }
    }

    // Save credentials when form is submitted
    loginForm.addEventListener('submit', function() {
        if (rememberMeCheckbox.checked) {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('savedUsername', usernameInput.value);
        } else {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('savedUsername');
        }
    });

    // Input validation and styling
    const inputs = [usernameInput, passwordInput];
    
    inputs.forEach(input => {
        if (input) {
            input.addEventListener('focus', function() {
                this.parentElement.style.borderColor = '#2563eb';
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.style.borderColor = '#d1d5db';
                
                // Validate input
                if (this.hasAttribute('required') && !this.value.trim()) {
                    this.parentElement.style.borderColor = '#ef4444';
                }
            });
            
            input.addEventListener('input', function() {
                // Clear error styling when user starts typing
                this.parentElement.style.borderColor = '#d1d5db';
                hideMessages();
            });
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Escape key to clear form
        if (e.key === 'Escape') {
            usernameInput.value = '';
            passwordInput.value = '';
            hideMessages();
        }
    });

    // Generate CSRF token
    function generateCSRFToken() {
        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
        document.getElementById('csrf_token').value = token;
        return token;
    }

    // Initialize CSRF token
    generateCSRFToken();

    // Refresh CSRF token every 10 minutes
    setInterval(generateCSRFToken, 600000);

    // Load and apply dark mode settings
    function loadDarkModeSettings() {
        const settings = JSON.parse(localStorage.getItem('accountingSettings') || '{}');
        const themeMode = settings.themeMode || 'light';
        
        applyThemeMode(themeMode);
    }

    // Apply theme mode function
    function applyThemeMode(mode) {
        const body = document.body;
        
        // Remove existing theme classes
        body.classList.remove('dark-theme');
        
        if (mode === 'dark') {
            body.classList.add('dark-theme');
        } else if (mode === 'auto') {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                body.classList.add('dark-theme');
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
});
