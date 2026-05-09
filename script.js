const GAS_URL = "https://script.google.com/macros/s/AKfycbxt1_NeYXWt6QPna7a6_GEFCJRcWpU4Yk-Cef0uWEbfKSaILd0iQDc8c_Is6_pO7T8icQ/exec";

// Data Store
let medicines = [];
let issues = [];
let doctors = [];
let activities = [];
let users = [];

let currentRole = sessionStorage.getItem('celogen_role') || null;
let currentUser = sessionStorage.getItem('celogen_user') || null;
let isDataLoaded = false;
let saveTimeout = null;

async function loadDataFromGas() {
    try {
        const response = await fetch(GAS_URL);
        if (!response.ok) throw new Error("Network response was not ok");
        const dataStr = await response.text();
        
        if (!dataStr || dataStr.trim() === "") {
            console.log("Server returned empty data. Initializing empty state.");
            isDataLoaded = true;
            return true;
        }

        let data;
        try { 
            data = JSON.parse(dataStr); 
        } catch(e) {
            console.error("Invalid JSON from server:", dataStr);
            showToast("Database error: Data corrupted on server.", "error");
            return false;
        }
        
        medicines = data.medicines || [];
        issues = data.issues || [];
        doctors = data.doctors || [];
        activities = data.activities || [];
        users = data.users || [];
        
        // Ensure default users exist if absolutely none are found
        if (users.length === 0) {
            users = [
                { username: 'Admin', role: 'Admin', password: 'admin123' },
                { username: 'Assistant', role: 'Assistant', password: 'staff123' }
            ];
        }
        
        isDataLoaded = true;
        console.log("Database successfully loaded.");
        
        // Initial Renders
        renderInventory();
        updateDashboard();
        renderMedicineOptions();
        renderIssues();
        renderActivityFeed();
        if (typeof renderDoctors === 'function') renderDoctors();
        if (typeof renderDoctorOptions === 'function') renderDoctorOptions();
        if (currentRole === 'Admin') renderUsers();
        
        return true;
    } catch (error) {
        console.error("Error loading data from Google Sheets:", error);
        showToast("Error connecting to database. Please check your internet.", "error");
        return false;
    }
}
        
    } catch (error) {
        console.error("Error loading data from Google Sheets:", error);
        showToast("Error loading data from database.", "error");
    }
}

// Utility: Save to Google Sheets
function saveData() {
    if (!isDataLoaded) {
        console.warn("Save blocked: Data is not yet loaded from the server.");
        return;
    }

    const payload = {
        medicines,
        issues,
        doctors,
        activities,
        users
    };
    
    // We update local UI immediately
    updateDashboard();
    renderInventory();
    renderIssues();
    renderMedicineOptions();
    renderActivityFeed();
    if (typeof renderChart === 'function') renderChart();
    if (typeof renderDoctors === 'function') renderDoctors();
    if (typeof renderDoctorOptions === 'function') renderDoctorOptions();
    if (typeof renderAlerts === 'function') renderAlerts();
    if (typeof renderHealthChart === 'function') renderHealthChart();
    if (typeof renderUsageReport === 'function') renderUsageReport();
    if (typeof populateYearFilter === 'function') populateYearFilter();
    updateUIByRole();
    if (currentRole === 'Admin') renderUsers();

    // Theme consistency
    if (document.body.classList.contains('light-theme')) {
        document.getElementById('theme-icon-light')?.classList.add('hidden-role');
        document.getElementById('theme-icon-dark')?.classList.remove('hidden-role');
    } else {
        document.getElementById('theme-icon-light')?.classList.remove('hidden-role');
        document.getElementById('theme-icon-dark')?.classList.add('hidden-role');
    }

    // Debounce network request to prevent race conditions and excessive writes
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        fetch(GAS_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        }).catch(err => console.error("Error saving to GAS", err));
    }, 1000);
}

function updateUIByRole() {
    const isAdmin = currentRole === 'Admin';
    const adminElements = document.querySelectorAll('.admin-only');
    
    adminElements.forEach(el => {
        if (isAdmin) el.classList.remove('hidden-role');
        else el.classList.add('hidden-role');
    });

    const roleDisplay = document.getElementById('user-role-display');
    if (roleDisplay) {
        roleDisplay.innerHTML = `${currentUser || currentRole} <span style="font-size:0.6rem; opacity:0.8;">(${currentRole})</span>`;
        roleDisplay.className = `role-badge role-${currentRole?.toLowerCase()}`;
    }
}

function logActivity(message, type = 'info') {
    activities.unshift({
        id: Date.now(),
        date: new Date().toISOString(),
        message,
        type
    });
    // Keep only last 50 activities
    if (activities.length > 50) activities.pop();
    saveData();
}

// Navigation Logic
document.querySelectorAll('.nav-item').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
        
        button.classList.add('active');
        const targetId = button.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');

        // Special initialization for sample request
        if (targetId === 'sample-request') {
            renderSampleRequestGrid();
        }
    });
});

window.switchTab = function(targetId) {
    const targetBtn = document.querySelector(`.nav-item[data-target="${targetId}"]`);
    if(targetBtn) targetBtn.click();
}

// Modal Logic
const addMedModal = document.getElementById('add-medicine-modal');
document.getElementById('btn-add-medicine')?.addEventListener('click', () => {
    document.getElementById('med-modal-title').innerText = 'Add New Product';
    document.getElementById('btn-med-save').innerText = 'Save Product';
    document.getElementById('med-edit-id').value = '';
    document.getElementById('add-medicine-form').reset();
    addMedModal.classList.add('active');
});

const addDocModal = document.getElementById('add-doctor-modal');
document.getElementById('btn-add-doctor')?.addEventListener('click', () => {
    document.getElementById('doc-modal-title').innerText = 'Add New Recipient';
    document.getElementById('btn-doc-save').innerText = 'Save Recipient';
    document.getElementById('doc-edit-id').value = '';
    document.getElementById('add-doctor-form').reset();
    addDocModal.classList.add('active');
});

document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
        document.getElementById('add-medicine-form')?.reset();
        document.getElementById('add-doctor-form')?.reset();
        document.getElementById('discard-stock-form')?.reset();
    });
});

// Toast Notification
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' 
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    
    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Dashboard Updates
function updateDashboard() {
    const totalMedicines = medicines.length;
    // Only count active issues
    const activeIssues = issues.filter(i => i.status !== 'cancelled');
    const totalIssued = activeIssues.reduce((sum, issue) => sum + issue.quantity, 0);
    
    medicines.forEach(med => {
        const threshold = med.minThreshold || 50;
        if(med.quantity <= 0) med.status = 'out';
        else if(med.quantity < threshold) med.status = 'low';
        else med.status = 'ok';
    });
    
    const lowStock = medicines.filter(m => m.status === 'low' || m.status === 'out').length;
    
    // Update badge
    const badge = document.getElementById('alert-badge');
    if (badge) badge.innerText = lowStock;
    
    animateValue('stat-total-medicines', totalMedicines);
    animateValue('stat-samples-issued', totalIssued);
    animateValue('stat-low-stock', lowStock);
    
    // Recent issues table
    const recentIssuesBody = document.querySelector('#recent-issues-table tbody');
    if (recentIssuesBody) {
        recentIssuesBody.innerHTML = '';
        const recentIssues = [...activeIssues].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
        
        if (recentIssues.length === 0) {
            recentIssuesBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No recent issues found.</td></tr>`;
        } else {
            recentIssues.forEach(issue => {
                const dateStr = new Date(issue.date).toLocaleDateString();
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${issue.medicineName}</strong></td>
                    <td>${issue.doctor}</td>
                    <td>${issue.quantity}</td>
                    <td>${dateStr}</td>
                `;
                recentIssuesBody.appendChild(tr);
            });
        }
    }
}

