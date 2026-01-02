// Data Aplikasi DompetKu v1.4
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let userProfile = JSON.parse(localStorage.getItem('userProfile')) || {
    name: 'Pengguna',
    email: '',
    joinDate: new Date().toISOString(),
    theme: 'light',
    milestoneTarget: 250000,
    fontSize: 'medium',
    fontFamily: 'inter',
    language: 'id',
    adminMode: false
};

// Admin state
let isAdmin = false;

// Format Rupiah
function formatRupiah(amount) {
    return 'Rp ' + parseInt(amount).toLocaleString('id-ID');
}

// Update Header dengan nama dan avatar
function updateHeaderUser() {
    const headerUser = document.getElementById('header-user');
    if (!headerUser) return;
    
    const userName = userProfile.name || 'Pengguna';
    const firstLetter = userName.charAt(0).toUpperCase();
    
    headerUser.innerHTML = `
        <div class="user-profile">
            <div class="user-avatar">
                ${firstLetter}
            </div>
            <div class="user-name">${userName}</div>
        </div>
    `;
}

// Update Header berdasarkan halaman
function updateHeader(pageName) {
    const titles = {
        'dashboard': '<i class="fas fa-wallet"></i> Yakoo‼️',
        'add': '<i class="fas fa-plus-circle"></i> Tambah Transaksi',
        'history': '<i class="fas fa-history"></i> Histori Transaksi',
        'milestone': '<i class="fas fa-flag-checkered"></i> Milestone',
        'settings': '<i class="fas fa-cog"></i> Pengaturan'
    };
    
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
        pageTitle.innerHTML = titles[pageName] || titles['dashboard'];
    }
    
    // Update user info di header
    updateHeaderUser();
}

// Update Waktu
function updateDateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    const liveClock = document.getElementById('live-clock');
    if (liveClock) liveClock.textContent = `${hours}:${minutes}:${seconds}`;
    
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const currentDate = document.getElementById('current-date');
    if (currentDate) currentDate.textContent = now.toLocaleDateString('id-ID', options);
}

// Hitung Saldo
function calculateBalance() {
    let totalIncome = 0;
    let totalExpense = 0;
    
    transactions.forEach(t => {
        const amount = parseFloat(t.amount) || 0;
        if (t.type === 'income') {
            totalIncome += amount;
        } else {
            totalExpense += amount;
        }
    });
    
    const currentBalance = totalIncome - totalExpense;
    
    const currentBalanceEl = document.getElementById('current-balance');
    const incomeTotalEl = document.getElementById('income-total');
    const expenseTotalEl = document.getElementById('expense-total');
    
    if (currentBalanceEl) currentBalanceEl.textContent = formatRupiah(currentBalance);
    if (incomeTotalEl) incomeTotalEl.textContent = formatRupiah(totalIncome);
    if (expenseTotalEl) expenseTotalEl.textContent = formatRupiah(totalExpense);
    
    updateMilestone(currentBalance);
    updateMiniMilestone(currentBalance);
    return currentBalance;
}

// Update Milestone
function updateMilestone(currentBalance) {
    const target = userProfile.milestoneTarget || 250000;
    const progress = Math.min((currentBalance / target) * 100, 100);
    
    const progressBar = document.getElementById('milestone-progress');
    const milestoneCurrent = document.getElementById('milestone-current');
    const milestoneTarget = document.getElementById('milestone-target');
    const milestonePercent = document.getElementById('milestone-percent');
    
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (milestoneCurrent) milestoneCurrent.textContent = formatRupiah(currentBalance);
    if (milestoneTarget) milestoneTarget.textContent = formatRupiah(target);
    if (milestonePercent) milestonePercent.textContent = `${Math.round(progress)}%`;
}

// Update Mini Milestone di Dashboard
function updateMiniMilestone(currentBalance) {
    const target = userProfile.milestoneTarget || 250000;
    const progress = Math.min((currentBalance / target) * 100, 100);
    
    const progressBar = document.getElementById('milestone-mini-progress');
    const milestonePercent = document.getElementById('milestone-mini-percent');
    
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (milestonePercent) milestonePercent.textContent = `${Math.round(progress)}%`;
}

