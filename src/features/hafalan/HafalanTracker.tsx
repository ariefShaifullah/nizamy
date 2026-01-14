import React, { useState } from "react";
import { useHafalan } from "./hooks/useHafalan.ts";
import { audioService } from "../../services/audio.service.ts";
import { UserSelection } from "./components/UserSelection.tsx";
import { CreateUser } from "./components/CreateUser.tsx";
import { Dashboard } from "./components/Dashboard.tsx";
import { AddItem } from "./components/AddItem.tsx";
import { ReviewSession } from "./components/ReviewSession.tsx";
import { useToast } from "../../components/ui/Toast.tsx";
import type { HafalanSkillLevel } from "../../types.ts";

const HafalanTracker: React.FC = () => {
  const {
    state,
    usersList,
    view,
    loading,
    activeSessionItem,
    isPracticeMode,
    actions,
  } = useHafalan();

  const { showToast } = useToast();

  // Local State for UI Feedback
  const [earnedBadgesQueue, setEarnedBadgesQueue] = useState<string[]>([]);

  // Wrapper Handlers
  const handleCreateUser = (
    name: string,
    level: HafalanSkillLevel,
    target: number
  ) => {
    actions.createUser(name, level, target);
    showToast(`Profil ${name} berhasil dibuat!`, "success");
  };

  const handleStartReview = (item: any) => {
    audioService.playClick();
    actions.startReview(item);
  };

  const handleStartPractice = (item: any) => {
    audioService.playClick();
    actions.startPractice(item);
  };

  const handleSubmitReview = (result: "success" | "fail") => {
    const res = actions.submitReview(result);

    if (result === "success") {
      audioService.playSuccessMajor();
      showToast(`Murajaah Sukses! +${res?.xpGained} XP`, "success");
    } else {
      audioService.playFail();
      showToast("Tetap Semangat! +1 XP", "info");
    }

    if (res?.badgesEarned.length) {
      setEarnedBadgesQueue(res.badgesEarned);
    }
  };

  if (loading)
    return (
      <div className="text-center py-12 text-indigo-600">Memuat data...</div>
    );

  return (
    <>
      {view === "user_selection" && (
        <UserSelection
          users={usersList}
          onSelect={actions.selectUser}
          onDelete={actions.deleteUser}
          onCreateClick={() => actions.setView("create_user")}
        />
      )}

      {view === "create_user" && (
        <CreateUser
          hasUsers={usersList.length > 0}
          onBack={() => actions.setView("user_selection")}
          onCreate={handleCreateUser}
        />
      )}

      {view === "dashboard" && state.profile && (
        <Dashboard
          state={state}
          onAddClick={() => actions.setView("add_new")}
          onStartReview={handleStartReview}
          onStartPractice={handleStartPractice}
          onUpdateProfile={actions.updateProfile}
          onLogout={actions.logout}
          earnedBadgesQueue={earnedBadgesQueue}
          onClearBadges={() => setEarnedBadgesQueue([])}
        />
      )}

      {view === "add_new" && state.profile && (
        <AddItem
          state={state}
          onBack={() => actions.setView("dashboard")}
          onAddItem={actions.addItem}
          onBadgeEarned={(badges) => setEarnedBadgesQueue(badges)}
        />
      )}

      {view === "review_session" && activeSessionItem && (
        <ReviewSession
          item={activeSessionItem}
          isPractice={isPracticeMode}
          onExit={() => actions.setView("dashboard")}
          onCompletePractice={actions.finishPractice}
          onSubmitReview={handleSubmitReview}
        />
      )}
    </>
  );
};

export default HafalanTracker;
