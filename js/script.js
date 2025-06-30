/**
 * FILE: script.js
 * FUNGSI UTAMA UNTUK E-LEARNING UNPAM
 * Mencakup: Mode Disabilitas, Navigasi, dan Fitur Aksesibilitas
 */

// ==================== FUNGSI UTAMA ====================

/**
 * Inisialisasi semua fungsi saat dokumen siap
 */
document.addEventListener('DOMContentLoaded', function() {
    initAccessibilityMode();
    initNavigation();
    initCalendar();
    initAnnouncements();
    initCourses();
    
    // Jika di halaman dashboard, inisialisasi fitur khusus
    if(document.querySelector('.dashboard-main')) {
        initDashboardFeatures();
    }
});

// ==================== MODE DISABILITAS ====================

/**
 * Menginisialisasi mode aksesibilitas
 */
function initAccessibilityMode() {
    const toggleBtn = document.getElementById('accessibilityToggle');
    
    // Buat tombol toggle jika belum ada
    if (!toggleBtn) {
        const header = document.querySelector('header');
        if (header) {
            const newToggleBtn = document.createElement('button');
            newToggleBtn.id = 'accessibilityToggle';
            newToggleBtn.className = 'btn btn-sm btn-outline-light';
            newToggleBtn.innerHTML = '<i class="fas fa-universal-access"></i> Mode Disabilitas';
            header.querySelector('.container .row').appendChild(newToggleBtn);
        }
    }
    
    // Cek preferensi yang disimpan
    if(localStorage.getItem('accessibilityMode')) {
        enableAccessibilityMode();
    }
    
    // Event listener untuk tombol toggle
    document.getElementById('accessibilityToggle')?.addEventListener('click', toggleAccessibilityMode);
    
    // Keyboard shortcut (Ctrl+A)
    document.addEventListener('keydown', function(e) {
        if(e.key === 'a' && e.ctrlKey) {
            toggleAccessibilityMode();
        }
    });
}

/**
 * Mengaktifkan/menonaktifkan mode aksesibilitas
 */
function toggleAccessibilityMode() {
    if(document.body.classList.contains('accessibility-mode')) {
        disableAccessibilityMode();
    } else {
        enableAccessibilityMode();
    }
}

/**
 * Mengaktifkan mode aksesibilitas
 */
function enableAccessibilityMode() {
    document.body.classList.add('accessibility-mode');
    localStorage.setItem('accessibilityMode', 'enabled');
    
    const toggleBtn = document.getElementById('accessibilityToggle');
    if (toggleBtn) {
        toggleBtn.innerHTML = '<i class="fas fa-universal-access"></i> Mode Normal';
        toggleBtn.classList.remove('btn-outline-light');
        toggleBtn.classList.add('btn-warning');
    }
    
    speak("Mode disabilitas diaktifkan");
    setupAccessibilityFeatures();
}

/**
 * Menonaktifkan mode aksesibilitas
 */
function disableAccessibilityMode() {
    document.body.classList.remove('accessibility-mode');
    localStorage.removeItem('accessibilityMode');
    
    const toggleBtn = document.getElementById('accessibilityToggle');
    if (toggleBtn) {
        toggleBtn.innerHTML = '<i class="fas fa-universal-access"></i> Mode Disabilitas';
        toggleBtn.classList.remove('btn-warning');
        toggleBtn.classList.add('btn-outline-light');
    }
    
    speak("Mode disabilitas dinonaktifkan");
}

/**
 * Menyiapkan fitur aksesibilitas tambahan
 */
function setupAccessibilityFeatures() {
    // Focus styles
    document.addEventListener('focus', function(e) {
        if (e.target.tagName !== 'BODY') {
            e.target.style.outline = '3px solid var(--secondary-color)';
            e.target.style.borderRadius = '4px';
        }
    }, true);

    document.addEventListener('blur', function(e) {
        e.target.style.outline = '';
    }, true);
    
    // Skip to content link
    if (!document.getElementById('skip-link')) {
        const skipLink = document.createElement('a');
        skipLink.id = 'skip-link';
        skipLink.href = '#main-content';
        skipLink.className = 'skip-to-content';
        skipLink.textContent = 'Langsung ke konten utama';
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Style untuk skip link
        const style = document.createElement('style');
        style.textContent = `
            .skip-to-content {
                position: absolute;
                top: -40px;
                left: 0;
                background: var(--secondary-color);
                color: white;
                padding: 8px;
                z-index: 100;
                transition: top 0.3s;
            }
            .skip-to-content:focus {
                top: 0;
            }
        `;
        document.head.appendChild(style);
    }
}

// ==================== TEXT-TO-SPEECH ====================

/**
 * Fungsi text-to-speech
 * @param {string} text - Teks yang akan dibacakan
 */
function speak(text) {
    if ('speechSynthesis' in window) {
        // Hentikan pembacaan sebelumnya
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        
        // Atur suara preferensi jika ada
        const voices = window.speechSynthesis.getVoices();
        const indonesianVoice = voices.find(voice => 
            voice.lang.includes('id') || voice.lang.includes('ID')
        );
        
        if (indonesianVoice) {
            utterance.voice = indonesianVoice;
        }
        
        window.speechSynthesis.speak(utterance);
    }
}

