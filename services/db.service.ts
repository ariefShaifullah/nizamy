import { get, set, del, keys, clear } from 'idb-keyval';

/**
 * Database Service
 * Wrapper around idb-keyval to handle typed storage and migration from localStorage.
 */

const MIGRATION_FLAG_KEY = 'nizamy_migration_v1_complete';

/**
 * Migrates data starting with 'nizamy_' from localStorage to IndexedDB.
 * This runs once.
 */
export const migrateFromLocalStorage = async () => {
    const isMigrated = localStorage.getItem(MIGRATION_FLAG_KEY);
    if (isMigrated) return;

    console.log("Starting migration to IndexedDB...");
    
    const keysToMigrate: string[] = [];
    
    // Identify keys
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // FIXED: Only migrate Hafalan data (heavy JSON). 
        // Keep faraidhHistory and zakatHistory in LS for synchronous UI access.
        if (key && key.startsWith('nizamy_hafalan_')) {
            keysToMigrate.push(key);
        }
    }

    // Migrate keys
    for (const key of keysToMigrate) {
        try {
            const value = localStorage.getItem(key);
            if (value) {
                const parsed = JSON.parse(value);
                await set(key, parsed);
                localStorage.removeItem(key); // Clean up
            }
        } catch (e) {
            console.error(`Failed to migrate key: ${key}`, e);
        }
    }

    localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
    console.log("Migration to IndexedDB complete.");
};

// Typed wrapper functions
export const dbGet = async <T>(key: string): Promise<T | undefined> => {
    return await get<T>(key);
};

export const dbSet = async (key: string, val: any): Promise<void> => {
    await set(key, val);
};

export const dbDel = async (key: string): Promise<void> => {
    await del(key);
};

export const dbKeys = async (): Promise<IDBValidKey[]> => {
    return await keys();
};

export const dbClear = async (): Promise<void> => {
    await clear();
    localStorage.removeItem(MIGRATION_FLAG_KEY); // Reset migration flag if full clear
};