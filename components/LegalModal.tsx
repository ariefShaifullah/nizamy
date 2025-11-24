
import React from 'react';
import { Modal } from './Modal.tsx';

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

const ListItem: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <li className="mb-2">
        <span className="font-semibold text-slate-800 dark:text-slate-200">{title}</span> {children}
    </li>
);

const TermsContent = () => (
    <div className="space-y-3">
        <p className="text-xs text-slate-500">Terakhir Diperbarui: Oktober 2025</p>
        <p>Selamat datang di <strong>NIZAMY</strong>. Dengan mengakses atau menggunakan Aplikasi ini, Anda dianggap telah menyetujui Syarat dan Ketentuan ini.</p>

        <SectionTitle>1. Definisi</SectionTitle>
        <ul className="list-disc pl-5 space-y-1">
            <li><strong>"Aplikasi"</strong> merujuk pada perangkat lunak NIZAMY (Web & PWA).</li>
            <li><strong>"Pengguna"</strong> merujuk pada individu yang mengakses Aplikasi.</li>
        </ul>

        <SectionTitle>2. Penafian Agama dan Hukum</SectionTitle>
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800 mb-4">
            <p className="font-bold text-amber-800 dark:text-amber-200 mb-2">PENTING:</p>
            <ul className="list-disc pl-5 space-y-2 text-amber-900 dark:text-amber-100">
                <li><strong>Bukan Fatwa Resmi:</strong> Hasil perhitungan Waris dan Zakat bersifat estimasi dan tidak menggantikan fatwa ulama atau putusan pengadilan agama.</li>
                <li><strong>Teks Al-Quran:</strong> Kami menggunakan data digital dari API publik terpercaya. Jika menemukan ketidaksesuaian, harap merujuk kembali pada Mushaf cetak standar.</li>
                <li><strong>Pembebasan Tanggung Jawab:</strong> Kami tidak bertanggung jawab atas sengketa yang timbul akibat ketergantungan mutlak pada aplikasi ini.</li>
            </ul>
        </div>

        <SectionTitle>3. Penggunaan Mushaf & Audio</SectionTitle>
        <ul className="list-disc pl-5 space-y-1">
            <li>Fitur pemutaran audio (streaming) dapat mengonsumsi kuota data internet Anda.</li>
            <li>Fitur analisis tajwid adalah algoritma bantu belajar dan bukan pengganti guru (Talaqqi).</li>
            <li>Pengguna diharapkan menjaga adab saat berinteraksi dengan konten ayat suci di layar.</li>
        </ul>

        <SectionTitle>4. Privasi & Data</SectionTitle>
        <p>Kami menerapkan prinsip <strong>Local-First</strong>. Seluruh data (profil, harta, progres hafalan) disimpan di perangkat Anda (Local Storage) dan <strong>tidak dikirim</strong> ke server kami. Kehilangan data akibat penghapusan cache browser atau uninstall aplikasi adalah tanggung jawab pengguna.</p>

        <SectionTitle>5. Hak Kekayaan Intelektual</SectionTitle>
        <p>Kode sumber dan desain NIZAMY dilindungi hak cipta. Aplikasi menggunakan layanan pihak ketiga (Quran.com, EveryAyah, Aladhan) yang hak cipta datanya milik penyedia masing-masing.</p>

        <SectionTitle>6. Hukum yang Berlaku</SectionTitle>
        <p>Ketentuan ini diatur oleh hukum Republik Indonesia.</p>

        <SectionTitle>7. Kontak</SectionTitle>
        <p>Jika Anda memiliki pertanyaan mengenai Syarat dan Ketentuan ini, silakan hubungi kami melalui email: <strong>aryan@nizamy.com</strong>.</p>
    </div>
);

const PrivacyContent = () => (
    <div className="space-y-3">
        <p className="text-xs text-slate-500">Terakhir Diperbarui: Oktober 2025</p>
        <p>Di <strong>NIZAMY</strong>, privasi Anda adalah prioritas. Kami menggunakan prinsip <strong>Data Minimization</strong>.</p>

        <SectionTitle>1. Informasi yang Kami Kumpulkan</SectionTitle>
        <ul className="list-disc pl-5 space-y-2">
            <ListItem title="Data Lokal:">
                Data profil, keluarga, harta, dan progres hafalan disimpan secara eksklusif di <em>Local Storage</em> perangkat Anda. Kami tidak memiliki akses ke database ini.
            </ListItem>
            <ListItem title="Izin Perangkat:">
                <ul>
                    <li><strong>Lokasi:</strong> Hanya diminta sesaat untuk mengambil jadwal sholat sesuai koordinat.</li>
                    <li><strong>Wake Lock:</strong> Menjaga layar tetap menyala saat Anda membaca Mushaf.</li>
                    <li><strong>Notifikasi:</strong> Untuk pengingat jadwal murajaah (lokal).</li>
                </ul>
            </ListItem>
        </ul>

        <SectionTitle>2. Penggunaan Informasi</SectionTitle>
        <p>Informasi digunakan semata-mata untuk fungsi internal aplikasi di perangkat Anda: menghitung waris/zakat, melacak hafalan, dan personalisasi.</p>

        <SectionTitle>3. Layanan Pihak Ketiga</SectionTitle>
        <p>Aplikasi terhubung dengan layanan publik berikut untuk mengambil data:</p>
        <ul className="list-disc pl-5">
            <li><strong>Quran.com & EveryAyah:</strong> Data ayat dan streaming audio. (Penyedia CDN mungkin mencatat IP Address Anda dalam log teknis mereka).</li>
            <li><strong>Aladhan:</strong> Data jadwal sholat.</li>
        </ul>

        <SectionTitle>4. Keamanan & Risiko Data</SectionTitle>
        <p>Karena data tersimpan di perangkat, keamanannya bergantung pada akses fisik ke perangkat Anda (Gunakan kunci layar). Menghapus cache browser atau uninstall aplikasi akan menghapus data permanen.</p>

        <SectionTitle>5. Kontak</SectionTitle>
        <p>Jika ada pertanyaan, silakan hubungi kami melalui email: <strong>aryan@nizamy.com</strong>.</p>
    </div>
);
