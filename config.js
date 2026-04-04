// ==========================================
// PENGATURAN DATABASE & SISTEM UTAMA
// ==========================================

// 1. URL MESIN UTAMA (GOOGLE APPS SCRIPT)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyW4nRHnI57knObTbQUXvu2ckV-eQEAxAt6XR3HIjlw7iBFZWf9aGIv-HjrlFFysMrW/exec";
window.SCRIPT_URL = SCRIPT_URL; // Back-up untuk dibaca oleh frontend HTML

// 2. ID SPREADSHEET MASTER (WAJIB UNTUK CLOUDFLARE WORKER CMS)
// (Silakan ganti tulisan di bawah dengan ID Spreadsheet bos yang asli)
const SHEET_ID = "1ZVw_4h0lsh6hs3naNn_HSuJJ0Ghw3O7Ki72ojeamaD0";
window.SHEET_ID = SHEET_ID;


// ==========================================
// 🎯 RADAR AFFILIATE GLOBAL (AUTO RECORD)
// ==========================================
(function() {
    // 1. Cek apakah ada parameter "?ref=" di ujung URL saat ini
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');

    // 2. Jika ada, simpan ke memori browser (LocalStorage)
    if (refCode && refCode.trim() !== "") {
        localStorage.setItem('melimpah_affiliate', refCode.trim());
        console.log("✅ Affiliate Tracker Saved:", refCode.trim());
    }
})();
