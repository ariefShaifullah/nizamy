/**
 * Service untuk mengecek dan mengirim reminder hafalan
 * Optimized untuk performa dan battery efficiency
 */

import { notificationService } from './notification.service.ts';

export interface HafalanReminderData {
  dueCount: number;
  remainingQuota: number;
}

// In-memory cache untuk menghindari re-computation
let reminderDataCache: {
  data: HafalanReminderData | null;
  timestamp: number;
  date: string;
} = {
  data: null,
  timestamp: 0,
  date: ''
};

/**
 * Mengambil data reminder dari semua user yang ada
 * Returns aggregated reminder data dengan caching
 */
export const getHafalanReminderData = async (): Promise<HafalanReminderData | null> => {
  try {
    // Import dynamically to avoid circular dependencies
    const { getLocalYYYYMMDD, getAllUsers, loadUserData, getMaxAyatByLevel, getDailyLoad } = await import('../features/hafalan/logic/hafalan.service.ts');
    
    const today = getLocalYYYYMMDD();
    const now = Date.now();
    const cacheValidMs = 30 * 60 * 1000; // Cache valid 30 menit
    
    // Optimization: Gunakan cache jika masih valid (hari yang sama + belum expire)
    if (reminderDataCache.date === today && 
        now - reminderDataCache.timestamp < cacheValidMs &&
        reminderDataCache.data !== null) {
      console.debug('⚡ Using cached reminder data');
      return reminderDataCache.data;
    }
    
    const users = await getAllUsers();
    
    // Optimization: Early exit jika tidak ada user
    if (users.length === 0) {
      return null;
    }
    
    let totalDue = 0;
    let maxRemainingQuota = 0;
    let hasData = false;
    
    // Check all users for due items
    for (const user of users) {
      const userData = await loadUserData(user.id);
      if (!userData || !userData.items || userData.items.length === 0) continue;
      
      hasData = true;
      
      // Count due items (filter lebih efisien)
      const dueCount = userData.items.filter((item: any) => item.nextReviewDate <= today).length;
      totalDue += dueCount;
      
      // Calculate remaining quota
      if (userData.profile) {
        const limit = getMaxAyatByLevel(userData.profile.skillLevel);
        const used = getDailyLoad(userData.items);
        const remaining = Math.max(0, limit - used);
        maxRemainingQuota = Math.max(maxRemainingQuota, remaining);
      }
    }
    
    // Optimization: Return null jika tidak ada data sama sekali
    if (!hasData) {
      return null;
    }
    
    const result = {
      dueCount: totalDue,
      remainingQuota: maxRemainingQuota
    };
    
    // Update cache
    reminderDataCache = {
      data: result,
      timestamp: now,
      date: today
    };
    
    return result;
  } catch (error) {
    console.error('❌ Error getting hafalan reminder data:', error);
    return null;
  }
};

/**
 * Check dan kirim notifikasi hafalan jika diperlukan
 * Dengan optimasi untuk mencegah spam dan hemat resource
 */
export const checkAndSendHafalanReminder = async (): Promise<boolean> => {
  try {
    // Optimization 1: Check notification support & permission dulu
    if (!notificationService.isSupported() || !notificationService.isEnabled()) {
      console.debug('⏭️ Notifications not available');
      return false;
    }
    
    // Optimization 2: Get data (dengan caching internal)
    const reminderData = await getHafalanReminderData();
    
    if (!reminderData) {
      console.debug('⏭️ No reminder data available');
      return false;
    }
    
    // Optimization 3: Update badge (lightweight operation)
    await notificationService.updateAppBadge(reminderData.dueCount);
    
    // Optimization 4: Only send notification if there are due items
    if (reminderData.dueCount > 0) {
      // sendReminder sudah punya logic untuk cek apakah sudah notif hari ini
      await notificationService.sendReminder(
        reminderData.dueCount, 
        reminderData.remainingQuota
      );
      console.debug('✅ Reminder sent:', reminderData.dueCount, 'due items');
      return true;
    }
    
    console.debug('ℹ️ No due items, skipping notification');
    return false;
  } catch (error) {
    console.error('❌ Error in checkAndSendHafalanReminder:', error);
    return false;
  }
};

/**
 * Clear cache (untuk testing atau force refresh)
 */
export const clearReminderCache = () => {
  reminderDataCache = {
    data: null,
    timestamp: 0,
    date: ''
  };
};
