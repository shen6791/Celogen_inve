const GAS_URL = "https://script.google.com/macros/s/AKfycbxt1_NeYXWt6QPna7a6_GEFCJRcWpU4Yk-Cef0uWEbfKSaILd0iQDc8c_Is6_pO7T8icQ/exec";

// --- CORE DATA STORE ---
let medicines = [
    { id: 'M001', name: 'ATOGEN 10mg', batch: 'BATCH-001', expiry: '2026-12', quantity: 0, status: 'out', minThreshold: 50 },
    { id: 'M002', name: 'ATOGEN 20 mg', batch: 'BATCH-001', expiry: '2026-12', quantity: 0, status: 'out', minThreshold: 50 },
    { id: 'M003', name: 'ATOGEN 40 mg', batch: 'BATCH-001', expiry: '2026-12', quantity: 0, status: 'out', minThreshold: 50 },
    { id: 'M004', name: 'CLOPIL 75mg', batch: 'BATCH-001', expiry: '2026-12', quantity: 0, status: 'out', minThreshold: 50 },
    { id: 'M005', name: 'LK 50mg', batch: 'BATCH-001', expiry: '2026-12', quantity: 0, status: 'out', minThreshold: 50 },
    { id: 'M006', name: 'LK 25mg', batch: 'BATCH-001', expiry: '2026-12', quantity: 0, status: 'out', minThreshold: 50 },
    { id: 'M007', name: 'SITABEST 50mg', batch: 'BATCH-001', expiry: '2026-12', quantity: 0, status: 'out', minThreshold: 50 },
    { id: 'M008', name: 'SITABEST 100mg', batch: 'BATCH-001', expiry: '2026-12', quantity: 0, status: 'out', minThreshold: 50 },
    { id: 'M009', name: 'CELOMET 850mg', batch: 'BATCH-001', expiry: '2026-12', quantity: 0, status: 'out', minThreshold: 50 },
    { id: 'M010', name: 'CELOMET SR 500mg', batch: 'BATCH-001', expiry: '2026-12', quantity: 0, status: 'out', minThreshold: 50 },
    { id: 'M011', name: 'EMPABEST 10mg', batch: 'BATCH-001', expiry: '2026-12', quantity: 0, status: 'out', minThreshold: 50 },
    { id: 'M012', name: 'EMPABEST 25mg', batch: 'BATCH-001', expiry: '2026-12', quantity: 0, status: 'out', minThreshold: 50 },
    { id: 'M013', name: 'EWON 400mg', batch: 'BATCH-001', expiry: '2026-12', quantity: 0, status: 'out', minThreshold: 50 },
    { id: 'M014', name: 'PANTOGEN 20mg', batch: 'BATCH-001', expiry: '2026-12', quantity: 0, status: 'out', minThreshold: 50 },
    { id: 'M015', name: 'PANTOGEN 40mg', batch: 'BATCH-001', expiry: '2026-12', quantity: 0, status: 'out', minThreshold: 50 }
];

let doctors = [
    { id: 'D001', name: 'M.G.L.W.K.DHARMAPALA', specialty: 'Medical Representative', team: '' },
    { id: 'D002', name: 'G.RICHERD PAUL', specialty: 'Medical Representative', team: '' },
    { id: 'D003', name: 'S.D.P.NARAMPANAWA', specialty: 'Medical Representative', team: '' },
    { id: 'D004', name: 'MANIMOHAN', specialty: 'Medical Representative', team: '' },
    { id: 'D005', name: 'ASIRI NUWAN', specialty: 'Medical Representative', team: '' },
    { id: 'D006', name: 'GIHAN DHANUSHKA', specialty: 'Medical Representative', team: '' },
    { id: 'D007', name: 'ROSHEN THARAKA SAMARAWICKRAMA', specialty: 'Medical Representative', team: '' },
    { id: 'D008', name: 'N.A.THARINDU DINUSHAN WIJESIRI', specialty: 'Medical Representative', team: '' },
    { id: 'D009', name: 'KASUN WIMALASIRI', specialty: 'Medical Representative', team: '' },
    { id: 'D010', name: 'KANISHKA GIHAN', specialty: 'Medical Representative', team: '' },
    { id: 'D011', name: 'SINDUJAN', specialty: 'Medical Representative', team: '' },
    { id: 'D012', name: 'PEYUMAL NIROSHAN', specialty: 'Medical Representative', team: '' },
    { id: 'D013', name: 'P.M.WELAGEDARA', specialty: 'Medical Representative', team: '' },
    { id: 'D014', name: 'ISHAN MUNASINGHE', specialty: 'Medical Representative', team: '' },
    { id: 'D015', name: 'IMASH KODAGODA', specialty: 'Medical Representative', team: '' },
    { id: 'D016', name: 'ASIRI CHAMARA', specialty: 'Medical Representative', team: '' },
    { id: 'D017', name: 'SHERAN CHRISTOPHER', specialty: 'Medical Representative', team: '' },
    { id: 'D018', name: 'K.S. PRAGATHAN', specialty: 'Medical Representative', team: '' },
    { id: 'D019', name: 'PALITHA RUWAN', specialty: 'Medical Representative', team: '' },
    { id: 'D020', name: 'ARJUNA SUDARSHANA', specialty: 'Medical Representative', team: '' },
    { id: 'D021', name: 'NIROSHAN PATHMANATHAN', specialty: 'Medical Representative', team: '' },
    { id: 'D022', name: 'DR. WARUNA GUNATHILAKA', specialty: 'Doctor', team: '' },
    { id: 'D023', name: 'DR. SAMPATH WITHANAWASAM', specialty: 'Doctor', team: '' },
    { id: 'D024', name: 'DR.RUWAN EKANAYAKE', specialty: 'Doctor', team: '' }
];

