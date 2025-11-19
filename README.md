# Nizamy - Kalkulator Islami

Nizamy adalah sebuah aplikasi web yang menyediakan kumpulan alat bantu kalkulator Islami, dirancang untuk membantu umat Muslim dalam menjalankan kewajiban finansial sesuai dengan syariat Al-Qur'an dan Sunnah. Aplikasi ini bersifat _privacy-first_, di mana semua perhitungan dilakukan sepenuhnya di sisi klien (browser Anda) dan tidak ada data yang dikirim atau disimpan di server.

## Fitur Utama

Aplikasi ini terdiri dari dua kalkulator utama:

### 1. Kalkulator Waris (Faraidh)

- **Perhitungan Akurat**: Menghitung pembagian harta warisan berdasarkan porsi yang telah ditetapkan dalam Al-Qur'an dan hadits.
- **Penanganan Kasus Kompleks**: Mendukung penyelesaian kasus 'Aul (peningkatan penyebut) dan Radd (pengembalian sisa harta).
- **Detail Ahli Waris**: Menyediakan daftar lengkap ahli waris beserta bagiannya masing-masing.
- **Dalil & Referensi**: Menampilkan dalil atau dasar hukum untuk setiap bagian waris.
- **Riwayat Perhitungan**: Menyimpan beberapa perhitungan terakhir untuk referensi di masa mendatang.

### 2. Kalkulator Zakat

- **Komprehensif**: Menghitung berbagai jenis zakat, termasuk:
  - Zakat Fitrah
  - Zakat Maal (harta simpanan, tunai, tabungan, investasi)
  - Zakat Emas dan Perak
  - Zakat Perniagaan
  - Zakat Pertanian
  - Zakat Peternakan (dengan pendekatan qiyas perniagaan)
- **Konfigurasi Fleksibel**: Pengguna dapat menyesuaikan parameter penting seperti harga emas (untuk nisab), harga perak, dan harga beras.
- **Status Nisab Jelas**: Memberikan indikator visual yang jelas apakah harta telah mencapai ambang batas (nisab) atau belum.
- **Unduh Kwitansi**: Menghasilkan ringkasan perhitungan zakat yang dapat diunduh dalam format PDF sebagai bukti atau catatan pribadi.

## Tampilan Aplikasi

_(Catatan: Gambar di bawah ini adalah representasi visual)_

**Halaman Utama**
![image](https://github.com/user-attachments/assets/b377f45b-723a-403a-811a-815845312345)

**Kalkulator Waris**
![image](https://github.com/user-attachments/assets/195624c2-819a-4111-810b-101234567890)

**Kalkulator Zakat**
![image](https://github.com/user-attachments/assets/98765432-1234-5678-90ab-cdef12345678)

## Teknologi yang Digunakan

- **Frontend**: React, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **PDF Generation**: jsPDF, html2canvas
- **State Management**: React Hooks (`useState`, `useReducer`)

## Struktur Proyek

```
/
├─── src/
│    ├─── components/      # Komponen UI (FaraidhCalculator, ZakatCalculator, dll.)
│    ├─── services/        # Logika bisnis inti (faraidh.service.ts, zakat.service.ts)
│    ├─── reducers/        # Fungsi reducer untuk state management (heirsReducer.ts)
│    ├─── constants.ts     # Konstanta aplikasi (misal: data FAQ)
│    ├─── types.ts         # Definisi tipe TypeScript
│    ├─── utils.ts         # Fungsi utilitas (format mata uang, dll.)
│    ├─── App.tsx          # Komponen utama dan routing aplikasi
│    └─── index.tsx        # Titik masuk aplikasi React
├─── package.json         # Dependensi dan skrip proyek
└─── README.md            # Dokumentasi ini
```

## Instalasi dan Menjalankan Secara Lokal

Untuk menjalankan proyek ini di lingkungan lokal Anda, ikuti langkah-langkah berikut:

**Prasyarat:**

- Node.js (versi 18 atau lebih baru)
- npm atau package manager lainnya

**Langkah-langkah:**

1.  **Clone repository ini:**

    ```bash
    git clone https://github.com/ariefShaifullah/nizamy.git
    cd nizamy
    ```

2.  **Install dependensi:**

    ```bash
    npm install
    ```

3.  **Jalankan server development:**
    ```bash
    npm run dev
    ```

## Cara Menggunakan

### Kalkulator Waris

1.  Buka aplikasi dan pilih "Kalkulator Waris".
2.  Masukkan jumlah total harta yang akan diwariskan di kolom "Total Harta Peninggalan".
3.  Pilih ahli waris yang ada dari daftar yang tersedia (misalnya, Suami, Istri, Anak Laki-laki, dll.).
4.  Klik tombol **"Hitung Warisan"**.
5.  Hasil perhitungan akan ditampilkan secara rinci, termasuk bagian masing-masing ahli waris, dalilnya, dan total harta yang diterima.

### Kalkulator Zakat

1.  Dari halaman utama, pilih "Kalkulator Zakat".
2.  (Opsional) Klik ikon **Pengaturan** untuk menyesuaikan harga emas dan beras sesuai dengan harga pasar saat ini.
3.  Pilih jenis zakat yang ingin dihitung dari tab navigasi (misalnya, Fitrah, Maal, Emas/Perak).
4.  Isi data harta Anda pada kolom yang sesuai.
5.  Kalkulator akan secara otomatis menampilkan status nisab dan jumlah zakat yang harus dibayarkan untuk kategori tersebut.
6.  Buka tab **"Ringkasan"** untuk melihat total kewajiban zakat dari semua kategori dan untuk mengunduh kwitansi PDF.

---

&copy; 2025 Nizamy. All rights reserved.