// Tampilkan Transaksi di Dashboard
function displayTransactions() {
    const transactionsList = document.getElementById('transactions-list');
    if (!transactionsList) return;
    
    if (transactions.length === 0) {
        transactionsList.innerHTML = '<p class="empty-message">Belum ada transaksi</p>';
        return;
    }
    
    // Ambil 5 transaksi terbaru
    const recentTransactions = [...transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    let html = '';
    recentTransactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const formattedDate = date.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'short' 
        });
        
        html += `
            <div class="transaction-item ${transaction.type}">
                <div class="transaction-info">
                    <div class="transaction-description">${transaction.description || 'Tanpa Keterangan'}</div>
                    <div class="transaction-category">${transaction.category}</div>
                    <div class="transaction-date">${formattedDate}</div>
                </div>
                <div class="transaction-amount ${transaction.type}-amount">
                    ${transaction.type === 'income' ? '+' : '-'} ${formatRupiah(transaction.amount)}
                </div>
            </div>
        `;
    });
    
    transactionsList.innerHTML = html;
}

// Tampilkan Histori Transaksi
function displayHistory(filterMonth = '', filterType = '') {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    if (transactions.length === 0) {
        historyList.innerHTML = '<p class="empty-message">Belum ada transaksi</p>';
        return;
    }
    
    let filteredTransactions = [...transactions];
    
    // Filter berdasarkan bulan
    if (filterMonth !== '') {
        filteredTransactions = filteredTransactions.filter(t => {
            const date = new Date(t.date);
            return date.getMonth() === parseInt(filterMonth);
        });
    }
    
    // Filter berdasarkan jenis
    if (filterType !== '') {
        filteredTransactions = filteredTransactions.filter(t => t.type === filterType);
    }
    
    // Urutkan dari terbaru
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let html = '';
    filteredTransactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const formattedDate = date.toLocaleDateString('id-ID', { 
            weekday: 'short',
            day: 'numeric', 
            month: 'long',
            year: 'numeric'
        });
        
        // Tombol edit dan hapus hanya untuk admin
        const adminButtons = isAdmin ? `
            <div class="history-actions">
                <button class="edit-transaction" data-id="${transaction.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-transaction" data-id="${transaction.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        ` : '';
        
        html += `
            <div class="history-item ${transaction.type}" data-id="${transaction.id}">
                <div class="history-details">
                    <div class="history-date">${formattedDate}</div>
                    <div class="transaction-description">${transaction.description || 'Tanpa Keterangan'}</div>
                    <div class="transaction-category">${transaction.category}</div>
                </div>
                <div class="history-right">
                    <div class="transaction-amount ${transaction.type}-amount">
                        ${transaction.type === 'income' ? '+' : '-'} ${formatRupiah(transaction.amount)}
                    </div>
                    ${adminButtons}
                </div>
            </div>
        `;
    });
    
    historyList.innerHTML = html;
    
    // Tambahkan event listener untuk tombol edit/hapus jika admin
    if (isAdmin) {
        document.querySelectorAll('.edit-transaction').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                editTransaction(id);
            });
        });
        
        document.querySelectorAll('.delete-transaction').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                deleteTransaction(id);
            });
        });
    }
}

// Navigasi antar Halaman
function navigateTo(pageId) {
    console.log('Navigating to:', pageId);
    
    // Sembunyikan semua halaman
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Tampilkan halaman yang dipilih
    const pageElement = document.getElementById(`${pageId}-page`);
    if (pageElement) {
        pageElement.classList.add('active');
    }
    
    // Update tombol navigasi
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === pageId) {
            btn.classList.add('active');
        }
    });
    
    // Update header
    updateHeader(pageId);
    
    // Load data untuk halaman tertentu
    if (pageId === 'dashboard') {
        calculateBalance();
        displayTransactions();
        showGreeting();
    } else if (pageId === 'history') {
        displayHistory();
        populateMonthFilter();
    } else if (pageId === 'milestone') {
        calculateBalance();
    } else if (pageId === 'settings') {
        initSettings();
    }
}