let issues = [];
let activities = [];
let users = [
    { username: 'Admin', role: 'Admin', password: 'admin123' },
    { username: 'Assistant', role: 'Assistant', password: 'staff123' }
];

let currentRole = sessionStorage.getItem('celogen_role') || null;
let currentUser = sessionStorage.getItem('celogen_user') || null;
let isDataLoaded = false;
let saveTimeout = null;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    checkAuth();
    
    // Set default month/year for reports
    const monthSelect = document.getElementById('sample-month-select');
    const yearInput = document.getElementById('sample-year-input');
    if (monthSelect && yearInput) {
        const now = new Date();
        monthSelect.value = now.getMonth();
        yearInput.value = now.getFullYear();
    }

    const yearFilter = document.getElementById('usage-year-filter');
    if (yearFilter) {
        const year = new Date().getFullYear();
        for (let i = year; i >= year - 5; i--) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = i;
            yearFilter.appendChild(opt);
        }
    }

    // Load from Cloud
    loadDataFromGas();

    // Connect Modal Buttons
    document.getElementById('btn-add-medicine')?.addEventListener('click', () => openAddMedicineModal());
    document.getElementById('btn-add-doctor')?.addEventListener('click', () => openAddDoctorModal());
    document.getElementById('btn-add-user')?.addEventListener('click', () => openAddUserModal());
    
    document.getElementById('btn-add-issue-item')?.addEventListener('click', () => {
        const container = document.getElementById('issue-items-container');
        const row = document.querySelector('.issue-item-row').cloneNode(true);
        row.querySelector('.issue-medicine').value = "";
        row.querySelector('.issue-quantity').value = "";
        row.querySelector('.remove-item-row').style.visibility = 'visible';
        row.querySelector('.remove-item-row').addEventListener('click', () => row.remove());
        container.appendChild(row);
        renderMedicineOptions();
    });

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
        });
    });

    // Theme Toggle
    document.getElementById('theme-toggle')?.addEventListener('click', () => toggleTheme());
});

async function loadDataFromGas() {
    try {
        console.log("Connecting to Google Sheets...");
        const response = await fetch(GAS_URL, { redirect: 'follow' });
        if (!response.ok) throw new Error("Network error");
        const text = await response.text();
        
        if (text && text.trim().startsWith('{')) {
            const data = JSON.parse(text);
            // ONLY update if cloud data exists and has items
            if (data.medicines && data.medicines.length > 0) medicines = data.medicines;
            if (data.doctors && data.doctors.length > 0) doctors = data.doctors;
            if (data.issues) issues = data.issues;
            if (data.activities) activities = data.activities;
            if (data.users && data.users.length > 0) users = data.users;
        }
        
        isDataLoaded = true;
        console.log("Data sync complete.");
        refreshAllUI();
    } catch (e) {
        console.warn("Could not load cloud data, using defaults.", e);
        isDataLoaded = true; 
        refreshAllUI();
    }
}

function saveData() {
    if (!isDataLoaded) return;
    const payload = { medicines, issues, doctors, activities, users };
    refreshAllUI();
    
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        fetch(GAS_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        }).catch(err => console.error("Cloud Save Failed", err));
    }, 1500);
}

function refreshAllUI() {
    updateDashboard();
    renderInventory();
    renderIssues();
    renderMedicineOptions();
    renderActivityFeed();
    renderDoctors();
    renderDoctorOptions();
    if (currentRole === 'Admin') renderUsers();
    updateUIByRole();
}

// --- LOGIN & AUTH ---
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
    
    const user = users.find(u => u.username.toLowerCase() === usernameInput.toLowerCase() && u.password === pass);
    
    if (user) {
        currentRole = user.role;
        currentUser = user.username;
        sessionStorage.setItem('celogen_role', user.role);
        sessionStorage.setItem('celogen_user', user.username);
        errorEl.style.display = 'none';
        checkAuth();
        showToast(`Welcome back, ${user.username}`);
        logActivity(`User ${user.username} logged in`, 'info');
    } else {
        errorEl.style.display = 'block';
        errorEl.innerText = "Invalid username or password.";
    }
});

