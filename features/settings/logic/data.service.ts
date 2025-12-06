
import { dbGet, dbKeys, dbSet, dbClear } from "../../../services/db.service.ts";

/**
 * Service to handle Data Backup & Restore logic.
 * Supports both LocalStorage and IndexedDB.
 */

// Keys that are definitely in IndexedDB (Heavy Data)
const IDB_KEYS = [
    'faraidhHistory',
    'zakatHistory',
    'hede_history',
    'hede_last_result',
    'nizamy_hafalan_users'
    // dynamic keys 'nizamy_hafalan_data_*' and 'nizamy_amal_log_*' are handled by logic
];

// Keys that might be in LocalStorage (Preferences/Light state)
const LS_KEYS = [
    'zakatState', 
    'zakatSettings',
    'vite-ui-theme',
    'preferredQori',
    'mushaf_lastRead',
    'mushaf_fontSize',
    'mushaf_showTranslation',
    'mushaf_wordMode',
    'nizamy_mushaf_tutorial_seen',
    'nizamy_notifications_enabled',
    'nizamy_hafalan_tutorial_seen',
    'hede_roadmap_progress'
];

export const exportData = async (): Promise<void> => {
    const data: Record<string, any> = {};
    
    // 1. Collect LocalStorage Keys
    LS_KEYS.forEach(key => {
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
        if (typeof key === 'string') {
            // Check if it's one of our known IDB keys OR a dynamic hafalan/amal key
            if (IDB_KEYS.includes(key) || key.startsWith('nizamy_')) {
                const value = await dbGet(key);
                if (value) {
                    data[key] = value;
                }
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
                    
                    // Logic to determine destination (IDB vs LocalStorage)
                    // CRITICAL: Add amal log prefix here so it restores to IDB properly
                    const isHeavyData = 
                        key.startsWith('nizamy_hafalan_') || 
                        key.startsWith('nizamy_amal_log_') ||
                        IDB_KEYS.includes(key);

                    if (isHeavyData) {
                        await dbSet(key, value);
                    } else {
                        // Preferences, Light State go to LocalStorage
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
};