// Tampilkan sapaan di dashboard (hanya pertama kali)
function showGreeting() {
    const greetingShown = localStorage.getItem('greetingShown');
    const greetingMessage = document.getElementById('greeting-message');
    
    if (!greetingShown && greetingMessage) {
        const userName = userProfile.name || 'Pengguna';
        const hour = new Date().getHours();
        let greeting = '';
        
        if (hour < 12) greeting = 'Selamat pagi';
        else if (hour < 15) greeting = 'Selamat siang';
        else if (hour < 19) greeting = 'Selamat sore';
        else greeting = 'Selamat malam';
        
        greetingMessage.textContent = `${greeting}, ${userName}! Selamat menggunakan DompetKu.`;
        
        // Simpan flag bahwa sapaan sudah ditampilkan
        localStorage.setItem('greetingShown', 'true');
        
        // Hapus pesan setelah 5 detik
        setTimeout(() => {
            greetingMessage.textContent = '';
        }, 5000);
    }
}

// Isi Filter Bulan
function populateMonthFilter() {
    const monthSelect = document.getElementById('filter-month');
    if (!monthSelect) return;
    
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    monthSelect.innerHTML = '<option value="">Semua Bulan</option>';
    
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = month;
        monthSelect.appendChild(option);
    });
}

// Terapkan Tema
function applyTheme(theme) {
    document.body.className = theme + '-theme';
    userProfile.theme = theme;
    
    // Update tombol tema di header
    document.querySelectorAll('.theme-btn-header').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
    
    // Update tombol tema di settings (jika ada)
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
    
    saveToLocalStorage();
}

// Terapkan Font Settings
function applyFontSettings() {
    const fontSize = userProfile.fontSize || 'medium';
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add(`font-${fontSize}`);
    
    const fontFamily = userProfile.fontFamily || 'inter';
    document.body.style.fontFamily = fontFamily === 'poppins' ? "'Poppins', sans-serif" :
                                     fontFamily === 'roboto' ? "'Roboto', sans-serif" :
                                     fontFamily === 'arial' ? "Arial, sans-serif" :
                                     "'Inter', 'Segoe UI', sans-serif";
}

// Simpan ke LocalStorage
function saveToLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    calculateBalance();
    displayTransactions();
    applyFontSettings();
    
    // Update tombol save di settings
    const saveBtn = document.getElementById('save-settings');
    if (saveBtn) {
        saveBtn.classList.add('saved');
        saveBtn.innerHTML = '<i class="fas fa-check"></i> Pengaturan Tersimpan';
        setTimeout(() => {
            saveBtn.classList.remove('saved');
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Simpan Pengaturan';
        }, 2000);
    }
}

// Inisialisasi Aplikasi
function initApp() {
    console.log('Yakoo‼️ v1.4 Initializing...');
    
    // Update waktu
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Inisialisasi form tanggal
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
        dateInput.max = today;
    }
    
    // Setup event listeners untuk navigasi
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            navigateTo(this.dataset.page);
        });
    });
    
    // Set default page ke dashboard
    navigateTo('dashboard');
    
    // Load data
    calculateBalance();
    displayTransactions();
    applyFontSettings();
    
    // Terapkan tema
    if (userProfile.theme) {
        applyTheme(userProfile.theme);
    }
    
    // Update user info
    updateHeaderUser();
    
    console.log('Yakoo‼️ v1.4 Ready!');
}

