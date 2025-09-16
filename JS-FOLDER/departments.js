// Departments Module JavaScript
document.addEventListener('DOMContentLoaded', function() {
	document.addEventListener('headerLoaded', initDepartmentsModule);
	if (document.querySelector('.sidebar')) initDepartmentsModule();

	function initDepartmentsModule() {
		setupNavigationLinks();
		loadDarkModeFromSettings();
		renderDepartmentsUI();
		attachEventHandlers();
	}

	function setupNavigationLinks() {
		document.querySelectorAll('.nav-link').forEach(link => {
			link.addEventListener('click', function(e) {
				const href = this.getAttribute('href') || '';
				if (href.startsWith('#')) { e.preventDefault(); showPageTransition(href); }
			});
		});
	}

	function showPageTransition(route) {
		const overlay = document.createElement('div');
		overlay.className = 'page-transition-overlay';
		overlay.innerHTML = `
			<div class="page-transition-content">
				<div class="page-transition-icon"><i class="fas fa-building"></i></div>
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
		window.addEventListener('storage', function(e) { if (e.key === 'accountingSettings') applyThemeMode(JSON.parse(localStorage.getItem('accountingSettings')||'{}').themeMode||'light'); });
		if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() { const s=JSON.parse(localStorage.getItem('accountingSettings')||'{}'); if (s.themeMode==='auto') applyThemeMode('auto'); });
	}

	let departments = [
		{ id: 1, name: 'Administration', description: 'Company administration and HR', status: 'Active' },
		{ id: 2, name: 'Operations', description: 'Operations and logistics', status: 'Active' },
		{ id: 3, name: 'Accounting', description: 'Accounting and finance', status: 'Active' }
	];

	function renderDepartmentsUI() {
		const container = document.querySelector('.section-body');
		if (!container) return;
		container.innerHTML = `
			<div class="filters-section" style="display:flex;gap:6px;margin-bottom:8px;padding:6px;background:#f8f9fa;border-radius:4px;">
				<input id="deptSearch" class="filter-input" type="text" placeholder="Search departments..." style="padding:4px 6px;border:1px solid #ddd;border-radius:4px;font-size:12px;min-width:180px;" />
				<select id="deptStatus" class="filter-select" style="padding:4px 6px;border:1px solid #ddd;border-radius:4px;font-size:12px;min-width:140px;">
					<option value="">All Status</option>
					<option>Active</option>
					<option>Inactive</option>
				</select>
			</div>
			<div class="users-table-container" style="background:white;border-radius:6px;border:1px solid #e9ecef;overflow:hidden;">
				<table class="users-table" style="width:100%;border-collapse:collapse;font-size:12px;">
					<thead>
						<tr>
							<th style="text-align:left;padding:6px 8px;background:#f8f9fa;border-bottom:1px solid #dee2e6;">Department</th>
							<th style="text-align:left;padding:6px 8px;background:#f8f9fa;border-bottom:1px solid #dee2e6;">Description</th>
							<th style="text-align:left;padding:6px 8px;background:#f8f9fa;border-bottom:1px solid #dee2e6;">Status</th>
							<th style="text-align:left;padding:6px 8px;background:#f8f9fa;border-bottom:1px solid #dee2e6;">Actions</th>
						</tr>
					</thead>
					<tbody id="departmentsTableBody">
						<tr><td colspan="4" class="loading" style="text-align:center;padding:20px;color:#6c757d;font-style:italic;">Loading...</td></tr>
					</tbody>
				</table>
			</div>
			<!-- Modal -->
			<div class="modal-overlay" id="departmentModal" style="display:none;">
				<div class="modal-container">
					<div class="modal-header">
						<h3 class="modal-title" id="departmentModalTitle">New Department</h3>
						<button class="modal-close" id="closeDepartmentModal"><i class="fas fa-times"></i></button>
					</div>
					<div class="modal-body" style="padding:12px;">
						<div class="form-row">
							<div class="form-group">
								<label class="form-label">Name *</label>
								<input id="deptName" class="form-input" type="text" required />
							</div>
						</div>
						<div class="form-row">
							<div class="form-group">
								<label class="form-label">Description</label>
								<input id="deptDescription" class="form-input" type="text" />
							</div>
						</div>
						<div class="form-row">
							<div class="form-group">
								<label class="form-label">Status *</label>
								<select id="deptStatusInput" class="form-select">
									<option>Active</option>
									<option>Inactive</option>
								</select>
							</div>
						</div>
					</div>
					<div class="modal-footer">
						<button class="btn-secondary" id="cancelDepartmentBtn">Cancel</button>
						<button class="btn-primary" id="saveDepartmentBtn">Save Department</button>
					</div>
				</div>
			</div>
		`;

		displayDepartments();
	}

	function attachEventHandlers() {
		const newBtn = document.querySelector('#newDepartmentBtn') || document.querySelector('.section-header .btn-primary');
		if (newBtn) newBtn.addEventListener('click', openNewDepartmentModal);
		['deptSearch','deptStatus'].forEach(id => { const el = document.getElementById(id); if (el) { el.addEventListener('input', displayDepartments); el.addEventListener('change', displayDepartments); } });
		document.getElementById('closeDepartmentModal')?.addEventListener('click', closeDepartmentModal);
		document.getElementById('cancelDepartmentBtn')?.addEventListener('click', closeDepartmentModal);
		document.getElementById('saveDepartmentBtn')?.addEventListener('click', saveDepartment);
		document.addEventListener('click', e => { if (e.target.classList.contains('modal-overlay')) closeDepartmentModal(); });
		document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDepartmentModal(); });
	}

	function displayDepartments() {
		const tbody = document.getElementById('departmentsTableBody');
		if (!tbody) return;
		const q = (document.getElementById('deptSearch')?.value || '').toLowerCase();
		const s = document.getElementById('deptStatus')?.value || '';
		const filtered = departments.filter(d => (!q || `${d.name} ${d.description}`.toLowerCase().includes(q)) && (!s || d.status === s));
		if (filtered.length === 0) { tbody.innerHTML = '<tr><td colspan="4" class="no-data">No departments found</td></tr>'; return; }
		tbody.innerHTML = filtered.map(d => `
			<tr>
				<td>${d.name}</td>
				<td>${d.description || ''}</td>
				<td><span class="status-badge ${d.status.toLowerCase()}">${d.status}</span></td>
				<td>
					<div class="action-buttons">
						<button class="btn-icon" data-edit="${d.id}" title="Edit"><i class="fas fa-edit"></i></button>
						<button class="btn-icon danger" data-del="${d.id}" title="Delete"><i class="fas fa-trash"></i></button>
					</div>
				</td>
			</tr>
		`).join('');
		Array.from(tbody.querySelectorAll('button[data-edit]')).forEach(btn => btn.addEventListener('click', () => openEditDepartmentModal(parseInt(btn.dataset.edit))));
		Array.from(tbody.querySelectorAll('button[data-del]')).forEach(btn => btn.addEventListener('click', () => deleteDepartment(parseInt(btn.dataset.del))));
	}

	let editingId = null;
	function openNewDepartmentModal() {
		editingId = null;
		document.getElementById('departmentModalTitle').textContent = 'New Department';
		document.getElementById('deptName').value = '';
		document.getElementById('deptDescription').value = '';
		document.getElementById('deptStatusInput').value = 'Active';
		showModal();
	}

	function openEditDepartmentModal(id) {
		const d = departments.find(x => x.id === id);
		if (!d) return;
		editingId = id;
		document.getElementById('departmentModalTitle').textContent = 'Edit Department';
		document.getElementById('deptName').value = d.name;
		document.getElementById('deptDescription').value = d.description || '';
		document.getElementById('deptStatusInput').value = d.status;
		showModal();
	}

	function showModal() { const modal = document.getElementById('departmentModal'); modal.style.display = 'flex'; setTimeout(() => modal.classList.add('show'), 10); document.body.style.overflow = 'hidden'; }
	function closeDepartmentModal() { const modal = document.getElementById('departmentModal'); modal.classList.remove('show'); setTimeout(() => { modal.style.display = 'none'; document.body.style.overflow = ''; }, 300); }

	function saveDepartment() {
		const name = document.getElementById('deptName').value.trim();
		const description = document.getElementById('deptDescription').value.trim();
		const status = document.getElementById('deptStatusInput').value;
		const errors = [];
		if (!name) errors.push('Name is required');
		if (errors.length) return notify(errors.join('. '), 'error');
		if (editingId) {
			const idx = departments.findIndex(d => d.id === editingId);
			if (idx !== -1) departments[idx] = { ...departments[idx], name, description, status };
			notify('Department updated', 'success');
		} else {
			const id = (departments.length ? Math.max(...departments.map(d => d.id)) : 0) + 1;
			departments.unshift({ id, name, description, status });
			notify('Department created', 'success');
		}
		closeDepartmentModal();
		displayDepartments();
	}

	function deleteDepartment(id) {
		if (!confirm('Delete this department?')) return;
		departments = departments.filter(d => d.id !== id);
		displayDepartments();
		notify('Department deleted', 'success');
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
			const styles = document.createElement('style'); styles.id = 'notification-styles'; styles.textContent = `
				.notification { position: fixed; top: 20px; right: 20px; background: white; padding: 8px 12px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-left: 4px solid #3b82f6; display:flex; gap:8px; align-items:center; font-size:12px; z-index:10000; }
				.notification.success { border-left-color:#10b981; }
				.notification.error { border-left-color:#ef4444; }
				.notification button { background:none; border:none; color:#64748b; cursor:pointer; padding:2px; margin-left:auto; }
			`; document.head.appendChild(styles);
		}
		document.body.appendChild(el);
		setTimeout(() => { if (el.parentElement) el.remove(); }, 3000);
	}
});

