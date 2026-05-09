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

    // Load from Cloud
    loadDataFromGas();
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
    
    doctors.forEach(doc => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${doc.id}</td>
            <td><strong>${doc.name}</strong></td>
            <td>${doc.specialty}</td>
            <td>${doc.team || '-'}</td>
            <td>
                <button class="btn-icon admin-only" onclick="deleteDoctor('${doc.id}')">Del</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

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

// --- FORM SUBMISSIONS ---
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
    // Basic implementation for warehouse view
    const grid = document.getElementById('sample-request-grid');
    if (!grid) return;
    grid.innerHTML = '<h3>Request Samples Grid Coming Soon</h3>';
}
