
import { dbGet, dbSet } from '../../../services/db.service.ts';
import type { DailyAmalLog } from '../types.ts';
import { AMAL_TASKS, TOTAL_POSSIBLE_SCORE } from '../constants.ts';

const STORAGE_KEY_PREFIX = 'nizamy_amal_log_';

export const getLogDateKey = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

export const getLogForDate = async (dateStr: string): Promise<DailyAmalLog> => {
    const key = `${STORAGE_KEY_PREFIX}${dateStr}`;
    const data = await dbGet<DailyAmalLog>(key);
    
    if (!data) {
        return {
            date: dateStr,
            completedTasks: [],
            totalScore: 0
        };
    }
    return data;
};

export const toggleTaskCompletion = async (dateStr: string, taskId: string): Promise<DailyAmalLog> => {
    const currentLog = await getLogForDate(dateStr);
    const isCompleted = currentLog.completedTasks.includes(taskId);
    
    let newCompletedTasks = [...currentLog.completedTasks];
    
    if (isCompleted) {
        newCompletedTasks = newCompletedTasks.filter(id => id !== taskId);
    } else {
        newCompletedTasks.push(taskId);
    }
    
    // Recalculate Score
    const rawScore = newCompletedTasks.reduce((acc, tid) => {
        const task = AMAL_TASKS.find(t => t.id === tid);
        return acc + (task ? task.points : 0);
    }, 0);
    
    // Normalize to 0-100 scale
    const normalizedScore = Math.min(100, Math.round((rawScore / TOTAL_POSSIBLE_SCORE) * 100));

    const updatedLog: DailyAmalLog = {
        ...currentLog,
        completedTasks: newCompletedTasks,
        totalScore: normalizedScore
    };

    const key = `${STORAGE_KEY_PREFIX}${dateStr}`;
    await dbSet(key, updatedLog);
    
    return updatedLog;
};

export const getHistoryRange = async (days: number = 365): Promise<DailyAmalLog[]> => {
    // Optimization: Iterate backwards from today to get recent history
    const logs: DailyAmalLog[] = [];
    const today = new Date();
    
    // Create parallel promises for better performance
    const promises = [];
    
    for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = getLogDateKey(d);
        promises.push(
            dbGet<DailyAmalLog>(`${STORAGE_KEY_PREFIX}${dateStr}`)
                .then(log => log || { date: dateStr, completedTasks: [], totalScore: 0 })
        );
    }
    
    const results = await Promise.all(promises);
    return results.reverse(); // Return chronological order (oldest to newest)
};
