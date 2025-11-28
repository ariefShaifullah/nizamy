import { dbGet, dbKeys, dbSet, dbClear } from "../../../services/db.service.ts";

/**
 * Service to handle Data Backup & Restore logic.
 * Supports both LocalStorage and IndexedDB.
 */

const APP_KEYS = [
    // --- CORE DATA (History & Heavy Data) ---
    'faraidhHistory',
    'zakatHistory',
    'nizamy_hafalan_users',
    'hede_last_result',
    'hede_history',
    
    // --- APP STATES (Work in Progress) ---
    'zakatState', // Save current input values in Zakat Calculator
    
    // --- SETTINGS & PREFERENCES ---
    'zakatSettings',
    'vite-ui-theme',
    'preferredQori',
    
    // --- MUSHAF DIGITAL ---
    'mushaf_lastRead',
    'mushaf_fontSize',
    'mushaf_showTranslation',
    'mushaf_wordMode',
    'nizamy_mushaf_tutorial_seen',
    
    // --- GLOBAL FLAGS ---
    'nizamy_notifications_enabled',
    'nizamy_hafalan_tutorial_seen'
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
        // 'nizamy_' prefix covers dynamic hafalan data (nizamy_hafalan_data_USERID)
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
                    
                    // FIXED: Only Hafalan data goes to IDB. 
                    // Faraidh & Zakat History must stay in LocalStorage because their UI components use synchronous useLocalStorage hook.
                    if (key.startsWith('nizamy_hafalan_')) {
                        await dbSet(key, value);
                    } else {
                        // Preferences, HEDE, Faraidh, Zakat go to LocalStorage
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