function renderActivityFeed() {
    const feed = document.getElementById('activity-feed');
    if (!feed) return;
    feed.innerHTML = '';
    
    if (activities.length === 0) {
        feed.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 1rem;">No activity yet.</p>`;
        return;
    }
    
    activities.slice(0, 15).forEach(act => {
        const dateObj = new Date(act.date);
        const timeStr = dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        let color = 'var(--text-secondary)';
        if(act.type === 'error' || act.type === 'danger') color = 'var(--danger)';
        if(act.type === 'warning') color = 'var(--warning)';
        if(act.type === 'success') color = 'var(--success)';
        
        const el = document.createElement('div');
        el.style.display = 'flex';
        el.style.gap = '1rem';
        el.style.borderBottom = '1px solid var(--border-color)';
        el.style.paddingBottom = '0.5rem';
        
        el.innerHTML = `
            <span style="color: var(--text-muted); font-size: 0.8rem; min-width: 60px;">${timeStr}</span>
            <span style="font-size: 0.9rem; color: ${color};">${act.message}</span>
        `;
        feed.appendChild(el);
    });
}

function renderAlerts() {
    const container = document.getElementById('action-alerts');
    if (!container) return;
    container.innerHTML = '';
    
    let alertsCount = 0;
    
    // Check low stock
    medicines.filter(m => {
        const threshold = m.minThreshold || 50;
        return m.quantity < threshold;
    }).forEach(med => {
        alertsCount++;
        const el = document.createElement('div');
        el.style.display = 'flex'; el.style.gap = '1rem'; el.style.alignItems = 'center';
        el.style.borderBottom = '1px solid var(--border-color)'; el.style.paddingBottom = '0.5rem';
        el.innerHTML = `
            <div style="background: var(--warning-bg); color: var(--warning); padding: 4px; border-radius: 4px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <div>
                <strong style="display:block; font-size: 0.9rem;">${med.name} ${med.quantity === 0 ? 'Out of Stock' : 'Low Stock'}</strong>
                <span style="color: var(--text-muted); font-size: 0.8rem;">Current: ${med.quantity} (Threshold: ${med.minThreshold || 50})</span>
            </div>
        `;
        container.appendChild(el);
    });
    
    // Check Expiry (Next 3 months)
    const today = new Date();
    const nextQuarter = new Date();
    nextQuarter.setMonth(today.getMonth() + 3);
    
    medicines.forEach(med => {
        if(!med.expiry) return;
        const expDate = new Date(med.expiry);
        if(expDate <= nextQuarter) {
            alertsCount++;
            const isExpired = expDate < today;
            const colorVar = isExpired ? 'danger' : 'warning';
            
            const el = document.createElement('div');
            el.style.display = 'flex'; el.style.gap = '1rem'; el.style.alignItems = 'center';
            el.style.borderBottom = '1px solid var(--border-color)'; el.style.paddingBottom = '0.5rem';
            el.innerHTML = `
                <div style="background: var(--${colorVar}-bg); color: var(--${colorVar}); padding: 4px; border-radius: 4px;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <div>
                    <strong style="display:block; font-size: 0.9rem; color: var(--${colorVar});">${isExpired ? 'EXPIRED: ' : 'Expiring Soon: '} ${med.name}</strong>
                    <span style="color: var(--text-muted); font-size: 0.8rem;">Batch ${med.batch} (Exp: ${med.expiry})</span>
                </div>
            `;
            container.appendChild(el);
        }
    });
    
    if (alertsCount === 0) {
        container.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 1rem;">No critical alerts. All good!</p>`;
    }
}

function animateValue(id, end) {
    const obj = document.getElementById(id);
    if(!obj) return;
    const start = parseInt(obj.innerText) || 0;
    if (start === end) {
        obj.innerText = end;
        return;
    }
    
    const duration = 1000;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = (end - start) / steps;
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            obj.innerText = end;
            clearInterval(timer);
        } else {
            obj.innerText = Math.round(current);
        }
    }, stepTime);
}

// Render Inventory
function renderInventory() {
    const tbody = document.querySelector('#inventory-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    if (medicines.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">Inventory is empty.</td></tr>`;
        return;
    }
    
    medicines.forEach(med => {
        let statusBadge = '';
        if (med.status === 'ok') statusBadge = '<span class="status-badge status-ok">In Stock</span>';
        else if (med.status === 'low') statusBadge = '<span class="status-badge status-low">Low Stock</span>';
        else statusBadge = '<span class="status-badge status-out">Out of Stock</span>';
        
        const tr = document.createElement('tr');
        
        let actions = `
            <div style="display: flex; gap: 4px;">
                <button class="btn-icon" title="Edit" onclick="openEditMedicineModal('${med.id}')" style="color: var(--primary);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4L18.5 2.5z"></path></svg></button>
                <button class="btn-icon" title="Adjust Stock" onclick="adjustStock('${med.id}')" style="color: var(--primary);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10M18 20V4M6 20v-4"></path></svg></button>
                <button class="btn-icon" title="Discard Stock" onclick="openDiscardModal('${med.id}')" style="color: var(--warning);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></button>
                <button class="btn-icon" title="Delete" onclick="deleteMedicine('${med.id}')" style="color: var(--danger);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
            </div>
        `;
        
        if (currentRole === 'Assistant') {
            actions = `<span style="color:var(--text-muted); font-size:0.8rem;">View Only</span>`;
        }

        tr.innerHTML = `
            <td>${med.id}</td>
            <td><strong>${med.name}</strong></td>
            <td>${med.batch}</td>
            <td>${med.expiry}</td>
            <td><strong>${med.quantity}</strong></td>
            <td>${statusBadge}</td>
            <td>${actions}</td>
        `;
        tbody.appendChild(tr);
    });
}

window.deleteMedicine = function(id) {
    if(confirm('Are you sure you want to delete this product?')) {
        const med = medicines.find(m => m.id === id);
        medicines = medicines.filter(m => m.id !== id);
        logActivity(`Deleted product: ${med.name}`, 'danger');
        saveData();
        showToast('Product deleted successfully');
    }
}

window.openEditMedicineModal = function(id) {
    const med = medicines.find(m => m.id === id);
    if(!med) return;
    
    document.getElementById('med-modal-title').innerText = 'Edit Product Details';
    document.getElementById('btn-med-save').innerText = 'Update Product';
    
    document.getElementById('med-edit-id').value = med.id;
    document.getElementById('med-name').value = med.name;
    document.getElementById('med-batch').value = med.batch;
    document.getElementById('med-expiry').value = med.expiry;
    document.getElementById('med-qty').value = med.quantity;
    document.getElementById('med-threshold').value = med.minThreshold || 50;
    
    addMedModal.classList.add('active');
}

window.openDiscardModal = function(id) {
    const med = medicines.find(m => m.id === id);
    if(!med) return;
    
    document.getElementById('discard-med-id').value = med.id;
    document.getElementById('discard-med-name').value = med.name;
    document.getElementById('discard-qty').value = '';
    document.getElementById('discard-qty').max = med.quantity;
    
    document.getElementById('discard-stock-modal').classList.add('active');
}

// Render Issue Options for all medicine selects
function renderMedicineOptions() {
    const selects = document.querySelectorAll('.issue-medicine');
    selects.forEach(select => {
        const currentVal = select.value;
        const firstOp = select.options[0];
        select.innerHTML = '';
        select.appendChild(firstOp);
        
        medicines.filter(m => m.quantity > 0 || m.id === currentVal).forEach(med => {
            const option = document.createElement('option');
            option.value = med.id;
            option.textContent = `${med.name} (Stock: ${med.quantity})`;
            if (med.id === currentVal) option.selected = true;
            select.appendChild(option);
        });
    });
}

