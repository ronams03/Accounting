// Reports Module JavaScript
document.addEventListener('DOMContentLoaded', function() {
	document.addEventListener('headerLoaded', initReportsModule);
	if (document.querySelector('.sidebar')) initReportsModule();

	function initReportsModule() {
		setupNavigationLinks();
		loadDarkModeFromSettings();
		renderReportsUI();
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
				<div class="page-transition-icon"><i class="fas fa-chart-bar"></i></div>
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

	// Use local transactions sample to compute example reports
	const sampleTxns = [
		{ date: '2024-01-15', account: 'Cash', type: 'Debit', amount: 5000 },
		{ date: '2024-01-16', account: 'Service Revenue', type: 'Credit', amount: 1500 },
		{ date: '2024-01-17', account: 'Salaries Expense', type: 'Debit', amount: 900 }
	];

	function renderReportsUI() {
		const container = document.querySelector('.section-body');
		if (!container) return;
		container.innerHTML = `
			<div class="settings-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin-bottom:12px;">
				<div class="setting-card">
					<div class="setting-header"><i class="fas fa-filter"></i><span>Report Filters</span></div>
					<div class="setting-body">
						<label class="form-label">Report Type</label>
						<select id="reportType" class="modern-select">
							<option value="income">Income Statement</option>
							<option value="balance">Balance Sheet</option>
							<option value="trial">Trial Balance</option>
						</select>
						<label class="form-label" style="margin-top:8px;display:block;">Start Date</label>
						<input id="startDate" type="date" class="form-input" />
						<label class="form-label" style="margin-top:8px;display:block;">End Date</label>
						<input id="endDate" type="date" class="form-input" />
						<div style="margin-top:12px;display:flex;gap:8px;">
							<button class="btn-primary" id="generateReportBtn"><i class="fas fa-play"></i> Generate</button>
							<button class="btn-secondary" id="downloadReportBtn"><i class="fas fa-download"></i> Download</button>
						</div>
					</div>
				</div>
			</div>
			<div class="content-section" style="border: 1px solid #e9ecef; background: #fff; border-radius: 6px;">
				<div class="section-header" style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid #e9ecef;">
					<h3>Report Preview</h3>
				</div>
				<div class="section-body" id="reportPreview" style="padding:12px;">
					<p style="font-size:12px;color:#6c757d;">Select a report type and date range, then click Generate.</p>
				</div>
			</div>
		`;
	}

	function attachEventHandlers() {
		const genBtn = document.getElementById('generateReportBtn') || document.querySelector('.section-header .btn-primary');
		if (genBtn) genBtn.addEventListener('click', generateReport);
		document.getElementById('downloadReportBtn')?.addEventListener('click', downloadReport);
	}

	let lastReport = { title: '', rows: [], totals: {} };

	function generateReport() {
		const type = document.getElementById('reportType')?.value || 'income';
		const start = document.getElementById('startDate')?.value;
		const end = document.getElementById('endDate')?.value;
		const txns = sampleTxns.filter(t => (!start || t.date >= start) && (!end || t.date <= end));

		let title = '';
		let rows = [];
		let totals = {};
		if (type === 'income') {
			title = 'Income Statement';
			const revenue = txns.filter(t => t.account.includes('Revenue')).reduce((s,t) => s + (t.type==='Credit'?t.amount:0), 0);
			const expenses = txns.filter(t => t.account.includes('Expense')).reduce((s,t) => s + (t.type==='Debit'?t.amount:0), 0);
			totals = { revenue, expenses, net: revenue - expenses };
			rows = [
				{ label: 'Revenue', value: revenue },
				{ label: 'Expenses', value: expenses },
				{ label: 'Net Income', value: revenue - expenses }
			];
		} else if (type === 'balance') {
			title = 'Balance Sheet';
			const assets = txns.filter(t => ['Cash','Accounts Receivable'].includes(t.account)).reduce((s,t)=> s + (t.type==='Debit'?t.amount:-t.amount),0);
			const liabilities = txns.filter(t => ['Accounts Payable'].includes(t.account)).reduce((s,t)=> s + (t.type==='Credit'?t.amount:-t.amount),0);
			totals = { assets, liabilities, equity: assets - liabilities };
			rows = [
				{ label: 'Assets', value: assets },
				{ label: 'Liabilities', value: liabilities },
				{ label: 'Equity', value: assets - liabilities }
			];
		} else {
			title = 'Trial Balance';
			const byAccount = {};
			txns.forEach(t => {
				if (!byAccount[t.account]) byAccount[t.account] = { debit: 0, credit: 0 };
				byAccount[t.account][t.type.toLowerCase()] += t.amount;
			});
			rows = Object.keys(byAccount).map(acc => ({ account: acc, debit: byAccount[acc].debit, credit: byAccount[acc].credit }));
			totals = rows.reduce((s,r)=>({ debit: s.debit + r.debit, credit: s.credit + r.credit }), { debit:0, credit:0 });
		}
		lastReport = { title, rows, totals, type, start, end };
		renderPreview(lastReport);
		notify('Report generated', 'success');
	}

	function renderPreview(report) {
		const target = document.getElementById('reportPreview');
		if (!target) return;
		if (report.type === 'trial') {
			target.innerHTML = `
				<h4 style="margin:0 0 8px 0;">${report.title}</h4>
				<table class="users-table" style="width:100%;border-collapse:collapse;font-size:12px;">
					<thead><tr><th>Account</th><th style="text-align:right;">Debit</th><th style="text-align:right;">Credit</th></tr></thead>
					<tbody>
						${report.rows.map(r => `<tr><td>${r.account}</td><td style=\"text-align:right;\">${fmt(r.debit)}</td><td style=\"text-align:right;\">${fmt(r.credit)}</td></tr>`).join('')}
						<tr><td style="font-weight:600;">Totals</td><td style="text-align:right;font-weight:600;">${fmt(report.totals.debit)}</td><td style="text-align:right;font-weight:600;">${fmt(report.totals.credit)}</td></tr>
					</tbody>
				</table>
			`;
		} else {
			target.innerHTML = `
				<h4 style="margin:0 0 8px 0;">${report.title}</h4>
				<ul style="margin:0;padding-left:16px;">
					${report.rows.map(r => `<li><strong>${r.label}:</strong> ${fmt(r.value)}</li>`).join('')}
				</ul>
			`;
		}
	}

	function downloadReport() {
		if (!lastReport || !lastReport.title) { return notify('Generate a report first', 'warning'); }
		let csv = `${lastReport.title}\n`;
		if (lastReport.type === 'trial') {
			csv += 'Account,Debit,Credit\n';
			lastReport.rows.forEach(r => { csv += `${r.account},${r.debit},${r.credit}\n`; });
			csv += `Totals,${lastReport.totals.debit},${lastReport.totals.credit}\n`;
		} else {
			csv += 'Item,Value\n';
			lastReport.rows.forEach(r => { csv += `${r.label},${r.value}\n`; });
		}
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${lastReport.title.replace(/\s+/g,'_').toLowerCase()}.csv`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		notify('Report downloaded', 'success');
	}

	function fmt(n){ return Number(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}); }
	function notify(message, type = 'info') {
		const el = document.createElement('div');
		el.className = `notification ${type}`;
		el.innerHTML = `
			<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
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
				.notification.warning { border-left-color:#f59e0b; }
				.notification button { background:none; border:none; color:#64748b; cursor:pointer; padding:2px; margin-left:auto; }
			`;
			document.head.appendChild(styles);
		}
		document.body.appendChild(el);
		setTimeout(() => { if (el.parentElement) el.remove(); }, 3000);
	}
});