// Inisialisasi Pengaturan
function initSettings() {
    // Set nilai input
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const setTarget = document.getElementById('set-target');
    
    if (userName) userName.value = userProfile.name || '';
    if (userEmail) userEmail.value = userProfile.email || '';
    if (setTarget) setTarget.value = userProfile.milestoneTarget || 250000;
    
    // Set font size
    document.querySelectorAll('input[name="font-size"]').forEach(radio => {
        radio.checked = radio.value === userProfile.fontSize;
        if (radio.checked) {
            const label = radio.closest('.radio-label');
            if (label) label.classList.add('active');
        }
    });
    
    // Set font family
    const fontFamilySelect = document.getElementById('font-family');
    if (fontFamilySelect) {
        fontFamilySelect.value = userProfile.fontFamily || 'inter';
    }
    
    // Set theme buttons di header
    document.querySelectorAll('.theme-btn-header').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === userProfile.theme);
    });
    
    // Set language buttons
    document.querySelectorAll('.language-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === userProfile.language);
    });
    
    // Set admin mode
    const adminModeCheckbox = document.getElementById('admin-mode');
    if (adminModeCheckbox) {
        adminModeCheckbox.checked = userProfile.adminMode || false;
        
        // Tampilkan input password jika admin mode aktif
        const adminPasswordContainer = document.getElementById('admin-password-container');
        if (adminPasswordContainer) {
            adminPasswordContainer.style.display = adminModeCheckbox.checked ? 'block' : 'none';
        }
    }
}

// Fungsi untuk edit transaksi (admin)
function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;
    
    // Tampilkan form edit (sementara gunakan prompt)
    const newAmount = prompt('Edit jumlah:', transaction.amount);
    if (newAmount && !isNaN(newAmount) && newAmount > 0) {
        transaction.amount = parseInt(newAmount);
    }
    
    const newDescription = prompt('Edit keterangan:', transaction.description);
    if (newDescription !== null) {
        transaction.description = newDescription;
    }
    
    saveToLocalStorage();
    displayHistory();
}

