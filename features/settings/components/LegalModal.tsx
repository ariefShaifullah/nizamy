
import React from 'react';
import { Modal } from '../../../components/ui/Modal.tsx';

export type LegalType = 'terms' | 'privacy' | null;

interface LegalModalProps {
  type: LegalType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const isTerms = type === 'terms';
  const title = isTerms ? 'Syarat & Ketentuan' : 'Kebijakan Privasi';

  return (
    <Modal isOpen={true} onClose={onClose} title={title} maxWidth="max-w-3xl">
      <div className="p-6 overflow-y-auto max-h-[70vh] text-slate-700 dark:text-slate-300 text-sm leading-relaxed space-y-4 custom-scrollbar">
        {isTerms ? <TermsContent /> : <PrivacyContent />}
        
        <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
            <button 
                onClick={onClose}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-sm"
            >
                Saya Mengerti
            </button>
        </div>
      </div>
    </Modal>
  );
};

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-2">{children}</h4>
);

const TermsContent = () => (
    <div className="space-y-3">
        <p className="text-xs text-slate-500">Terakhir Diperbarui: November 2025</p>
        <p>Selamat datang di <strong>NIZAMY</strong>. Aplikasi ini menyediakan alat bantu ibadah (Kalkulator Zakat, Waris, Hafalan Quran, Jadwal Sholat, dan Klinik Finansial). Dengan menggunakan aplikasi ini, Anda menyetujui ketentuan berikut:</p>

        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800 my-4 text-xs md:text-sm">
            <SectionTitle>1. Penafian Penting (Important Disclaimer)</SectionTitle>
            <ul className="list-disc pl-5 space-y-2 text-amber-900 dark:text-amber-100 mt-2">
                <li><strong>Alat Bantu, Bukan Fatwa:</strong> Semua hasil perhitungan dan diagnosa dalam aplikasi ini adalah <strong>estimasi</strong> berdasarkan algoritma dan kaidah umum (Jumhur Ulama). Hasil ini <strong>TIDAK</strong> menggantikan fatwa resmi ulama, keputusan pengadilan agama, atau nasihat hukum profesional.</li>
                <li><strong>Tanggung Jawab Pengguna:</strong> Anda bertanggung jawab penuh atas keakuratan data yang dimasukkan dan keputusan (finansial/hukum) yang diambil berdasarkan hasil aplikasi. Kami tidak bertanggung jawab atas kerugian yang timbul.</li>
                <li><strong>Akurasi Kompas & Jadwal:</strong> Fitur Arah Kiblat sangat bergantung pada kualitas sensor perangkat Anda. Interferensi magnetik dapat menyebabkan penyimpangan. Jadwal sholat mungkin memiliki selisih waktu 1-2 menit (ihtiyati) dengan masjid setempat.</li>
                <li><strong>Verifikasi Wajib:</strong> Untuk kasus sensitif seperti pembagian waris yang kompleks, sengketa harta, atau penentuan arah kiblat bangunan permanen, <strong>WAJIB</strong> berkonsultasi langsung dengan ahli ilmu terpercaya.</li>
            </ul>
        </div>

        <SectionTitle>2. Ketentuan Layanan Per Fitur</SectionTitle>
        <ul className="list-disc pl-5 space-y-3">
            <li>
                <strong>Kalkulator Waris (Faraidh):</strong> Menggunakan metode Syafi'iyah/Jumhur. Tidak mencakup kasus langka (seperti banci/khuntsa, hilang/mafqud, atau janin) yang memerlukan putusan hakim.
            </li>
            <li>
                <strong>Kalkulator Zakat:</strong> Perhitungan menggunakan asumsi harga emas/beras standar pasar. Pengguna disarankan menyesuaikan dengan harga aktual di daerah masing-masing saat pembayaran.
            </li>
            <li>
                <strong>Jadwal Sholat & Kiblat:</strong> Menggunakan metode perhitungan Kemenag RI (untuk wilayah Indonesia). Akurasi kompas bersifat estimasi; pengguna disarankan melakukan kalibrasi (gerakan angka 8) sebelum penggunaan dan menjauhkan HP dari benda magnetik/besi.
            </li>
            <li>
                <strong>Klinik Finansial (Audit Finansial):</strong> Fitur ini adalah alat <em>self-assessment</em> (diagnosa mandiri). Status "Kritis", "Syubhat", atau "Aman" adalah indikator teknis sistem, bukan vonis hukum syara' mutlak terhadap individu.
            </li>
            <li>
                <strong>Al-Quran & Hafalan:</strong> Teks ayat diambil dari API publik. Jika menemukan kesalahan penulisan, mohon merujuk pada Mushaf Utsmani cetak. Fitur audio streaming menggunakan kuota data internet Anda.
            </li>
            <li>
                <strong>Perintah Suara (Voice Command):</strong> Fitur ini menggunakan teknologi pengenalan suara (Web Speech API). Kami tidak bertanggung jawab atas kesalahan interpretasi suara oleh sistem. Pengguna wajib memverifikasi ulang data yang terisi otomatis.
            </li>
        </ul>

        <SectionTitle>3. Adab & Penggunaan</SectionTitle>
        <p>Pengguna diharapkan menggunakan aplikasi ini untuk tujuan kebaikan, ibadah, dan edukasi. Dilarang menyalahgunakan konten Al-Quran atau memanipulasi hasil perhitungan untuk tujuan penipuan.</p>

        <SectionTitle>4. Hak Kekayaan Intelektual</SectionTitle>
        <p>Kode sumber, desain antarmuka, dan algoritma NIZAMY dilindungi hak cipta. Penggunaan untuk tujuan komersial tanpa izin adalah dilarang.</p>
        <SectionTitle>5. Kontak</SectionTitle>
        <p>
          Jika ada pertanyaan, silakan hubungi kami melalui email:{" "}
          <strong>aryan@nizamy.com</strong>.
        </p>
    </div>
);

