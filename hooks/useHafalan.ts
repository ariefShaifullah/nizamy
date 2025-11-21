import { useState, useEffect } from "react";
import type {
  HafalanState,
  HafalanItem,
  UserSummary,
  HafalanSkillLevel,
} from "../types.ts";
import {
  getAllUsers,
  loadUserData,
  saveUserData,
  createNewUser,
  updateUserProfile,
  deleteUser,
  processItemReview,
  calculateLevel,
  checkBadges,
  checkGamificationSync,
} from "../services/hafalan.service.ts";

const INITIAL_STATE: HafalanState = {
  profile: null,
  items: [],
  gamification: {
    xp: 0,
    level: 1,
    currentStreak: 0,
    lastLoginDate: "",
    badges: [],
    weeklyChallengeProgress: 0,
    weeklyChallengeTarget: 250,
  },
};

export const useHafalan = () => {
  const [state, setState] = useState<HafalanState>(INITIAL_STATE);
  const [usersList, setUsersList] = useState<UserSummary[]>([]);
  const [view, setView] = useState<
    | "user_selection"
    | "create_user"
    | "dashboard"
    | "add_new"
    | "review_session"
  >("user_selection");
  const [loading, setLoading] = useState(true);
  const [activeSessionItem, setActiveSessionItem] =
    useState<HafalanItem | null>(null);
  const [isPracticeMode, setIsPracticeMode] = useState(false);

  // Initial Load
  useEffect(() => {
    const users = getAllUsers();
    setUsersList(users);
    if (users.length === 0) setView("create_user");
    else setView("user_selection");
    setLoading(false);
  }, []);

  // Auto-save
  useEffect(() => {
    if (state.profile && view !== "user_selection" && view !== "create_user") {
      saveUserData(state);
    }
  }, [state, view]);

  const actions = {
    selectUser: (userId: string) => {
      const userData = loadUserData(userId);
      if (userData) {
        // Check streak and handle weekly reset logic
        const updatedGamification = checkGamificationSync(
          userData.gamification
        );

        const updatedState = { ...userData, gamification: updatedGamification };
        setState(updatedState);
        saveUserData(updatedState);
        setView("dashboard");
      }
    },
    createUser: (name: string, level: HafalanSkillLevel, target: number) => {
      const newUserState = createNewUser(name, level, target);
      setState(newUserState);
      setUsersList(getAllUsers());
      setView("dashboard");
      return newUserState;
    },
    updateProfile: (updates: {
      name: string;
      skillLevel: HafalanSkillLevel;
      targetJuz: number;
    }) => {
      if (!state.profile) return;
      const updated = updateUserProfile(state.profile.userId, updates);
      if (updated) setState(updated);
    },
    deleteUser: (userId: string) => {
      deleteUser(userId);
      const list = getAllUsers();
      setUsersList(list);
      if (list.length === 0) setView("create_user");
    },
    logout: () => {
      setState(INITIAL_STATE);
      setUsersList(getAllUsers());
      setView("user_selection");
    },
    addItem: (item: HafalanItem) => {
      // 1. Calculate potential badges with the new item included
      const tempItems = [...state.items, item];
      const tempState = { ...state, items: tempItems };
      const badgesEarned = checkBadges(tempState);

      // 2. Update State
      setState((prev) => ({
        ...prev,
        items: [...prev.items, item],
        gamification: {
          ...prev.gamification,
          badges: [...prev.gamification.badges, ...badgesEarned],
        },
      }));

      setView("dashboard");
      return badgesEarned; // Return badges so UI can trigger modal
    },
    startReview: (item: HafalanItem) => {
      setActiveSessionItem(item);
      setIsPracticeMode(false);
      setView("review_session");
    },
    startPractice: (item: HafalanItem) => {
      setActiveSessionItem(item);
      setIsPracticeMode(true);
      setView("review_session");
    },
    finishPractice: () => {
      setActiveSessionItem(null);
      setIsPracticeMode(false);
      setView("dashboard");
    },
    submitReview: (result: "success" | "fail") => {
      if (!activeSessionItem) return null;
      const { updatedItem, xpGained } = processItemReview(
        activeSessionItem,
        result
      );

      let badgesEarned: string[] = [];

      setState((prev) => {
        const newItems = prev.items.map((i) =>
          i.id === updatedItem.id ? updatedItem : i
        );
        const newXP = prev.gamification.xp + xpGained;
        const newLevel = calculateLevel(newXP);
        // Accumulate XP for the week (Not percentage anymore)
        const newChallengeXP =
          prev.gamification.weeklyChallengeProgress + xpGained;

        const newState = {
          ...prev,
          items: newItems,
          gamification: {
            ...prev.gamification,
            xp: newXP,
            level: newLevel,
            weeklyChallengeProgress: newChallengeXP,
          },
        };

        const earned = checkBadges(newState);
        if (earned.length > 0) {
          newState.gamification.badges = [
            ...newState.gamification.badges,
            ...earned,
          ];
          badgesEarned = earned;
        }
        return newState;
      });

      setView("dashboard");
      setActiveSessionItem(null);
      return { xpGained, badgesEarned };
    },
    setView,
    setState,
  };

  return {
    state,
    usersList,
    view,
    loading,
    activeSessionItem,
    isPracticeMode,
    actions,
  };
};
