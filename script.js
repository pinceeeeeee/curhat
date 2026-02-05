// Data curhatan akan disimpan di localStorage
const STORAGE_KEY = 'curhatBersamaData';
const PUBLIC_STORAGE_KEY = 'curhatBersamaPublicData';

// Data awal jika localStorage kosong
const initialData = {
    curhats: [],
    publicCurhats: []
};

// Inisialisasi data
let appData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialData;
let publicData = JSON.parse(localStorage.getItem(PUBLIC_STORAGE_KEY)) || { publicCurhats: [] };

// Elemen DOM
const curhatInput = document.getElementById('curhatInput');
const moodSelect = document.getElementById('moodSelect');
const submitBtn = document.getElementById('submitBtn');
const charCount = document.getElementById('charCount');
const myCurhatsList = document.getElementById('myCurhatsList');
const emptyMyCurhats = document.getElementById('emptyMyCurhats');
const publicCurhatsList = document.getElementById('publicCurhatsList');
const emptyPublicCurhats = document.getElementById('emptyPublicCurhats');
const moodFilter = document.getElementById('moodFilter');
const totalCurhats = document.getElementById('totalCurhats');
const totalPublicCurhats = document.getElementById('totalPublicCurhats');
const curhatModal = document.getElementById('curhatModal');
const closeModal = document.querySelector('.close-modal');
const modalTitle = document.getElementById('modalTitle');
const modalText = document.getElementById('modalText');
const modalDate = document.getElementById('modalDate');
const modalMood = document.getElementById('modalMood');
const deleteBtn = document.getElementById('deleteBtn');

// Variabel untuk menyimpan curhatan yang sedang dilihat di modal
let currentCurhatId = null;
let isPublicCurhat = false;

// Inisialisasi hujan di background
function initRain() {
    const rainContainer = document.querySelector('.rain-background');
    const rainCount = 80;
    
    for (let i = 0; i < rainCount; i++) {
        const drop = document.createElement('div');
        drop.classList.add('rain-drop');
        
        // Posisi acak
        const left = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = 1 + Math.random() * 2;
        
        drop.style.left = `${left}%`;
        drop.style.animationDelay = `${delay}s`;
        drop.style.animationDuration = `${duration}s`;
        
        // Tinggi acak
        const height = 30 + Math.random() * 50;
        drop.style.height = `${height}px`;
        
        // Opasitas acak
        const opacity = 0.3 + Math.random() * 0.5;
        drop.style.opacity = opacity;
        
        rainContainer.appendChild(drop);
    }
}

// Format tanggal
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('id-ID', options);
}

// Simpan data ke localStorage
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    localStorage.setItem(PUBLIC_STORAGE_KEY, JSON.stringify(publicData));
    updateStats();
}

// Update statistik
function updateStats() {
    totalCurhats.textContent = appData.curhats.length;
    totalPublicCurhats.textContent = publicData.publicCurhats.length;
}

// Ambil ikon mood berdasarkan nilai
function getMoodIcon(moodValue) {
    const moodIcons = {
        sad: '😢',
        heartbroken: '💔',
        lonely: '🌌',
        anxious: '😰',
        disappointed: '😞',
        tired: '😴',
        confused: '😕'
    };
    
    return moodIcons[moodValue] || '😢';
}

// Ambil label mood berdasarkan nilai
function getMoodLabel(moodValue) {
    const moodLabels = {
        sad: 'Sedih',
        heartbroken: 'Patah Hati',
        lonely: 'Kesepian',
        anxious: 'Cemas',
        disappointed: 'Kecewa',
        tired: 'Lelah',
        confused: 'Bingung'
    };
    
    return moodLabels[moodValue] || 'Sedih';
}