// ==================== NAVIGASI ====================

/**
 * Inisialisasi navigasi
 */
function initNavigation() {
    // Navigasi utama
    document.querySelectorAll('[data-navigate]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-navigate');
            navigateTo(page);
        });
    });
    
    // Tombol kembali
    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', function() {
            window.history.back();
        });
    });
}

/**
 * Navigasi ke halaman tertentu
 * @param {string} page - Nama halaman tujuan
 */
function navigateTo(page) {
    if (document.body.classList.contains('accessibility-mode')) {
        speak(`Menuju ke halaman ${page}`);
        setTimeout(() => {
            window.location.href = `${page}.html`;
        }, 1000);
    } else {
        window.location.href = `${page}.html`;
    }
}

// ==================== FITUR DASHBOARD ====================

/**
 * Inisialisasi fitur dashboard
 */
function initDashboardFeatures() {
    // Timeline actions
    document.querySelector('.btn-filter-timeline')?.addEventListener('click', function() {
        filterTimeline('7days');
    });
    
    document.querySelector('.btn-sort-timeline')?.addEventListener('click', sortTimeline);
    document.querySelector('.btn-search-timeline')?.addEventListener('click', searchTimeline);
    
    // Inisialisasi kalender mini
    initMiniCalendar();
}

function filterTimeline(filter) {
    console.log(`Filter timeline: ${filter}`);
    speak(`Menampilkan aktivitas ${filter}`);
}

function sortTimeline() {
    console.log('Mengurutkan timeline');
    speak('Timeline diurutkan berdasarkan tanggal');
}

function searchTimeline() {
    const query = prompt('Masukkan pencarian:');
    if (query) {
        console.log(`Mencari: ${query}`);
        speak(`Mencari ${query}`);
    }
}

// ==================== KALENDER ====================

/**
 * Inisialisasi kalender
 */
function initCalendar() {
    if (!document.querySelector('.calendar-container')) return;
    
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
                      "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    
    let currentDate = new Date();
    
    // Render kalender
    renderCalendar(currentDate);
    
    // Navigasi bulan
    document.querySelector('.btn-prev-month')?.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });
    
    document.querySelector('.btn-next-month')?.addEventListener('click', function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });
    
    // Event listener untuk hari kalender
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('calendar-day') && !e.target.classList.contains('disabled')) {
            const day = e.target.textContent.trim();
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            console.log(`Tanggal dipilih: ${day}/${month}/${year}`);
            speak(`Tanggal ${day} ${monthNames[month-1]} ${year}`);
        }
    });
}

function renderCalendar(date) {
    // Implementasi render kalender
    // ... (sama seperti kode sebelumnya)
}

// ==================== PENGUMUMAN ====================

function initAnnouncements() {
    if (!document.querySelector('.announcement-list')) return;
    
    // Filter pengumuman
    document.querySelectorAll('.btn-announcement-filter').forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            filterAnnouncements(filter);
        });
    });
    
    // Tandai sudah dibaca
    document.querySelectorAll('.btn-mark-read').forEach(btn => {
        btn.addEventListener('click', function() {
            const announcement = this.closest('.announcement-card');
            announcement.classList.add('read');
            this.textContent = '✓ Sudah Dibaca';
            speak('Pengumuman ditandai sudah dibaca');
        });
    });
}

function filterAnnouncements(filter) {
    console.log(`Filter pengumuman: ${filter}`);
    speak(`Menampilkan pengumuman ${filter}`);
}

// ==================== MATA KULIAH ====================

function initCourses() {
    if (!document.querySelector('.course-list')) return;
    
    // Navigasi ke materi
    document.querySelectorAll('.btn-view-material').forEach(btn => {
        btn.addEventListener('click', function() {
            const course = this.getAttribute('data-course');
            viewCourseMaterial(course);
        });
    });
}

function viewCourseMaterial(course) {
    console.log(`Membuka materi: ${course}`);
    speak(`Membuka materi ${course}`);
}

// ==================== FUNGSI BANTU ====================

/**
 * Memeriksa apakah mode disabilitas aktif
 * @returns {boolean}
 */
function isAccessibilityModeEnabled() {
    return document.body.classList.contains('accessibility-mode');
}

/**
 * Memuat konten secara dinamis
 * @param {string} url - URL konten yang akan dimuat
 * @param {string} target - ID elemen target
 */
function loadContent(url, target) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            document.getElementById(target).innerHTML = data;
            if (isAccessibilityModeEnabled()) {
                speak(`Konten ${url} telah dimuat`);
            }
        })
        .catch(error => {
            console.error('Error loading content:', error);
            if (isAccessibilityModeEnabled()) {
                speak('Gagal memuat konten');
            }
        });
}

// ==================== INISIALISASI TAMBAHAN ====================

// Pastikan suara tersedia untuk text-to-speech
if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = function() {
        // Siapkan suara yang tersedia
    };
}