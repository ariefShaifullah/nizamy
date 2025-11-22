import { useState, useEffect, useMemo } from "react";
import type { HafalanState, HafalanItem, HafalanSkillLevel } from "../types.ts";
import {
  loadUserData,
  saveUserData,
  createNewUser,
  updateUserProfile,
  checkBadges,
  checkGamificationSync,
  processItemReview,
  calculateLevel,
} from "../services/hafalan.service.ts";
import { useUserList } from "./useUserList.ts";

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
  const { usersList, refreshUsers, handleDeleteUser } = useUserList();

  const [state, setState] = useState<HafalanState>(INITIAL_STATE);
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

  // Initialize view based on users existence
  useEffect(() => {
    if (usersList.length === 0) {
      setView("create_user");
    } else if (!state.profile) {
      // If users exist but no profile loaded, show selection
      setView("user_selection");
    }
    setLoading(false);
  }, [usersList.length, state.profile]);

  // Auto-save
  useEffect(() => {
    if (state.profile && view !== "user_selection" && view !== "create_user") {
      saveUserData(state);
    }
  }, [state, view]);

  const actions = useMemo(
    () => ({
      selectUser: (userId: string) => {
        const userData = loadUserData(userId);
        if (userData) {
          // Sync Gamification (Streak, Weekly Reset)
          const updatedGamification = checkGamificationSync(
            userData.gamification
          );
          const updatedState = {
            ...userData,
            gamification: updatedGamification,
          };

          setState(updatedState);
          saveUserData(updatedState);
          setView("dashboard");
        }
      },
      createUser: (name: string, level: HafalanSkillLevel, target: number) => {
        const newUserState = createNewUser(name, level, target);
        setState(newUserState);
        refreshUsers(); // Update list in useUserList
        setView("dashboard");
        return newUserState;
      },
      updateProfile: (updates: {
        name: string;
        skillLevel: HafalanSkillLevel;
        targetJuz: number;
      }) => {
        setState((prev) => {
          if (!prev.profile) return prev;
          const updated = updateUserProfile(prev.profile.userId, updates);
          if (updated) refreshUsers(); // Name might have changed
          return updated || prev;
        });
      },
      deleteUser: (userId: string) => {
        handleDeleteUser(userId);
        // logic to handle view switch is in useEffect above
      },
      logout: () => {
        setState(INITIAL_STATE);
        refreshUsers();
        setView("user_selection");
      },
      addItem: (item: HafalanItem) => {
        let badgesEarned: string[] = [];
        setState((prev) => {
          const tempItems = [...prev.items, item];
          const tempState = { ...prev, items: tempItems };
          badgesEarned = checkBadges(tempState);

          return {
            ...prev,
            items: tempItems,
            gamification: {
              ...prev.gamification,
              badges: [...prev.gamification.badges, ...badgesEarned],
            },
          };
        });

        setView("dashboard");
        return badgesEarned;
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
      // Internal implementation needed to capture current state in closure
      _submitReviewImplementation: (
        item: HafalanItem,
        result: "success" | "fail"
      ) => {
        const { updatedItem, xpGained } = processItemReview(item, result);
        let badgesEarned: string[] = [];

        setState((prev) => {
          const newItems = prev.items.map((i) =>
            i.id === updatedItem.id ? updatedItem : i
          );
          const newXP = prev.gamification.xp + xpGained;
          const newLevel = calculateLevel(newXP);
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
    }),
    [refreshUsers, handleDeleteUser]
  );

  // Stable Actions wrapper
  const stableActions = useMemo(
    () => ({
      ...actions,
      submitReview: (result: "success" | "fail") => {
        if (!activeSessionItem) return null;
        return actions._submitReviewImplementation(activeSessionItem, result);
      },
    }),
    [actions, activeSessionItem]
  );

  return {
    state,
    usersList,
    view,
    loading,
    activeSessionItem,
    isPracticeMode,
    actions: stableActions,
  };
};