window.logout = function() {
    sessionStorage.clear();
    location.reload();
};

function updateUIByRole() {
    const isAdmin = currentRole === 'Admin';
    document.body.setAttribute('data-role', currentRole || 'Guest');
    
    document.querySelectorAll('.admin-only').forEach(el => {
        if (isAdmin) el.classList.remove('hidden-role');
        else el.classList.add('hidden-role');
    });

    const roleDisplay = document.getElementById('user-role-display');
    if (roleDisplay) {
        roleDisplay.innerHTML = `${currentUser} <span style="font-size:0.6rem; opacity:0.7;">(${currentRole})</span>`;
        roleDisplay.className = `role-badge role-${currentRole?.toLowerCase()}`;
    }
}

// --- UTILS ---
function logActivity(message, type = 'info') {
    activities.unshift({ id: Date.now(), date: new Date().toISOString(), message, type });
    if (activities.length > 50) activities.pop();
    saveData();
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function animateValue(id, end) {
    const obj = document.getElementById(id);
    if (!obj) return;
    obj.innerText = end;
}

// --- UI COMPONENTS ---
function updateDashboard() {
    const totalMeds = medicines.length;
    const totalIssued = issues.filter(i => i.status !== 'cancelled').reduce((s, i) => s + i.quantity, 0);
    const lowStock = medicines.filter(m => m.quantity < (m.minThreshold || 50)).length;
    
    animateValue('stat-total-medicines', totalMeds);
    animateValue('stat-samples-issued', totalIssued);
    animateValue('stat-low-stock', lowStock);
    
    const badge = document.getElementById('alert-badge');
    if (badge) {
        badge.innerText = lowStock;
        badge.style.display = lowStock > 0 ? 'block' : 'none';
    }

    const recentIssuesBody = document.querySelector('#recent-issues-table tbody');
    if (recentIssuesBody) {
        recentIssuesBody.innerHTML = issues.length ? '' : '<tr><td colspan="4" style="text-align:center;">No recent issues.</td></tr>';
        issues.filter(i => i.status !== 'cancelled').slice(0, 5).forEach(issue => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td><strong>${issue.medicineName}</strong></td><td>${issue.doctor}</td><td>${issue.quantity}</td><td>${new Date(issue.date).toLocaleDateString()}</td>`;
            recentIssuesBody.appendChild(tr);
        });
    }
}

function renderInventory() {
    const tbody = document.querySelector('#inventory-table tbody');
    if (!tbody) return;
    tbody.innerHTML = medicines.length ? '' : '<tr><td colspan="7" style="text-align:center;">No products found.</td></tr>';
    
    medicines.forEach(med => {
        const tr = document.createElement('tr');
        const threshold = med.minThreshold || 50;
        const statusClass = med.quantity <= 0 ? 'status-out' : (med.quantity < threshold ? 'status-low' : 'status-ok');
        const statusText = med.quantity <= 0 ? 'Out of Stock' : (med.quantity < threshold ? 'Low Stock' : 'In Stock');
        
        tr.innerHTML = `
            <td>${med.id}</td>
            <td><strong>${med.name}</strong></td>
            <td>${med.batch}</td>
            <td>${med.expiry}</td>
            <td>${med.quantity}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <div style="display:flex; gap:5px;">
                    <button class="btn-icon admin-only" onclick="openEditMedicineModal('${med.id}')">Edit</button>
                    <button class="btn-icon" onclick="adjustStock('${med.id}')">Add</button>
                    <button class="btn-icon admin-only" onclick="openDiscardModal('${med.id}')">Discard</button>
                    <button class="btn-icon admin-only" onclick="deleteMedicine('${med.id}')">Del</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderDoctors() {
    const tbody = document.querySelector('#doctors-table tbody');
    if (!tbody) return;
    tbody.innerHTML = doctors.length ? '' : '<tr><td colspan="5" style="text-align:center;">No recipients found.</td></tr>';
    
    doctors.forEach((doc, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${doc.id}</td>
            <td><strong>${doc.name}</strong></td>
            <td>${doc.specialty}</td>
            <td>${doc.team || '-'}</td>
            <td>
                <div style="display:flex; gap:5px;">
                    <button class="btn-icon" onclick="moveRecipientUp('${doc.id}')" title="Move Up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16"><polyline points="18 15 12 9 6 15"></polyline></svg></button>
                    <button class="btn-icon" onclick="moveRecipientDown('${doc.id}')" title="Move Down"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
                    <button class="btn-icon admin-only" onclick="deleteDoctor('${doc.id}')" title="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.moveRecipientUp = (id) => {
    const index = doctors.findIndex(d => d.id === id);
    if (index > 0) {
        [doctors[index], doctors[index - 1]] = [doctors[index - 1], doctors[index]];
        saveData();
    }
};

window.moveRecipientDown = (id) => {
    const index = doctors.findIndex(d => d.id === id);
    if (index < doctors.length - 1) {
        [doctors[index], doctors[index + 1]] = [doctors[index + 1], doctors[index]];
        saveData();
    }
};

function renderMedicineOptions() {
    document.querySelectorAll('.issue-medicine').forEach(select => {
        const val = select.value;
        select.innerHTML = '<option value="">Select Product...</option>';
        medicines.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = `${m.name} (Stock: ${m.quantity})`;
            select.appendChild(opt);
        });
        select.value = val;
    });
}

function renderDoctorOptions() {
    const select = document.getElementById('issue-doctor');
    if (!select) return;
    const val = select.value;
    select.innerHTML = '<option value="">Select Recipient...</option>';
    doctors.sort((a,b) => a.name.localeCompare(b.name)).forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.id;
        opt.textContent = d.name;
        select.appendChild(opt);
    });
    select.value = val;
}

function renderIssues(filtered = null) {
    const tbody = document.querySelector('#history-table tbody');
    if (!tbody) return;
    const data = filtered || issues;
    tbody.innerHTML = data.length ? '' : '<tr><td colspan="7" style="text-align:center;">No history.</td></tr>';
    
    [...data].sort((a,b) => b.id - a.id).forEach(issue => {
        const tr = document.createElement('tr');
        if (issue.status === 'cancelled') tr.style.opacity = '0.5';
        tr.innerHTML = `
            <td>${new Date(issue.date).toLocaleString()}</td>
            <td>${issue.doctor}</td>
            <td>${issue.medicineName}</td>
            <td>${issue.batch}</td>
            <td><strong>${issue.quantity}</strong></td>
            <td>${issue.status}</td>
            <td>
                <button class="btn-text" onclick="printReceipt(${issue.id})">Gate Pass</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderActivityFeed() {
    const feed = document.getElementById('activity-feed');
    if (!feed) return;
    feed.innerHTML = activities.length ? '' : '<p style="padding:10px;">No activity.</p>';
    activities.slice(0, 10).forEach(a => {
        const div = document.createElement('div');
        div.style.padding = '8px 0';
        div.style.borderBottom = '1px solid var(--border-color)';
        div.innerHTML = `<small style="color:#888;">${new Date(a.date).toLocaleTimeString()}</small> | ${a.message}`;
        feed.appendChild(div);
    });
}

function renderUsers() {
    const tbody = document.querySelector('#users-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    users.forEach((u, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${u.username}</td><td>${u.role}</td><td>••••••</td><td><button class="btn-icon" onclick="deleteUserAccount(${index})">Del</button></td>`;
        tbody.appendChild(tr);
    });
}

// --- ACTIONS ---
window.adjustStock = (id) => {
    const qty = prompt("Enter quantity to ADD to stock:");
    if (qty === null || qty === "") return;
    const val = parseInt(qty);
    const med = medicines.find(m => m.id === id);
    if (med && !isNaN(val)) {
        med.quantity += val;
        logActivity(`Stock Added: ${val} units of ${med.name}`, 'success');
        saveData();
    }
};

window.deleteMedicine = (id) => {
    if(confirm("Delete this product permanently?")) {
        medicines = medicines.filter(m => m.id !== id);
        logActivity(`Deleted product ID ${id}`, 'danger');
        saveData();
    }
};

window.deleteDoctor = (id) => {
    if(confirm("Delete this recipient?")) {
        doctors = doctors.filter(d => d.id !== id);
        logActivity(`Deleted recipient ID ${id}`, 'danger');
        saveData();
    }
};

window.deleteUserAccount = (index) => {
    if(confirm("Delete this user account?")) {
        const user = users[index];
        if (user.username === 'Admin') return alert("Cannot delete main Admin");
        users.splice(index, 1);
        saveData();
    }
};

window.applyDateFilter = () => {
    const start = document.getElementById('filter-start-date').value;
    const end = document.getElementById('filter-end-date').value;
    if (!start || !end) return showToast("Please select both dates", "info");
    
    const filtered = issues.filter(i => {
        const date = i.date.split('T')[0];
        return date >= start && date <= end;
    });
    renderIssues(filtered);
};

window.clearDateFilter = () => {
    document.getElementById('filter-start-date').value = '';
    document.getElementById('filter-end-date').value = '';
    renderIssues();
};

window.printReceipt = (id) => {
    const issue = issues.find(i => i.id == id);
    if (!issue) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Gate Pass - ${issue.transactionId}</title>
            <style>
                body { font-family: sans-serif; padding: 40px; }
                .header { text-align: center; border-bottom: 2px solid #159a45; padding-bottom: 20px; }
                .details { margin: 30px 0; line-height: 1.6; }
                .footer { margin-top: 50px; display: flex; justify-content: space-between; }
                .sig { border-top: 1px solid #000; width: 150px; text-align: center; padding-top: 5px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>CELOGEN PHARMA</h1>
                <h3>SAMPLE GATE PASS</h3>
            </div>
            <div class="details">
                <p><strong>Transaction ID:</strong> ${issue.transactionId || issue.id}</p>
                <p><strong>Date:</strong> ${new Date(issue.date).toLocaleString()}</p>
                <p><strong>Recipient:</strong> ${issue.doctor}</p>
                <hr>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f4f4f4;">
                            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Product</th>
                            <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Batch</th>
                            <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Qty</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ddd;">${issue.medicineName}</td>
                            <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${issue.batch}</td>
                            <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${issue.quantity}</td>
                        </tr>
                    </tbody>
                </table>
                <p style="margin-top: 20px;"><strong>Notes:</strong> ${issue.notes || 'N/A'}</p>
            </div>
            <div class="footer">
                <div class="sig">Issuer Signature</div>
                <div class="sig">Receiver Signature</div>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
};

window.printInventoryAudit = () => {
    const printWindow = window.open('', '_blank');
    let rows = '';
    medicines.forEach(m => {
        rows += `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${m.id}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${m.name}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${m.batch}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${m.expiry}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.quantity}</td>
                <td style="padding: 8px; border: 1px solid #ddd; width: 100px;"></td>
            </tr>
        `;
    });

    printWindow.document.write(`
        <html>
        <head><title>Inventory Audit Sheet</title></head>
        <body style="font-family: sans-serif; padding: 20px;">
            <h1 style="color: #159a45;">Inventory Audit Sheet</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <table border="1" style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #eee;">
                        <th>ID</th><th>Product Name</th><th>Batch</th><th>Expiry</th><th>System Qty</th><th>Actual Qty</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
};

// --- STOCK ADJUSTMENT ---
window.adjustStock = (id) => {
    const med = medicines.find(m => m.id === id);
    if (!med) return;
    const qty = prompt(`Add stock for ${med.name}. Current: ${med.quantity}\nEnter amount to ADD:`);
    if (qty === null || qty === "") return;
    const val = parseInt(qty);
    if (isNaN(val) || val <= 0) return alert("Please enter a valid positive number");
    
    med.quantity += val;
    logActivity(`Restocked: +${val} ${med.name}`, 'success');
    saveData();
    showToast(`Added ${val} units to ${med.name}`);
};

window.openDiscardModal = (id) => {
    const med = medicines.find(m => m.id === id);
    if (!med) return;
    document.getElementById('discard-med-id').value = med.id;
    document.getElementById('discard-med-name').value = med.name;
    document.getElementById('discard-qty').max = med.quantity;
    document.getElementById('discard-qty').value = "";
    document.getElementById('discard-stock-modal').classList.add('active');
};

document.getElementById('discard-stock-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('discard-med-id').value;
    const qty = parseInt(document.getElementById('discard-qty').value);
    const reason = document.getElementById('discard-reason').value;
    const med = medicines.find(m => m.id === id);

    if (med && qty > 0) {
        if (qty > med.quantity) return alert("Cannot discard more than current stock!");
        med.quantity -= qty;
        logActivity(`Discarded: -${qty} ${med.name} (${reason})`, 'warning');
        saveData();
        document.getElementById('discard-stock-modal').classList.remove('active');
        showToast(`Discarded ${qty} units`);
    }
});

// --- FORM SUBMISSIONS ---
document.getElementById('add-doctor-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('doc-name').value.trim();
    const specialty = document.getElementById('doc-specialty').value;
    const team = document.getElementById('doc-team').value.trim();
    
    const newId = 'D' + String(Date.now()).slice(-4);
    doctors.push({ id: newId, name, specialty, team });
    
    logActivity(`Added recipient: ${name}`, 'success');
    saveData();
    
    document.getElementById('add-doctor-modal').classList.remove('active');
    e.target.reset();
});

document.getElementById('issue-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const doctorId = document.getElementById('issue-doctor').value;
    const doctor = doctors.find(d => d.id === doctorId)?.name;
    const notes = document.getElementById('issue-notes').value;
    const transactionId = Date.now();
    
    document.querySelectorAll('.issue-item-row').forEach(row => {
        const medId = row.querySelector('.issue-medicine').value;
        const qty = parseInt(row.querySelector('.issue-quantity').value);
        const med = medicines.find(m => m.id === medId);
        
        if (med && qty > 0) {
            if (qty > med.quantity) return showToast(`Not enough ${med.name}`, 'error');
            
            med.quantity -= qty;
            const issueId = Date.now() + Math.random();
            issues.unshift({
                id: issueId,
                transactionId,
                date: new Date().toISOString(),
                doctor,
                medicineId: med.id,
                medicineName: med.name,
                batch: med.batch,
                quantity: qty,
                notes,
                status: 'issued'
            });
            logActivity(`Issued ${qty} ${med.name} to ${doctor}`, 'success');
        }
    });
    
    saveData();
    e.target.reset();
    showToast("Samples issued successfully!");
});

// --- MEDICINE MODAL & FORM ---
window.openAddMedicineModal = () => {
    document.getElementById('med-modal-title').innerText = "Add New Product";
    document.getElementById('med-edit-id').value = "";
    document.getElementById('add-medicine-form').reset();
    document.getElementById('add-medicine-modal').classList.add('active');
};

window.openEditMedicineModal = (id) => {
    const med = medicines.find(m => m.id === id);
    if (!med) return;
    document.getElementById('med-modal-title').innerText = "Edit Product";
    document.getElementById('med-edit-id').value = med.id;
    document.getElementById('med-name').value = med.name;
    document.getElementById('med-batch').value = med.batch;
    document.getElementById('med-expiry').value = med.expiry;
    document.getElementById('med-qty').value = med.quantity;
    document.getElementById('med-threshold').value = med.minThreshold || 50;
    document.getElementById('add-medicine-modal').classList.add('active');
};

document.getElementById('add-medicine-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('med-edit-id').value;
    const name = document.getElementById('med-name').value.trim();
    const batch = document.getElementById('med-batch').value.trim();
    const expiry = document.getElementById('med-expiry').value;
    const quantity = parseInt(document.getElementById('med-qty').value);
    const minThreshold = parseInt(document.getElementById('med-threshold').value);

    if (id) {
        // Edit Mode
        const index = medicines.findIndex(m => m.id === id);
        if (index !== -1) {
            medicines[index] = { ...medicines[index], name, batch, expiry, quantity, minThreshold };
            logActivity(`Updated product: ${name}`, 'info');
        }
    } else {
        // Add Mode
        const newId = 'M' + String(Date.now()).slice(-4);
        medicines.push({ id: newId, name, batch, expiry, quantity, minThreshold, status: 'ok' });
        logActivity(`Added new product: ${name}`, 'success');
    }

    saveData();
    document.getElementById('add-medicine-modal').classList.remove('active');
    showToast("Product saved successfully!");
});

// --- DOCTOR MODAL & FORM ---
window.openAddDoctorModal = () => {
    document.getElementById('doc-modal-title').innerText = "Add New Recipient";
    document.getElementById('doc-edit-id').value = "";
    document.getElementById('add-doctor-form').reset();
    document.getElementById('add-doctor-modal').classList.add('active');
};

document.getElementById('add-doctor-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('doc-name').value.trim();
    const specialty = document.getElementById('doc-category').value; // Corrected ID from index.html
    const team = document.getElementById('doc-region').value.trim(); // Corrected ID from index.html
    
    const newId = 'D' + String(Date.now()).slice(-4);
    doctors.push({ id: newId, name, specialty, team });
    
    logActivity(`Added recipient: ${name}`, 'success');
    saveData();
    
    document.getElementById('add-doctor-modal').classList.remove('active');
    showToast("Recipient added!");
});

// --- REPORTS MODULE ---
window.toggleReportMode = (mode) => {
    document.querySelectorAll('.report-toggle').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.report-toggle[onclick*="${mode}"]`).classList.add('active');
    
    document.getElementById('monthly-report-controls').style.display = mode === 'monthly' ? 'block' : 'none';
    document.getElementById('yearly-report-controls').style.display = mode === 'yearly' ? 'block' : 'none';
};

window.renderUsageReport = () => {
    const monthFilter = document.getElementById('usage-month-filter').value;
    if (!monthFilter) return showToast("Please select a month", "info");

    const tbody = document.querySelector('#usage-report-table tbody');
    tbody.innerHTML = '';

    // Group by Doctor
    const reportData = doctors.map(doc => {
        const docIssues = issues.filter(i => {
            const date = i.date.substring(0, 7); // YYYY-MM
            return date === monthFilter && i.doctor === doc.name && i.status !== 'cancelled';
        });

        if (docIssues.length === 0) return null;

        const products = [...new Set(docIssues.map(i => i.medicineName))].join(', ');
        const totalQty = docIssues.reduce((sum, i) => sum + i.quantity, 0);
        const lastDate = docIssues[0].date;

        return { name: doc.name, category: doc.specialty, products, totalQty, lastDate };
    }).filter(d => d !== null);

    if (reportData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No data for this month.</td></tr>';
        return;
    }

    reportData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${row.name}</strong></td>
            <td>${row.category}</td>
            <td><small>${row.products}</small></td>
            <td>${row.totalQty}</td>
            <td>${new Date(row.lastDate).toLocaleDateString()}</td>
        `;
        tbody.appendChild(tr);
    });
};

window.renderYearlyReport = () => {
    const yearFilter = document.getElementById('usage-year-filter').value;
    const tbody = document.querySelector('#usage-report-table tbody');
    tbody.innerHTML = '';

    const reportData = doctors.map(doc => {
        const docIssues = issues.filter(i => {
            const date = i.date.substring(0, 4); // YYYY
            return date === yearFilter && i.doctor === doc.name && i.status !== 'cancelled';
        });

        if (docIssues.length === 0) return null;

        const products = [...new Set(docIssues.map(i => i.medicineName))].join(', ');
        const totalQty = docIssues.reduce((sum, i) => sum + i.quantity, 0);
        const lastDate = docIssues[0].date;

        return { name: doc.name, category: doc.specialty, products, totalQty, lastDate };
    }).filter(d => d !== null);

    if (reportData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No data for this year.</td></tr>';
        return;
    }

    reportData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${row.name}</strong></td>
            <td>${row.category}</td>
            <td><small>${row.products}</small></td>
            <td>${row.totalQty}</td>
            <td>${new Date(row.lastDate).toLocaleDateString()}</td>
        `;
        tbody.appendChild(tr);
    });
};

// --- USER MODAL & FORM ---
window.openAddUserModal = () => {
    document.getElementById('add-user-form').reset();
    document.getElementById('add-user-modal').classList.add('active');
};

// --- DATA MANAGEMENT ---
window.backupData = () => {
    const data = { medicines, issues, doctors, activities, users, backupDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Celogen_Backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    showToast("Backup downloaded!");
};

document.getElementById('file-restore-data')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            if (confirm("Restore this backup? Current data will be overwritten.")) {
                if (data.medicines) medicines = data.medicines;
                if (data.issues) issues = data.issues;
                if (data.doctors) doctors = data.doctors;
                if (data.activities) activities = data.activities;
                if (data.users) users = data.users;
                saveData();
                showToast("Data Restored!");
                location.reload();
            }
        } catch (err) {
            alert("Invalid backup file!");
        }
    };
    reader.readAsText(file);
});