// Render History
function renderIssues(filteredIssues = null) {
    const tbody = document.querySelector('#history-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const dataToRender = filteredIssues || issues;
    const sortedIssues = [...dataToRender].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sortedIssues.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No history available in this range.</td></tr>`;
        return;
    }
    
    sortedIssues.forEach(issue => {
        const dateObj = new Date(issue.date);
        const dateStr = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        let statusHtml = '<span class="status-badge status-ok">Issued</span>';
        let actionsHtml = `
            <div style="display: flex; gap: 8px; align-items: center;">
                <button class="btn-text" onclick="reIssue(${issue.id})" style="color: var(--primary); font-size: 0.8rem; font-weight: 600;">Re-Issue</button>
                <button class="btn-text" onclick="printReceipt(${issue.id})" style="color: var(--primary); font-size: 0.8rem;">Gate Pass</button>
                <button class="btn-text admin-only" onclick="cancelIssue(${issue.id})" style="color: var(--danger); font-size: 0.8rem;">Cancel</button>
            </div>
        `;
        
        if (currentRole === 'Assistant') {
            actionsHtml = `
                <div style="display: flex; gap: 8px; align-items: center;">
                    <button class="btn-text" onclick="printReceipt(${issue.id})" style="color: var(--primary); font-size: 0.8rem;">Gate Pass</button>
                </div>
            `;
        }
        
        if (issue.status === 'cancelled') {
            statusHtml = '<span class="status-badge status-out">Cancelled</span>';
            actionsHtml = `<span style="color: var(--text-muted); font-size: 0.8rem;">Voided</span>`;
        }
        
        const tr = document.createElement('tr');
        if(issue.status === 'cancelled') tr.style.opacity = '0.6';
        
        tr.innerHTML = `
            <td>${dateStr}</td>
            <td><strong>${issue.doctor}</strong></td>
            <td>${issue.medicineName}</td>
            <td>${issue.batch}</td>
            <td><strong>${issue.quantity}</strong></td>
            <td>${statusHtml}</td>
            <td>${actionsHtml}</td>
        `;
        tbody.appendChild(tr);
    });
}

window.applyDateFilter = function() {
    const startVal = document.getElementById('filter-start-date').value;
    const endVal = document.getElementById('filter-end-date').value;
    
    if(!startVal && !endVal) return;
    
    const start = startVal ? new Date(startVal).setHours(0,0,0,0) : 0;
    const end = endVal ? new Date(endVal).setHours(23,59,59,999) : Infinity;
    
    const filtered = issues.filter(issue => {
        const d = new Date(issue.date).getTime();
        return d >= start && d <= end;
    });
    
    renderIssues(filtered);
    showToast(`Found ${filtered.length} records in this date range`, 'info');
}

window.clearDateFilter = function() {
    document.getElementById('filter-start-date').value = '';
    document.getElementById('filter-end-date').value = '';
    renderIssues();
}

window.cancelIssue = function(id) {
    if(confirm('Are you sure you want to cancel this issue? The stock will be returned to inventory.')) {
        const issue = issues.find(i => i.id === id);
        if(!issue || issue.status === 'cancelled') return;
        
        issue.status = 'cancelled';
        
        // Return stock
        const med = medicines.find(m => m.id === issue.medicineId);
        if(med) {
            med.quantity += issue.quantity;
            med.status = med.quantity < 50 ? 'low' : 'ok';
        }
        
        logActivity(`Cancelled issue to ${issue.doctor} (Returned ${issue.quantity} ${issue.medicineName})`, 'warning');
        saveData();
        showToast('Issue cancelled and stock returned.', 'success');
    }
}

window.reIssue = function(id) {
    const issue = issues.find(i => i.id === id);
    if(!issue) return;
    
    switchTab('issue-samples');
    
    // Select the doctor
    const doc = doctors.find(d => d.name === issue.doctor);
    if(doc) document.getElementById('issue-doctor').value = doc.id;
    
    // Select the medicine in the first row
    const firstRow = document.querySelector('.issue-item-row');
    if (firstRow) {
        firstRow.querySelector('.issue-medicine').value = issue.medicineId;
        firstRow.querySelector('.issue-quantity').value = issue.quantity;
    }
    
    document.getElementById('issue-notes').value = `Re-issued from previous order on ${new Date(issue.date).toLocaleDateString()}`;
    
    showToast('Form pre-filled for re-issue', 'info');
}

window.printReceipt = function(id) {
    const mainIssue = issues.find(i => i.id === id);
    if(!mainIssue) return;
    
    // Find all items belonging to the same transaction
    const transactionItems = mainIssue.transactionId 
        ? issues.filter(i => i.transactionId === mainIssue.transactionId && i.status !== 'cancelled')
        : [mainIssue];
        
    const receiptId = mainIssue.transactionId || mainIssue.id;
    
    const tableRows = transactionItems.map(item => `
        <tr>
            <td style="font-size: 1.1rem;">${item.medicineName}</td>
            <td>${item.batch}</td>
            <td style="font-size: 1.2rem;"><strong>${item.quantity} Units</strong></td>
        </tr>
    `).join('');

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
        <html>
        <head>
            <title>Gate Pass - #${receiptId}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 2rem; color: #333; max-width: 800px; margin: 0 auto; }
                .header { text-align: center; border-bottom: 3px solid #159a45; padding-bottom: 1.5rem; margin-bottom: 2rem; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 3rem; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background-color: #f8f9fa; }
                .sigs { display: flex; justify-content: space-between; margin-top: 6rem; }
                .sig-line { border-top: 1px solid #000; width: 250px; text-align: center; padding-top: 10px; font-weight: bold; }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1 style="color: #159a45; margin:0; font-size: 2.5rem;">CELOGEN</h1>
                <p style="margin:5px 0; font-size: 1.2rem; color: #666;">PRODUCT ISSUE GATE PASS / RECEIPT</p>
            </div>
            
            <div style="display:flex; justify-content: space-between; margin-bottom: 2.5rem; font-size: 1.1rem;">
                <div>
                    <p><strong>Issued To:</strong> ${mainIssue.doctor}</p>
                    <p><strong>Date & Time:</strong> ${new Date(mainIssue.date).toLocaleString()}</p>
                </div>
                <div style="text-align: right;">
                    <p><strong>Receipt No:</strong> #${receiptId}</p>
                    <p><strong>Status:</strong> APPROVED</p>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Batch Number</th>
                        <th>Quantity Issued</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
            
            <p style="font-size: 1.1rem;"><strong>Notes / Remarks:</strong> <br><br> ${mainIssue.notes || 'None'}</p>
            
            <div class="sigs">
                <div class="sig-line">Authorized Signature (Celogen)</div>
                <div class="sig-line">Recipient Signature</div>
            </div>
            
            <p style="text-align:center; color:#999; margin-top:4rem; font-size:0.8rem;">Generated securely by Celogen Inventory Management System</p>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
}

// Form Submissions
document.getElementById('add-medicine-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const editId = document.getElementById('med-edit-id').value;
    const name = document.getElementById('med-name').value;
    const batch = document.getElementById('med-batch').value;
    const expiry = document.getElementById('med-expiry').value;
    const quantity = parseInt(document.getElementById('med-qty').value);
    const threshold = parseInt(document.getElementById('med-threshold').value) || 50;
    
    if (editId) {
        // Edit mode
        const index = medicines.findIndex(m => m.id === editId);
        if (index !== -1) {
            medicines[index] = { ...medicines[index], name, batch, expiry, quantity, minThreshold: threshold };
            logActivity(`Updated product: ${name}`);
            showToast('Product updated successfully!');
        }
    } else {
        // Add mode
        const newId = 'M' + String(medicines.length + 1).padStart(3, '0');
        medicines.push({
            id: newId,
            name,
            batch,
            expiry,
            quantity,
            minThreshold: threshold,
            status: quantity < threshold ? 'low' : 'ok'
        });
        logActivity(`Added new product: ${name} (${quantity} units)`);
        showToast('Product added successfully!');
    }
    
    saveData();
    addMedModal.classList.remove('active');
    e.target.reset();
});

// --- Multi-Item Issue Logic ---
document.getElementById('btn-add-issue-item')?.addEventListener('click', () => {
    const container = document.getElementById('issue-items-container');
    const firstRow = container.querySelector('.issue-item-row');
    const newRow = firstRow.cloneNode(true);
    
    // Reset inputs
    newRow.querySelector('select').value = '';
    newRow.querySelector('input').value = '';
    
    // Show remove button
    const removeBtn = newRow.querySelector('.remove-item-row');
    removeBtn.style.visibility = 'visible';
    removeBtn.addEventListener('click', () => {
        newRow.remove();
        toggleRemoveButtons();
    });
    
    container.appendChild(newRow);
    toggleRemoveButtons();
    renderMedicineOptions(); // Populate options for the new row
});

function toggleRemoveButtons() {
    const rows = document.querySelectorAll('.issue-item-row');
    const removeBtns = document.querySelectorAll('.remove-item-row');
    if (rows.length === 1) {
        removeBtns[0].style.visibility = 'hidden';
    } else {
        removeBtns.forEach(btn => btn.style.visibility = 'visible');
    }
}

// Re-attach listeners to existing remove buttons (initial row)
document.querySelectorAll('.remove-item-row').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const row = e.target.closest('.issue-item-row');
        if (document.querySelectorAll('.issue-item-row').length > 1) {
            row.remove();
            toggleRemoveButtons();
        }
    });
});

document.getElementById('issue-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const doctorId = document.getElementById('issue-doctor').value;
    const doctorObj = doctors.find(d => d.id === doctorId);
    if(!doctorObj) {
        showToast('Please select a valid doctor', 'error');
        return;
    }
    const doctor = doctorObj.name;
    const notes = document.getElementById('issue-notes')?.value || '';
    const date = new Date().toISOString();
    const transactionId = Date.now();
    
    const itemRows = document.querySelectorAll('.issue-item-row');
    const itemsToIssue = [];
    
    // 1. Validate all items first
    for (const row of itemRows) {
        const medId = row.querySelector('.issue-medicine').value;
        const qty = parseInt(row.querySelector('.issue-quantity').value);
        
        if (!medId || !qty) continue;
        
        const med = medicines.find(m => m.id === medId);
        if (!med) continue;
        
        if (qty > med.quantity) {
            showToast(`Insufficient stock for ${med.name}!`, 'error');
            return;
        }
        
        itemsToIssue.push({ med, qty });
    }
    
    if (itemsToIssue.length === 0) {
        showToast('Please select at least one medicine', 'error');
        return;
    }
    
    // 2. Commit all issues
    itemsToIssue.forEach(item => {
        const { med, qty } = item;
        med.quantity -= qty;
        
        issues.push({
            id: transactionId + Math.random(), // Unique ID for each item
            transactionId: transactionId,
            date,
            doctor,
            medicineId: med.id,
            medicineName: med.name,
            batch: med.batch,
            quantity: qty,
            notes,
            status: 'issued'
        });
        
        logActivity(`Issued ${qty} ${med.name} to ${doctor}`, 'success');
    });
    
    saveData();
    
    // Reset form to single row
    const container = document.getElementById('issue-items-container');
    const rows = container.querySelectorAll('.issue-item-row');
    for (let i = 1; i < rows.length; i++) rows[i].remove();
    e.target.reset();
    toggleRemoveButtons();
    
    showToast(`${itemsToIssue.length} products issued successfully!`);
    setTimeout(() => switchTab('history'), 500);
});

// Search functionality
document.querySelector('.search-bar input')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    
    const invRows = document.querySelectorAll('#inventory-table tbody tr');
    invRows.forEach(row => {
        if(row.children.length === 1) return;
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
    
    const histRows = document.querySelectorAll('#history-table tbody tr');
    histRows.forEach(row => {
        if(row.children.length === 1) return;
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
});
// --- Sample Request Logic (Standalone Tool) ---
function renderSampleRequestGrid() {
    const head = document.getElementById('bulk-head');
    const body = document.getElementById('bulk-body');
    if (!head || !body) return;

    // Build Header
    let headHtml = `
        <tr>
            <th style="min-width: 40px; text-align:center;">NO</th>
            <th style="position: sticky; left: 0; background: var(--bg-panel); z-index: 10; min-width: 250px;">NAME</th>
    `;
    medicines.forEach(med => {
        headHtml += `<th style="text-align:center;">${med.name}</th>`;
    });
    headHtml += `</tr>`;
    head.innerHTML = headHtml;

    // Build Special Input Row for Main Store Stock
    let mainStoreRow = `
        <tr style="background: rgba(21, 154, 69, 0.1); font-weight: bold;">
            <td colspan="2" style="text-align:right; padding-right: 15px; color: var(--primary);">AVAILABLE BALANCE STOCK:</td>
    `;
    medicines.forEach(med => {
        mainStoreRow += `
            <td style="text-align:center;">
                <input type="text" 
                       inputmode="numeric"
                       pattern="[0-9]*"
                       class="main-store-input" 
                       data-med-name="${med.name}" 
                       placeholder="0" 
                       style="width: 80px; padding: 8px 4px; border: 1px solid var(--primary); background: rgba(255,255,255,0.15); color: var(--primary); border-radius: 4px; text-align:center; font-weight: bold; font-size: 1rem;">
            </td>
        `;
    });
    mainStoreRow += `</tr>`;
    
    // Build Body
    let bodyHtml = mainStoreRow;
    doctors.forEach((doc, index) => {
        bodyHtml += `
            <tr>
                <td style="text-align:center; color: var(--text-muted);">${index + 1}</td>
                <td style="position: sticky; left: 0; background: var(--bg-panel); z-index: 5; font-weight: 600;">${doc.name}</td>
        `;
        medicines.forEach(med => {
            bodyHtml += `
                <td style="text-align:center;">
                    <input type="text" 
                           inputmode="numeric"
                           pattern="[0-9]*"
                           class="request-input" 
                           data-doc-name="${doc.name}" 
                           data-med-name="${med.name}" 
                           placeholder="-" 
                           style="width: 65px; padding: 8px 4px; border: 1px solid var(--border-color); background: rgba(255,255,255,0.08); color: var(--text-primary); border-radius: 4px; text-align:center; font-size: 0.95rem;">
                </td>
            `;
        });
        bodyHtml += `</tr>`;
    });
    body.innerHTML = bodyHtml;
}

window.printSampleRequest = function() {
    const monthSelect = document.getElementById('sample-month-select');
    const yearInput = document.getElementById('sample-year-input');
    const selectedMonth = parseInt(monthSelect?.value) || new Date().getMonth();
    const selectedYear = parseInt(yearInput?.value) || new Date().getFullYear();
    
    const monthName = new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' }).toUpperCase();
    const year = selectedYear;
    const today = new Date();
    const medicinesList = medicines; 

    // 1. Calculate Totals and Get Main Store Stocks
    const totals = {};
    const mainStoreStocks = {};
    let hasAnyData = false;

    medicinesList.forEach(med => {
        totals[med.name] = 0;
        const mainInput = document.querySelector(`.main-store-input[data-med-name="${med.name}"]`);
        mainStoreStocks[med.name] = parseInt(mainInput?.value) || 0;
    });

    // 2. Build Table Body with Data
    let tableBody = '';
    let rowNum = 1;
    doctors.forEach(doc => {
        let rowHasData = false;
        let row = `<tr><td style="text-align:center;">${rowNum}</td><td>${doc.name}</td>`;
        
        medicinesList.forEach(med => {
            const qtyInput = document.querySelector(`.request-input[data-doc-name="${doc.name}"][data-med-name="${med.name}"]`);
            const qty = qtyInput ? (parseInt(qtyInput.value) || 0) : 0;
            if (qty > 0) {
                rowHasData = true;
                hasAnyData = true;
                totals[med.name] += qty;
            }
            row += `<td style="text-align:center;">${qty || ''}</td>`;
        });
        
        row += `</tr>`;
        if (rowHasData) {
            tableBody += row;
            rowNum++;
        }
    });

    if (!hasAnyData) {
        showToast('No request data entered', 'warning');
        return;
    }

    // 3. Add Summary Rows at the bottom
    let separatorRow = `<tr style="background-color: #000; height: 10px;"><td colspan="2"></td>`;
    medicinesList.forEach(() => separatorRow += `<td></td>`);
    separatorRow += `</tr>`;

    let storeStockRow = `<tr style="background-color: #fff; font-weight: bold;"><td colspan="2" style="text-align:left; padding-left: 10px;">AVAILABLE BALANCE STOCK</td>`;
    let totalRequestedRow = `<tr style="background-color: #fff; font-weight: bold;"><td colspan="2" style="text-align:left; padding-left: 10px;">TOTAL REQUEST</td>`;
    let balanceRow = `<tr style="background-color: #fff; font-weight: bold;"><td colspan="2" style="text-align:left; padding-left: 10px; color: #b71c1c;">REMAINING STOCK</td>`;

    medicinesList.forEach(med => {
        const total = totals[med.name];
        const stock = mainStoreStocks[med.name];
        const balance = stock - total;
        
        storeStockRow += `<td style="text-align:center;">${stock || ''}</td>`;
        totalRequestedRow += `<td style="text-align:center;">${total || ''}</td>`;
        balanceRow += `<td style="text-align:center; color: #b71c1c; font-weight: 900;">${stock > 0 ? balance : ''}</td>`;
    });

    storeStockRow += `</tr>`;
    totalRequestedRow += `</tr>`;
    balanceRow += `</tr>`;
    tableBody += separatorRow + storeStockRow + totalRequestedRow + balanceRow;

    // 4. Build Header
    let tableHeader = `
        <tr>
            <th style="width: 30px;">NO</th>
            <th style="width: 250px;">NAME</th>
    `;
    medicinesList.forEach(med => {
        tableHeader += `<th style="font-size: 11px;">${med.name}</th>`;
    });
    tableHeader += `</tr>`;

    // 5. Open Print Window
    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    printWindow.document.write(`
        <html>
        <head>
            <title>Sample Request - ${monthName} ${year}</title>
            <style>
                @page { size: landscape; margin: 5mm; }
                body { font-family: Arial, sans-serif; padding: 10px; color: #000; font-size: 9px; }
                .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
                .title { font-size: 16px; font-weight: bold; text-align: center; flex-grow: 1; color: #1565c0; text-decoration: underline; }
                table { width: 100%; border-collapse: collapse; margin-top: 5px; }
                th, td { border: 1px solid #000; padding: 3px; text-align: left; }
                th { background-color: #fff; font-size: 8px; font-weight: bold; }
                .footer { margin-top: 50px; display: flex; justify-content: space-between; font-weight: bold; font-size: 10px; }
                .sig-box { text-align: center; width: 200px; }
                .sig-line { border-top: 1px dotted #000; margin-top: 60px; padding-top: 5px; }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="header">
                <div style="width: 100px;"></div>
                <div class="title">CELOGEN SAMPLE REQUEST - MONTH OF ${monthName} ${year}</div>
                <div style="text-align: right; width: 100px;">
                    <img src="logo.png" style="height: 30px;" onerror="this.style.display='none'">
                </div>
            </div>
            <table>
                <thead>${tableHeader}</thead>
                <tbody>${tableBody}</tbody>
            </table>
            <div class="footer">
                <div class="sig-box">
                    <div>${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                    <div class="sig-line">Date</div>
                </div>
                <div class="sig-box">
                    <div class="sig-line">BDM - CELOGEN</div>
                </div>
                <div class="sig-box">
                    <div>APPROVED BY,</div>
                    <div class="sig-line"></div>
                </div>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
}

window.exportSampleRequestExcel = function() {
    const rows = [];
    
    // Top Title Row
    const monthSelect = document.getElementById('sample-month-select');
    const yearInput = document.getElementById('sample-year-input');
    const selectedMonth = parseInt(monthSelect?.value) || new Date().getMonth();
    const selectedYear = parseInt(yearInput?.value) || new Date().getFullYear();
    
    const monthName = new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' }).toUpperCase();
    rows.push([`CELOGEN SAMPLE REQUEST - MONTH OF ${monthName} ${selectedYear}`]);
    rows.push([]); // Spacer

    // Header Rows
    const header1 = ["NO", "NAME", "TEAM"];
    const productCount = medicines.length;
    header1.push("PRODUCT");
    for(let i=1; i<productCount; i++) header1.push("");
    rows.push(header1);

    const header2 = ["", "", ""];
    medicines.forEach(med => header2.push(med.name));
    rows.push(header2);

    // Data Rows
    let rowNum = 1;
    doctors.forEach(doc => {
        const row = [rowNum, doc.name, doc.team || ""];
        let hasData = false;
        medicines.forEach(med => {
            const qtyInput = document.querySelector(`.request-input[data-doc-name="${doc.name}"][data-med-name="${med.name}"]`);
            const qty = qtyInput ? (parseInt(qtyInput.value) || 0) : 0;
            if (qty > 0) hasData = true;
            row.push(qty > 0 ? qty : "");
        });
        if (hasData) {
            rows.push(row);
            rowNum++;
        }
    });

    if (rows.length <= 4) {
        showToast('No data to export', 'warning');
        return;
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    
    // Simple merging for Excel
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 3 + productCount } }, // Title
        { s: { r: 2, c: 3 }, e: { r: 2, c: 2 + productCount } }  // Product Header
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Sample Request");
    XLSX.writeFile(wb, `Sample_Request_${monthName}_${today.getFullYear()}.xlsx`);
}

// Export Excel Report
document.getElementById('btn-export-csv')?.addEventListener('click', () => {
    if (!window.XLSX) {
        showToast('Excel library is loading, please try again in a moment.', 'warning');
        return;
    }
    
    if (issues.length === 0 && medicines.length === 0) {
        showToast('No data to export', 'error');
        return;
    }
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // 1. Issue History Sheet
    const historyData = [...issues].sort((a, b) => new Date(b.date) - new Date(a.date)).map(issue => {
        const d = new Date(issue.date);
        return {
            "Date": d.toLocaleDateString(),
            "Time": d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            "Doctor / Rep": issue.doctor,
            "Product ID": issue.medicineId,
            "Product Name": issue.medicineName,
            "Batch Number": issue.batch,
            "Quantity": issue.quantity,
            "Status": issue.status === 'cancelled' ? 'Voided' : 'Issued',
            "Notes": issue.notes || '-'
        };
    });
    const wsHistory = XLSX.utils.json_to_sheet(historyData);
    XLSX.utils.book_append_sheet(wb, wsHistory, "Issue History");
    
    // 2. Current Inventory Sheet
    const inventoryData = medicines.map(med => ({
        "Product ID": med.id,
        "Product Name": med.name,
        "Batch Number": med.batch,
        "Expiry Date": med.expiry,
        "Current Stock": med.quantity,
        "Status": med.status === 'ok' ? 'In Stock' : (med.status === 'low' ? 'Low Stock' : 'Out of Stock')
    }));
    const wsInventory = XLSX.utils.json_to_sheet(inventoryData);
    XLSX.utils.book_append_sheet(wb, wsInventory, "Current Inventory");
    
    // 3. Activity Log Sheet
    const activityData = [...activities].map(act => {
        const d = new Date(act.date);
        return {
            "Date": d.toLocaleDateString(),
            "Time": d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            "Action Type": act.type.toUpperCase(),
            "Description": act.message
        };
    });
    const wsActivity = XLSX.utils.json_to_sheet(activityData);
    XLSX.utils.book_append_sheet(wb, wsActivity, "Activity Logs");
    
    // Adjust Column Widths for readability
    wsHistory['!cols'] = [{wch:12}, {wch:10}, {wch:25}, {wch:12}, {wch:30}, {wch:15}, {wch:10}, {wch:12}, {wch:40}];
    wsInventory['!cols'] = [{wch:12}, {wch:30}, {wch:15}, {wch:12}, {wch:15}, {wch:15}];
    wsActivity['!cols'] = [{wch:12}, {wch:10}, {wch:15}, {wch:50}];
    
    // Download file
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Celogen_Master_Report_${dateStr}.xlsx`);
    
    logActivity('Exported Master Excel Report');
    saveData();
    showToast('Excel Report Downloaded successfully!');
});

window.renderUsageReport = function() {
    const tbody = document.querySelector('#usage-report-table tbody');
    const monthFilter = document.getElementById('usage-month-filter');
    if (!tbody || !monthFilter) return;

    // Set default month if empty (Current Month)
    if (!monthFilter.value) {
        const now = new Date();
        monthFilter.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    const [year, month] = monthFilter.value.split('-').map(Number);
    tbody.innerHTML = '';

    // Filter active issues for selected month
    const monthlyIssues = issues.filter(i => {
        if (i.status === 'cancelled') return false;
        const d = new Date(i.date);
        return d.getFullYear() === year && (d.getMonth() + 1) === month;
    });

    if (monthlyIssues.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No usage data found for ${monthFilter.value}</td></tr>`;
        return;
    }

    // Group by Recipient
    const summary = {};
    monthlyIssues.forEach(i => {
        if (!summary[i.doctor]) {
            const docInfo = doctors.find(d => d.name === i.doctor) || { specialty: 'Other' };
            summary[i.doctor] = {
                category: docInfo.specialty,
                medicines: {},
                totalQty: 0,
                lastDate: i.date
            };
        }
        
        summary[i.doctor].medicines[i.medicineName] = (summary[i.doctor].medicines[i.medicineName] || 0) + i.quantity;
        summary[i.doctor].totalQty += i.quantity;
        if (new Date(i.date) > new Date(summary[i.doctor].lastDate)) {
            summary[i.doctor].lastDate = i.date;
        }
    });

    // Render Rows
    Object.entries(summary).forEach(([name, data]) => {
        const medList = Object.entries(data.medicines)
            .map(([med, qty]) => `<span style="display:block; font-size: 0.85rem;">${med}: <strong>${qty}</strong></span>`)
            .join('');
            
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${name}</strong></td>
            <td><span class="status-badge status-ok" style="font-size: 0.75rem;">${data.category}</span></td>
            <td style="line-height: 1.4;">${medList}</td>
            <td style="font-size: 1.1rem; font-weight: 700; color: var(--primary);">${data.totalQty}</td>
            <td style="font-size: 0.85rem; color: var(--text-muted);">${new Date(data.lastDate).toLocaleDateString()}</td>
        `;
        tbody.appendChild(tr);
    });
}

document.getElementById('btn-export-usage')?.addEventListener('click', () => {
    const monthVal = document.getElementById('usage-month-filter').value;
    if (!monthVal) return;
    
    const rows = [];
    const tbody = document.querySelector('#usage-report-table tbody');
    const trs = tbody.querySelectorAll('tr');
    
    if (trs.length === 0 || trs[0].innerText.includes("No usage data")) {
        showToast('No data to export for this month', 'error');
        return;
    }

    // Extract text data for Excel
    // We'll regenerate from logic to be cleaner than DOM scraping
    const [year, month] = monthVal.split('-').map(Number);
    const monthlyIssues = issues.filter(i => {
        if (i.status === 'cancelled') return false;
        const d = new Date(i.date);
        return d.getFullYear() === year && (d.getMonth() + 1) === month;
    });

    const exportData = monthlyIssues.map(i => ({
        "Date": new Date(i.date).toLocaleDateString(),
        "Recipient": i.doctor,
        "Product": i.medicineName,
        "Batch": i.batch,
        "Quantity": i.quantity
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, "Monthly Usage");
    XLSX.writeFile(wb, `Celogen_Monthly_Usage_${monthVal}.xlsx`);
    
    logActivity(`Exported Monthly Usage Report for ${monthVal}`);
});

document.getElementById('discard-stock-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('discard-med-id').value;
    const qty = parseInt(document.getElementById('discard-qty').value);
    const reason = document.getElementById('discard-reason').value;
    
    const med = medicines.find(m => m.id === id);
    if(!med) return;
    
    if(qty > med.quantity) {
        showToast(`Cannot discard more than existing stock (${med.quantity})`, 'error');
        return;
    }
    
    med.quantity -= qty;
    const threshold = med.minThreshold || 50;
    med.status = med.quantity < threshold ? (med.quantity === 0 ? 'out' : 'low') : 'ok';
    
    logActivity(`Discarded ${qty} units of ${med.name}. Reason: ${reason}`, 'warning');
    saveData();
    
    document.getElementById('discard-stock-modal').classList.remove('active');
    e.target.reset();
    renderInventory();
    renderHealthChart();
    showToast(`Discarded ${qty} units successfully.`, 'success');
});

window.printInventoryAudit = function() {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    const today = new Date().toLocaleDateString();
    
    let tableRows = medicines.map(med => `
        <tr>
            <td>${med.id}</td>
            <td><strong>${med.name}</strong></td>
            <td>${med.batch}</td>
            <td>${med.expiry}</td>
            <td style="text-align: center; font-weight: bold;">${med.quantity}</td>
            <td style="border: 2px solid #333; width: 100px;"></td>
        </tr>
    `).join('');

    printWindow.document.write(`
        <html>
        <head>
            <title>Inventory Audit Sheet - ${today}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                .header { text-align: center; border-bottom: 2px solid #159a45; padding-bottom: 10px; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
                th { background-color: #f2f2f2; }
                .audit-title { color: #159a45; margin: 0; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1 class="audit-title">CELOGEN INVENTORY AUDIT SHEET</h1>
                <p>Date: ${today} | Warehouse Stock Reconciliation</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Product Name</th>
                        <th>Batch</th>
                        <th>Expiry</th>
                        <th>System Qty</th>
                        <th>Physical Count</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
            <div style="margin-top: 40px; display: flex; justify-content: space-between;">
                <div>
                    <p>__________________________</p>
                    <p>Auditor Signature</p>
                </div>
                <div>
                    <p>__________________________</p>
                    <p>Manager Approval</p>
                </div>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 250);
}

// Backup Data
document.getElementById('btn-backup-data')?.addEventListener('click', () => {
    const data = {
        medicines,
        issues,
        activities,
        exportDate: new Date().toISOString()
    };
    
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Celogen_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    logActivity('Created system backup');
    saveData();
    showToast('Backup downloaded successfully');
});

// Restore Data
document.getElementById('file-restore-data')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = JSON.parse(event.target.result);
            if (data.medicines && data.issues) {
                if(confirm('Are you sure you want to overwrite current data with this backup?')) {
                    medicines = data.medicines;
                    issues = data.issues;
                    activities = data.activities || [];
                    
                    logActivity('System data restored from backup', 'warning');
                    saveData();
                    showToast('Data restored successfully!');
                }
            } else {
                showToast('Invalid backup file format', 'error');
            }
        } catch(err) {
            showToast('Error reading file', 'error');
        }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset
});

// Factory Reset
document.getElementById('btn-reset-data')?.addEventListener('click', () => {
    const code = prompt('WARNING: This will delete ALL data. Type "RESET" to confirm:');
    if (code === 'RESET') {
        medicines = [];
        issues = [];
        activities = [{ id: Date.now(), date: new Date().toISOString(), message: 'System Factory Reset Performed', type: 'danger' }];
        saveData();
        showToast('Application reset completely', 'error');
    } else if (code !== null) {
        showToast('Reset cancelled - Incorrect code', 'info');
    }
});

// Initial Setup
let distChart = null;

function renderChart() {
    const ctx = document.getElementById('distributionChart');
    if (!ctx) return;
    
    // Aggregate data: top 5 issued products
    const activeIssues = issues.filter(i => i.status !== 'cancelled');
    const counts = {};
    activeIssues.forEach(i => {
        counts[i.medicineName] = (counts[i.medicineName] || 0) + i.quantity;
    });
    
    const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 5);
    const sortedLabels = sorted.map(i => i[0]);
    const sortedData = sorted.map(i => i[1]);
    
    if (distChart) distChart.destroy();
    
    // Only render if we have data and Chart is loaded
    if (window.Chart && sortedLabels.length > 0) {
        distChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedLabels,
                datasets: [{
                    label: 'Total Samples Issued',
                    data: sortedData,
                    backgroundColor: '#159a45',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#a0aec0' } },
                    x: { grid: { display: false }, ticks: { color: '#a0aec0' } }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    } else if (sortedLabels.length === 0) {
        // Clear canvas if no data
        const context = ctx.getContext('2d');
        context.clearRect(0, 0, ctx.width || 300, ctx.height || 150);
        context.fillStyle = '#64748b';
        context.textAlign = 'center';
        context.fillText('No issue data available yet', (ctx.width || 300)/2, (ctx.height || 150)/2);
    }
}

let healthChartInstance = null;

function renderHealthChart() {
    const ctx = document.getElementById('healthChart')?.getContext('2d');
    if (!ctx) return;
    
    let healthy = 0;
    let low = 0;
    let out = 0;
    
    medicines.forEach(m => {
        const threshold = m.minThreshold || 50;
        if(m.quantity >= threshold) healthy++;
        else if(m.quantity > 0) low++;
        else out++;
    });
    
    if (healthChartInstance) {
        healthChartInstance.destroy();
    }
    
    healthChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Healthy Stock', 'Low Stock', 'Out of Stock'],
            datasets: [{
                data: [healthy, low, out],
                backgroundColor: ['#159a45', '#f59e0b', '#ef4444'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#a0aec0', padding: 20 } }
            },
            cutout: '70%'
        }
    });
}

window.adjustStock = function(id) {
    const med = medicines.find(m => m.id === id);
    if(!med) return;
    
    const amt = prompt(`Adjust stock for ${med.name}. \nCurrent Stock: ${med.quantity}\nEnter number to ADD (or negative number to subtract):`, "0");
    
    if(amt !== null && !isNaN(parseInt(amt))) {
        const val = parseInt(amt);
        if(val === 0) return;
        
        if (med.quantity + val < 0) {
            showToast('Cannot reduce stock below zero!', 'error');
            return;
        }
        
        med.quantity += val;
        const threshold = med.minThreshold || 50;
        med.status = med.quantity < threshold ? (med.quantity === 0 ? 'out' : 'low') : 'ok';
        
        logActivity(`Manually adjusted stock for ${med.name} by ${val > 0 ? '+'+val : val}`, 'warning');
        saveData();
        showToast('Stock adjusted successfully!');
    }
}

// --- DOCTOR REGISTRY FUNCTIONS ---

function renderDoctors() {
    const tbody = document.querySelector('#doctors-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    if (doctors.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No doctors or reps found.</td></tr>`;
        return;
    }
    
    doctors.forEach(doc => {
        // Ensure specialty is set based on the name if missing
        if (!doc.specialty) {
            const isDoctor = doc.name.toUpperCase().startsWith('DR.');
            doc.specialty = isDoctor ? 'Doctor' : 'Medical Representative';
        }

        let badgeClass = 'status-ok'; // Default for Doctor (Green)
        if(doc.specialty === 'Medical Representative') badgeClass = 'status-low'; // Amber for Reps
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${doc.id}</td>
            <td><strong>${doc.name}</strong></td>
            <td><span class="status-badge ${badgeClass}">${doc.specialty}</span></td>
            <td>${doc.team || '-'}</td>
            <td>
                <div style="display: flex; gap: 8px;">
                    ${currentRole === 'Admin' ? `
                        <button class="btn-icon" title="Edit" onclick="openEditDoctorModal('${doc.id}')" style="color: var(--primary); background: rgba(21, 154, 69, 0.1); padding: 5px; border-radius: 4px;">
                            <svg style="width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4L18.5 2.5z"></path></svg>
                        </button>
                        <button class="btn-icon" title="Delete" onclick="deleteDoctor('${doc.id}')" style="color: var(--danger); background: rgba(239, 68, 68, 0.1); padding: 5px; border-radius: 4px;">
                            <svg style="width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    ` : '<span style="color:var(--text-muted); font-size:0.8rem; opacity: 0.6;">View Only</span>'}
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderDoctorOptions() {
    const select = document.getElementById('issue-doctor');
    if (!select) return;
    const firstOp = select.options[0];
    select.innerHTML = '';
    select.appendChild(firstOp);
    
    doctors.forEach(doc => {
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = `${doc.name} ${doc.team ? `(${doc.team})` : ''}`;
        select.appendChild(option);
    });
}

window.deleteDoctor = function(id) {
    if(confirm('Are you sure you want to delete this doctor from the registry?')) {
        const doc = doctors.find(d => d.id === id);
        doctors = doctors.filter(d => d.id !== id);
        logActivity(`Deleted doctor: ${doc.name}`, 'danger');
        saveData();
        showToast('Doctor deleted successfully');
    }
}

window.openEditDoctorModal = function(id) {
    const doc = doctors.find(d => d.id === id);
    if(!doc) return;
    
    document.getElementById('doc-modal-title').innerText = 'Edit Recipient Details';
    document.getElementById('btn-doc-save').innerText = 'Update Recipient';
    
    document.getElementById('doc-edit-id').value = doc.id;
    document.getElementById('doc-name').value = doc.name;
    document.getElementById('doc-category').value = doc.specialty;
    document.getElementById('doc-region').value = doc.team || '';
    
    addDocModal.classList.add('active');
}

document.getElementById('add-doctor-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const editId = document.getElementById('doc-edit-id').value;
    const name = document.getElementById('doc-name').value;
    const specialty = document.getElementById('doc-category').value;
    const team = document.getElementById('doc-region').value;
    
    if (editId) {
        // Edit mode
        const index = doctors.findIndex(d => d.id === editId);
        if (index !== -1) {
            doctors[index] = { ...doctors[index], name, specialty, team };
            logActivity(`Updated recipient: ${name}`);
            showToast('Recipient details updated!');
        }
    } else {
        // Add mode
        const newId = 'D' + String(Date.now()).slice(-4);
        doctors.push({ id: newId, name, specialty, team });
        logActivity(`Added new recipient: ${name} (${specialty})`);
        showToast('Recipient added successfully!');
    }
    
    saveData();
    addDocModal.classList.remove('active');
    e.target.reset();
});

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Sample Request Month/Year
    const monthSelect = document.getElementById('sample-month-select');
    const yearInput = document.getElementById('sample-year-input');
    if (monthSelect && yearInput) {
        const now = new Date();
        monthSelect.value = now.getMonth();
        yearInput.value = now.getFullYear();
    }

    try {
        initTheme();
        checkAuth();
        
        // Load data from Google Apps Script Backend
        loadDataFromGas().then(success => {
            if (success) {
                console.log("Initialization complete.");
            }
        });
        
    } catch (e) {
        console.error("Initialization error:", e);
    }
});


// Theme Management
function initTheme() {
    const theme = localStorage.getItem('celogen_theme') || 'dark';
    if (theme === 'light') {
        document.body.classList.add('light-theme');
    }
}

window.toggleTheme = function() {
    const isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem('celogen_theme', isLight ? 'light' : 'dark');
    
    const iconLight = document.getElementById('theme-icon-light');
    const iconDark = document.getElementById('theme-icon-dark');
    
    if (isLight) {
        iconLight?.classList.add('hidden-role');
        iconDark?.classList.remove('hidden-role');
    } else {
        iconLight?.classList.remove('hidden-role');
        iconDark?.classList.add('hidden-role');
    }
}

document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

window.cleanStart = function() {
    if (confirm('⚠️ WARNING: This will delete ALL Products, Recipients, and Issuing History.\n\nYour Login Accounts will be KEPT.\n\nAre you sure you want a Clean Start?')) {
        medicines = [];
        issues = [];
        doctors = [];
        activities = [{ id: Date.now(), date: new Date().toISOString(), message: 'System Clean Start performed by Admin', type: 'warning' }];
        
        saveData();
        showToast('System data wiped. Starting fresh.');
        setTimeout(() => location.reload(), 1000);
    }
}

function checkAuth() {
    const loginScreen = document.getElementById('login-screen');
    if (!currentRole) {
        loginScreen.classList.remove('hidden-role');
        document.body.classList.add('login-required');
    } else {
        loginScreen.classList.add('hidden-role');
        document.body.classList.remove('login-required');
        updateUIByRole();
    }
}

document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById('login-username').value.trim();
    const pass = document.getElementById('login-pass').value.trim();
    const errorEl = document.getElementById('login-error');
    
    // Debug log for troubleshooting
    console.log(`Login attempt for: "${usernameInput}"`);
    
    const user = users.find(u => u.username.toLowerCase() === usernameInput.toLowerCase() && u.password === pass);
    
    if (user) {
        currentRole = user.role;
        currentUser = user.username;
        sessionStorage.setItem('celogen_role', user.role);
        sessionStorage.setItem('celogen_user', user.username);
        errorEl.style.display = 'none';
        checkAuth();
        showToast(`Welcome back, ${user.username}!`);
        logActivity(`User ${user.username} logged in`, 'info');
    } else {
        console.error('Login failed: Invalid username or password.');
        errorEl.style.display = 'block';
    }
});

window.logout = function() {
    if(confirm('Are you sure you want to sign out?')) {
        sessionStorage.removeItem('celogen_role');
        sessionStorage.removeItem('celogen_user');
        currentRole = null;
        currentUser = null;
        location.reload(); 
    }
}

// --- USER MANAGEMENT LOGIC ---

function renderUsers() {
    const tbody = document.querySelector('#users-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    users.forEach((user, index) => {
        const tr = document.createElement('tr');
        const maskedPass = '•'.repeat(user.password.length);
        
        tr.innerHTML = `
            <td><strong>${user.username}</strong></td>
            <td><span class="role-badge role-${user.role.toLowerCase()}">${user.role}</span></td>
            <td title="${user.password}">${maskedPass}</td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-text" onclick="openEditUserModal(${index})" style="color: var(--primary);">Edit</button>
                    <button class="btn-text" onclick="deleteUserAccount(${index})" style="color: var(--danger);">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

const addUserModal = document.getElementById('add-user-modal');
document.getElementById('btn-add-user')?.addEventListener('click', () => {
    document.getElementById('user-modal-title').innerText = 'Create New User Account';
    document.getElementById('btn-user-save').innerText = 'Create Account';
    document.getElementById('user-edit-index').value = '';
    document.getElementById('add-user-form').reset();
    addUserModal.classList.add('active');
});

window.openEditUserModal = function(index) {
    const user = users[index];
    if(!user) return;
    
    document.getElementById('user-modal-title').innerText = 'Edit User Account';
    document.getElementById('btn-user-save').innerText = 'Update Account';
    
    document.getElementById('user-edit-index').value = index;
    document.getElementById('user-name').value = user.username;
    document.getElementById('user-role').value = user.role;
    document.getElementById('user-pass').value = user.password;
    
    addUserModal.classList.add('active');
}

document.getElementById('add-user-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const editIndex = document.getElementById('user-edit-index').value;
    const username = document.getElementById('user-name').value;
    const role = document.getElementById('user-role').value;
    const password = document.getElementById('user-pass').value;
    
    if (editIndex !== '') {
        // Edit mode
        const oldName = users[editIndex].username;
        users[editIndex] = { username, role, password };
        logActivity(`Admin updated user account: ${oldName} to ${username}`);
        showToast('Account updated successfully');
    } else {
        // Add mode
        if (users.find(u => u.username === username)) {
            showToast('Username already exists!', 'error');
            return;
        }
        users.push({ username, role, password });
        logActivity(`Admin created new user account: ${username} (${role})`);
        showToast('Account created successfully');
    }
    
    saveData();
    addUserModal.classList.remove('active');
    e.target.reset();
});

window.deleteUserAccount = function(index) {
    const user = users[index];
    if(!user) return;
    
    // Protection: Don't delete yourself
    if (user.username === currentUser) {
        showToast('You cannot delete your own account!', 'error');
        return;
    }
    
    // Protection: Ensure at least one admin exists
    const adminCount = users.filter(u => u.role === 'Admin').length;
    if (user.role === 'Admin' && adminCount <= 1) {
        showToast('System requires at least one Administrator account!', 'error');
        return;
    }
    
    if (confirm(`Are you sure you want to permanently delete user "${user.username}"?`)) {
        logActivity(`Admin deleted user account: ${user.username}`, 'danger');
        users.splice(index, 1);
        saveData();
        showToast('User account removed');
    }
}

window.clearActivityLogs = function() {
    if (confirm('Are you sure you want to clear all system activity logs? This cannot be undone.')) {
        activities = [{ id: Date.now(), date: new Date().toISOString(), message: 'Activity logs cleared by Admin', type: 'warning' }];
        saveData();
        showToast('Logs cleared');
    }
}

// --- YEARLY REPORT LOGIC ---

window.toggleReportMode = function(mode) {
    const monthlyControls = document.getElementById('monthly-report-controls');
    const yearlyControls = document.getElementById('yearly-report-controls');
    const toggles = document.querySelectorAll('.report-toggle');
    
    toggles.forEach(t => t.classList.remove('active'));
    
    if (mode === 'monthly') {
        if(monthlyControls) monthlyControls.style.display = 'block';
        if(yearlyControls) yearlyControls.style.display = 'none';
        toggles[0].classList.add('active');
        renderUsageReport();
    } else {
        if(monthlyControls) monthlyControls.style.display = 'none';
        if(yearlyControls) yearlyControls.style.display = 'block';
        toggles[1].classList.add('active');
        renderYearlyReport();
    }
}

window.populateYearFilter = function() {
    const yearSelect = document.getElementById('usage-year-filter');
    if (!yearSelect) return;
    
    const currentYear = new Date().getFullYear();
    yearSelect.innerHTML = '';
    
    // Get unique years from issues
    const years = [...new Set(issues.map(i => new Date(i.date).getFullYear()))];
    if (!years.includes(currentYear)) years.push(currentYear);
    
    years.sort((a, b) => b - a).forEach(y => {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        yearSelect.appendChild(opt);
    });
}

window.renderYearlyReport = function() {
    const tbody = document.querySelector('#usage-report-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const yearVal = document.getElementById('usage-year-filter')?.value;
    const year = parseInt(yearVal) || new Date().getFullYear();
    
    const yearlyIssues = issues.filter(i => {
        if (i.status === 'cancelled') return false;
        return new Date(i.date).getFullYear() === year;
    });

    if (yearlyIssues.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No usage data found for the year ${year}</td></tr>`;
        return;
    }

    const summary = {};
    yearlyIssues.forEach(i => {
        if (!summary[i.doctor]) {
            const docInfo = doctors.find(d => d.name === i.doctor) || { category: 'Other' };
            summary[i.doctor] = {
                category: docInfo.specialty || docInfo.category || 'Staff',
                products: {},
                totalQty: 0,
                lastDate: i.date
            };
        }
        
        summary[i.doctor].products[i.medicineName] = (summary[i.doctor].products[i.medicineName] || 0) + i.quantity;
        summary[i.doctor].totalQty += i.quantity;
        if (new Date(i.date) > new Date(summary[i.doctor].lastDate)) {
            summary[i.doctor].lastDate = i.date;
        }
    });

    Object.entries(summary).forEach(([name, data]) => {
        const prodList = Object.entries(data.products)
            .map(([prod, qty]) => `<span style="display:block; font-size: 0.85rem;">${prod}: <strong>${qty}</strong></span>`)
            .join('');
            
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${name}</strong></td>
            <td><span class="status-badge status-ok" style="font-size: 0.75rem;">${data.category}</span></td>
            <td style="line-height: 1.4;">${prodList}</td>
            <td style="font-size: 1.1rem; font-weight: 700; color: var(--primary);">${data.totalQty}</td>
            <td style="font-size: 0.85rem; color: var(--text-muted);">${new Date(data.lastDate).toLocaleDateString()}</td>
        `;
        tbody.appendChild(tr);
    });
}

document.getElementById('btn-export-yearly')?.addEventListener('click', () => {
    const year = document.getElementById('usage-year-filter').value;
    if (!year) return;
    
    const yearlyIssues = issues.filter(i => {
        if (i.status === 'cancelled') return false;
        return new Date(i.date).getFullYear() === parseInt(year);
    });

    if (yearlyIssues.length === 0) {
        showToast('No data to export for this year', 'error');
        return;
    }

    const exportData = yearlyIssues.map(i => ({
        "Date": new Date(i.date).toLocaleDateString(),
        "Recipient": i.doctor,
        "Product": i.medicineName,
        "Batch": i.batch,
        "Quantity": i.quantity,
        "Notes": i.notes || '-'
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, "Annual Usage");
    XLSX.writeFile(wb, `Celogen_Annual_Usage_${year}.xlsx`);
});

});
