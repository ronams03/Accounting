// Transactions Module JavaScript
document.addEventListener('DOMContentLoaded', function() {
	// Ensure header is loaded before initializing interactions
	document.addEventListener('headerLoaded', initTransactionsModule);
	if (document.querySelector('.sidebar')) initTransactionsModule();

	function initTransactionsModule() {
		setupNavigationLinks();
		loadDarkModeFromSettings();
		renderTransactionsUI();
		attachEventHandlers();
	}

	function setupNavigationLinks() {
		document.querySelectorAll('.nav-link').forEach(link => {
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
				<div class="page-transition-icon"><i class="fas fa-exchange-alt"></i></div>
				<div class="page-transition-text">Loading</div>
				<div class="page-transition-subtext">Please wait...</div>
			</div>
		`;
		document.body.appendChild(overlay);
		setTimeout(() => overlay.classList.add('show'), 10);
		setTimeout(() => { overlay.classList.remove('show'); setTimeout(() => overlay.remove(), 400); }, 1200);
	}

	function loadDarkModeFromSettings() {
		const settings = JSON.parse(localStorage.getItem('accountingSettings') || '{}');
		applyThemeMode(settings.themeMode || 'light');
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

	// Sample transactions data (fallback)
	let transactions = [
		{ id: 1, date: '2024-01-15', account: 'Cash', description: 'Initial capital', type: 'Debit', amount: 5000.00, status: 'Posted' },
		{ id: 2, date: '2024-01-16', account: 'Service Revenue', description: 'Consulting income', type: 'Credit', amount: 1500.00, status: 'Posted' },
		{ id: 3, date: '2024-01-17', account: 'Salaries Expense', description: 'Monthly payroll', type: 'Debit', amount: 900.00, status: 'Draft' }
	];

	function renderTransactionsUI() {
		const container = document.querySelector('.section-body');
		if (!container) return;
		container.innerHTML = `
			<div class="filters-section" style="display:flex;gap:6px;margin-bottom:8px;padding:6px;background:#f8f9fa;border-radius:4px;">
				<input id="txnSearch" class="filter-input" type="text" placeholder="Search transactions..." style="padding:4px 6px;border:1px solid #ddd;border-radius:4px;font-size:12px;min-width:180px;" />
				<select id="txnType" class="filter-select" style="padding:4px 6px;border:1px solid #ddd;border-radius:4px;font-size:12px;min-width:140px;">
					<option value="">All Types</option>
					<option>Debit</option>
					<option>Credit</option>
				</select>
				<select id="txnStatus" class="filter-select" style="padding:4px 6px;border:1px solid #ddd;border-radius:4px;font-size:12px;min-width:140px;">
					<option value="">All Status</option>
					<option>Posted</option>
					<option>Draft</option>
				</select>
			</div>
			<div class="users-table-container" style="background:white;border-radius:6px;border:1px solid #e9ecef;overflow:hidden;">
				<table class="users-table" style="width:100%;border-collapse:collapse;font-size:12px;">
					<thead>
						<tr>
							<th style="text-align:left;padding:6px 8px;background:#f8f9fa;border-bottom:1px solid #dee2e6;">Date</th>
							<th style="text-align:left;padding:6px 8px;background:#f8f9fa;border-bottom:1px solid #dee2e6;">Account</th>
							<th style="text-align:left;padding:6px 8px;background:#f8f9fa;border-bottom:1px solid #dee2e6;">Description</th>
							<th style="text-align:right;padding:6px 8px;background:#f8f9fa;border-bottom:1px solid #dee2e6;">Amount</th>
							<th style="text-align:left;padding:6px 8px;background:#f8f9fa;border-bottom:1px solid #dee2e6;">Type</th>
							<th style="text-align:left;padding:6px 8px;background:#f8f9fa;border-bottom:1px solid #dee2e6;">Status</th>
							<th style="text-align:left;padding:6px 8px;background:#f8f9fa;border-bottom:1px solid #dee2e6;">Actions</th>
						</tr>
					</thead>
					<tbody id="transactionsTableBody">
						<tr><td colspan="7" class="loading" style="text-align:center;padding:20px;color:#6c757d;font-style:italic;">Loading...</td></tr>
					</tbody>
				</table>
			</div>
			<!-- Modal -->
			<div class="modal-overlay" id="transactionModal" style="display:none;">
				<div class="modal-container">
					<div class="modal-header">
						<h3 class="modal-title" id="transactionModalTitle">Record Transaction</h3>
						<button class="modal-close" id="closeTransactionModal"><i class="fas fa-times"></i></button>
					</div>
					<div class="modal-body" style="padding:12px;">
						<div class="form-row">
							<div class="form-group">
								<label class="form-label">Date *</label>
								<input id="txnDate" class="form-input" type="date" required />
							</div>
							<div class="form-group">
								<label class="form-label">Account *</label>
								<input id="txnAccount" class="form-input" type="text" placeholder="e.g., Cash" required />
							</div>
						</div>
						<div class="form-row">
							<div class="form-group">
								<label class="form-label">Description *</label>
								<input id="txnDescription" class="form-input" type="text" required />
							</div>
						</div>
						<div class="form-row">
							<div class="form-group">
								<label class="form-label">Type *</label>
								<select id="txnTypeInput" class="form-select">
									<option>Debit</option>
									<option>Credit</option>
								</select>
							</div>
							<div class="form-group">
								<label class="form-label">Amount *</label>
								<input id="txnAmount" class="form-input" type="number" min="0" step="0.01" required />
							</div>
							<div class="form-group">
								<label class="form-label">Status *</nlabel>
								<select id="txnStatusInput" class="form-select">
									<option>Posted</option>
									<option>Draft</option>
								</select>
							</div>
						</div>
					</div>
					<div class="modal-footer">
						<button class="btn-secondary" id="cancelTransactionBtn">Cancel</button>
						<button class="btn-primary" id="saveTransactionBtn">Save Transaction</button>
					</div>
				</div>
			</div>
		`;

		displayTransactions();
	}

	function attachEventHandlers() {
		const newBtn = document.querySelector('#recordTransactionBtn') || document.querySelector('.section-header .btn-primary');
		if (newBtn) newBtn.addEventListener('click', openNewTransactionModal);
		['txnSearch','txnType','txnStatus'].forEach(id => {
			const el = document.getElementById(id);
			if (el) el.addEventListener('input', displayTransactions);
			if (el && el.tagName === 'SELECT') el.addEventListener('change', displayTransactions);
		});
		document.getElementById('closeTransactionModal')?.addEventListener('click', closeTransactionModal);
		document.getElementById('cancelTransactionBtn')?.addEventListener('click', closeTransactionModal);
		document.getElementById('saveTransactionBtn')?.addEventListener('click', saveTransaction);
		document.addEventListener('click', e => { if (e.target.classList.contains('modal-overlay')) closeTransactionModal(); });
		document.addEventListener('keydown', e => { if (e.key === 'Escape') closeTransactionModal(); });
	}

	function displayTransactions() {
		const tbody = document.getElementById('transactionsTableBody');
		if (!tbody) return;
		const q = (document.getElementById('txnSearch')?.value || '').toLowerCase();
		const t = document.getElementById('txnType')?.value || '';
		const s = document.getElementById('txnStatus')?.value || '';
		const filtered = transactions.filter(txn =>
			(!q || `${txn.account} ${txn.description}`.toLowerCase().includes(q)) &&
			(!t || txn.type === t) && (!s || txn.status === s)
		);
		if (filtered.length === 0) {
			tbody.innerHTML = '<tr><td colspan="7" class="no-data">No transactions found</td></tr>';
			return;
		}
		tbody.innerHTML = filtered.map(txn => `
			<tr>
				<td>${txn.date}</td>
				<td>${txn.account}</td>
				<td>${txn.description}</td>
				<td style="text-align:right;">${formatAmount(txn.amount)}</td>
				<td>${txn.type}</td>
				<td><span class="status-badge ${txn.status.toLowerCase()}">${txn.status}</span></td>
				<td>
					<div class="action-buttons">
						<button class="btn-icon" data-edit="${txn.id}" title="Edit"><i class="fas fa-edit"></i></button>
						<button class="btn-icon danger" data-del="${txn.id}" title="Delete"><i class="fas fa-trash"></i></button>
					</div>
				</td>
			</tr>
		`).join('');

		Array.from(tbody.querySelectorAll('button[data-edit]')).forEach(btn => btn.addEventListener('click', () => openEditTransactionModal(parseInt(btn.dataset.edit))));
		Array.from(tbody.querySelectorAll('button[data-del]')).forEach(btn => btn.addEventListener('click', () => deleteTransaction(parseInt(btn.dataset.del))));
	}

	let editingId = null;
	function openNewTransactionModal() {
		editingId = null;
		document.getElementById('transactionModalTitle').textContent = 'Record Transaction';
		document.getElementById('txnDate').value = new Date().toISOString().slice(0,10);
		document.getElementById('txnAccount').value = '';
		document.getElementById('txnDescription').value = '';
		document.getElementById('txnTypeInput').value = 'Debit';
		document.getElementById('txnAmount').value = '';
		document.getElementById('txnStatusInput').value = 'Posted';
		showModal();
	}

	function openEditTransactionModal(id) {
		const txn = transactions.find(x => x.id === id);
		if (!txn) return;
		editingId = id;
		document.getElementById('transactionModalTitle').textContent = 'Edit Transaction';
		document.getElementById('txnDate').value = txn.date;
		document.getElementById('txnAccount').value = txn.account;
		document.getElementById('txnDescription').value = txn.description;
		document.getElementById('txnTypeInput').value = txn.type;
		document.getElementById('txnAmount').value = txn.amount;
		document.getElementById('txnStatusInput').value = txn.status;
		showModal();
	}

	function showModal() {
		const modal = document.getElementById('transactionModal');
		modal.style.display = 'flex';
		setTimeout(() => modal.classList.add('show'), 10);
		document.body.style.overflow = 'hidden';
	}

	function closeTransactionModal() {
		const modal = document.getElementById('transactionModal');
		modal.classList.remove('show');
		setTimeout(() => { modal.style.display = 'none'; document.body.style.overflow = ''; }, 300);
	}

	function saveTransaction() {
		const date = document.getElementById('txnDate').value;
		const account = document.getElementById('txnAccount').value.trim();
		const description = document.getElementById('txnDescription').value.trim();
		const type = document.getElementById('txnTypeInput').value;
		const amount = parseFloat(document.getElementById('txnAmount').value);
		const status = document.getElementById('txnStatusInput').value;
		const errors = [];
		if (!date) errors.push('Date is required');
		if (!account) errors.push('Account is required');
		if (!description) errors.push('Description is required');
		if (!(amount > 0)) errors.push('Amount must be greater than 0');
		if (errors.length) return notify(errors.join('. '), 'error');
		if (editingId) {
			const idx = transactions.findIndex(t => t.id === editingId);
			if (idx !== -1) transactions[idx] = { ...transactions[idx], date, account, description, type, amount, status };
			notify('Transaction updated', 'success');
		} else {
			const id = (transactions.length ? Math.max(...transactions.map(t => t.id)) : 0) + 1;
			transactions.unshift({ id, date, account, description, type, amount, status });
			notify('Transaction recorded', 'success');
		}
		closeTransactionModal();
		displayTransactions();
	}

	function deleteTransaction(id) {
		if (!confirm('Delete this transaction?')) return;
		transactions = transactions.filter(t => t.id !== id);
		displayTransactions();
		notify('Transaction deleted', 'success');
	}

	function formatAmount(n) {
		return Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

