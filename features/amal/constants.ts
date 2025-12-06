import type { AmalTask } from './types.ts';

export const AMAL_TASKS: AmalTask[] = [
    // Wajib (Bobot Tinggi - Total 75 poin)
    { id: 'fajr', label: 'Shalat Subuh', category: 'wajib', icon: '🌅', points: 15 },
    { id: 'dhuhr', label: 'Shalat Dzuhur', category: 'wajib', icon: '☀️', points: 15 },
    { id: 'asr', label: 'Shalat Ashar', category: 'wajib', icon: '🌤️', points: 15 },
    { id: 'maghrib', label: 'Shalat Maghrib', category: 'wajib', icon: '🌇', points: 15 },
    { id: 'isha', label: 'Shalat Isya', category: 'wajib', icon: '🌌', points: 15 },
    
    // Sunnah (Bobot Sedang)
    { id: 'qobliyah_fajr', label: 'Qobliyah Subuh', category: 'sunnah', icon: '✨', points: 5 },
    { id: 'dhuha', label: 'Shalat Dhuha', category: 'sunnah', icon: '🕌', points: 5 },
    { id: 'rawatib', label: 'Rawatib Lainnya', category: 'sunnah', icon: '🤲', points: 3 },
    { id: 'tahajjud', label: 'Qiyamul Lail / Tahajjud', category: 'sunnah', icon: '🌙', points: 8 },
    { id: 'witir', label: 'Shalat Witir', category: 'sunnah', icon: '1️⃣', points: 3 },
    { id: 'tilawah', label: 'Tilawah Quran', category: 'sunnah', icon: '📖', points: 5 },
    { id: 'dzikir_pagi', label: 'Dzikir Pagi', category: 'sunnah', icon: '📿', points: 3 },
    { id: 'dzikir_petang', label: 'Dzikir Petang', category: 'sunnah', icon: '📿', points: 3 },
    
    // Sosial (Bobot Sedang)
    { id: 'sedekah', label: 'Sedekah / Infaq', category: 'social', icon: '🎁', points: 5 },
    { id: 'birrul_walidain', label: 'Berbakti Orang Tua', category: 'social', icon: '👵', points: 5 },
    { id: 'help_others', label: 'Membantu Orang Lain', category: 'social', icon: '🤝', points: 3 },
];

// Total points possible used for normalization
export const TOTAL_POSSIBLE_SCORE = AMAL_TASKS.reduce((acc, curr) => acc + curr.points, 0);

export const AMAL_FAQ = [
    {
        question: "Apa tujuan fitur Amal Yaumi ini?",
        answer: "Fitur ini dirancang sebagai sarana Muhasabah (introspeksi diri) harian. Dengan mencatat amal ibadah, kita bisa melihat pola konsistensi kita dan termotivasi untuk meningkatkan kualitas ibadah dari hari ke hari, sesuai kaidah 'Hari ini harus lebih baik dari kemarin'."
    },
    {
        question: "Bagaimana sistem penilaian (Skor) bekerja?",
        answer: "Setiap ibadah memiliki bobot poin berbeda. Ibadah Wajib (Shalat Fardhu) memiliki poin tertinggi karena merupakan tiang agama. Ibadah Sunnah dan Sosial menjadi penyempurna. Skor 100% hanya bisa dicapai jika seluruh amalan Wajib dan Sunnah dalam daftar dikerjakan."
    },
    {
        question: "Apa arti kotak-kotak di bagian konsistensi?",
        answer: "Itu adalah Jejak Istiqomah Anda. Setiap kotak mewakili satu hari. Semakin hijau warnanya, semakin banyak amal ibadah yang Anda kerjakan pada hari tersebut. Jika warnanya abu-abu, berarti tidak ada catatan amal. Ini membantu Anda melihat seberapa rutin ibadah Anda sepanjang tahun."
    },
    {
        question: "Apakah data amal saya aman dan privat?",
        answer: "Sangat aman. Sesuai prinsip NIZAMY, data amal yaumi Anda hanya disimpan secara lokal di perangkat ini (IndexedDB). Tidak ada data yang dikirim ke server manapun. Ini adalah catatan pribadi antara Anda dan Allah."
    },
    {
        question: "Bolehkah saya mengisi untuk hari yang sudah lewat?",
        answer: "Boleh. Anda bisa menggunakan navigasi tanggal (tombol panah di widget kiri) untuk mundur ke tanggal sebelumnya jika lupa mencatat. Namun, disarankan mencatat setiap malam sebelum tidur sebagai penutup hari."
    }
];