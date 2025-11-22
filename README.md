# NIZAMY - Islamic Apps Suite

![Nizamy Banner](public/images/android-chrome-192x192.png)

**NIZAMY** adalah *Progressive Web Application* (PWA) komprehensif yang menyediakan solusi digital untuk kebutuhan ibadah umat Islam, meliputi perhitungan waris (Faraidh), kalkulator Zakat, dan pelacak hafalan Al-Quran berbasis metode *Spaced Repetition System* (SRS).

Aplikasi ini dibangun dengan prinsip **Local-First** dan **Privacy-Focused**, di mana seluruh pemrosesan data dan perhitungan dilakukan di sisi klien (browser) tanpa mengirim data sensitif ke server eksternal.

---

## 📋 Daftar Isi
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Audit Kode & Arsitektur](#-audit-kode--arsitektur)
- [Struktur Proyek](#-struktur-proyek)
- [Algoritma Inti](#-algoritma-inti)
- [Instalasi & Pengembangan](#-instalasi--pengembangan)

---

## 🌟 Fitur Utama

### 1. Kalkulator Waris (Faraidh)
- **Sesuai Syariat:** Mengimplementasikan aturan hijab (penghalang), 'Aul (pembilang > penyebut), dan Radd (pembilang < penyebut).
- **Kasus Khusus:** Menangani kasus kompleks seperti *Umariyyatain*, *Al-Musytarakah*, dan *Al-Akdariyyah*.
- **Visualisasi:** Grafik distribusi harta dan rincian dalil per ahli waris.
- **Export:** Cetak laporan pembagian waris ke PDF.

### 2. Kalkulator Zakat
- **Multi-Jenis:** Zakat Fitrah, Maal, Emas/Perak, Perniagaan, Pertanian, Peternakan, dan Rikaz.
- **Real-time Calculation:** Perhitungan otomatis berdasarkan input dan *settings* harga emas/beras terkini.
- **Kwitansi:** Pembuatan bukti hitung zakat digital.

### 3. Hafalan Quran Tracker (SRS)
- **Metode SRS:** Algoritma pengulangan berjarak (*Spaced Repetition*) untuk menjaga hafalan jangka panjang (Mutqin).
- **Gamifikasi:** Sistem Level, XP, Streak, dan Badges untuk motivasi.
- **Audio:** Integrasi audio Qori (via *EveryAyah API*) untuk pengecekan tajwid.
- **Multi-User:** Mendukung banyak profil pengguna dalam satu perangkat.

### 4. Utilitas Tambahan
- **Jadwal Sholat:** Integrasi API Aladhan dengan deteksi lokasi otomatis.
- **Mode Gelap:** Dukungan *Dark Mode* penuh.
- **PWA:** Dapat diinstal di Android & iOS, berjalan offline.

---

## 🛠 Tech Stack

- **Core:** React 18 (TypeScript)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** React Context API + `useReducer` + Custom Hooks
- **Persistence:** `localStorage` (via `useLocalStorage` hook)
- **Visualisasi:** Recharts
- **PDF Generation:** `jspdf` & `html2canvas`
- **Audio:** Web Audio API (Synthesizer) + HTML5 Audio
- **Icons:** React Icons

---

## 🔍 Audit Kode & Arsitektur

### Kekuatan (Strengths)
1.  **Separation of Concerns (SoC):** Logika bisnis yang berat dipisahkan dengan sangat baik ke dalam folder `services/` (contoh: `faraidh.service.ts`, `zakat.service.ts`). Komponen UI hanya berfokus pada rendering.
2.  **Type Safety:** Penggunaan TypeScript yang ketat (banyak interface dan type definitions di `types/`) mengurangi potensi *runtime errors*.
3.  **Performance:**
    - Penggunaan `React.lazy` dan `Suspense` untuk *code splitting* per modul (Faraidh, Zakat, Hafalan).
    - PWA Service Worker (`sw.js`) dengan strategi *caching* yang agresif untuk aset statis dan API Quran.
    - Penggunaan `React.memo` dan `useMemo` untuk mencegah re-render yang tidak perlu pada kalkulasi berat.
4.  **Offline-First:** Seluruh data disimpan di `localStorage`. Service worker menangani aset agar aplikasi tetap bisa dibuka tanpa internet.
5.  **Clean UI/UX:** Implementasi Tailwind CSS yang konsisten dengan *glassmorphism* dan transisi yang halus.

### Area Optimasi (Improvements)
1.  **Routing:** Saat ini menggunakan *State-based Routing* manual (`window.history`). Untuk skalabilitas jangka panjang, migrasi ke `react-router-dom` disarankan untuk manajemen URL dan *deep linking* yang lebih robust.
2.  **Storage Limit:** Ketergantungan pada `localStorage` (max ~5-10MB) aman untuk teks, namun jika fitur berkembang (misal: simpan rekaman suara user), perlu migrasi ke `IndexedDB`.
3.  **Testing:** Logika Faraidh sangat kompleks. Disarankan menambahkan *Unit Testing* (Vitest/Jest) khusus untuk `faraidh.service.ts` guna memastikan akurasi perhitungan syariah.

---

## 📂 Struktur Proyek

```text
/
├── components/          # Komponen UI (Atomic design)
│   ├── faraidh/         # Komponen spesifik modul Waris
│   ├── zakat/           # Komponen spesifik modul Zakat
│   ├── hafalan/         # Komponen spesifik modul Hafalan
│   ├── ui/              # Komponen generik (Toast, Modal, dll)
│   └── ...
├── services/            # Logika Bisnis Murni (Tanpa UI)
│   ├── faraidh.service.ts
│   ├── zakat.service.ts
│   ├── hafalan.service.ts
│   ├── audio.service.ts
│   └── ...
├── hooks/               # Custom React Hooks (Logic Reuse)
├── types/               # Definisi TypeScript
├── reducers/            # State logic untuk useReducer
├── constants.ts         # Data statis (Ayat, Aturan, Config)
├── App.tsx              # Entry point & Routing logic
├── index.tsx            # Mounting point
└── sw.js                # Service Worker (PWA Cache)
```

---

## 🧠 Algoritma Inti

### Faraidh Engine (`faraidh.service.ts`)
1.  **Hajb Detection:** Mendeteksi ahli waris yang terhalang (mahjub) oleh ahli waris lain (misal: Cucu terhalang Anak Laki-laki).
2.  **Share Calculation:** Menghitung bagian pasti (*Furudh*) masing-masing ahli waris.
3.  **Ashabah Handling:** Mendistribusikan sisa harta kepada ahli waris *Ashabah*.
4.  **Correction:**
    - **'Aul:** Jika total bagian > 1, penyebut dinaikkan (bagian mengecil).
    - **Radd:** Jika total bagian < 1 & tidak ada Ashabah, sisa dikembalikan proporsional.

### Hafalan SRS (`hafalan.service.ts`)
Menggunakan interval pengulangan eksponensial:
- **Stage 0:** Baru
- **Stage 1:** 1 hari
- **Stage 2:** 3 hari
- **Stage 3:** 7 hari
- **Stage 4:** 14 hari
- **Stage 5:** 30 hari (Mutqin)

---

## 🚀 Instalasi & Pengembangan

Karena proyek ini menggunakan ES Modules dan Vite, langkah standarnya:

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Run Development Server**
    ```bash
    npm run dev
    ```

3.  **Build for Production**
    ```bash
    npm run build
    ```

**Catatan:** Aplikasi ini tidak memerlukan backend server. Seluruh logika berjalan di browser.

---

*Dibuat dengan ❤️ oleh si Pengembang NIZAMY*