// Tampilkan curhatan pribadi
function renderMyCurhats() {
    if (appData.curhats.length === 0) {
        emptyMyCurhats.style.display = 'block';
        myCurhatsList.style.display = 'none';
        return;
    }
    
    emptyMyCurhats.style.display = 'none';
    myCurhatsList.style.display = 'grid';
    myCurhatsList.innerHTML = '';
    
    // Urutkan berdasarkan tanggal (terbaru dulu)
    const sortedCurhats = [...appData.curhats].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedCurhats.forEach(curhat => {
        const curhatElement = document.createElement('div');
        curhatElement.className = 'curhat-item personal';
        curhatElement.dataset.id = curhat.id;
        
        // Potong teks jika terlalu panjang
        const shortText = curhat.text.length > 150 
            ? curhat.text.substring(0, 150) + '...' 
            : curhat.text;
        
        curhatElement.innerHTML = `
            <div class="curhat-content">${shortText}</div>
            <div class="curhat-footer">
                <div class="mood-badge">
                    ${getMoodIcon(curhat.mood)} ${getMoodLabel(curhat.mood)}
                </div>
                <div class="curhat-date">${formatDate(curhat.date)}</div>
            </div>
        `;
        
        // Klik untuk melihat detail
        curhatElement.addEventListener('click', () => openCurhatModal(curhat.id, false));
        
        myCurhatsList.appendChild(curhatElement);
    });
}

// Tampilkan curhatan publik
function renderPublicCurhats() {
    const selectedMood = moodFilter.value;
    let filteredCurhats = publicData.publicCurhats;
    
    // Filter berdasarkan mood jika dipilih
    if (selectedMood !== 'all') {
        filteredCurhats = publicData.publicCurhats.filter(curhat => curhat.mood === selectedMood);
    }
    
    if (filteredCurhats.length === 0) {
        emptyPublicCurhats.style.display = 'block';
        publicCurhatsList.style.display = 'none';
        return;
    }
    
    emptyPublicCurhats.style.display = 'none';
    publicCurhatsList.style.display = 'grid';
    publicCurhatsList.innerHTML = '';
    
    // Urutkan berdasarkan tanggal (terbaru dulu)
    const sortedCurhats = [...filteredCurhats].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedCurhats.forEach(curhat => {
        const curhatElement = document.createElement('div');
        curhatElement.className = 'curhat-item';
        curhatElement.dataset.id = curhat.id;
        
        // Potong teks jika terlalu panjang
        const shortText = curhat.text.length > 150 
            ? curhat.text.substring(0, 150) + '...' 
            : curhat.text;
        
        curhatElement.innerHTML = `
            <div class="curhat-content">${shortText}</div>
            <div class="curhat-footer">
                <div class="mood-badge">
                    ${getMoodIcon(curhat.mood)} ${getMoodLabel(curhat.mood)}
                </div>
                <div class="curhat-date">${formatDate(curhat.date)}</div>
            </div>
        `;
        
        // Klik untuk melihat detail
        curhatElement.addEventListener('click', () => openCurhatModal(curhat.id, true));
        
        publicCurhatsList.appendChild(curhatElement);
    });
}

// Buka modal untuk melihat detail curhatan
function openCurhatModal(id, isPublic) {
    let curhat;
    
    if (isPublic) {
        curhat = publicData.publicCurhats.find(c => c.id === id);
        isPublicCurhat = true;
        deleteBtn.style.display = 'none'; // Tidak bisa menghapus curhatan publik orang lain
    } else {
        curhat = appData.curhats.find(c => c.id === id);
        isPublicCurhat = false;
        deleteBtn.style.display = 'block';
    }
    
    if (!curhat) return;
    
    currentCurhatId = id;
    
    // Isi modal dengan data curhatan
    modalTitle.textContent = isPublic ? 'Curhatan dari Pengunjung Lain' : 'Curhatanmu';
    modalText.textContent = curhat.text;
    modalDate.textContent = formatDate(curhat.date);
    modalMood.innerHTML = `${getMoodIcon(curhat.mood)} ${getMoodLabel(curhat.mood)}`;
    
    // Tampilkan modal
    curhatModal.style.display = 'flex';
}

// Tutup modal
function closeCurhatModal() {
    curhatModal.style.display = 'none';
    currentCurhatId = null;
}

// Hapus curhatan
function deleteCurhat() {
    if (!currentCurhatId || isPublicCurhat) return;
    
    // Hapus dari data pribadi
    appData.curhats = appData.curhats.filter(curhat => curhat.id !== currentCurhatId);
    
    // Simpan dan render ulang
    saveData();
    renderMyCurhats();
    closeCurhatModal();
    
    // Tampilkan notifikasi
    showNotification('Curhatan berhasil dihapus', 'info');
}

