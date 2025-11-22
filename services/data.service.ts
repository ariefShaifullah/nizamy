/**
 * Service to handle Data Backup & Restore logic.
 * Collects all NIZAMY related keys from localStorage.
 */

const APP_KEYS = [
  "faraidhHistory",
  "zakatHistory",
  "zakatSettings",
  "nizamy_hafalan_users",
  "vite-ui-theme",
  "preferredQori",
];

export const exportData = () => {
  const data: Record<string, any> = {};

  // 1. Collect Known Keys
  APP_KEYS.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        data[key] = JSON.parse(value);
      } catch {
        data[key] = value;
      }
    }
  });

  // 2. Collect Dynamic Keys (Hafalan Data per User)
  // Prefix: nizamy_hafalan_data_
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("nizamy_hafalan_data_")) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value;
        }
      }
    }
  }

  // 3. Create Download Blob
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `NIZAMY_Backup_${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importData = async (
  file: File
): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const data = JSON.parse(json);

        if (typeof data !== "object" || data === null) {
          resolve({ success: false, message: "Format file tidak valid." });
          return;
        }

        // Restore Data
        Object.keys(data).forEach((key) => {
          const value = data[key];
          if (typeof value === "object") {
            localStorage.setItem(key, JSON.stringify(value));
          } else {
            localStorage.setItem(key, String(value));
          }
        });

        resolve({
          success: true,
          message: "Data berhasil dipulihkan! Halaman akan dimuat ulang.",
        });
      } catch (err) {
        console.error(err);
        resolve({ success: false, message: "Gagal membaca file backup." });
      }
    };
    reader.readAsText(file);
  });
};

export const clearAllData = () => {
  localStorage.clear();
  // Optional: Restore theme preference immediately to prevent flash
  // localStorage.setItem('vite-ui-theme', 'system');
};
