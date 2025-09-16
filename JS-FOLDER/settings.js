// Settings JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize settings
    initializeSettings();
    setupEventListeners();
    setupNavigation();
    loadSettings();
    
    // Initialize modern settings functionality
    initializeModernSettings();
    
    // Initialize general sub-navigation
    initializeGeneralSubnav();
    
    // Initialize real-time clock
    initializeRealTimeClock();
    
    // Initialize appearance settings
    initializeAppearanceSettings();
});

function initializeSettings() {
    // Load saved settings from localStorage
    const savedSettings = JSON.parse(localStorage.getItem('accountingSettings') || '{}');
    
    // Apply saved settings
    Object.keys(savedSettings).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            if (element.type === 'checkbox' || element.classList.contains('toggle-switch')) {
                if (savedSettings[key]) {
                    element.classList.add('active');
                } else {
                    element.classList.remove('active');
                }
            } else {
                element.value = savedSettings[key];
            }
        }
    });
}

function setupEventListeners() {
    // Tab switching
    const tabs = document.querySelectorAll('.settings-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Form changes auto-save
    const inputs = document.querySelectorAll('select, input[type="color"]');
    inputs.forEach(input => {
        input.addEventListener('change', function() {
            saveSettingValue(this.id, this.value);
        });
    });
}

function setupNavigation() {
    // Navigation link active state and routing
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav items
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked nav item
            this.parentElement.classList.add('active');
            
            // Handle navigation routing
            const href = this.getAttribute('href');
            handleNavigation(href);
            
            // Update header title
            const headerTitle = document.querySelector('.header h1');
            const linkText = this.querySelector('span').textContent;
            headerTitle.textContent = linkText;
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
            // Already on settings - just show notification
            showNotification('Settings loaded', 'info');
            break;
        default:
            showNotification('Page not found', 'error');
    }
}

function switchTab(tabId) {
    // Remove active class from all tabs and panels
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.settings-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Add active class to selected tab and panel
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(`${tabId}-panel`).classList.add('active');
}

function toggleSetting(settingId) {
    const toggle = document.getElementById(settingId);
    toggle.classList.toggle('active');
    
    const isActive = toggle.classList.contains('active');
    saveSettingValue(settingId, isActive);
    
    // Apply setting immediately
    applySetting(settingId, isActive);
    
    showNotification(`${getSettingName(settingId)} ${isActive ? 'enabled' : 'disabled'}`, 'success');
}

function applySetting(settingId, value) {
    switch(settingId) {
        case 'darkMode':
            if (value) {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.remove('dark-theme');
            }
            break;
        case 'compactMode':
            if (value) {
                document.body.classList.add('compact-mode');
            } else {
                document.body.classList.remove('compact-mode');
            }
            break;
        case 'browserNotifications':
            if (value && 'Notification' in window) {
                Notification.requestPermission();
            }
            break;
    }
}

function getSettingName(settingId) {
    const names = {
        'darkMode': 'Dark Mode',
        'compactMode': 'Compact Mode',
        'emailNotifications': 'Email Notifications',
        'browserNotifications': 'Browser Notifications',
        'soundAlerts': 'Sound Alerts',
        'userActivityAlerts': 'User Activity Alerts',
        'autoBackup': 'Automatic Backup',
        'passwordPolicy': 'Password Policy'
    };
    return names[settingId] || settingId;
}

function saveSettingValue(key, value) {
    const settings = JSON.parse(localStorage.getItem('accountingSettings') || '{}');
    settings[key] = value;
    localStorage.setItem('accountingSettings', JSON.stringify(settings));
}

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('accountingSettings') || '{}');
    
    // Apply loaded settings
    Object.keys(settings).forEach(key => {
        if (typeof settings[key] === 'boolean') {
            applySetting(key, settings[key]);
        }
    });
}

// Settings action functions
function setup2FA() {
    showNotification('2FA setup will be available soon', 'info');
}

function createBackup() {
    showNotification('Creating backup...', 'info');
    
    // Simulate backup process
    setTimeout(() => {
        showNotification('Backup created successfully', 'success');
        
        // Update backup status
        const statusText = document.querySelector('.setting-item .setting-description');
        if (statusText && statusText.textContent.includes('Last backup:')) {
            statusText.textContent = 'Last backup: Just now';
        }
    }, 2000);
}

function checkUpdates() {
    showNotification('Checking for updates...', 'info');
    
    setTimeout(() => {
        showNotification('System is up to date', 'success');
    }, 1500);
}

