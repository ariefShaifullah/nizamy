import React, { useState, useEffect } from "react";
import { useHafalan } from "../../hooks/useHafalan.ts";
import { audioService } from "../../services/audio.service.ts";
import { UserSelection } from "./UserSelection.tsx";
import { CreateUser } from "./CreateUser.tsx";
import { Dashboard } from "./Dashboard.tsx";
import { AddItem } from "./AddItem.tsx";
import { ReviewSession } from "./ReviewSession.tsx";

// --- TOAST COMPONENT ---
const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "info";
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-xl z-50 animate-fade-in-up flex items-center gap-2 ${
        type === "success"
          ? "bg-emerald-600 text-white"
          : "bg-slate-800 text-white"
      }`}
    >
      <span>{type === "success" ? "✨" : "ℹ️"}</span>
      <span className="font-bold text-sm">{message}</span>
    </div>
  );
};

export const HafalanTracker: React.FC = () => {
  const {
    state,
    usersList,
    view,
    loading,
    activeSessionItem,
    isPracticeMode,
    actions,
  } = useHafalan();

  // Local State for UI Feedback
  const [earnedBadgesQueue, setEarnedBadgesQueue] = useState<string[]>([]);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "info";
  } | null>(null);

  const showToast = (msg: string, type: "success" | "info" = "success") => {
    setToast({ msg, type });
  };

  // Wrapper Handlers
  const handleCreateUser = (name: string, level: any, target: number) => {
    actions.createUser(name, level, target);
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
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

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
          onShowToast={showToast}
          earnedBadgesQueue={earnedBadgesQueue}
          onClearBadges={() => setEarnedBadgesQueue([])}
        />
      )}

      {view === "add_new" && state.profile && (
        <AddItem
          state={state}
          onBack={() => actions.setView("dashboard")}
          onAddItem={actions.addItem}
          onSuccess={(msg) => showToast(msg, "success")}
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
