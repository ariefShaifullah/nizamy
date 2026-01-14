
import { useState, useEffect, useMemo } from 'react';
import type { HafalanState, HafalanItem, HafalanSkillLevel } from '../../../types.ts';
import { 
    loadUserData, saveUserData, createNewUser, updateUserProfile, 
    checkBadges, checkGamificationSync, processItemReview, calculateLevel
} from '../logic/hafalan.service.ts';
import { useUserList } from './useUserList.ts';

const INITIAL_STATE: HafalanState = {
    profile: null,
    items: [],
    gamification: {
        xp: 0, level: 1, currentStreak: 0, lastLoginDate: '', badges: [], weeklyChallengeProgress: 0, weeklyChallengeTarget: 250
    }
};

export const useHafalan = () => {
    const { usersList, isLoading: isUserListLoading, refreshUsers, handleDeleteUser } = useUserList();
    
    const [state, setState] = useState<HafalanState>(INITIAL_STATE);
    const [view, setView] = useState<'user_selection' | 'create_user' | 'dashboard' | 'add_new' | 'review_session'>('user_selection');
    const [loading, setLoading] = useState(true);
    const [activeSessionItem, setActiveSessionItem] = useState<HafalanItem | null>(null);
    const [isPracticeMode, setIsPracticeMode] = useState(false);

    // Initialize view based on users existence (Wait for user list to load first)
    useEffect(() => {
        if (!isUserListLoading) {
            if (usersList.length === 0) {
                setView('create_user');
                setLoading(false);
            } else if (!state.profile) {
                // If users exist but no profile loaded, show selection
                setView('user_selection');
                setLoading(false);
            } else {
                setLoading(false);
            }
        }
    }, [usersList.length, state.profile, isUserListLoading]);

    // Auto-save (Fire and Forget in background)
    useEffect(() => {
        if (state.profile && view !== 'user_selection' && view !== 'create_user') {
            saveUserData(state).catch(err => console.error("Failed to save data in background", err));
        }
    }, [state, view]);

    const actions = useMemo(() => ({
        selectUser: async (userId: string) => {
            setLoading(true);
            const userData = await loadUserData(userId);
            if (userData) {
                // Sync Gamification (Streak, Weekly Reset)
                const updatedGamification = checkGamificationSync(userData.gamification);
                const updatedState = { ...userData, gamification: updatedGamification };
                
                setState(updatedState);
                await saveUserData(updatedState); // Wait for sync
                setView('dashboard');
            }
            setLoading(false);
        },
        createUser: async (name: string, level: HafalanSkillLevel, target: number) => {
            setLoading(true);
            const newUserState = await createNewUser(name, level, target);
            setState(newUserState);
            await refreshUsers(); // Update list in useUserList
            setView('dashboard');
            setLoading(false);
            return newUserState;
        },
        updateProfile: async (updates: { name: string, skillLevel: HafalanSkillLevel, targetJuz: number }) => {
            // Optimistic Update
            setState(prev => {
               if (!prev.profile) return prev;
               // We can't use the sync service function directly for optimistic update, 
               // so we just update the local state first.
               // The background useEffect will handle persistence.
               const updatedProfile = { ...prev.profile, ...updates, linesPerDay: updates.skillLevel === "beginner" ? 3 : updates.skillLevel === "intermediate" ? 10 : 20 };
               return { ...prev, profile: updatedProfile };
            });
            
            // Trigger actual DB update logic which handles name changes in index
            if (state.profile) {
                await updateUserProfile(state.profile.userId, updates);
                if (updates.name !== state.profile.name) {
                    refreshUsers(); 
                }
            }
        },
        deleteUser: async (userId: string) => {
            await handleDeleteUser(userId);
            // logic to handle view switch is in useEffect above
        },
        logout: () => {
            setState(INITIAL_STATE);
            refreshUsers();
            setView('user_selection');
        },
        addItem: (item: HafalanItem) => {
            let badgesEarned: string[] = [];
            setState(prev => {
                const tempItems = [...prev.items, item];
                const tempState = { ...prev, items: tempItems };
                badgesEarned = checkBadges(tempState);
                
                return { 
                    ...prev, 
                    items: tempItems,
                    gamification: {
                        ...prev.gamification,
                        badges: [...prev.gamification.badges, ...badgesEarned]
                    }
                };
            });
            
            setView('dashboard');
            return badgesEarned;
        },
        startReview: (item: HafalanItem) => {
            setActiveSessionItem(item);
            setIsPracticeMode(false);
            setView('review_session');
        },
        startPractice: (item: HafalanItem) => {
            setActiveSessionItem(item);
            setIsPracticeMode(true);
            setView('review_session');
        },
        finishPractice: () => {
            setActiveSessionItem(null);
            setIsPracticeMode(false);
            setView('dashboard');
        },
        // Internal implementation needed to capture current state in closure
        _submitReviewImplementation: (item: HafalanItem, result: 'success' | 'fail') => {
            const { updatedItem, xpGained } = processItemReview(item, result);
            let badgesEarned: string[] = [];
            
            setState(prev => {
                const newItems = prev.items.map(i => i.id === updatedItem.id ? updatedItem : i);
                const newXP = prev.gamification.xp + xpGained;
                const newLevel = calculateLevel(newXP);
                const newChallengeXP = prev.gamification.weeklyChallengeProgress + xpGained;
                
                const newState = {
                    ...prev,
                    items: newItems,
                    gamification: { ...prev.gamification, xp: newXP, level: newLevel, weeklyChallengeProgress: newChallengeXP }
                };
                
                const earned = checkBadges(newState);
                if (earned.length > 0) {
                    newState.gamification.badges = [...newState.gamification.badges, ...earned];
                    badgesEarned = earned;
                }
                return newState;
            });

            setView('dashboard');
            setActiveSessionItem(null);
            return { xpGained, badgesEarned };
        },
        setView,
        setState
    }), [refreshUsers, handleDeleteUser, state.profile]); 

    // Stable Actions wrapper
    const stableActions = useMemo(() => ({
        ...actions,
        submitReview: (result: 'success' | 'fail') => {
             if (!activeSessionItem) return null;
             return actions._submitReviewImplementation(activeSessionItem, result);
        }
    }), [actions, activeSessionItem]);

    return { state, usersList, view, loading, activeSessionItem, isPracticeMode, actions: stableActions };
};