function clearCache() {
    showNotification('Clearing cache...', 'info');
    
    setTimeout(() => {
        showNotification('Cache cleared successfully', 'success');
    }, 1000);
}

function exportData() {
    showNotification('Preparing data export...', 'info');
    
    setTimeout(() => {
        // Create a dummy download
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,Sample Export Data');
        element.setAttribute('download', 'accounting_data_export.txt');
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        
        showNotification('Data exported successfully', 'success');
    }, 2000);
}

function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
        localStorage.removeItem('accountingSettings');
        showNotification('Settings reset to default', 'success');
        
        setTimeout(() => {
            location.reload();
        }, 1000);
    }
}

function saveAllSettings() {
    const settings = {};
    
    // Collect all form values
    const inputs = document.querySelectorAll('select, input[type="color"]');
    inputs.forEach(input => {
        settings[input.id] = input.value;
    });
    
    // Collect toggle states
    const toggles = document.querySelectorAll('.toggle-switch');
    toggles.forEach(toggle => {
        settings[toggle.id] = toggle.classList.contains('active');
    });
    
    // Save to localStorage
    localStorage.setItem('accountingSettings', JSON.stringify(settings));
    
    showNotification('All settings saved successfully', 'success');
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 100);

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

// Page transition function
function showPageTransition(route) {
    const transitionData = getTransitionData(route);
    
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
    
    // Add transition styles
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        visibility: hidden;
        transition: all 0.4s ease;
    `;
    
    overlay.querySelector('.page-transition-content').style.cssText = `
        text-align: center;
        color: #2c3e50;
    `;
    
    overlay.querySelector('.page-transition-icon').style.cssText = `
        font-size: 48px;
        margin-bottom: 16px;
        color: #007bff;
    `;
    
    overlay.querySelector('.page-transition-text').style.cssText = `
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 8px;
    `;
    
    overlay.querySelector('.page-transition-subtext').style.cssText = `
        font-size: 14px;
        color: #6c757d;
    `;
    
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        overlay.style.opacity = '1';
        overlay.style.visibility = 'visible';
    }, 10);
    
    setTimeout(() => {
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
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

// Modern Settings Functions
function initializeModernSettings() {
    // Load saved settings
    loadModernSettings();
    
    // Setup event listeners for all modern controls
    setupModernEventListeners();
    
    // Initialize interval buttons
    initializeIntervalButtons();
    
    // Initialize number selectors
    initializeNumberSelectors();
    
    // Initialize quick option buttons
    initializeQuickOptions();
    
    // Update overview cards
    updateOverviewCards();
    
    // Handle toggle dependencies
    initializeToggleDependencies();
}

function loadModernSettings() {
    const settings = getSettings();
    
    // Load select values
    const selects = document.querySelectorAll('.modern-select');
    selects.forEach(select => {
        if (settings[select.id]) {
            select.value = settings[select.id];
        }
    });
    
    // Load radio values
    const radios = document.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
        if (settings[radio.name] === radio.value) {
            radio.checked = true;
        }
    });
    
    // Load toggle values
    const toggles = document.querySelectorAll('.toggle-label input[type="checkbox"]');
    toggles.forEach(toggle => {
        if (settings[toggle.id] !== undefined) {
            toggle.checked = settings[toggle.id];
        }
    });
    
    // Load number inputs
    const numbers = document.querySelectorAll('.number-selector input');
    numbers.forEach(input => {
        if (settings[input.id]) {
            input.value = settings[input.id];
        }
    });
}

function setupModernEventListeners() {
    // Modern select listeners
    const selects = document.querySelectorAll('.modern-select');
    selects.forEach(select => {
        select.addEventListener('change', function() {
            saveModernSetting(this.id, this.value);
            applyModernSettings();
            showNotification('Setting updated successfully', 'success');
        });
    });
    
    // Radio button listeners
    const radios = document.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                saveModernSetting(this.name, this.value);
                applyModernSettings();
                showNotification('Setting updated successfully', 'success');
            }
        });
    });
    
    // Toggle switch listeners
    const toggles = document.querySelectorAll('.toggle-label input[type="checkbox"]');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            saveModernSetting(this.id, this.checked);
            applyModernSettings();
            showNotification('Setting updated successfully', 'success');
            
            // Handle dependent settings
            handleToggleDependencies(this);
        });
    });
    
    // Number input listeners
    const numbers = document.querySelectorAll('.number-selector input');
    numbers.forEach(input => {
        input.addEventListener('change', function() {
            const value = parseInt(this.value) || 0;
            this.value = Math.max(0, value);
            saveModernSetting(this.id, this.value);
            applyModernSettings();
            showNotification('Setting updated successfully', 'success');
        });
    });
}

function initializeIntervalButtons() {
    const intervalGroups = document.querySelectorAll('.interval-buttons');
    intervalGroups.forEach(group => {
        const buttons = group.querySelectorAll('.interval-btn');
        const settingName = group.dataset.setting || 'backupInterval';
        
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                buttons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                saveModernSetting(settingName, this.textContent);
                applyModernSettings();
                showNotification('Interval updated successfully', 'success');
            });
        });
        
        // Load saved interval
        const settings = getSettings();
        if (settings[settingName]) {
            buttons.forEach(btn => {
                if (btn.textContent === settings[settingName]) {
                    btn.classList.add('active');
                }
            });
        } else if (buttons.length > 0) {
            buttons[0].classList.add('active');
        }
    });
}

function initializeNumberSelectors() {
    const numberGroups = document.querySelectorAll('.number-selector');
    numberGroups.forEach(group => {
        const input = group.querySelector('input');
        const decreaseBtn = group.querySelector('.number-btn:first-child');
        const increaseBtn = group.querySelector('.number-btn:last-child');
        
        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', function() {
                const currentValue = parseInt(input.value) || 0;
                const newValue = Math.max(0, currentValue - 1);
                input.value = newValue;
                saveModernSetting(input.id, newValue);
                applyModernSettings();
                showNotification('Setting updated successfully', 'success');
            });
        }
        
        if (increaseBtn) {
            increaseBtn.addEventListener('click', function() {
                const currentValue = parseInt(input.value) || 0;
                const newValue = currentValue + 1;
                input.value = newValue;
                saveModernSetting(input.id, newValue);
                applyModernSettings();
                showNotification('Setting updated successfully', 'success');
            });
        }
    });
}

function initializeQuickOptions() {
    const quickGroups = document.querySelectorAll('.quick-options');
    quickGroups.forEach(group => {
        const buttons = group.querySelectorAll('.quick-btn');
        const settingName = group.dataset.setting;
        
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                buttons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                const relatedInput = group.parentElement.querySelector('input');
                if (relatedInput) {
                    relatedInput.value = this.dataset.value || this.textContent;
                }
                
                if (settingName) {
                    saveModernSetting(settingName, this.dataset.value || this.textContent);
                    applyModernSettings();
                    showNotification('Setting updated successfully', 'success');
                }
            });
        });
    });
}

function initializeToggleDependencies() {
    const toggles = document.querySelectorAll('.toggle-label input[type="checkbox"]');
    toggles.forEach(toggle => {
        handleToggleDependencies(toggle);
    });
}

function handleToggleDependencies(toggle) {
    if (toggle.id === 'autoBackup') {
        const intervalSelector = document.querySelector('.interval-buttons[data-setting="backupInterval"]')?.closest('.interval-selector');
        if (intervalSelector) {
            intervalSelector.style.display = toggle.checked ? 'block' : 'none';
        }
    }
    
    if (toggle.id === 'sessionTimeout') {
        const timeoutInput = document.getElementById('sessionTimeoutMinutes')?.closest('.number-input-group');
        if (timeoutInput) {
            timeoutInput.style.display = toggle.checked ? 'block' : 'none';
        }
    }
    
    if (toggle.id === 'dataRetention') {
        const retentionInput = document.getElementById('retentionMonths')?.closest('.number-input-group');
        if (retentionInput) {
            retentionInput.style.display = toggle.checked ? 'block' : 'none';
        }
    }
}

function updateOverviewCards() {
    const settings = getSettings();
    
    // Update overview cards
    const statusCards = document.querySelectorAll('.overview-card');
    statusCards.forEach(card => {
        const title = card.querySelector('.card-title')?.textContent;
        const valueElement = card.querySelector('.card-value');
        
        if (!valueElement) return;
        
        switch (title) {
            case 'System Language':
                valueElement.textContent = getLanguageDisplay(settings.language || 'en');
                break;
            case 'Current Time':
                // Time is updated by the real-time clock function
                break;
            case 'Default Currency':
                valueElement.textContent = getCurrencyDisplay(settings.currency || 'USD');
                break;
            case 'Auto-save':
                const autosaveInterval = settings.autosaveInterval || 60;
                if (autosaveInterval < 60) {
                    valueElement.textContent = `Every ${autosaveInterval}s`;
                } else {
                    valueElement.textContent = `Every ${Math.floor(autosaveInterval / 60)}m`;
                }
                break;
        }
    });
}

function getSettings() {
    return JSON.parse(localStorage.getItem('accountingSettings') || '{}');
}

function saveModernSetting(key, value) {
    const settings = getSettings();
    settings[key] = value;
    localStorage.setItem('accountingSettings', JSON.stringify(settings));
}

function applyModernSettings() {
    const settings = getSettings();
    
    // Apply theme
    if (settings.theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
    
    // Apply language
    if (settings.language) {
        document.documentElement.lang = settings.language;
    }
    
    // Apply timezone
    if (settings.timezone) {
        console.log('Timezone set to:', settings.timezone);
    }
    
    // Apply currency
    if (settings.currency) {
        console.log('Currency set to:', settings.currency);
    }
    
    // Apply date format
    if (settings.dateFormat) {
        console.log('Date format set to:', settings.dateFormat);
    }
    
    // Update last backup time if auto backup is enabled
    if (settings.autoBackup && settings.backupInterval) {
        settings.lastBackup = new Date().toLocaleString();
        localStorage.setItem('accountingSettings', JSON.stringify(settings));
        updateOverviewCards();
    }
}

// General Sub-navigation Functions
function initializeGeneralSubnav() {
    const subnavButtons = document.querySelectorAll('.general-subnav-btn');
    
    subnavButtons.forEach(button => {
        button.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            switchGeneralSection(sectionId);
            
            // Update active button
            subnavButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            showNotification(`Switched to ${this.querySelector('span').textContent}`, 'info');
        });
    });
}

function switchGeneralSection(sectionId) {
    // Hide all general sections
    const sections = document.querySelectorAll('.general-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// Real-time Clock Functions
function initializeRealTimeClock() {
    updateCurrentTime();
    // Update every second
    setInterval(updateCurrentTime, 1000);
}

function updateCurrentTime() {
    const currentTimeElement = document.getElementById('currentTime');
    if (currentTimeElement) {
        const settings = getSettings();
        const timezone = settings.timezone || 'UTC+8';
        const dateFormat = settings.dateFormat || 'MM/DD/YYYY';
        
        // Get current time based on timezone setting
        const now = getCurrentTimeByTimezone(timezone);
        
        // Format time display
        const timeString = formatTimeDisplay(now, dateFormat);
        currentTimeElement.textContent = timeString;
    }
}

function getCurrentTimeByTimezone(timezone) {
    const now = new Date();
    
    // Parse timezone offset
    let offsetHours = 0;
    if (timezone.includes('UTC')) {
        const offsetStr = timezone.replace('UTC', '');
        if (offsetStr) {
            offsetHours = parseInt(offsetStr);
        }
    }
    
    // Calculate time with timezone offset
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const targetTime = new Date(utc + (offsetHours * 3600000));
    
    return targetTime;
}

function formatTimeDisplay(date, dateFormat) {
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    
    const timeString = date.toLocaleTimeString('en-US', options);
    
    // Format date part based on user preference
    let dateString = '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    switch (dateFormat) {
        case 'DD/MM/YYYY':
            dateString = `${day}/${month}/${year}`;
            break;
        case 'YYYY-MM-DD':
            dateString = `${year}-${month}-${day}`;
            break;
        default: // MM/DD/YYYY
            dateString = `${month}/${day}/${year}`;
    }
    
    return `${timeString}`;
}

// Update time when timezone or date format changes
function updateLanguage(language) {
    saveModernSetting('language', language);
    document.getElementById('currentLanguage').textContent = getLanguageDisplay(language);
    applyModernSettings();
    showNotification('Language updated successfully', 'success');
}

function updateTimezone(timezone) {
    saveModernSetting('timezone', timezone);
    applyModernSettings();
    updateCurrentTime(); // Immediately update time display
    showNotification('Timezone updated successfully', 'success');
}

function updateDateFormat(format) {
    saveModernSetting('dateFormat', format);
    applyModernSettings();
    updateCurrentTime(); // Immediately update time display
    showNotification('Date format updated successfully', 'success');
}

function updateCurrency(currency) {
    saveModernSetting('currency', currency);
    document.getElementById('currentCurrency').textContent = getCurrencyDisplay(currency);
    applyModernSettings();
    showNotification('Currency updated successfully', 'success');
}

function getLanguageDisplay(langCode) {
    const languages = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'zh': 'Chinese',
        'ja': 'Japanese'
    };
    return languages[langCode] || 'English';
}

function getCurrencyDisplay(currencyCode) {
    const currencies = {
        'USD': 'USD ($)',
        'EUR': 'EUR (€)',
        'GBP': 'GBP (£)',
        'JPY': 'JPY (¥)',
        'PHP': 'PHP (₱)',
        'CNY': 'CNY (¥)',
        'CAD': 'CAD (C$)',
        'AUD': 'AUD (A$)'
    };
    return currencies[currencyCode] || 'USD ($)';
}

// Appearance Settings Functions
function updateThemeMode(mode) {
    saveModernSetting('themeMode', mode);
    applyThemeMode(mode);
    updateThemePreview();
    showNotification(`Theme mode set to ${mode}`, 'success');
}

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
    } else if (mode === 'light') {
        // Already removed above
    } else if (mode === 'auto') {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            body.classList.add('dark-theme');
            if (dashboardContainer) dashboardContainer.classList.add('dark-theme');
            if (mainContent) mainContent.classList.add('dark-theme');
        }
    }
    
    // Force update all elements with dark theme class
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
        if (mode === 'dark' || (mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            element.classList.add('dark-theme-element');
        } else {
            element.classList.remove('dark-theme-element');
        }
    });
}

function selectPrimaryColor(color) {
    // Update color palette selection
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.classList.remove('active');
        if (option.dataset.color === color) {
            option.classList.add('active');
        }
    });
    
    // Update custom color picker
    const customPicker = document.getElementById('customPrimaryColor');
    if (customPicker) {
        customPicker.value = color;
    }
    
    // Apply color
    document.documentElement.style.setProperty('--primary-color', color);
    saveModernSetting('primaryColor', color);
    updateThemePreview();
    showNotification('Primary color updated', 'success');
}

function toggleCompactMode(enabled) {
    const body = document.body;
    if (enabled) {
        body.classList.add('compact-mode');
    } else {
        body.classList.remove('compact-mode');
    }
    saveModernSetting('compactMode', enabled);
    updateThemePreview();
    showNotification(`Compact mode ${enabled ? 'enabled' : 'disabled'}`, 'success');
}

function toggleReducedAnimations(enabled) {
    const body = document.body;
    if (enabled) {
        body.classList.add('reduced-animations');
    } else {
        body.classList.remove('reduced-animations');
    }
    saveModernSetting('reducedAnimations', enabled);
    showNotification(`Animations ${enabled ? 'reduced' : 'restored'}`, 'success');
}

function selectFontSize(size) {
    // Update font size selection
    const fontOptions = document.querySelectorAll('.font-size-option');
    fontOptions.forEach(option => {
        option.classList.remove('active');
        if (parseInt(option.dataset.size) === size) {
            option.classList.add('active');
        }
    });
    
    // Apply font size
    document.documentElement.style.setProperty('--base-font-size', size + 'px');
    document.body.style.fontSize = size + 'px';
    saveModernSetting('fontSize', size);
    updateThemePreview();
    showNotification(`Font size set to ${size}px`, 'success');
}

function updateFontFamily(family) {
    const body = document.body;
    
    // Remove existing font classes
    body.classList.remove('font-inter', 'font-roboto', 'font-opensans', 'font-lato', 'font-sourcesans');
    
    // Apply new font family
    if (family !== 'system') {
        body.classList.add(`font-${family}`);
    }
    
    saveModernSetting('fontFamily', family);
    updateThemePreview();
    showNotification('Font family updated', 'success');
}

function changeSidebarWidth(delta) {
    const input = document.getElementById('sidebarWidth');
    const currentWidth = parseInt(input.value) || 250;
    const newWidth = Math.max(200, Math.min(350, currentWidth + delta));
    input.value = newWidth;
    updateSidebarWidth(newWidth);
}

function updateSidebarWidth(width) {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.style.width = width + 'px';
    }
    
    // Update main content margin
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.marginLeft = width + 'px';
    }
    
    saveModernSetting('sidebarWidth', width);
    updateThemePreview();
    showNotification(`Sidebar width set to ${width}px`, 'success');
}

function toggleCollapsibleSidebar(enabled) {
    saveModernSetting('collapsibleSidebar', enabled);
    showNotification(`Collapsible sidebar ${enabled ? 'enabled' : 'disabled'}`, 'success');
}

function toggleSidebarIcons(enabled) {
    const navIcons = document.querySelectorAll('.nav-link i');
    navIcons.forEach(icon => {
        icon.style.display = enabled ? 'inline-block' : 'none';
    });
    
    saveModernSetting('sidebarIcons', enabled);
    updateThemePreview();
    showNotification(`Navigation icons ${enabled ? 'shown' : 'hidden'}`, 'success');
}

function updateContentLayout(layout) {
    const body = document.body;
    
    if (layout === 'boxed') {
        body.classList.add('boxed-layout');
    } else {
        body.classList.remove('boxed-layout');
    }
    
    saveModernSetting('contentLayout', layout);
    updateThemePreview();
    showNotification(`Content layout set to ${layout}`, 'success');
}

function updateThemePreview() {
    const preview = document.getElementById('themePreview');
    if (!preview) return;
    
    const settings = getSettings();
    
    // Update preview colors
    const primaryColor = settings.primaryColor || '#007bff';
    const previewHeader = preview.querySelector('.preview-header');
    const previewNavActive = preview.querySelector('.preview-nav-item.active');
    
    if (previewHeader) {
        previewHeader.style.background = primaryColor;
    }
    
    if (previewNavActive) {
        previewNavActive.style.background = primaryColor;
    }
    
    // Update preview theme
    const themeMode = settings.themeMode || 'light';
    if (themeMode === 'dark' || (themeMode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        preview.classList.add('dark-theme');
    } else {
        preview.classList.remove('dark-theme');
    }
    
    // Update preview font size
    const fontSize = settings.fontSize || 12;
    preview.style.fontSize = (fontSize * 0.8) + 'px'; // Scale down for preview
}

function initializeAppearanceSettings() {
    const settings = getSettings();
    
    // Apply saved theme mode
    if (settings.themeMode) {
        applyThemeMode(settings.themeMode);
        const themeRadio = document.querySelector(`input[name="themeMode"][value="${settings.themeMode}"]`);
        if (themeRadio) {
            themeRadio.checked = true;
        }
    }
    
    // Apply saved primary color
    if (settings.primaryColor) {
        selectPrimaryColor(settings.primaryColor);
    }
    
    // Apply saved compact mode
    if (settings.compactMode) {
        toggleCompactMode(settings.compactMode);
        const compactToggle = document.getElementById('compactMode');
        if (compactToggle) {
            compactToggle.checked = settings.compactMode;
        }
    }
    
    // Apply saved reduced animations
    if (settings.reducedAnimations) {
        toggleReducedAnimations(settings.reducedAnimations);
        const animationsToggle = document.getElementById('reducedAnimations');
        if (animationsToggle) {
            animationsToggle.checked = settings.reducedAnimations;
        }
    }
    
    // Apply saved font size
    if (settings.fontSize) {
        selectFontSize(settings.fontSize);
    }
    
    // Apply saved font family
    if (settings.fontFamily) {
        updateFontFamily(settings.fontFamily);
        const fontSelect = document.getElementById('fontFamily');
        if (fontSelect) {
            fontSelect.value = settings.fontFamily;
        }
    }
    
    // Apply saved sidebar width
    if (settings.sidebarWidth) {
        updateSidebarWidth(settings.sidebarWidth);
        const sidebarInput = document.getElementById('sidebarWidth');
        if (sidebarInput) {
            sidebarInput.value = settings.sidebarWidth;
        }
    }
    
    // Apply saved sidebar settings
    if (settings.collapsibleSidebar !== undefined) {
        const collapsibleToggle = document.getElementById('collapsibleSidebar');
        if (collapsibleToggle) {
            collapsibleToggle.checked = settings.collapsibleSidebar;
        }
    }
    
    if (settings.sidebarIcons !== undefined) {
        toggleSidebarIcons(settings.sidebarIcons);
        const iconsToggle = document.getElementById('sidebarIcons');
        if (iconsToggle) {
            iconsToggle.checked = settings.sidebarIcons;
        }
    }
    
    // Apply saved content layout
    if (settings.contentLayout) {
        updateContentLayout(settings.contentLayout);
        const layoutRadio = document.querySelector(`input[name="contentLayout"][value="${settings.contentLayout}"]`);
        if (layoutRadio) {
            layoutRadio.checked = true;
        }
    }
    
    // Initialize theme preview
    updateThemePreview();
    
    // Listen for system theme changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
            const settings = getSettings();
            if (settings.themeMode === 'auto') {
                applyThemeMode('auto');
                updateThemePreview();
            }
        });
    }
}