window.clearActivityLogs = () => {
    if (confirm("Clear all activity logs?")) {
        activities = [];
        saveData();
        showToast("Logs cleared!");
    }
};

window.resetData = () => {
    if (confirm("FACTORY RESET: Wipe ALL data including users?")) {
        const defaultUsers = [{ username: 'Admin', role: 'Admin', password: 'admin123' }];
        medicines = [];
        issues = [];
        doctors = [];
        activities = [];
        users = defaultUsers;
        saveData();
        sessionStorage.clear();
        location.reload();
    }
};

// --- EXPORT UTILS ---
window.exportHistoryToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(issues.map(i => ({
        Date: new Date(i.date).toLocaleString(),
        Recipient: i.doctor,
        Product: i.medicineName,
        Batch: i.batch,
        Quantity: i.quantity,
        Status: i.status,
        Notes: i.notes || ''
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "History");
    XLSX.writeFile(wb, "Celogen_Issue_History.xlsx");
};

window.exportUsageReport = (type) => {
    const table = document.getElementById('usage-report-table');
    if (!table) return;
    const wb = XLSX.utils.table_to_book(table);
    const filename = type === 'monthly' ? "Celogen_Monthly_Usage.xlsx" : "Celogen_Yearly_Usage.xlsx";
    XLSX.writeFile(wb, filename);
    showToast("Report Exported!");
};

document.getElementById('add-user-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('user-name').value.trim();
    const role = document.getElementById('user-role').value;
    const password = document.getElementById('user-pass').value.trim();

    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        return alert("Username already exists!");
    }

    users.push({ username, role, password });
    logActivity(`Created user account: ${username}`, 'info');
    saveData();
    
    document.getElementById('add-user-modal').classList.remove('active');
    showToast("User account created!");
});

