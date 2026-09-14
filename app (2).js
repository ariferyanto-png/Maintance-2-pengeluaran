// Array Menyimpan Semua Data Pengeluaran
let expensesData = JSON.parse(localStorage.getItem('my_expenses_excel')) || [];

// Generator Efek Suara Tombol
function playClickSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
    } catch(e) {}
}

// Format Angka ke Rupiah
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(amount);
}

// RUMUS EXCEL: Menghitung Sum Pengeluaran per Kategori & Grand Total
function calculateExpenses() {
    const categories = ['HARIAN', 'LAIN2', 'LAUNDRY', 'TABUNGAN / ARISAN'];
    let grandTotalSum = 0;

    // Reset dan Hitung per Kategori (=SUMIF)
    categories.forEach(cat => {
        const catTotal = expensesData
            .filter(item => item.category === cat)
            .reduce((sum, item) => sum + item.amount, 0);

        const el = document.getElementById(`total-${cat}`);
        if (el) el.textContent = formatRupiah(catTotal);

        grandTotalSum += catTotal;
    });

    // Total Seluruh Pengeluaran (=SUM)
    document.getElementById('grandTotal').textContent = formatRupiah(grandTotalSum);

    // Update Tabel Laporan
    renderReportTable(grandTotalSum);

    // Simpan ke Memori HP
    localStorage.setItem('my_expenses_excel', JSON.stringify(expensesData));
}

// Render Tabel Laporan Excel
function renderReportTable(totalSum) {
    const tbody = document.getElementById('reportTableBody');
    tbody.innerHTML = '';

    expensesData.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${item.category}</strong></td>
            <td>${item.desc}</td>
            <td style="color:#f43f5e; font-weight:600;">${formatRupiah(item.amount)}</td>
            <td><button class="btn-del-row" onclick="deleteExpense(${item.id})">✕</button></td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('reportTotalSum').textContent = formatRupiah(totalSum);
}

// Buka Form Modal untuk Kategori Tertentu
function openInput(category) {
    playClickSound();
    document.getElementById('selectedCategory').value = category;
    document.getElementById('modalTitle').textContent = `Pengeluaran: ${category}`;
    document.getElementById('inputModal').classList.remove('hidden');
}

// Tutup Form Modal
function closeInput() {
    document.getElementById('inputModal').classList.add('hidden');
    document.getElementById('expenseForm').reset();
}

// Simpan Data Pengeluaran Baru
document.getElementById('expenseForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const category = document.getElementById('selectedCategory').value;
    const desc = document.getElementById('expenseDesc').value.trim();
    const amount = parseFloat(document.getElementById('expenseAmount').value) || 0;

    if (!desc || amount <= 0) return;

    expensesData.push({
        id: Date.now(),
        category: category,
        desc: desc,
        amount: amount
    });

    playClickSound();
    calculateExpenses();
    closeInput();
});

// Hapus Item Pengeluaran
function deleteExpense(id) {
    playClickSound();
    expensesData = expensesData.filter(item => item.id !== id);
    calculateExpenses();
}

// Navigasi Tab (Utama vs Laporan)
function switchTab(tab) {
    playClickSound();
    const homeView = document.getElementById('homeView');
    const reportView = document.getElementById('reportView');
    const navHome = document.getElementById('navHome');
    const navReport = document.getElementById('navReport');

    if (tab === 'home') {
        homeView.classList.remove('hidden');
        reportView.classList.add('hidden');
        navHome.classList.add('active');
        navReport.classList.remove('active');
    } else {
        homeView.classList.add('hidden');
        reportView.classList.remove('hidden');
        navHome.classList.remove('active');
        navReport.classList.add('active');
    }
}

// Jalankan kalkulasi rumus awal
calculateExpenses();
