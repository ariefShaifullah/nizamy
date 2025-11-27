
import { dbGet, dbKeys, dbSet, dbClear } from "../../../services/db.service.ts";

/**
 * Service to handle Data Backup & Restore logic.
 * Supports both LocalStorage and IndexedDB.
 */

const APP_KEYS = [
    'faraidhHistory',
    'zakatHistory',
    'zakatSettings',
    'nizamy_hafalan_users',
    'vite-ui-theme',
    'preferredQori'
];

export const exportData = async (): Promise<void> => {
    const data: Record<string, any> = {};
    
    // 1. Collect LocalStorage Keys (Synchronous)
    // Some settings might still be in LS or migrated to IDB depending on key
    APP_KEYS.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            try {
                data[key] = JSON.parse(value);
            } catch {
                data[key] = value;
            }
        }
    });

    // 2. Collect IndexedDB Keys (Asynchronous)
    const allDbKeys = await dbKeys();
    for (const key of allDbKeys) {
        // Only backup nizamy related keys from IDB
        if (typeof key === 'string' && (APP_KEYS.includes(key) || key.startsWith('nizamy_'))) {
            const value = await dbGet(key);
            if (value) {
                data[key] = value;
            }
        }
    }

    // 3. Create Download Blob
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `NIZAMY_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const importData = async (file: File): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const json = e.target?.result as string;
                const data = JSON.parse(json);
                
                if (typeof data !== 'object' || data === null) {
                    resolve({ success: false, message: "Format file tidak valid." });
                    return;
                }

                // Restore Data
                for (const key of Object.keys(data)) {
                    const value = data[key];
                    
                    // Determine destination: IDB or LS
                    // If it's large data or specific keys, go to IDB
                    if (key.startsWith('nizamy_hafalan_') || key === 'faraidhHistory' || key === 'zakatHistory') {
                        await dbSet(key, value);
                    } else {
                        // Preferences go to LocalStorage
                        if (typeof value === 'object') {
                            localStorage.setItem(key, JSON.stringify(value));
                        } else {
                            localStorage.setItem(key, String(value));
                        }
                    }
                }

                resolve({ success: true, message: "Data berhasil dipulihkan! Halaman akan dimuat ulang." });
            } catch (err) {
                console.error(err);
                resolve({ success: false, message: "Gagal membaca file backup." });
            }
        };
        reader.readAsText(file);
    });
};

export const clearAllData = async () => {
    localStorage.clear();
    await dbClear();
    // Optional: Restore theme preference immediately to prevent flash
    // localStorage.setItem('vite-ui-theme', 'system'); 
};
