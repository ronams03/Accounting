// Client Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication and role
    checkClientAuthentication();
    
    // Initialize client dashboard
    initializeClientDashboard();
});

// Check if user is authenticated and has client role
function checkClientAuthentication() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUser = localStorage.getItem('currentUser');
    
    if (!isLoggedIn || !currentUser) {
        // Redirect to login page
        window.location.href = '../login.html';
        return false;
    }
    
    try {
        const user = JSON.parse(currentUser);
        
        // Check if user has client role
        if (user.role !== 'client') {
            // Redirect non-clients to appropriate dashboard
            if (user.role === 'admin') {
                window.location.href = 'dashboard.html';
            } else {
                window.location.href = '../login.html';
            }
            return false;
        }
        
        // Update client info
        updateClientInfo(user);
        
    } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        window.location.href = '../login.html';
        return false;
    }
    
    return true;
}

// Update client information in the dashboard
function updateClientInfo(user) {
    const clientNameElement = document.getElementById('clientName');
    const clientAvatarElement = document.getElementById('clientAvatar');
    
    if (clientNameElement) {
        clientNameElement.textContent = user.full_name || user.username || 'Client';
    }
    
    if (clientAvatarElement) {
        const initials = (user.full_name || user.username || 'C').charAt(0).toUpperCase();
        clientAvatarElement.textContent = initials;
    }
}

// Initialize client dashboard functionality
function initializeClientDashboard() {
    // Load client-specific data
    loadClientStats();
    
    // Set up periodic data refresh
    setInterval(loadClientStats, 300000); // Refresh every 5 minutes
}

// Load client statistics
function loadClientStats() {
    // In a real application, this would fetch data from the API
    // For now, we'll use sample data that varies based on the client
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const clientData = getClientData(currentUser.username);
    
    // Update statistics
    document.getElementById('activeInvoices').textContent = clientData.activeInvoices;
    document.getElementById('pendingTasks').textContent = clientData.pendingTasks;
    document.getElementById('monthlyReports').textContent = clientData.monthlyReports;
}

// Get client-specific data
function getClientData(username) {
    const clientDataMap = {
        'client_acme': {
            activeInvoices: 3,
            pendingTasks: 2,
            monthlyReports: 1
        },
        'client_techstart': {
            activeInvoices: 5,
            pendingTasks: 1,
            monthlyReports: 2
        },
        'client_globalltd': {
            activeInvoices: 2,
            pendingTasks: 3,
            monthlyReports: 1
        },
        'client_innovate': {
            activeInvoices: 4,
            pendingTasks: 2,
            monthlyReports: 3
        },
        'client_retail': {
            activeInvoices: 1,
            pendingTasks: 1,
            monthlyReports: 1
        }
    };
    
    return clientDataMap[username] || {
        activeInvoices: 2,
        pendingTasks: 1,
        monthlyReports: 1
    };
}

// Client action functions
window.viewInvoice = function(invoiceId) {
    showNotification(`Viewing invoice ${invoiceId}`, 'info');
    // In a real application, this would open the invoice details
};

window.uploadDocuments = function() {
    showNotification('Document upload feature coming soon', 'info');
    // In a real application, this would open a file upload dialog
};

window.viewReport = function() {
    showNotification('Opening report viewer', 'info');
    // In a real application, this would show the report
};

window.requestService = function() {
    showNotification('Service request form coming soon', 'info');
    // In a real application, this would open a service request form
};

window.scheduleAppointment = function() {
    showNotification('Appointment scheduling coming soon', 'info');
    // In a real application, this would open a calendar/scheduling interface
};

window.contactSupport = function() {
    showNotification('Support contact form coming soon', 'info');
    // In a real application, this would open a support ticket system
};

window.downloadReports = function() {
    showNotification('Report download feature coming soon', 'info');
    // In a real application, this would allow downloading reports
};

// Logout functionality
window.logout = function() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear authentication data
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userSession');
        sessionStorage.clear();
        
        // Make API call to logout (if server is available)
        fetch('../PHP-FOLDER-API/auth.php?action=logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        }).catch(error => {
            console.log('Logout API call failed, but local logout completed');
        });
        
        // Redirect to login page
        window.location.href = '../login.html';
    }
};

// Navigation functions
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update navigation active state
    const navItems = document.querySelectorAll('.client-nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    const activeNavItem = document.querySelector(`[onclick="showSection('${sectionName}')"]`).closest('.client-nav-item');
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
    
    // Load section-specific data
    switch(sectionName) {
        case 'invoices':
            loadInvoices();
            break;
        case 'tasks':
            loadTasks();
            break;
        case 'documents':
            loadDocuments();
            break;
        case 'reports':
            loadReports();
            break;
        case 'appointments':
            loadAppointments();
            break;
        case 'support':
            loadSupport();
            break;
    }
}

// Invoices functionality
let allInvoices = [];

function loadInvoices() {
    fetch('../PHP-FOLDER-API/invoices.php?action=list')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                allInvoices = data.data;
                displayInvoices(allInvoices);
            } else {
                console.error('Error loading invoices:', data.message);
                // Fallback to sample data
                loadSampleInvoices();
            }
        })
        .catch(error => {
            console.error('Error fetching invoices:', error);
            loadSampleInvoices();
        });
}

