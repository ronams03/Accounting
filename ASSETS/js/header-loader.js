/**
 * Header Loader - Dynamically loads the modular header component
 * This script should be included in all dashboard pages
 */

(function() {
    'use strict';

    // Function to load header HTML
    function loadHeader() {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', '../ASSETS/header.html', true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve(xhr.responseText);
                    } else {
                        reject(new Error('Failed to load header: ' + xhr.status));
                    }
                }
            };
            xhr.send();
        });
    }

    // Function to inject header into page
    function injectHeader(headerHTML) {
        // Find the dashboard container
        const dashboardContainer = document.querySelector('.dashboard-container');
        if (!dashboardContainer) {
            console.error('Dashboard container not found');
            return;
        }

        // Create a temporary div to parse the header HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = headerHTML;

        // Extract sidebar and header elements
        const sidebar = tempDiv.querySelector('.sidebar');
        const header = tempDiv.querySelector('.header');
        const userMenuDropdown = tempDiv.querySelector('.user-menu-dropdown');
        const script = tempDiv.querySelector('script');

        // Insert sidebar as first child of dashboard container
        if (sidebar) {
            dashboardContainer.insertBefore(sidebar, dashboardContainer.firstChild);
        }

        // Find main content and insert header as first child
        const mainContent = dashboardContainer.querySelector('.main-content');
        if (mainContent && header) {
            mainContent.insertBefore(header, mainContent.firstChild);
        }

        // Add user menu dropdown to body
        if (userMenuDropdown) {
            document.body.appendChild(userMenuDropdown);
        }

        // Execute the header script
        if (script) {
            const newScript = document.createElement('script');
            newScript.textContent = script.textContent;
            document.head.appendChild(newScript);
        }
    }

    // Function to remove existing header elements
    function removeExistingHeader() {
        // Remove existing sidebar
        const existingSidebar = document.querySelector('.sidebar');
        if (existingSidebar) {
            existingSidebar.remove();
        }

        // Remove existing header
        const existingHeader = document.querySelector('.header');
        if (existingHeader) {
            existingHeader.remove();
        }

        // Remove existing user menu dropdown
        const existingDropdown = document.querySelector('.user-menu-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
        }
    }

    // Main initialization function
    function initializeHeader() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeHeader);
            return;
        }

        // Remove existing header elements
        removeExistingHeader();

        // Load and inject header
        loadHeader()
            .then(headerHTML => {
                injectHeader(headerHTML);
                
                // Dispatch custom event to notify that header is loaded
                const headerLoadedEvent = new CustomEvent('headerLoaded', {
                    detail: { message: 'Header has been loaded successfully' }
                });
                document.dispatchEvent(headerLoadedEvent);
            })
            .catch(error => {
                console.error('Error loading header:', error);
                
                // Fallback: show error message
                const dashboardContainer = document.querySelector('.dashboard-container');
                if (dashboardContainer) {
                    const errorDiv = document.createElement('div');
                    errorDiv.style.cssText = 'background: #f8d7da; color: #721c24; padding: 10px; margin: 10px; border-radius: 4px; font-size: 12px;';
                    errorDiv.textContent = 'Failed to load header component. Please refresh the page.';
                    dashboardContainer.insertBefore(errorDiv, dashboardContainer.firstChild);
                }
            });
    }

    // Auto-initialize when script loads
    initializeHeader();

    // Export for manual initialization if needed
    window.HeaderLoader = {
        init: initializeHeader,
        load: loadHeader,
        inject: injectHeader
    };
})();
