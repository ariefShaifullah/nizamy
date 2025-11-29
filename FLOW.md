# Application Logic Flow (NIZAMY)

Dokumen ini menjelaskan alur data dan logika bisnis dari setiap modul dalam aplikasi NIZAMY.

---

## 1. Global Architecture Flow

```mermaid
graph TD
    UserNode["User / Browser"] -->|Load App| SWNode["Service Worker"]
    SWNode -->|Cache First| CacheNode["Cache Storage"]
    SWNode -->|Network First| API_Node["External APIs"]

    subgraph External_APIs
        AlquranNode["Al-Quran Cloud API"]
        AudioNode["EveryAyah Audio CDN"]
        PrayerNode["Aladhan Prayer API"]
    end

    subgraph Client_Side_React
        RouterNode["App.tsx - React Router"]
        ContextNode["Global Contexts (Theme, Toast, Confirm)"]

        RouterNode --> HomeNode["Home"]
        RouterNode --> FaraidhNode["Modul Faraidh"]
        RouterNode --> ZakatNode["Modul Zakat"]
        RouterNode --> HafalanNode["Modul Hafalan"]
    end

    subgraph Persistence
        direction LR
        LSNode["LocalStorage (Sinkron)"]
        IDBNode["IndexedDB (Asinkron)"]
    end

    FaraidhNode --> LSNode
    ZakatNode --> LSNode
    HafalanNode --> IDBNode
    HafalanNode --> AlquranNode
    HafalanNode --> AudioNode
```
**Catatan Arsitektur:** Aplikasi menggunakan strategi penyimpanan *hybrid*. Data berat yang tidak memerlukan akses sinkron (seperti data Hafalan) disimpan di **IndexedDB** untuk skalabilitas. Data ringan yang dibutuhkan UI secara langsung saat render (seperti riwayat Zakat & Waris) disimpan di **LocalStorage**.

---

## 2. Faraidh Calculator Flow (Waris)

Alur perhitungan pembagian waris. Logika ini sangat ketat mengikuti aturan fiqh.

1.  **Input Data:** User memasukkan jumlah ahli waris yang ada & total harta.
2.  **Filtering (Hajb):** Sistem mengeliminasi ahli waris yang terhalang (_Mahjub_) oleh ahli waris lain yang lebih dekat.
    - _Contoh:_ Cucu laki-laki terhalang jika ada Anak laki-laki.
3.  **Penentuan Bagian (Furudh):** Memberikan nilai pecahan (1/2, 1/4, 1/8, dll) kepada _Ashabul Furudh_.
4.  **Kalkulasi KPK (Asal Masalah):** Mencari penyebut persekutuan terkecil dari semua pecahan.
5.  **Distribusi Sisa (Ashabah):** Jika ada sisa harta, diberikan ke ahli waris _Ashabah_.
6.  **Koreksi Kasus Khusus:**
    - **'Aul:** Total saham > Asal Masalah -> Naikkan Asal Masalah.
    - **Radd:** Total saham < Asal Masalah (Tanpa Ashabah) -> Kembalikan sisa ke Furudh.
7.  **Output:** Tampilkan hasil persentase, nilai nominal, dan dalil.

---

## 3. Zakat Calculator Flow

Alur kalkulasi multi-tab menggunakan `useReducer`.

1.  **Select Type:** User memilih Tab (Fitrah / Maal / Emas / Tani / dll).
2.  **Input & Settings:**
    - User input nilai aset.
    - User dapat mengubah asumsi harga emas/beras di "Settings".
3.  **Threshold Check (Nisab):**
    - Total Aset Bersih = (Aset - Hutang Jatuh Tempo).
    - Cek: `Total Aset >= Harga Emas 85g` (untuk Maal/Niaga).
4.  **Calculation:**
    - Jika `>= Nisab`: `Total * 2.5%`.
    - Jika `< Nisab`: 0 (Tidak wajib).
5.  **Aggregation:** Tab "Ringkasan" menjumlahkan seluruh zakat yang wajib dibayar.

---

## 4. Hafalan Quran Tracker Flow (SRS Logic)

Ini adalah modul paling kompleks dengan logika _state machine_.

### A. User Journey

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Dashboard
    participant SRS as SRS Logic
    participant DB as IndexedDB

    U->>UI: Tambah Hafalan Baru (Surat X: 1-5)
    UI->>SRS: Validate Quota (Cek beban harian)
    SRS->>DB: Simpan Item (Stage: 0)

    Note over U, DB: Hari Berikutnya...

    UI->>U: Notifikasi "Waktunya Murajaah"
    U->>UI: Buka Sesi Review
    UI->>U: Tampilkan Ayat (Hidden Audio)

    alt User Lupa / Salah
        U->>UI: Klik "Lupa / Salah"
        UI->>SRS: Reset to Stage 1
        SRS->>DB: Next Review = Besok (1 hari)
    else User Lancar
        U->>UI: Klik "Lancar"
        UI->>SRS: Increment Stage (Stage + 1)
        SRS->>DB: Next Review = Interval[Stage] (3/7/14/30 hari)
        SRS->>UI: Tambah XP & Cek Badges
    end
```

### B. Aturan Gamifikasi

1.  **XP Calculation:**
    - Item Baru: `10 XP * Bobot Ayat` (Ayat panjang bobotnya lebih besar).
    - Review Lancar: `5 XP * Bobot Ayat`.
    - Review Gagal: `1 XP * Bobot Ayat`.
2.  **Streak:** Reset ke 0 jika user tidak login/buka app > 24 jam dari tanggal terakhir.
3.  **Badges:** Diberikan saat kondisi tertentu terpenuhi (misal: 7 hari streak, hafal Juz 30).

---

## 5. Audio Service Flow

Untuk menghindari masalah performa dan _Auto-play policy_ browser.

1.  **Inisialisasi:** `AudioContext` dibuat dalam mode _Suspended_.
2.  **User Interaction:** Saat user klik tombol pertama kali, `AudioContext` di-_resume_.
3.  **Synthesizer (SFX):** Menggunakan Oscillator node untuk suara 'Ting' (Sukses) atau 'Buzz' (Gagal). Ringan, tanpa download file mp3.
4.  **Quran Player:** Menggunakan HTML5 `<audio>` standar yang mengambil sumber dari CDN `everyayah.com`.