const PrivacyContent = () => (
    <div className="space-y-3">
        <p className="text-xs text-slate-500">Terakhir Diperbarui: November 2025</p>
        <p>Di <strong>NIZAMY</strong>, kami menerapkan prinsip <em>Privacy by Design</em>. Kami menghormati privasi ibadah dan data keuangan Anda.</p>

        <SectionTitle>1. Arsitektur "Local-First" (Data di Tangan Anda)</SectionTitle>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 mb-2">
            <p className="text-blue-900 dark:text-blue-100 font-medium">
                Kami <strong>TIDAK MEMILIKI SERVER DATABASE</strong> untuk menyimpan data pribadi Anda.
            </p>
        </div>
        <p>Seluruh data berikut disimpan secara terenkripsi di dalam memori browser (Local Storage / IndexedDB) perangkat Anda sendiri:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Data keluarga & harta waris.</li>
            <li>Nominal aset & utang (Zakat/Klinik Finansial).</li>
            <li>Progress hafalan Quran & riwayat murajaah.</li>
            <li>Jawaban diagnosa ekonomi.</li>
        </ul>

        <SectionTitle>2. Pengumpulan Data Teknis & Izin</SectionTitle>
        <p>Kami hanya mengakses data teknis yang diperlukan untuk fungsi aplikasi:</p>
        <ul className="list-disc pl-5 space-y-1">
            <li><strong>Lokasi (GPS):</strong> Hanya diminta sesaat untuk menghitung jadwal sholat akurat sesuai posisi geografis Anda. Koordinat tidak dikirim ke server kami, melainkan langsung ke API perhitungan waktu.</li>
            <li><strong>Sensor Gerak (Magnetometer/Orientation):</strong> Diakses hanya saat Anda membuka halaman "Arah Kiblat" untuk menggerakkan jarum kompas. Data gerakan diproses secara real-time dan tidak direkam.</li>
            <li><strong>Mikrofon:</strong> Hanya diakses saat Anda mengaktifkan fitur Voice Command. Audio diproses langsung oleh <em>browser engine</em> dan tidak kami rekam.</li>
            <li><strong>IP Address:</strong> Mungkin tercatat secara otomatis oleh penyedia layanan pihak ketiga (seperti CDN Audio Quran) saat Anda memutar audio streaming untuk keperluan teknis pengiriman data.</li>
        </ul>

        <SectionTitle>3. Layanan Pihak Ketiga</SectionTitle>
        <p>Aplikasi ini menggunakan layanan pihak ketiga tertentu. Data yang Anda berikan mungkin diproses sesuai kebijakan privasi mereka:</p>
        <ul className="list-disc pl-5 space-y-1">
            <li><strong>Web Speech API (Google/Apple/Browser Vendor):</strong> Saat menggunakan Voice Command, data suara Anda mungkin dikirim ke server penyedia browser untuk diubah menjadi teks (Speech-to-Text).</li>
            <li><strong>Aladhan & Quran.com API:</strong> Untuk data jadwal sholat dan teks ayat.</li>
            <li><strong>BigDataCloud API:</strong> Untuk mendeteksi nama kota dari koordinat GPS Anda (Reverse Geocoding).</li>
        </ul>

        <SectionTitle>4. Keamanan & Kehilangan Data</SectionTitle>
        <ul className="list-disc pl-5 space-y-2">
            <li><strong>Kontrol Penuh:</strong> Karena data ada di HP Anda, keamanan bergantung pada akses fisik ke perangkat Anda (gunakan PIN/Fingerprint).</li>
            <li><strong>Risiko Hapus Data:</strong> Menghapus <em>cache</em> browser atau meng-uninstall aplikasi akan <strong>menghapus seluruh data secara permanen</strong>.</li>
            <li><strong>Solusi Backup:</strong> Gunakan fitur "Backup & Restore" di menu Pengaturan untuk menyimpan data Anda ke file aman secara berkala.</li>
        </ul>
        <SectionTitle>5. Kontak</SectionTitle>
        <p>
          Jika ada pertanyaan, silakan hubungi kami melalui email:{" "}
          <strong>aryan@nizamy.com</strong>.
        </p>
    </div>
);