function loadSampleInvoices() {
    allInvoices = [
        { 
            invoice_id: 1,
            invoice_number: 'INV-2024-001', 
            total_amount: 2750.00, 
            status: 'Pending', 
            due_date: '2024-12-30',
            created_date: '2024-12-01',
            description: 'Monthly Accounting Services - November 2024'
        },
        { 
            invoice_id: 2,
            invoice_number: 'INV-2024-002', 
            total_amount: 1980.00, 
            status: 'Paid', 
            due_date: '2024-11-30',
            created_date: '2024-11-01',
            description: 'Tax Preparation Services Q3 2024'
        },
        { 
            invoice_id: 3,
            invoice_number: 'INV-2024-003', 
            total_amount: 3520.00, 
            status: 'Overdue', 
            due_date: '2024-10-15',
            created_date: '2024-09-15',
            description: 'Annual Financial Audit Services'
        }
    ];
    displayInvoices(allInvoices);
}

function displayInvoices(invoices) {
    const invoicesList = document.getElementById('invoicesList');
    
    if (!invoices || invoices.length === 0) {
        invoicesList.innerHTML = '<div class="no-invoices">No invoices found</div>';
        return;
    }
    
    invoicesList.innerHTML = invoices.map(invoice => `
        <div class="invoice-item">
            <div class="invoice-left">
                <div class="invoice-number">${invoice.invoice_number}</div>
                <div class="invoice-description">${invoice.description || 'No description'}</div>
                <div class="invoice-date">Date: ${formatDate(invoice.created_date)}</div>
            </div>
            <div class="invoice-right">
                <span class="status-badge status-${invoice.status.toLowerCase()}">${invoice.status.toUpperCase()}</span>
                <div class="invoice-amount">$${parseFloat(invoice.total_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
            </div>
        </div>
    `).join('');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function filterInvoicesByStatus() {
    const statusFilter = document.getElementById('invoiceStatusFilter').value;
    const dateFilter = document.getElementById('invoiceDateFilter').value;
    
    let filteredInvoices = allInvoices;
    
    // Apply status filter
    if (statusFilter !== 'all') {
        filteredInvoices = filteredInvoices.filter(invoice => 
            invoice.status.toLowerCase() === statusFilter.toLowerCase()
        );
    }
    
    // Apply date filter
    if (dateFilter) {
        filteredInvoices = filteredInvoices.filter(invoice => {
            const invoiceDate = new Date(invoice.created_date);
            const filterDate = new Date(dateFilter);
            return invoiceDate.toDateString() === filterDate.toDateString();
        });
    }
    
    displayInvoices(filteredInvoices);
}

function filterInvoicesByDate() {
    filterInvoicesByStatus(); // Reuse the same filtering logic
}

function viewInvoice(invoiceId) {
    const invoice = allInvoices.find(inv => inv.invoice_id === invoiceId);
    if (!invoice) {
        showNotification('Invoice not found', 'error');
        return;
    }
    
    // Create invoice modal
    const modal = document.createElement('div');
    modal.className = 'invoice-modal';
    modal.innerHTML = `
        <div class="invoice-modal-content">
            <div class="invoice-modal-header">
                <h3>Invoice Details - ${invoice.invoice_number}</h3>
                <button class="close-modal" onclick="closeInvoiceModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="invoice-modal-body">
                <div class="invoice-detail-row">
                    <span class="label">Invoice Number:</span>
                    <span class="value">${invoice.invoice_number}</span>
                </div>
                <div class="invoice-detail-row">
                    <span class="label">Status:</span>
                    <span class="value">
                        <span class="status-badge status-${invoice.status.toLowerCase()}">${invoice.status}</span>
                    </span>
                </div>
                <div class="invoice-detail-row">
                    <span class="label">Amount:</span>
                    <span class="value">$${parseFloat(invoice.total_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </div>
                <div class="invoice-detail-row">
                    <span class="label">Due Date:</span>
                    <span class="value">${formatDate(invoice.due_date)}</span>
                </div>
                <div class="invoice-detail-row">
                    <span class="label">Created:</span>
                    <span class="value">${formatDate(invoice.created_date)}</span>
                </div>
                <div class="invoice-detail-row">
                    <span class="label">Description:</span>
                    <span class="value">${invoice.description || 'No description'}</span>
                </div>
            </div>
            <div class="invoice-modal-actions">
                <button class="invoice-btn secondary" onclick="downloadInvoice(${invoice.invoice_id})">
                    <i class="fas fa-download"></i> Download PDF
                </button>
                ${invoice.status === 'Pending' || invoice.status === 'Overdue' ? 
                    `<button class="invoice-btn success" onclick="payInvoice(${invoice.invoice_id})">
                        <i class="fas fa-credit-card"></i> Pay Now
                    </button>` : ''}
                <button class="invoice-btn primary" onclick="closeInvoiceModal()">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function closeInvoiceModal() {
    const modal = document.querySelector('.invoice-modal');
    if (modal) {
        modal.remove();
    }
}

function downloadInvoice(invoiceId) {
    showNotification('Downloading invoice PDF...');
    // In a real implementation, this would generate and download a PDF
    setTimeout(() => {
        showNotification('Invoice downloaded successfully!');
    }, 1000);
}

function payInvoice(invoiceId) {
    if (confirm('Are you sure you want to mark this invoice as paid?')) {
        fetch('../PHP-FOLDER-API/invoices.php?action=pay', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ invoice_id: invoiceId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('Invoice marked as paid successfully!');
                loadInvoices(); // Refresh the list
                closeInvoiceModal();
            } else {
                showNotification('Error processing payment: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error processing payment', 'error');
        });
    }
}

function downloadAllInvoices() {
    showNotification('Preparing invoice downloads...');
    
    // Get current filtered invoices or all invoices
    const statusFilter = document.getElementById('invoiceStatusFilter').value;
    const dateFilter = document.getElementById('invoiceDateFilter').value;
    
    let invoicesToDownload = allInvoices;
    
    // Apply current filters
    if (statusFilter !== 'all') {
        invoicesToDownload = invoicesToDownload.filter(invoice => 
            invoice.status.toLowerCase() === statusFilter.toLowerCase()
        );
    }
    
    if (dateFilter) {
        invoicesToDownload = invoicesToDownload.filter(invoice => {
            const invoiceDate = new Date(invoice.created_date);
            const filterDate = new Date(dateFilter);
            return invoiceDate.toDateString() === filterDate.toDateString();
        });
    }
    
    if (invoicesToDownload.length === 0) {
        showNotification('No invoices to download', 'error');
        return;
    }
    
    // Create and download a summary file
    const csvContent = generateInvoiceCSV(invoicesToDownload);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `invoices_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification(`Successfully downloaded ${invoicesToDownload.length} invoice(s) as CSV`);
    } else {
        showNotification('Download not supported in this browser', 'error');
    }
}