// --- NAVIGATION ---
document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(target).classList.add('active');
        if (target === 'sample-request') renderSampleRequestGrid();
    });
});

window.switchTab = (id) => document.querySelector(`.nav-item[data-target="${id}"]`)?.click();

// --- THEME ---
function initTheme() {
    const theme = localStorage.getItem('celogen_theme') || 'dark';
    if (theme === 'light') document.body.classList.add('light-theme');
}

window.toggleTheme = () => {
    const isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem('celogen_theme', isLight ? 'light' : 'dark');
};

// --- DATA RESET ---
window.cleanStart = () => {
    if(confirm("⚠️ WIPE EVERYTHING? This cannot be undone.")) {
        medicines = [];
        issues = [];
        doctors = [];
        activities = [];
        saveData();
        location.reload();
    }
};

function renderSampleRequestGrid() {
    const head = document.getElementById('bulk-head');
    const body = document.getElementById('bulk-body');
    if (!head || !body) return;

    const monthSelect = document.getElementById('sample-month-select');
    const yearInput = document.getElementById('sample-year-input');
    const monthName = monthSelect.options[monthSelect.selectedIndex].text;
    const yearValue = yearInput.value;

    // Header: Product Name | Recipient 1 | Recipient 2 | ... | Total
    let headHtml = '<tr><th style="position:sticky; left:0; background:var(--bg-panel); z-index:10; min-width:200px;">Product Name</th>';
    doctors.forEach(doc => {
        headHtml += `<th style="writing-mode: vertical-lr; transform: rotate(180deg); padding: 15px 5px; min-width: 45px; font-size: 0.7rem; font-weight:500;">${doc.name}</th>`;
    });
    headHtml += '<th style="background:var(--bg-panel); font-weight:700; color:var(--primary);">TOTAL</th></tr>';
    head.innerHTML = headHtml;

    // Body: One row per medicine
    let bodyHtml = '';
    medicines.forEach(med => {
        bodyHtml += `<tr><td style="position:sticky; left:0; background:var(--bg-panel); z-index:9; border-right:2px solid var(--border-color);"><strong>${med.name}</strong></td>`;
        doctors.forEach(doc => {
            bodyHtml += `<td><input type="number" class="sample-input" data-med="${med.id}" data-doc="${doc.id}" min="0" value="0" oninput="calculateSampleTotals()" style="width: 45px; padding: 4px 2px; font-size: 0.8rem; background: transparent; border: 1px solid var(--border-color); color: var(--text-primary); text-align: center; border-radius: 4px;"></td>`;
        });
        bodyHtml += `<td class="med-row-total" id="total-${med.id}" style="font-weight:700; color:var(--primary); text-align:center; background:rgba(21, 154, 69, 0.05);">0</td></tr>`;
    });
    body.innerHTML = bodyHtml;
}

