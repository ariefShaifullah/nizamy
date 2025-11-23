import React from "react";
import { Modal } from "./Modal.tsx";

export type LegalType = "terms" | "privacy" | null;

interface LegalModalProps {
  type: LegalType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const isTerms = type === "terms";
  const title = isTerms ? "Syarat & Ketentuan" : "Kebijakan Privasi";

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

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-2">
    {children}
  </h4>
);

const ListItem: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <li className="mb-2">
    <span className="font-semibold text-slate-800 dark:text-slate-200">
      {title}
    </span>{" "}
    {children}
  </li>
);

const TermsContent = () => (
  <div className="space-y-3">
    <p className="text-xs text-slate-500">Terakhir Diperbarui: 23 Nov 2025</p>
    <p>
      Selamat datang di <strong>NIZAMY</strong>. Dengan mengakses atau
      menggunakan Aplikasi ini, Anda dianggap telah menyetujui Syarat dan
      Ketentuan ini.
    </p>

    <SectionTitle>1. Definisi</SectionTitle>
    <ul className="list-disc pl-5 space-y-1">
      <li>
        <strong>"Aplikasi"</strong> merujuk pada perangkat lunak NIZAMY.
      </li>
      <li>
        <strong>"Pengguna"</strong> merujuk pada individu yang mengakses
        Aplikasi.
      </li>
    </ul>

    <SectionTitle>2. Penafian Agama dan Hukum</SectionTitle>
    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800 mb-4">
      <p className="font-bold text-amber-800 dark:text-amber-200 mb-2">
        PENTING:
      </p>
      <ul className="list-disc pl-5 space-y-2 text-amber-900 dark:text-amber-100">
        <li>
          <strong>Bukan Fatwa Resmi:</strong> Hasil perhitungan bersifat
          estimasi dan tidak menggantikan fatwa ulama atau putusan pengadilan
          agama.
        </li>
        <li>
          <strong>Rekomendasi:</strong> Verifikasi hasil dengan Ustadz atau Ahli
          Fiqih terpercaya sebelum pembagian harta.
        </li>
        <li>
          <strong>Pembebasan Tanggung Jawab:</strong> Kami tidak bertanggung
          jawab atas sengketa yang timbul akibat ketergantungan mutlak pada
          aplikasi ini.
        </li>
      </ul>
    </div>

    <SectionTitle>3. Privasi & Data</SectionTitle>
    <p>
      Kami menerapkan prinsip <strong>Local-First</strong>. Seluruh data (nama,
      harta, hafalan) disimpan di perangkat Anda (Local Storage) dan{" "}
      <strong>tidak dikirim</strong> ke server kami. Kehilangan data akibat
      penghapusan cache browser adalah tanggung jawab pengguna.
    </p>

    <SectionTitle>4. Hak Kekayaan Intelektual</SectionTitle>
    <p>
      Kode sumber dan desain NIZAMY dilindungi hak cipta. Dilarang menyalin atau
      mendistribusikan ulang tanpa izin. Aplikasi menggunakan API publik
      (Al-Quran Cloud, Aladhan) yang hak ciptanya milik penyedia masing-masing.
    </p>

    <SectionTitle>5. Penggunaan yang Dilarang</SectionTitle>
    <p>
      Anda dilarang menggunakan Aplikasi untuk tindakan melanggar hukum,
      menyebarkan malware, atau merusak integritas sistem.
    </p>

    <SectionTitle>6. Hukum yang Berlaku</SectionTitle>
    <p>Ketentuan ini diatur oleh hukum Republik Indonesia.</p>

    <SectionTitle>7. Kontak Kami</SectionTitle>
    <p>
      Jika Anda memiliki pertanyaan atau masukan mengenai Syarat dan Ketentuan
      ini, silakan hubungi kami melalui email:{" "}
      <a
        href="mailto:aryan@nizamy.com"
        className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
      >
        aryan@nizamy.com
      </a>
      .
    </p>
  </div>
);

const PrivacyContent = () => (
  <div className="space-y-3">
    <p className="text-xs text-slate-500">Terakhir Diperbarui: 23 Nov 2025</p>
    <p>
      Di <strong>NIZAMY</strong>, privasi Anda adalah prioritas. Kami
      menggunakan prinsip <strong>Data Minimization</strong>.
    </p>

    <SectionTitle>1. Informasi yang Kami Kumpulkan</SectionTitle>
    <ul className="list-disc pl-5 space-y-2">
      <ListItem title="Data Input (Lokal):">
        Data profil, keluarga, dan harta disimpan secara eksklusif di{" "}
        <em>Local Storage</em> browser Anda. Kami tidak memiliki akses ke data
        ini.
      </ListItem>
      <ListItem title="Lokasi (Geolocation):">
        Akses lokasi hanya diminta untuk mengambil jadwal sholat via API pihak
        ketiga. Koordinat tidak disimpan di database kami.
      </ListItem>
    </ul>

    <SectionTitle>2. Penggunaan Informasi</SectionTitle>
    <p>
      Informasi digunakan semata-mata untuk fungsi internal aplikasi: menghitung
      waris/zakat, melacak hafalan, dan personalisasi tema.
    </p>

    <SectionTitle>3. Layanan Pihak Ketiga</SectionTitle>
    <p>Aplikasi terhubung dengan layanan publik berikut:</p>
    <ul className="list-disc pl-5">
      <li>
        <strong>Al-Quran Cloud & EveryAyah:</strong> Untuk data ayat dan audio.
      </li>
      <li>
        <strong>Aladhan:</strong> Untuk jadwal sholat.
      </li>
    </ul>
    <p className="mt-2 text-xs italic">
      Kami tidak membagikan data pribadi inputan Anda kepada pihak ketiga ini.
    </p>

    <SectionTitle>4. Keamanan Data</SectionTitle>
    <p>
      Karena data tersimpan di perangkat, keamanannya bergantung pada keamanan
      fisik perangkat Anda. Gunakan kunci layar untuk mencegah akses tidak sah.
    </p>

    <SectionTitle>5. Risiko Kehilangan Data</SectionTitle>
    <p>
      Menghapus cache browser atau uninstall aplikasi (PWA) akan menghapus data
      permanen. Gunakan fitur <strong>Backup & Restore</strong> di menu
      Pengaturan secara berkala.
    </p>

    <SectionTitle>6. Hubungi Kami</SectionTitle>
    <p>
      Jika ada pertanyaan, silakan hubungi kami melalui email:{" "}
      <a
        href="mailto:aryan@nizamy.com"
        className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
      >
        aryan@nizamy.com
      </a>
      .
    </p>
  </div>
);