function generateInvoiceCSV(invoices) {
    const headers = ['Invoice Number', 'Description', 'Amount', 'Status', 'Due Date', 'Created Date'];
    const csvRows = [headers.join(',')];
    
    invoices.forEach(invoice => {
        const row = [
            `"${invoice.invoice_number}"`,
            `"${invoice.description || 'No description'}"`,
            `"$${parseFloat(invoice.total_amount).toFixed(2)}"`,
            `"${invoice.status}"`,
            `"${formatDate(invoice.due_date)}"`,
            `"${formatDate(invoice.created_date)}"`
        ];
        csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
}

// Tasks functionality
let allTasks = [];
let currentTaskId = null;

function loadTasks() {
    // Load tasks from localStorage or use sample data
    const savedTasks = localStorage.getItem('clientTasks');
    if (savedTasks) {
        allTasks = JSON.parse(savedTasks);
    } else {
        allTasks = [
            { 
                id: 1, 
                title: 'Submit Q4 Financial Documents', 
                description: 'Prepare and submit all Q4 financial documents including profit/loss statements and balance sheets',
                priority: 'high', 
                status: 'pending', 
                dueDate: '2024-12-20',
                createdDate: '2024-12-01',
                assignedClient: 'client_acme',
                clientName: 'ACME Corporation',
                category: 'accounting',
                checklist: [
                    { id: 1, text: 'Gather all receipts and invoices', completed: true },
                    { id: 2, text: 'Prepare profit/loss statement', completed: false },
                    { id: 3, text: 'Create balance sheet', completed: false },
                    { id: 4, text: 'Review and submit documents', completed: false }
                ]
            },
            { 
                id: 2, 
                title: 'Review Monthly Expenses', 
                description: 'Analyze and categorize monthly business expenses for tax optimization',
                priority: 'medium', 
                status: 'in-progress', 
                dueDate: '2024-12-18',
                createdDate: '2024-12-05',
                assignedClient: 'client_techstart',
                clientName: 'TechStart Inc.',
                category: 'tax',
                checklist: [
                    { id: 1, text: 'Download bank statements', completed: true },
                    { id: 2, text: 'Categorize expenses', completed: true },
                    { id: 3, text: 'Identify tax deductions', completed: false }
                ]
            },
            { 
                id: 3, 
                title: 'Update Business Information', 
                description: 'Update client business registration and contact information',
                priority: 'low', 
                status: 'completed', 
                dueDate: '2024-12-10',
                createdDate: '2024-11-28',
                assignedClient: 'client_globalltd',
                clientName: 'Global Ltd.',
                category: 'general',
                checklist: [
                    { id: 1, text: 'Verify business address', completed: true },
                    { id: 2, text: 'Update contact information', completed: true },
                    { id: 3, text: 'Submit changes to registry', completed: true }
                ]
            }
        ];
        saveTasks();
    }
    
    displayTasks(allTasks);
}

function displayTasks(tasks) {
    const tasksList = document.getElementById('tasksList');
    
    if (!tasks || tasks.length === 0) {
        tasksList.innerHTML = '<div class="no-tasks" style="text-align: center; padding: 3rem; color: #64748b;">No tasks found</div>';
        return;
    }
    
    tasksList.innerHTML = tasks.map(task => {
        const completedItems = task.checklist ? task.checklist.filter(item => item.completed).length : 0;
        const totalItems = task.checklist ? task.checklist.length : 0;
        const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
        
        return `
            <div class="task-item" onclick="viewTaskDetails(${task.id})">
                <div class="task-header">
                    <div>
                        <div class="task-title">${task.title}</div>
                        <div class="task-description">${task.description || 'No description'}</div>
                    </div>
                    <span class="priority-badge priority-${task.priority}">${task.priority.toUpperCase()}</span>
                </div>
                <div class="task-meta">
                    <span class="task-client">${task.clientName}</span>
                    <span>Due: ${formatDate(task.dueDate)}</span>
                    <span class="status-badge status-${task.status}">${task.status.replace('-', ' ').toUpperCase()}</span>
                </div>
                ${totalItems > 0 ? `
                    <div class="task-progress">
                        <div class="task-progress-bar">
                            <div class="task-progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="task-progress-text">${completedItems}/${totalItems} items completed</div>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function filterTasks() {
    const statusFilter = document.getElementById('taskStatus').value;
    const priorityFilter = document.getElementById('taskPriority').value;
    
    let filteredTasks = allTasks;
    
    // Apply status filter
    if (statusFilter !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
    }
    
    displayTasks(filteredTasks);
    showNotification(`Filtered ${filteredTasks.length} task(s)`);
}

function addTask() {
    openTaskModal();
}

function openTaskModal() {
    // Reset form
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskClient').value = '';
    document.getElementById('taskPrioritySelect').value = 'medium';
    document.getElementById('taskDueDate').value = '';
    document.getElementById('taskCategory').value = 'general';
    
    // Reset checklist
    const checklistContainer = document.getElementById('checklistContainer');
    checklistContainer.innerHTML = `
        <div class="checklist-item">
            <input type="text" class="checklist-input" placeholder="Enter checklist item">
            <button type="button" class="remove-checklist-btn" onclick="removeChecklistItem(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Show modal
    document.getElementById('taskModal').classList.add('active');
}

function closeTaskModal() {
    const modal = document.getElementById('taskModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function addChecklistItem() {
    const checklistContainer = document.getElementById('checklistContainer');
    const newItem = document.createElement('div');
    newItem.className = 'checklist-item';
    newItem.innerHTML = `
        <input type="text" class="checklist-input" placeholder="Enter checklist item">
        <button type="button" class="remove-checklist-btn" onclick="removeChecklistItem(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    checklistContainer.appendChild(newItem);
}

function removeChecklistItem(button) {
    const checklistContainer = document.getElementById('checklistContainer');
    if (checklistContainer.children.length > 1) {
        button.parentElement.remove();
    } else {
        showNotification('At least one checklist item is required', 'warning');
    }
}

function createNewTask() {
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const client = document.getElementById('taskClient').value;
    const priority = document.getElementById('taskPrioritySelect').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const category = document.getElementById('taskCategory').value;
    
    // Validation
    if (!title) {
        showNotification('Task title is required', 'error');
        return;
    }
    
    if (!client) {
        showNotification('Please select a client', 'error');
        return;
    }
    
    // Get checklist items
    const checklistInputs = document.querySelectorAll('.checklist-input');
    const checklist = [];
    let checklistId = 1;
    
    checklistInputs.forEach(input => {
        const text = input.value.trim();
        if (text) {
            checklist.push({
                id: checklistId++,
                text: text,
                completed: false
            });
        }
    });
    
    // Get client name
    const clientSelect = document.getElementById('taskClient');
    const clientName = clientSelect.options[clientSelect.selectedIndex].text;
    
    // Create new task
    const newTask = {
        id: Date.now(), // Simple ID generation
        title: title,
        description: description,
        priority: priority,
        status: 'pending',
        dueDate: dueDate || null,
        createdDate: new Date().toISOString().split('T')[0],
        assignedClient: client,
        clientName: clientName,
        category: category,
        checklist: checklist
    };
    
    // Add to tasks array
    allTasks.unshift(newTask);
    saveTasks();
    
    // Refresh display
    displayTasks(allTasks);
    closeTaskModal();
    
    showNotification(`Task "${title}" created successfully!`);
}

function viewTaskDetails(taskId) {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) {
        showNotification('Task not found', 'error');
        return;
    }
    
    currentTaskId = taskId;
    
    // Update modal title
    document.getElementById('taskDetailsTitle').textContent = task.title;
    
    // Build task details content
    const completedItems = task.checklist ? task.checklist.filter(item => item.completed).length : 0;
    const totalItems = task.checklist ? task.checklist.length : 0;
    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    
    const content = `
        <div class="task-detail-row">
            <span class="task-detail-label">Status:</span>
            <span class="task-detail-value">
                <span class="status-badge status-${task.status}">${task.status.replace('-', ' ').toUpperCase()}</span>
            </span>
        </div>
        <div class="task-detail-row">
            <span class="task-detail-label">Priority:</span>
            <span class="task-detail-value">
                <span class="priority-badge priority-${task.priority}">${task.priority.toUpperCase()}</span>
            </span>
        </div>
        <div class="task-detail-row">
            <span class="task-detail-label">Assigned Client:</span>
            <span class="task-detail-value">${task.clientName}</span>
        </div>
        <div class="task-detail-row">
            <span class="task-detail-label">Category:</span>
            <span class="task-detail-value">${task.category}</span>
        </div>
        <div class="task-detail-row">
            <span class="task-detail-label">Due Date:</span>
            <span class="task-detail-value">${task.dueDate ? formatDate(task.dueDate) : 'No due date'}</span>
        </div>
        <div class="task-detail-row">
            <span class="task-detail-label">Created:</span>
            <span class="task-detail-value">${formatDate(task.createdDate)}</span>
        </div>
        ${task.description ? `
            <div class="task-detail-row">
                <span class="task-detail-label">Description:</span>
                <span class="task-detail-value">${task.description}</span>
            </div>
        ` : ''}
        ${task.checklist && task.checklist.length > 0 ? `
            <div class="task-checklist">
                <h4 style="margin-bottom: 1rem; font-size: 14px; color: #1e293b;">
                    Checklist (${completedItems}/${totalItems} completed)
                </h4>
                ${task.checklist.map(item => `
                    <div class="task-checklist-item">
                        <input type="checkbox" class="task-checklist-checkbox" 
                               ${item.completed ? 'checked' : ''} 
                               onchange="toggleChecklistItem(${item.id})">
                        <span class="task-checklist-text ${item.completed ? 'completed' : ''}">${item.text}</span>
                    </div>
                `).join('')}
            </div>
        ` : ''}
    `;
    
    document.getElementById('taskDetailsContent').innerHTML = content;
    
    // Update button text based on status
    const updateBtn = document.getElementById('updateTaskBtn');
    if (task.status === 'completed') {
        updateBtn.textContent = 'Reopen Task';
    } else {
        updateBtn.textContent = 'Mark Complete';
    }
    
    // Show modal
    document.getElementById('taskDetailsModal').classList.add('active');
}

function closeTaskDetailsModal() {
    const modal = document.getElementById('taskDetailsModal');
    if (modal) {
        modal.classList.remove('active');
    }
    currentTaskId = null;
}

function toggleChecklistItem(itemId) {
    if (!currentTaskId) return;
    
    const task = allTasks.find(t => t.id === currentTaskId);
    if (!task || !task.checklist) return;
    
    const item = task.checklist.find(i => i.id === itemId);
    if (item) {
        item.completed = !item.completed;
        saveTasks();
        
        // Refresh the task details view
        viewTaskDetails(currentTaskId);
        
        // Refresh the main tasks list
        displayTasks(allTasks);
        
        showNotification(`Checklist item ${item.completed ? 'completed' : 'reopened'}`);
    }
}

function updateTaskStatus() {
    if (!currentTaskId) return;
    
    const task = allTasks.find(t => t.id === currentTaskId);
    if (!task) return;
    
    if (task.status === 'completed') {
        task.status = 'pending';
        showNotification('Task reopened');
    } else {
        task.status = 'completed';
        // Mark all checklist items as completed
        if (task.checklist) {
            task.checklist.forEach(item => item.completed = true);
        }
        showNotification('Task marked as completed');
    }
    
    saveTasks();
    
    // Refresh views
    viewTaskDetails(currentTaskId);
    displayTasks(allTasks);
}

function saveTasks() {
    localStorage.setItem('clientTasks', JSON.stringify(allTasks));
}

// Documents functionality
let allDocuments = [
    { name: 'Financial Statement Q3.xlsx', type: 'financial', size: '1.8 MB', date: '2024-10-01', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { name: 'Receipt_Office_Supplies.jpg', type: 'receipts', size: '245 KB', date: '2024-12-05', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { name: 'Service Contract.pdf', type: 'contracts', size: '856 KB', date: '2024-01-10', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    { name: 'Tax Return 2023.pdf', type: 'tax', size: '2.4 MB', date: '2024-03-15', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
];

function loadDocuments() {
    const documentsGrid = document.getElementById('documentsGrid');
    // Sort documents alphabetically by name
    const sortedDocuments = [...allDocuments].sort((a, b) => a.name.localeCompare(b.name));
    
    documentsGrid.innerHTML = sortedDocuments.map((doc, index) => `
        <div class="document-item" data-type="${doc.type}">
            <div class="document-info">
                <i class="fas ${getFileIcon(doc.name)}" style="font-size: 28px; color: ${getFileColor(doc.name)};"></i>
                <div class="document-name">${doc.name}</div>
                <div class="document-meta">${doc.size}</div>
            </div>
            <div class="document-overlay">
                <button class="document-action-btn" onclick="viewDocument('${doc.name}', '${doc.url}')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="document-action-btn secondary" onclick="downloadDocument('${doc.name}', '${doc.url}')">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
        </div>
    `).join('');
}

function getFileIcon(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    switch(extension) {
        case 'pdf': return 'fa-file-pdf';
        case 'xlsx': case 'xls': return 'fa-file-excel';
        case 'docx': case 'doc': return 'fa-file-word';
        case 'jpg': case 'jpeg': case 'png': case 'gif': return 'fa-file-image';
        default: return 'fa-file';
    }
}

function getFileColor(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    switch(extension) {
        case 'pdf': return '#dc2626';
        case 'xlsx': case 'xls': return '#059669';
        case 'docx': case 'doc': return '#2563eb';
        case 'jpg': case 'jpeg': case 'png': case 'gif': return '#7c3aed';
        default: return '#64748b';
    }
}

function filterDocuments(type) {
    const buttons = document.querySelectorAll('.category-btn');
    
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Apply both search and category filters
    applyFilters();
    
    showNotification('Filtered documents by: ' + (type === 'all' ? 'All Categories' : type));
}

function searchDocuments() {
    applyFilters();
}

function applyFilters() {
    const searchTerm = document.getElementById('documentSearch').value.toLowerCase();
    const activeCategory = document.querySelector('.category-btn.active').textContent.toLowerCase();
    const documents = document.querySelectorAll('.document-item');
    
    documents.forEach(doc => {
        const docName = doc.querySelector('.document-name').textContent.toLowerCase();
        const docType = doc.dataset.type;
        
        // Check search filter
        const matchesSearch = docName.includes(searchTerm);
        
        // Check category filter
        const matchesCategory = activeCategory === 'all' || 
                               docType === getCategoryType(activeCategory);
        
        // Show/hide based on both filters
        if (matchesSearch && matchesCategory) {
            doc.style.display = 'block';
        } else {
            doc.style.display = 'none';
        }
    });
}

function getCategoryType(categoryName) {
    const categoryMap = {
        'financial': 'financial',
        'tax documents': 'tax',
        'contracts': 'contracts',
        'receipts': 'receipts'
    };
    return categoryMap[categoryName] || categoryName;
}

function uploadDocument() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.xlsx,.jpg,.png';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            showNotification('Document "' + file.name + '" uploaded successfully!');
            loadDocuments();
        }
    };
    input.click();
}

// Upload functionality
let selectedFiles = [];
const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB in bytes

function openUploadModal() {
    document.getElementById('uploadModal').classList.add('active');
    selectedFiles = [];
    updateFileList();
    updateUploadButton();
}

function closeUploadModal() {
    document.getElementById('uploadModal').classList.remove('active');
    selectedFiles = [];
    updateFileList();
    hideUploadProgress();
}

function updateFileList() {
    const fileList = document.getElementById('fileList');
    
    if (selectedFiles.length === 0) {
        fileList.innerHTML = '';
        return;
    }
    
    fileList.innerHTML = selectedFiles.map((file, index) => `
        <div class="file-item">
            <div class="file-info">
                <i class="fas ${getFileIcon(file.name)}" style="color: ${getFileColor(file.name)};"></i>
                <div>
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                </div>
            </div>
            <div class="file-actions">
                <button class="remove-file" onclick="removeFile(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function removeFile(index) {
    selectedFiles.splice(index, 1);
    updateFileList();
    updateUploadButton();
}

function updateUploadButton() {
    const uploadBtn = document.getElementById('uploadSubmitBtn');
    uploadBtn.disabled = selectedFiles.length === 0;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function validateFile(file) {
    if (file.size > MAX_FILE_SIZE) {
        showNotification('File "' + file.name + '" exceeds 5GB limit', 'error');
        return false;
    }
    return true;
}

function handleFileSelect(files) {
    for (let file of files) {
        if (validateFile(file)) {
            // Check if file already selected
            const exists = selectedFiles.some(f => f.name === file.name && f.size === file.size);
            if (!exists) {
                selectedFiles.push(file);
            }
        }
    }
    updateFileList();
    updateUploadButton();
}

function submitUpload() {
    if (selectedFiles.length === 0) return;
    
    showUploadProgress();
    const uploadBtn = document.getElementById('uploadSubmitBtn');
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading...';
    
    uploadFiles(selectedFiles);
}

function uploadFiles(files) {
    let completed = 0;
    const total = files.length;
    
    files.forEach((file, index) => {
        const formData = new FormData();
        formData.append('file', file);
        
        fetch('../PHP-FOLDER-API/upload.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            completed++;
            updateProgress((completed / total) * 100);
            
            if (data.success) {
                showNotification(`File "${file.name}" uploaded successfully!`);
            } else {
                showNotification(`Failed to upload "${file.name}": ${data.message}`, 'error');
            }
            
            if (completed === total) {
                setTimeout(() => {
                    hideUploadProgress();
                    closeUploadModal();
                    loadDocuments(); // Refresh documents list
                    showNotification(`${completed} file(s) uploaded successfully!`);
                }, 1000);
            }
        })
        .catch(error => {
            completed++;
            console.error('Upload error:', error);
            showNotification(`Failed to upload "${file.name}"`, 'error');
            
            if (completed === total) {
                setTimeout(() => {
                    hideUploadProgress();
                    const uploadBtn = document.getElementById('uploadSubmitBtn');
                    uploadBtn.disabled = false;
                    uploadBtn.textContent = 'Upload Files';
                }, 1000);
            }
        });
    });
}

function showUploadProgress() {
    document.getElementById('uploadProgress').style.display = 'block';
    updateProgress(0);
}

function hideUploadProgress() {
    document.getElementById('uploadProgress').style.display = 'none';
    const uploadBtn = document.getElementById('uploadSubmitBtn');
    uploadBtn.disabled = false;
    uploadBtn.textContent = 'Upload Files';
}

function updateProgress(percentage) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    progressFill.style.width = percentage + '%';
    progressText.textContent = `Uploading... ${Math.round(percentage)}%`;
}

// Event listeners for drag and drop
document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    // File input change event
    fileInput.addEventListener('change', function(e) {
        handleFileSelect(e.target.files);
    });
    
    // Drag and drop events
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFileSelect(e.dataTransfer.files);
    });
});

// Reports functionality
function loadReports() {
    const recentReports = document.getElementById('recentReports');
    const sampleReports = [
        { name: 'Profit & Loss - November 2024', date: '2024-12-01', type: 'profit-loss' },
        { name: 'Cash Flow Report - Q4 2024', date: '2024-11-28', type: 'cash-flow' },
        { name: 'Balance Sheet - October 2024', date: '2024-11-01', type: 'balance-sheet' }
    ];
    
    recentReports.innerHTML = '<h3>Recent Reports</h3>' + sampleReports.map(report => `
        <div class="invoice-item" style="margin-bottom: 0.5rem;">
            <div>
                <strong>${report.name}</strong><br>
                <small>Generated: ${report.date}</small>
            </div>
            <button class="client-btn" onclick="downloadReport('${report.type}')">
                <i class="fas fa-download"></i>
            </button>
        </div>
    `).join('');
}

function generateReport(type) {
    showNotification(`Generating ${type.replace('-', ' ')} report...`);
    setTimeout(() => {
        showNotification(`${type.replace('-', ' ')} report generated successfully!`);
        loadReports();
    }, 2000);
}

function generateCustomReport() {
    showNotification('Opening custom report builder...');
}

function downloadReport(type) {
    showNotification(`Downloading ${type.replace('-', ' ')} report...`);
}

// Appointments functionality
let currentDate = new Date();

function loadAppointments() {
    generateCalendar();
    loadAppointmentsList();
}

function generateCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonth = document.getElementById('currentMonth');
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    
    currentMonth.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    let calendarHTML = '';
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Add day headers
    dayNames.forEach(day => {
        calendarHTML += `<div class="calendar-day" style="font-weight: bold; background: #f1f5f9;">${day}</div>`;
    });
    
    // Add calendar days
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const isCurrentMonth = date.getMonth() === currentDate.getMonth();
        const hasAppointment = [15, 22, 28].includes(date.getDate()) && isCurrentMonth;
        
        calendarHTML += `<div class="calendar-day ${hasAppointment ? 'has-appointment' : ''}" 
            style="${!isCurrentMonth ? 'color: #cbd5e1;' : ''}">
            ${date.getDate()}
        </div>`;
    }
    
    calendarGrid.innerHTML = calendarHTML;
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar();
}

function loadAppointmentsList() {
    const appointmentsList = document.getElementById('appointmentsList');
    const sampleAppointments = [
        { date: '2024-12-15', time: '10:00 AM', title: 'Tax Consultation', type: 'consultation' },
        { date: '2024-12-22', time: '2:00 PM', title: 'Financial Review', type: 'review' },
        { date: '2024-12-28', time: '11:30 AM', title: 'Year-end Planning', type: 'planning' }
    ];
    
    appointmentsList.innerHTML = sampleAppointments.map(apt => `
        <div class="invoice-item" style="margin-bottom: 0.5rem;">
            <div>
                <strong>${apt.title}</strong><br>
                <small>${apt.date} at ${apt.time}</small>
            </div>
            <button class="client-btn" onclick="cancelAppointment('${apt.date}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function bookAppointment() {
    showNotification('Opening appointment booking form...');
}

function cancelAppointment(date) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
        showNotification('Appointment cancelled successfully.');
        loadAppointmentsList();
    }
}

// Support functionality
function loadSupport() {
    loadSupportTickets();
    loadFAQ();
}

function loadSupportTickets() {
    const supportTickets = document.getElementById('supportTickets');
    const sampleTickets = [
        { id: 'TKT-001', subject: 'Invoice Payment Issue', status: 'open', date: '2024-12-10' },
        { id: 'TKT-002', subject: 'Document Upload Problem', status: 'resolved', date: '2024-12-05' }
    ];
    
    supportTickets.innerHTML = sampleTickets.map(ticket => `
        <div class="invoice-item" style="margin-bottom: 0.5rem;">
            <div>
                <strong>${ticket.id}</strong> - ${ticket.subject}<br>
                <small>Created: ${ticket.date}</small>
            </div>
            <span class="status-badge status-${ticket.status === 'open' ? 'pending' : 'completed'}">
                ${ticket.status.toUpperCase()}
            </span>
        </div>
    `).join('');
}

function loadFAQ() {
    const faqList = document.getElementById('faqList');
    const faqs = [
        { q: 'How do I upload documents?', a: 'Click on the Documents section and use the Upload Document button to select and upload your files.' },
        { q: 'When are invoices due?', a: 'Invoice due dates are specified on each invoice. You can view all due dates in the My Invoices section.' },
        { q: 'How do I schedule an appointment?', a: 'Go to the Appointments section and click Book Appointment to schedule a meeting with our team.' },
        { q: 'Can I download my reports?', a: 'Yes, all reports can be downloaded as PDF files from the Reports section.' }
    ];
    
    faqList.innerHTML = faqs.map((faq, index) => `
        <div class="faq-item" onclick="toggleFAQ(${index})">
            <div class="faq-question">${faq.q}</div>
            <div class="faq-answer">${faq.a}</div>
        </div>
    `).join('');
}

function toggleFAQ(index) {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems[index].classList.toggle('active');
}

function createTicket() {
    const subject = prompt('Enter ticket subject:');
    if (subject) {
        showNotification('Support ticket created: ' + subject);
        loadSupportTickets();
    }
}

function openChat() {
    showNotification('Opening live chat...');
}

function callSupport() {
    showNotification('Calling (555) 123-4567...');
}

function emailSupport() {
    window.location.href = 'mailto:support@accounting.com?subject=Support Request';
}

// Document Viewer functionality
let currentPdf = null;
let currentPage = 1;
let totalPages = 0;
let currentZoom = 1.0;
let currentDocumentName = '';
let currentDocumentUrl = '';

function viewDocument(documentName, documentUrl) {
    currentDocumentName = documentName;
    currentDocumentUrl = documentUrl;
    
    // Show modal
    const modal = document.getElementById('documentViewerModal');
    modal.classList.add('active');
    
    // Update title
    document.getElementById('documentTitle').textContent = documentName;
    
    // Check if it's a PDF
    if (documentName.toLowerCase().endsWith('.pdf')) {
        loadPdfDocument(documentUrl);
    } else {
        // For non-PDF files, show a preview or message
        showNonPdfPreview(documentName, documentUrl);
    }
}

function loadPdfDocument(url) {
    const loadingDiv = document.getElementById('documentLoading');
    const pdfViewer = document.getElementById('pdfViewer');
    
    loadingDiv.style.display = 'flex';
    
    // Configure PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    // Load PDF
    pdfjsLib.getDocument(url).promise.then(function(pdf) {
        currentPdf = pdf;
        totalPages = pdf.numPages;
        currentPage = 1;
        currentZoom = 1.0;
        
        // Update UI
        document.getElementById('totalPages').textContent = totalPages;
        document.getElementById('currentPage').textContent = currentPage;
        document.getElementById('zoomLevel').textContent = Math.round(currentZoom * 100) + '%';
        
        // Hide loading and render first page
        loadingDiv.style.display = 'none';
        renderPage(currentPage);
        
    }).catch(function(error) {
        console.error('Error loading PDF:', error);
        loadingDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>Error loading document</span>';
    });
}

function renderPage(pageNum) {
    if (!currentPdf) return;
    
    currentPdf.getPage(pageNum).then(function(page) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate scale based on zoom and container width
        const viewport = page.getViewport({ scale: 1.0 });
        const containerWidth = document.getElementById('pdfViewer').clientWidth - 40; // Account for padding
        const scale = Math.min(currentZoom, containerWidth / viewport.width);
        
        const scaledViewport = page.getViewport({ scale: scale });
        
        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;
        canvas.className = 'pdf-canvas';
        
        const renderContext = {
            canvasContext: ctx,
            viewport: scaledViewport
        };
        
        // Clear previous canvas
        const pdfViewer = document.getElementById('pdfViewer');
        const existingCanvas = pdfViewer.querySelector('.pdf-canvas');
        if (existingCanvas) {
            existingCanvas.remove();
        }
        
        // Add new canvas
        pdfViewer.appendChild(canvas);
        
        page.render(renderContext);
        
        // Update navigation buttons
        document.getElementById('prevPageBtn').disabled = pageNum <= 1;
        document.getElementById('nextPageBtn').disabled = pageNum >= totalPages;
    });
}

function showNonPdfPreview(documentName, documentUrl) {
    const pdfViewer = document.getElementById('pdfViewer');
    const loadingDiv = document.getElementById('documentLoading');
    
    loadingDiv.style.display = 'none';
    
    const extension = documentName.split('.').pop().toLowerCase();
    let previewContent = '';
    
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
        previewContent = `
            <div style="text-align: center; padding: 2rem;">
                <img src="${documentUrl}" alt="${documentName}" style="max-width: 100%; max-height: 500px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            </div>
        `;
    } else {
        previewContent = `
            <div style="text-align: center; padding: 4rem; color: #64748b;">
                <i class="fas ${getFileIcon(documentName)}" style="font-size: 48px; color: ${getFileColor(documentName)}; margin-bottom: 1rem;"></i>
                <h3 style="margin-bottom: 1rem;">${documentName}</h3>
                <p>Preview not available for this file type.</p>
                <button class="client-btn" onclick="downloadCurrentDocument()" style="margin-top: 1rem;">
                    <i class="fas fa-download"></i> Download to View
                </button>
            </div>
        `;
    }
    
    pdfViewer.innerHTML = previewContent;
    
    // Hide PDF controls for non-PDF files
    document.querySelector('.pdf-controls').style.display = 'none';
}

function closeDocumentViewer() {
    const modal = document.getElementById('documentViewerModal');
    modal.classList.remove('active');
    
    // Reset state
    currentPdf = null;
    currentPage = 1;
    totalPages = 0;
    currentZoom = 1.0;
    
    // Show PDF controls again
    document.querySelector('.pdf-controls').style.display = 'flex';
    
    // Clear viewer content
    document.getElementById('pdfViewer').innerHTML = `
        <div class="document-loading" id="documentLoading">
            <i class="fas fa-spinner"></i>
            <span>Loading document...</span>
        </div>
    `;
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        document.getElementById('currentPage').textContent = currentPage;
        renderPage(currentPage);
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        document.getElementById('currentPage').textContent = currentPage;
        renderPage(currentPage);
    }
}

