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

export function App() {
  const { t } = useTranslation();
  const [activePage, setActivePage] = useState("today");
  const [localOnly, setLocalOnly] = useState(() => localStorage.getItem("studypath.local-only") === "true");
  const { authLoading, logout, user } = useAuth();
  const {
    studyState,
    syncStatus,
    updateStudyState,
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
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-500">
            {user ? `${t("common.signInAs")} ${user.isAnonymous ? t("common.guest") : user.email || user.displayName}` : t("common.localMode")}
          </p>
          {user && (
            <button className="btn-ghost" onClick={logout}>
              {t("common.signOut")}
            </button>
          )}
          {!user && localOnly && (
            <button
              className="btn-ghost"
              onClick={() => {
                localStorage.removeItem("studypath.local-only");
                setLocalOnly(false);
              }}
            >
              {t("common.enableCloudSync")}
            </button>
          )}
        </div>
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