window.calculateSampleTotals = () => {
    medicines.forEach(med => {
        let rowTotal = 0;
        document.querySelectorAll(`.sample-input[data-med="${med.id}"]`).forEach(input => {
            rowTotal += parseInt(input.value) || 0;
        });
        const totalEl = document.getElementById(`total-${med.id}`);
        if (totalEl) totalEl.innerText = rowTotal;
    });
};

window.exportSampleRequestExcel = () => {
    const table = document.getElementById('bulk-allocation-table');
    if (!table) return;
    
    const month = document.getElementById('sample-month-select').options[document.getElementById('sample-month-select').selectedIndex].text;
    const year = document.getElementById('sample-year-input').value;
    
    // Create a new workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws_data = [];
    
    // Header Row
    const headerRow = ['Product Name'];
    doctors.forEach(d => headerRow.push(d.name));
    headerRow.push('TOTAL');
    ws_data.push(headerRow);
    
    // Data Rows
    medicines.forEach(med => {
        const row = [med.name];
        let total = 0;
        doctors.forEach(doc => {
            const val = parseInt(document.querySelector(`.sample-input[data-med="${med.id}"][data-doc="${doc.id}"]`)?.value) || 0;
            row.push(val);
            total += val;
        });
        row.push(total);
        ws_data.push(row);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, "Sample Request");
    XLSX.writeFile(wb, `Celogen_Sample_Request_${month}_${year}.xlsx`);
    showToast("Excel Exported!");
};

window.printSampleRequest = () => {
    const month = document.getElementById('sample-month-select').options[document.getElementById('sample-month-select').selectedIndex].text;
    const year = document.getElementById('sample-year-input').value;
    
    let printContent = `
        <div style="font-family: Inter, sans-serif; padding: 20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 2px solid #159a45; padding-bottom: 10px; margin-bottom: 20px;">
                <div>
                    <h1 style="color: #159a45; margin: 0;">CELOGEN PHARMA</h1>
                    <p style="margin: 5px 0; color: #666;">Warehouse Sample Request - ${month} ${year}</p>
                </div>
                <div style="text-align: right;">
                    <p style="margin:0;">Date: ${new Date().toLocaleDateString()}</p>
                </div>
            </div>
            <table border="1" style="width:100%; border-collapse: collapse; font-size: 10px;">
                <thead>
                    <tr>
                        <th style="padding: 5px; text-align: left;">Product Name</th>
    `;
    
    doctors.forEach(d => {
        printContent += `<th style="writing-mode: vertical-lr; transform: rotate(180deg); padding: 5px;">${d.name}</th>`;
    });
    
    printContent += `
                        <th style="padding: 5px;">TOTAL</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    medicines.forEach(med => {
        printContent += `<tr><td style="padding: 5px;"><strong>${med.name}</strong></td>`;
        let total = 0;
        doctors.forEach(doc => {
            const val = parseInt(document.querySelector(`.sample-input[data-med="${med.id}"][data-doc="${doc.id}"]`)?.value) || 0;
            printContent += `<td style="text-align: center;">${val || '-'}</td>`;
            total += val;
        });
        printContent += `<td style="text-align: center; font-weight: bold;">${total}</td></tr>`;
    });
    
    printContent += `
                </tbody>
            </table>
            <div style="margin-top: 40px; display: flex; justify-content: space-between;">
                <div style="border-top: 1px solid #000; width: 200px; text-align: center; padding-top: 5px;">Requested By</div>
                <div style="border-top: 1px solid #000; width: 200px; text-align: center; padding-top: 5px;">Approved By</div>
            </div>
        </div>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<html><head><title>Sample Request - ${month} ${year}</title></head><body>${printContent}</body></html>`);
    printWindow.document.close();
    printWindow.print();
};