// Fungsi untuk hapus transaksi (admin)
function deleteTransaction(id) {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveToLocalStorage();
        displayHistory();
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi aplikasi
    initApp();
    
    // Radio button labels
    document.querySelectorAll('.radio-label:not(.locked-feature .radio-label)').forEach(label => {
        label.addEventListener('click', function() {
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                document.querySelectorAll('.radio-label').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Add transaction form
    const submitBtn = document.getElementById('submit-transaction');
    if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const amount = document.getElementById('amount').value;
            const typeInput = document.querySelector('input[name="type"]:checked');
            const description = document.getElementById('description').value;
            const category = document.getElementById('category').value;
            const date = document.getElementById('date').value;
            
            if (!amount || amount <= 0) {
                alert('Masukkan jumlah yang valid!');
                return;
            }
            
            const type = typeInput ? typeInput.value : 'income';
            
            const transaction = {
                id: Date.now(),
                amount: parseInt(amount),
                type: type,
                description: description || 'Tanpa Keterangan',
                category: category || 'lainnya',
                date: date || new Date().toISOString()
            };
            
            transactions.push(transaction);
            saveToLocalStorage();
            
            // Reset form
            document.getElementById('amount').value = '';
            document.getElementById('description').value = '';
            document.getElementById('category').value = 'lainnya';
            
            // Reset date
            const dateInput = document.getElementById('date');
            if (dateInput) {
                const today = new Date().toISOString().split('T')[0];
      dateInput.value = today;
            }
            
            // Reset radio buttons
            document.getElementById('income-label').classList.add('active');
            document.getElementById('expense-label').classList.remove('active');
            document.querySelector('input[name="type"][value="income"]').checked = true;
            
            alert('Transaksi berhasil ditambahkan!');
            navigateTo('dashboard');
        });
    }
    
    // Update milestone target
    const updateTargetBtn = document.getElementById('update-target');
    if (updateTargetBtn) {
        updateTargetBtn.addEventListener('click', function() {
            const targetInput = document.getElementById('set-target');
            if (targetInput && targetInput.value >= 10000) {
                userProfile.milestoneTarget = parseInt(targetInput.value);
                saveToLocalStorage();
                alert('Target milestone berhasil diperbarui!');
            } else {
                alert('Masukkan target minimal Rp 10.000');
            }
        });
    }
    
    // See all transactions
    const seeAllBtn = document.getElementById('see-all-transactions');
    if (seeAllBtn) {
        seeAllBtn.addEventListener('click', function() {
            navigateTo('history');
        });
    }
    
    // Theme buttons di header
    document.querySelectorAll('.theme-btn-header').forEach(btn => {
        btn.addEventListener('click', function() {
            applyTheme(this.dataset.theme);
        });
    });
    
    // Font size (dikunci)
    document.querySelectorAll('input[name="font-size"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (!this.disabled) {
                userProfile.fontSize = this.value;
                saveToLocalStorage();
            } else {
                alert('Fitur ukuran font akan hadir di update selanjutnya!');
            }
        });
    });
    
    // Font family (dikunci)
    const fontFamilySelect = document.getElementById('font-family');
    if (fontFamilySelect) {
        fontFamilySelect.addEventListener('change', function() {
            if (!this.disabled) {
                userProfile.fontFamily = this.value;
                saveToLocalStorage();
            } else {
                alert('Fitur jenis font akan hadir di update selanjutnya!');
            }
        });
    }
    
    // Language buttons (dikunci)
    document.querySelectorAll('.language-btn:not(.locked-feature .language-btn)').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.disabled) {
                userProfile.language = this.dataset.lang;
                saveToLocalStorage();
                alert('Bahasa akan diterapkan setelah refresh halaman');
            } else {
                alert('Fitur bahasa akan hadir di update selanjutnya!');
            }
        });
    });
    
    // Admin mode
    const adminModeCheckbox = document.getElementById('admin-mode');
    if (adminModeCheckbox) {
        adminModeCheckbox.addEventListener('change', function() {
            userProfile.adminMode = this.checked;
            
            const adminPasswordContainer = document.getElementById('admin-password-container');
            if (adminPasswordContainer) {
                adminPasswordContainer.style.display = this.checked ? 'block' : 'none';
            }
            
            if (!this.checked) {
                isAdmin = false;
            }
            
            saveToLocalStorage();
        });
    }
    
    // Admin login
    const adminLoginBtn = document.getElementById('admin-login');
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', function() {
            const password = document.getElementById('admin-password').value;
            if (password === 'admin') {
                isAdmin = true;
                alert('Login admin berhasil! Mode edit/hapus transaksi diaktifkan.');
                // Refresh history page jika sedang terbuka
                if (document.getElementById('history-page').classList.contains('active')) {
                    displayHistory();
                }
            } else {
                alert('Password salah!');
            }
        });
    }
    
    // Filter month
    const filterMonth = document.getElementById('filter-month');
    if (filterMonth) {
        filterMonth.addEventListener('change', function() {
            const filterType = document.getElementById('filter-type').value;
            displayHistory(this.value, filterType);
        });
    }
    
    // Filter type
    const filterType = document.getElementById('filter-type');
    if (filterType) {
        filterType.addEventListener('change', function() {
            const filterMonth = document.getElementById('filter-month').value;
            displayHistory(filterMonth, this.value);
        });
    }
    
    // Export data (dikunci)
    const exportBtn = document.getElementById('export-data');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            alert('Fitur ekspor data akan hadir di update selanjutnya!');
        });
    }
    
    // Import data (dikunci)
    const importBtn = document.getElementById('import-data');
    if (importBtn) {
        importBtn.addEventListener('click', function() {
            alert('Fitur impor data akan hadir di update selanjutnya!');
        });
    }
    
    // Reset data (dikunci)
    const resetBtn = document.getElementById('reset-data');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            alert('Fitur reset data akan hadir di update selanjutnya!');
        });
    }
    
    // Save settings
    const saveSettingsBtn = document.getElementById('save-settings');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', function() {
            // Simpan nama dan email
            const userName = document.getElementById('user-name');
            const userEmail = document.getElementById('user-email');
            
            if (userName) userProfile.name = userName.value || 'Pengguna';
            if (userEmail) userProfile.email = userEmail.value;
            
            saveToLocalStorage();
            updateHeaderUser();
        });
    }
});