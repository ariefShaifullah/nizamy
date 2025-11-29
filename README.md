# NIZAMY - Islamic Apps Suite

![Nizamy Banner](public/images/favicon-32x32.png)

**NIZAMY** adalah *Progressive Web Application* (PWA) komprehensif yang menyediakan ekosistem alat bantu ibadah digital. Aplikasi ini dirancang dengan prinsip **Local-First** dan **Privacy-Focused**, di mana seluruh data sensitif (keuangan, hafalan, diagnosa) disimpan dan diproses secara lokal di perangkat pengguna tanpa server *backend* terpusat.

---

## 📋 Daftar Isi
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Arsitektur Proyek](#-arsitektur-proyek)
- [Algoritma Inti](#-algoritma-inti)
- [Instalasi & Pengembangan](#-instalasi--pengembangan)

---

## 🌟 Fitur Utama

### 1. 🔍 H.E.D.E (Halal Economic Diagnostic Engine)
*Fitur Baru!*
- **Self-Assessment:** Diagnosa kesehatan ekonomi syariah pribadi (Pekerjaan, Bisnis, Keuangan, Digital).
- **Risk Scoring:** Mendeteksi potensi Riba, Gharar, Maysir, dan Zulm dengan skor kepatuhan 0-100.
- **Roadmap Hijrah:** Memberikan langkah taktis (Jangka Pendek/Menengah/Panjang) berdasarkan tingkat risiko dan kondisi darurat (Fiqh Tadarruj vs Bara'ah).
- **Toolkit:** Unduh template akad syariah (Qardh, Mudharabah, dll) dan panduan Tathhir.

### 2. 📖 Mushaf Al-Quran Digital
*Fitur Baru!*
- **Virtual Scroll:** Rendering performa tinggi untuk 6000+ ayat menggunakan `react-virtuoso`.
- **Analisis Tajwid:** Pewarnaan hukum tajwid otomatis (Ikhfa, Idgham, Mad, dll) berbasis analisis teks regex.
- **Bedah Kata:** Klik per kata untuk melihat arti, transliterasi, dan bedah makhraj huruf.
- **Audio Player:** Murottal per ayat atau per kata (Word-by-Word) dengan fitur *sticky player*.

### 3. ⚖️ Kalkulator Waris (Faraidh)
- **Engine Fiqh:** Mengimplementasikan aturan *Hajb* (penghalang), *'Aul*, dan *Radd*.
- **Kasus Kompleks:** Menangani kasus khusus seperti *Umariyyatain*, *Musytarakah*, dan *Akdariyyah*.
- **Visualisasi:** Grafik distribusi harta dan rincian dalil per ahli waris.
- **Export PDF:** Cetak laporan hasil pembagian waris yang rapi.

### 4. 💰 Kalkulator Zakat
- **Multi-Aset:** Zakat Fitrah, Maal, Emas/Perak, Perniagaan, Pertanian, Peternakan, dan Rikaz.
- **Fitur Nisab:** Visualisasi progress bar pencapaian nisab secara *real-time*.
- **Kwitansi Digital:** Generate bukti hitung zakat dalam format PDF.

### 5. 🧠 Hafalan Quran Tracker (SRS)
- **Spaced Repetition System:** Algoritma pengulangan berjarak otomatis untuk menjaga hafalan (Mutqin).
- **Gamifikasi:** Sistem Level, XP, Streak, Badges, dan Weekly Challenge.
- **Multi-Profile:** Mendukung banyak pengguna dalam satu perangkat (misal: Ayah, Ibu, Anak).

---

## 🛠 Tech Stack

- **Core:** React 18 (TypeScript), Vite
- **State Management:** React Context + `useReducer`
- **Persistence:** IndexedDB (`idb-keyval`) untuk data berat & `localStorage` untuk preferensi.
- **UI Framework:** Tailwind CSS (Dark Mode supported)
- **Visualization:** Recharts (Grafik HEDE & Waris)
- **Virtualization:** React Virtuoso (Mushaf List)
- **PDF Generation:** `jspdf` & `html2canvas`
- **PWA:** Service Worker, Manifest, Offline Capability

---

## 📂 Arsitektur Proyek

Proyek ini menggunakan struktur **Feature-Based** (Feature Sliced) untuk skalabilitas:

```text
/
├── components/          # Komponen UI Generik (Button, Modal, Toast)
├── features/            # Modul Fungsional Utama
│   ├── faraidh/         # Logika & UI Waris
│   ├── zakat/           # Logika & UI Zakat
│   ├── hafalan/         # Logic SRS, Gamification, Dashboard
│   ├── mushaf/          # Reader, Audio, Tajwid Engine
│   ├── hede/            # Logic Diagnosa, Scoring, Report
│   └── settings/        # Backup/Restore, Global Config
├── services/            # Service Singleton (Audio, DB, PDF, Notification)
├── hooks/               # Custom Hooks (usePWA, useWakeLock, useLocalStorage)
├── context/             # Global Context (Theme, Toast)
└── types/               # Definisi TypeScript Global
```

---

## 🧠 Algoritma Inti

### 1. HEDE Risk Engine (`hede.service.ts`)
- Menghitung skor risiko tertimbang dari jawaban user.
- Menerapkan logika *Dependency* (pertanyaan muncul bersyarat).
- **Poison Logic:** Jika terdeteksi pelanggaran berat (misal: Riba), skor total dibatasi maksimal 40 (Kritis), meskipun aspek lain aman. Ini sesuai kaidah bahwa "kerusakan menghilangkan keberkahan".

### 2. Tajwid Analysis Engine (`tajwid.helper.ts`)
- Menggunakan Regex kompleks untuk mendeteksi pola huruf hijaiyah dan harakat.
- Mengidentifikasi hukum tajwid (Nun Mati, Mim Mati, Mad, Qalqalah, dll) secara *client-side*.
- Menangani kasus *Gharib* (bacaan khusus) berdasarkan lokasi surat/ayat.

### 3. Hafalan SRS Logic (`hafalan.service.ts`)
- Menjadwalkan review ulang berdasarkan interval eksponensial: 1, 3, 7, 14, 30 hari.
- Menghitung beban harian (*Daily Load*) berdasarkan bobot ayat (panjang/pendek).

---

## 🚀 Instalasi & Pengembangan

1.  **Clone Repository**
    ```bash
    git clone https://github.com/username/nizamy.git
    cd nizamy
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

4.  **Build for Production**
    ```bash
    npm run build
    ```

---

*Dibuat dengan ❤️ oleh Si Pengembang NIZAMY*
