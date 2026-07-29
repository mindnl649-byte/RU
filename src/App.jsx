import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthPanel } from "./components/AuthPanel.jsx";
import { Shell } from "./components/Shell.jsx";
import { useStudyState } from "./hooks/useStudyState.js";
import { useAuth } from "./providers/AuthProvider.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { Flashcards } from "./pages/Flashcards.jsx";
import { Roadmap } from "./pages/Roadmap.jsx";
import { Subjects } from "./pages/Subjects.jsx";
import { Timer } from "./pages/Timer.jsx";
import { Calendar } from "./pages/Calendar.jsx";
import { PrepPlan } from "./pages/PrepPlan.jsx";

export function App() {
  const { t } = useTranslation();
  const [activePage, setActivePage] = useState("today");
  const [localOnly, setLocalOnly] = useState(() => localStorage.getItem("studypath.local-only") === "true");
  const { authLoading, logout, user } = useAuth();
  const {
    studyState,
    syncStatus,
    syncError,
    lastSyncedAt,
    updateStudyState,
    saveCloudNow,
    loadCloudNow,
    updateSubject,
    addSubject,
    editSubject,
    deleteSubject,
    // New semester functions
    createSemester,
    switchSemester,
    deleteSemester,
    addSubjectToSemester,
    updateSubjectInSemester,
    deleteSubjectFromSemester,
    duplicateSubject,
    getActiveSubjects,
  } = useStudyState(user);

  const page = useMemo(() => {
    const shared = {
      studyState,
      updateStudyState,
      updateSubject,
      addSubject,
      editSubject,
      deleteSubject,
      // New functions
      createSemester,
      switchSemester,
      deleteSemester,
      addSubjectToSemester,
      updateSubjectInSemester,
      deleteSubjectFromSemester,
      duplicateSubject,
      getActiveSubjects,
    };
    if (activePage === "prep") return <PrepPlan {...shared} />;
    if (activePage === "subjects") return <Subjects {...shared} />;
    if (activePage === "calendar") return <Calendar {...shared} />;
    if (activePage === "roadmap") return <Roadmap {...shared} />;
    if (activePage === "timer") return <Timer {...shared} />;
    if (activePage === "cards") return <Flashcards {...shared} />;
    return <Dashboard {...shared} />;
  }, [
    activePage,
    studyState,
    updateStudyState,
    updateSubject,
    addSubject,
    editSubject,
    deleteSubject,
    createSemester,
    switchSemester,
    deleteSemester,
    addSubjectToSemester,
    updateSubjectInSemester,
    deleteSubjectFromSemester,
    duplicateSubject,
    getActiveSubjects,
  ]);

  if (authLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper-100 text-ink-900">
        <div className="text-center">
          <p className="font-serif text-3xl">{t("brand.title")}</p>
          <p className="mt-2 text-sm text-ink-500">{t("common.loading_study_system")}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Shell activePage={activePage} setActivePage={setActivePage} syncStatus={syncStatus} user={user}>
        <SyncBar
          lastSyncedAt={lastSyncedAt}
          loadCloudNow={loadCloudNow}
          localOnly={localOnly}
          logout={logout}
          saveCloudNow={saveCloudNow}
          setLocalOnly={setLocalOnly}
          syncError={syncError}
          syncStatus={syncStatus}
          t={t}
          user={user}
        />
        {page}
      </Shell>
      {!localOnly && (
        <AuthPanel
          onUseLocal={() => {
            localStorage.setItem("studypath.local-only", "true");
            setLocalOnly(true);
          }}
        />
      )}
    </>
  );
}

function SyncBar({
  lastSyncedAt,
  loadCloudNow,
  localOnly,
  logout,
  saveCloudNow,
  setLocalOnly,
  syncError,
  syncStatus,
  t,
  user,
}) {
  const syncLabel = user
    ? `${t("common.signInAs")} ${user.isAnonymous ? t("common.guest") : user.email || user.displayName}`
    : t("common.localMode");
  const lastSyncedLabel = lastSyncedAt
    ? `Last sync ${new Date(lastSyncedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : "Not synced yet";

  return (
    <div className="mb-5 rounded-2xl border border-ink-900/10 bg-paper-50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink-700">{syncLabel}</p>
          <p className="mt-0.5 text-xs text-ink-500">
            Cloud status: <span className="font-semibold">{syncStatus}</span>
            {user && ` - ${lastSyncedLabel}`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {user && (
            <>
              <button className="btn-secondary rounded-lg px-3 py-2 text-xs" onClick={loadCloudNow}>
                Load cloud
              </button>
              <button className="btn-primary rounded-lg px-3 py-2 text-xs" onClick={saveCloudNow}>
                Sync now
              </button>
              <button className="btn-ghost rounded-lg px-3 py-2 text-xs" onClick={logout}>
                {t("common.signOut")}
              </button>
            </>
          )}
          {!user && localOnly && (
            <button
              className="btn-ghost rounded-lg px-3 py-2 text-xs"
              onClick={() => {
                localStorage.removeItem("studypath.local-only");
                setLocalOnly(false);
              }}
            >
              {t("common.enableCloudSync")}
            </button>
          )}
        </div>
      </div>

      {syncError && (
        <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-800">
          Sync problem: {syncError}
        </p>
      )}
    </div>
  );
}