// Tambah curhatan baru
function addCurhat() {
    const text = curhatInput.value.trim();
    const mood = moodSelect.value;
    
    // Validasi
    if (text.length < 5) {
        showNotification('Curhatan terlalu pendek. Minimal 5 karakter.', 'error');
        return;
    }
    
    if (text.length > 1000) {
        showNotification('Curhatan terlalu panjang. Maksimal 1000 karakter.', 'error');
        return;
    }
    
    // Buat ID unik
    const id = Date.now().toString();
    const date = new Date().toISOString();
    
    // Buat objek curhatan
    const newCurhat = {
        id,
        text,
        mood,
        date
    };
    
    // Tambahkan ke data pribadi
    appData.curhats.push(newCurhat);
    
    // Tambahkan ke data publik (secara anonim)
    const publicCurhat = { ...newCurhat };
    publicData.publicCurhats.push(publicCurhat);
    
    // Simpan data
    saveData();
    
    // Reset form
    curhatInput.value = '';
    charCount.textContent = '0';
    
    // Render ulang daftar curhatan
    renderMyCurhats();
    renderPublicCurhats();
    
    // Tampilkan notifikasi
    showNotification('Curhatan berhasil dikirim. Terima kasih telah berbagi.', 'success');
}

// Tampilkan notifikasi
function showNotification(message, type) {
    // Hapus notifikasi sebelumnya jika ada
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Buat elemen notifikasi
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Tambahkan ke body
    document.body.appendChild(notification);
    
    // Tampilkan dengan animasi
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hilangkan setelah 3 detik
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Buat styling untuk notifikasi
function initNotificationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(150%);
            transition: transform 0.3s ease-out;
            max-width: 350px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification.success {
            background-color: #2d6a4f;
            border-left: 4px solid #52b788;
        }
        
        .notification.error {
            background-color: #9d2e2e;
            border-left: 4px solid #e5383b;
        }
        
        .notification.info {
            background-color: #1b4965;
            border-left: 4px solid #5fa8d3;
        }
    `;
    document.head.appendChild(style);
}

// Inisialisasi aplikasi
function initApp() {
    // Inisialisasi hujan
    initRain();
    
    // Inisialisasi notifikasi
    initNotificationStyles();
    
    // Render data awal
    renderMyCurhats();
    renderPublicCurhats();
    updateStats();
    
    // Event listener untuk input curhat
    curhatInput.addEventListener('input', function() {
        charCount.textContent = this.value.length;
        
        // Ubah warna jika mendekati batas
        if (this.value.length > 900) {
            charCount.style.color = '#ff6b6b';
        } else if (this.value.length > 700) {
            charCount.style.color = '#ffd166';
        } else {
            charCount.style.color = '#a3b5cc';
        }
    });
    
    // Event listener untuk tombol submit
    submitBtn.addEventListener('click', addCurhat);
    
    // Submit dengan Enter (Ctrl+Enter atau Cmd+Enter)
    curhatInput.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            addCurhat();
        }
    });
    
    // Event listener untuk filter mood
    moodFilter.addEventListener('change', renderPublicCurhats);
    
    // Event listener untuk modal
    closeModal.addEventListener('click', closeCurhatModal);
    deleteBtn.addEventListener('click', deleteCurhat);
    
    // Tutup modal dengan klik di luar konten
    window.addEventListener('click', function(e) {
        if (e.target === curhatModal) {
            closeCurhatModal();
        }
    });
    
    // Tutup modal dengan tombol Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && curhatModal.style.display === 'flex') {
            closeCurhatModal();
        }
    });
    
    // Tampilkan pesan selamat datang
    setTimeout(() => {
        if (appData.curhats.length === 0 && publicData.publicCurhats.length === 0) {
            showNotification('Selamat datang di Curhat Bersama. Mulailah berbagi perasaanmu.', 'info');
        }
    }, 1000);
}

// Jalankan aplikasi ketika halaman selesai dimuat
document.addEventListener('DOMContentLoaded', initApp);