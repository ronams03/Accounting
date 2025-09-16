// Accounts Module JavaScript
document.addEventListener('DOMContentLoaded', function() {
	// Ensure header is loaded before initializing interactions
	document.addEventListener('headerLoaded', initAccountsModule);
	if (document.querySelector('.sidebar')) initAccountsModule();

	function initAccountsModule() {
		setupNavigationLinks();
		loadDarkModeFromSettings();
		renderAccountsUI();
		attachEventHandlers();
	}

	function setupNavigationLinks() {
		const navLinks = document.querySelectorAll('.nav-link');
		navLinks.forEach(link => {
			link.addEventListener('click', function(e) {
				const href = this.getAttribute('href') || '';
				if (href.startsWith('#')) {
					e.preventDefault();
					showPageTransition(href);
				}
			});
		});
	}

	function showPageTransition(route) {
		const overlay = document.createElement('div');
		overlay.className = 'page-transition-overlay';
		overlay.innerHTML = `
			<div class="page-transition-content">
				<div class="page-transition-icon"><i class="fas fa-book"></i></div>
				<div class="page-transition-text">Loading</div>
				<div class="page-transition-subtext">Please wait...</div>
			</div>
		`;
		document.body.appendChild(overlay);
		setTimeout(() => overlay.classList.add('show'), 10);
		setTimeout(() => {
			overlay.classList.remove('show');
			setTimeout(() => overlay.remove(), 400);
		}, 1200);
	}

	function loadDarkModeFromSettings() {
		const settings = JSON.parse(localStorage.getItem('accountingSettings') || '{}');
		const themeMode = settings.themeMode || 'light';
		applyThemeMode(themeMode);
		window.addEventListener('storage', function(e) {
			if (e.key === 'accountingSettings') {
				const s = JSON.parse(localStorage.getItem('accountingSettings') || '{}');
				applyThemeMode(s.themeMode || 'light');
			}
		});
		if (window.matchMedia) {
			window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
				const s = JSON.parse(localStorage.getItem('accountingSettings') || '{}');
				if (s.themeMode === 'auto') applyThemeMode('auto');
			});
		}
	}

	function applyThemeMode(mode) {
		const body = document.body;
		const dashboardContainer = document.querySelector('.dashboard-container');
		const mainContent = document.querySelector('.main-content');
		body.classList.remove('dark-theme');
		if (dashboardContainer) dashboardContainer.classList.remove('dark-theme');
		if (mainContent) mainContent.classList.remove('dark-theme');
		if (mode === 'dark') {
			body.classList.add('dark-theme');
			if (dashboardContainer) dashboardContainer.classList.add('dark-theme');
			if (mainContent) mainContent.classList.add('dark-theme');
		} else if (mode === 'auto') {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			if (prefersDark) {
				body.classList.add('dark-theme');
				if (dashboardContainer) dashboardContainer.classList.add('dark-theme');
				if (mainContent) mainContent.classList.add('dark-theme');
			}
		}
	}

	// Simple in-memory sample data (fallback when API not available)
	let accounts = [
		{ id: 1000, code: '1000', name: 'Cash', type: 'Asset', status: 'Active' },
		{ id: 1100, code: '1100', name: 'Accounts Receivable', type: 'Asset', status: 'Active' },
		{ id: 2000, code: '2000', name: 'Accounts Payable', type: 'Liability', status: 'Active' },
		{ id: 4000, code: '4000', name: 'Service Revenue', type: 'Revenue', status: 'Active' },
		{ id: 5000, code: '5000', name: 'Salaries Expense', type: 'Expense', status: 'Active' }
	];

	function renderAccountsUI() {
		const container = document.querySelector('.section-body');
		if (!container) return;
		container.innerHTML = `
			<div class="filters-section" style="display:flex;gap:6px;margin-bottom:8px;padding:6px;background:#f8f9fa;border-radius:4px;">
				<input id="accSearch" class="filter-input" type="text" placeholder="Search accounts..." style="padding:4px 6px;border:1px solid #ddd;border-radius:4px;font-size:12px;min-width:180px;" />
				<select id="accType" class="filter-select" style="padding:4px 6px;border:1px solid #ddd;border-radius:4px;font-size:12px;min-width:160px;">
					<option value="">All Types</option>
					<option>Asset</option>
					<option>Liability</option>
					<option>Equity</option>
					<option>Revenue</option>
					<option>Expense</option>
				</select>
				<select id="accStatus" class="filter-select" style="padding:4px 6px;border:1px solid #ddd;border-radius:4px;font-size:12px;min-width:140px;">
					<option value="">All Status</option>
					<option>Active</option>
					<option>Inactive</option>
				</select>
			</div>
			<div class="users-table-container" style="background:white;border-radius:6px;border:1px solid #e9ecef;overflow:hidden;">
				<table class="users-table" style="width:100%;border-collapse:collapse;font-size:12px;">
					<thead>
						<tr>
							<th style="text-align:left;padding:6px 8px;background:#f8f9fa;border-bottom:1px solid #dee2e6;">Code</th>
							<th style="text-align:left;padding:6px 8px;background:#f8f9fa;border-bottom:1px solid #dee2e6;">Account Name</th>
							<th style="text-align:left;padding:6px 8px;background:#f8f9fa;border-bottom:1px solid #dee2e6;">Type</th>
							<th style="text-align:left;padding:6px 8px;background:#f8f9fa;border-bottom:1px solid #dee2e6;">Status</th>
							<th style="text-align:left;padding:6px 8px;background:#f8f9fa;border-bottom:1px solid #dee2e6;">Actions</th>
						</tr>
					</thead>
					<tbody id="accountsTableBody">
						<tr><td colspan="5" class="loading" style="text-align:center;padding:20px;color:#6c757d;font-style:italic;">Loading...</td></tr>
					</tbody>
				</table>
			</div>
			<!-- Modal -->
			<div class="modal-overlay" id="accountModal" style="display:none;">
				<div class="modal-container">
					<div class="modal-header">
						<h3 class="modal-title" id="accountModalTitle">New Account</h3>
						<button class="modal-close" id="closeAccountModal"><i class="fas fa-times"></i></button>
					</div>
					<div class="modal-body" style="padding:12px;">
						<div class="form-row">
							<div class="form-group">
								<label class="form-label">Code *</label>
								<input id="accCode" class="form-input" type="text" required />
							</div>
							<div class="form-group">
								<label class="form-label">Account Name *</label>
								<input id="accName" class="form-input" type="text" required />
							</div>
						</div>
						<div class="form-row">
							<div class="form-group">
								<label class="form-label">Type *</label>
								<select id="accTypeInput" class="form-select">
									<option>Asset</option>
									<option>Liability</option>
									<option>Equity</option>
									<option>Revenue</option>
									<option>Expense</option>
								</select>
							</div>
							<div class="form-group">
								<label class="form-label">Status *</label>
								<select id="accStatusInput" class="form-select">
									<option>Active</option>
									<option>Inactive</option>
								</select>
							</div>
						</div>
					</div>
					<div class="modal-footer">
						<button class="btn-secondary" id="cancelAccountBtn">Cancel</button>
						<button class="btn-primary" id="saveAccountBtn">Save Account</button>
					</div>
				</div>
			</div>
		`;

		displayAccounts();
	}

	function attachEventHandlers() {
		const newBtn = document.getElementById('newAccountBtn') || document.querySelector('.section-header .btn-primary');
		if (newBtn) newBtn.addEventListener('click', openNewAccountModal);
		const search = document.getElementById('accSearch');
		const typeSel = document.getElementById('accType');
		const statusSel = document.getElementById('accStatus');
		[search, typeSel, statusSel].forEach(el => el && el.addEventListener('input', displayAccounts));
		if (typeSel) typeSel.addEventListener('change', displayAccounts);
		if (statusSel) statusSel.addEventListener('change', displayAccounts);

		document.getElementById('closeAccountModal')?.addEventListener('click', closeAccountModal);
		document.getElementById('cancelAccountBtn')?.addEventListener('click', closeAccountModal);
		document.getElementById('saveAccountBtn')?.addEventListener('click', saveAccount);

		document.addEventListener('click', function(e) {
			if (e.target.classList.contains('modal-overlay')) {
				closeAccountModal();
			}
		});

		document.addEventListener('keydown', function(e) {
			if (e.key === 'Escape') closeAccountModal();
		});
	}

	function displayAccounts() {
		const tbody = document.getElementById('accountsTableBody');
		if (!tbody) return;
		const q = (document.getElementById('accSearch')?.value || '').toLowerCase();
		const t = document.getElementById('accType')?.value || '';
		const s = document.getElementById('accStatus')?.value || '';
		const filtered = accounts.filter(a =>
			(!q || a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)) &&
			(!t || a.type === t) && (!s || a.status === s)
		);
		if (filtered.length === 0) {
			tbody.innerHTML = '<tr><td colspan="5" class="no-data">No accounts found</td></tr>';
			return;
		}
		tbody.innerHTML = filtered.map(a => `
			<tr>
				<td>${a.code}</td>
				<td>${a.name}</td>
				<td>${a.type}</td>
				<td><span class="status-badge ${a.status.toLowerCase()}">${a.status}</span></td>
				<td>
					<div class="action-buttons">
						<button class="btn-icon" data-edit="${a.id}" title="Edit"><i class="fas fa-edit"></i></button>
						<button class="btn-icon danger" data-del="${a.id}" title="Delete"><i class="fas fa-trash"></i></button>
					</div>
				</td>
			</tr>
		`).join('');

		// Attach row actions
		Array.from(tbody.querySelectorAll('button[data-edit]')).forEach(btn => btn.addEventListener('click', () => openEditAccountModal(parseInt(btn.dataset.edit))));
		Array.from(tbody.querySelectorAll('button[data-del]')).forEach(btn => btn.addEventListener('click', () => deleteAccount(parseInt(btn.dataset.del))));
	}

	let editingId = null;
	function openNewAccountModal() {
		editingId = null;
		document.getElementById('accountModalTitle').textContent = 'New Account';
		document.getElementById('accCode').value = '';
		document.getElementById('accName').value = '';
		document.getElementById('accTypeInput').value = 'Asset';
		document.getElementById('accStatusInput').value = 'Active';
		showModal();
	}

	function openEditAccountModal(id) {
		const a = accounts.find(x => x.id === id);
		if (!a) return;
		editingId = id;
		document.getElementById('accountModalTitle').textContent = 'Edit Account';
		document.getElementById('accCode').value = a.code;
		document.getElementById('accName').value = a.name;
		document.getElementById('accTypeInput').value = a.type;
		document.getElementById('accStatusInput').value = a.status;
		showModal();
	}

	function showModal() {
		const modal = document.getElementById('accountModal');
		modal.style.display = 'flex';
		setTimeout(() => modal.classList.add('show'), 10);
		document.body.style.overflow = 'hidden';
	}

	function closeAccountModal() {
		const modal = document.getElementById('accountModal');
		modal.classList.remove('show');
		setTimeout(() => {
			modal.style.display = 'none';
			document.body.style.overflow = '';
		}, 300);
	}

	function saveAccount() {
		const code = document.getElementById('accCode').value.trim();
		const name = document.getElementById('accName').value.trim();
		const type = document.getElementById('accTypeInput').value;
		const status = document.getElementById('accStatusInput').value;
		const errors = [];
		if (!code) errors.push('Code is required');
		if (!name) errors.push('Account name is required');
		if (errors.length) return notify(errors.join('. '), 'error');
		if (editingId) {
			const idx = accounts.findIndex(a => a.id === editingId);
			if (idx !== -1) accounts[idx] = { ...accounts[idx], code, name, type, status };
			notify('Account updated', 'success');
		} else {
			const id = Math.max(...accounts.map(a => a.id)) + 1;
			accounts.unshift({ id, code, name, type, status });
			notify('Account created', 'success');
		}
		closeAccountModal();
		displayAccounts();
	}

	function deleteAccount(id) {
		if (!confirm('Delete this account?')) return;
		accounts = accounts.filter(a => a.id !== id);
		displayAccounts();
		notify('Account deleted', 'success');
	}

	function notify(message, type = 'info') {
		const el = document.createElement('div');
		el.className = `notification ${type}`;
		el.innerHTML = `
			<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
			<span>${message}</span>
			<button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
		`;
		if (!document.querySelector('#notification-styles')) {
			const styles = document.createElement('style');
			styles.id = 'notification-styles';
			styles.textContent = `
				.notification { position: fixed; top: 20px; right: 20px; background: white; padding: 8px 12px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-left: 4px solid #3b82f6; display:flex; gap:8px; align-items:center; font-size:12px; z-index:10000; }
				.notification.success { border-left-color:#10b981; }
				.notification.error { border-left-color:#ef4444; }
				.notification button { background:none; border:none; color:#64748b; cursor:pointer; padding:2px; margin-left:auto; }
			`;
			document.head.appendChild(styles);
		}
		document.body.appendChild(el);
		setTimeout(() => { if (el.parentElement) el.remove(); }, 3000);
	}
});

