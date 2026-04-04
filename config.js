// ==========================================
// PENGATURAN DATABASE & SISTEM UTAMA
// ==========================================

// 1. URL MESIN UTAMA (GOOGLE APPS SCRIPT)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzsPe6bTlcpd5IiCN7UUM0z0bdFFF3HKQfrzTyB7qE1R3_Kfg9-d9AZKim_zp0LPhMo/exec";
window.SCRIPT_URL = SCRIPT_URL; // Back-up untuk dibaca oleh frontend HTML

// 2. ID SPREADSHEET MASTER (WAJIB UNTUK CLOUDFLARE WORKER CMS)
// (Silakan ganti tulisan di bawah dengan ID Spreadsheet bos yang asli)
const SHEET_ID = "1A-yZScOWktfMzLjFR2e7BD0s2dpM21vNjRsATBEACtM";
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
