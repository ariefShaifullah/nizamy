
import React, { useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal.tsx';
import { exportData, importData, clearAllData } from '../logic/data.service.ts';
import { useToast } from '../../../components/ui/Toast.tsx';
import { useConfirm } from '../../../components/ui/ConfirmContext.tsx';
import { LegalModal, type LegalType } from './LegalModal.tsx';
import { FaDownload, FaUpload, FaTrash, FaFileContract, FaShieldAlt, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

interface GlobalSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSettings: React.FC<GlobalSettingsProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [legalType, setLegalType] = useState<LegalType>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBackup = async () => {
    setIsProcessing(true);
    try {
      await exportData();
      showToast("Backup data berhasil diunduh", "success");
    } catch (e) {
      console.error(e);
      showToast("Gagal membuat backup", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isConfirmed = await confirm({
      title: 'Pulihkan Data?',
      message: 'Data saat ini akan ditimpa dengan data dari file backup. Lanjutkan?',
      confirmText: 'Ya, Pulihkan',
      variant: 'info'
    });

    if (isConfirmed) {
      setIsProcessing(true);
      try {
        const result = await importData(file);
        if (result.success) {
          showToast(result.message, "success");
          setTimeout(() => window.location.reload(), 1500);
        } else {
          showToast(result.message, "error");
          setIsProcessing(false);
        }
      } catch (e) {
        showToast("Terjadi kesalahan saat restore", "error");
        setIsProcessing(false);
      }
    } else {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResetApp = async () => {
    const isConfirmed = await confirm({
      title: 'Reset Total Aplikasi?',
      message: 'PERINGATAN: Semua data (Hafalan, History Waris, Zakat) akan dihapus permanen. Aplikasi akan kembali seperti baru instal.',
      confirmText: 'Hapus Semuanya',
      variant: 'danger'
    });

    if (isConfirmed) {
      setIsProcessing(true);
      await clearAllData();
      showToast("Semua data dihapus. Reloading...", "info");
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Pengaturan & Data"
        maxWidth="max-w-md"
      >
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            {/* SECTION: BACKUP & RESTORE */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
              <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-1">
                Backup & Restore
              </h4>
              <p className="text-xs text-blue-600 dark:text-blue-300 mb-4">
                Simpan data aplikasi (Waris, Zakat, Hafalan, Diagnosa
                Finansial) ke file agar tidak hilang saat clear cache atau
                ganti perangkat.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleBackup}
                  disabled={isProcessing}
                  className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span className="animate-spin">
                      <FaSpinner />
                    </span>
                  ) : (
                    <span className="icon-wrapper w-4 h-4">
                      <FaDownload />
                    </span>
                  )}
                  Backup
                </button>
                <button
                  onClick={handleRestoreClick}
                  disabled={isProcessing}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span className="animate-spin">
                      <FaSpinner />
                    </span>
                  ) : (
                    <span className="icon-wrapper w-4 h-4">
                      <FaUpload />
                    </span>
                  )}
                  Restore
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                />
              </div>
            </div>

            {/* SECTION: LEGAL & INFO */}
            <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3 text-sm">
                Tentang Aplikasi
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setLegalType("terms")}
                  className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors text-left flex items-center gap-2"
                >
                  <span className="icon-wrapper w-4 h-4">
                    <FaFileContract />
                  </span>{" "}
                  Syarat & Ketentuan
                </button>
                <button
                  onClick={() => setLegalType("privacy")}
                  className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors text-left flex items-center gap-2"
                >
                  <span className="icon-wrapper w-4 h-4">
                    <FaShieldAlt />
                  </span>{" "}
                  Kebijakan Privasi
                </button>
              </div>
            </div>

            {/* SECTION: DANGER ZONE */}
            <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
              <button
                onClick={handleResetApp}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 py-3 rounded-xl transition-colors text-sm font-bold disabled:opacity-50"
              >
                <span className="icon-wrapper w-4 h-4">
                  <FaTrash />
                </span>
                Reset Total Aplikasi
              </button>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 dark:text-slate-500">
            <p>NIZAMY Version 2.0.6</p>
            <p>
              Storage Usage:{" "}
              {(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB
            </p>
          </div>
        </div>
      </Modal>

      <LegalModal type={legalType} onClose={() => setLegalType(null)} />
    </>
  );
};