function zoomIn() {
    currentZoom = Math.min(currentZoom * 1.25, 3.0);
    document.getElementById('zoomLevel').textContent = Math.round(currentZoom * 100) + '%';
    if (currentPdf) renderPage(currentPage);
}

function zoomOut() {
    currentZoom = Math.max(currentZoom / 1.25, 0.25);
    document.getElementById('zoomLevel').textContent = Math.round(currentZoom * 100) + '%';
    if (currentPdf) renderPage(currentPage);
}

function fitToWidth() {
    if (!currentPdf) return;
    
    currentPdf.getPage(currentPage).then(function(page) {
        const viewport = page.getViewport({ scale: 1.0 });
        const containerWidth = document.getElementById('pdfViewer').clientWidth - 40;
        currentZoom = containerWidth / viewport.width;
        
        document.getElementById('zoomLevel').textContent = Math.round(currentZoom * 100) + '%';
        renderPage(currentPage);
    });
}

function downloadCurrentDocument() {
    if (currentDocumentUrl) {
        const link = document.createElement('a');
        link.href = currentDocumentUrl;
        link.download = currentDocumentName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('Downloading ' + currentDocumentName);
    }
}

function printDocument() {
    if (currentDocumentUrl) {
        window.open(currentDocumentUrl, '_blank');
        showNotification('Opening document in new tab for printing');
    }
}

function downloadDocument(documentName, documentUrl) {
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = documentName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Downloading ' + documentName);
}

// Logout function
function logout() {
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    
    // Call logout API
    fetch('../PHP-FOLDER-API/auth.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'logout'
        })
    })
    .then(() => {
        // Redirect to login page
        window.location.href = '../login.html';
    })
    .catch(error => {
        console.error('Logout error:', error);
        // Redirect anyway
        window.location.href = '../login.html';
    });
};

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add notification styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 8px;
                padding: 1rem;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                border-left: 4px solid #3b82f6;
                z-index: 1000;
                display: flex;
                align-items: center;
                gap: 1rem;
                min-width: 300px;
                animation: slideIn 0.3s ease;
            }
            
            .notification-info { border-left-color: #3b82f6; }
            .notification-success { border-left-color: #10b981; }
            .notification-warning { border-left-color: #f59e0b; }
            .notification-error { border-left-color: #ef4444; }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                flex: 1;
            }
            
            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                color: #6b7280;
                padding: 0.25rem;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'error': return 'fa-times-circle';
        default: return 'fa-info-circle';
    }
}
