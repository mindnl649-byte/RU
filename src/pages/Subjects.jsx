import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CHECKLIST, STATUS_OPTIONS } from "../data/subjects.js";
import { getEnrichedSubjects } from "../utils/calculations.js";
import { SemesterManager } from "../components/SemesterManager.jsx";
import { SubjectCard } from "../components/SubjectCard.jsx";
import { SubjectEditDrawer } from "../components/SubjectEditDrawer.jsx";
import { getActiveSemester } from "../utils/semesters.js";

const FILTERS = ["all", "urgent", "upcoming", "missingExam", "notStarted"];

export function Subjects({
  studyState,
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
}) {
  const { t } = useTranslation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [viewMode, setViewMode] = useState("cards"); // "cards" or "checklist"
  const [filter, setFilter] = useState("all");

  // Support both old and new data structures
  const useNewSystem = studyState?.semesters && Object.keys(studyState.semesters).length > 0;

  // Get subjects based on system version
  const getSubjects = () => {
    if (useNewSystem && getActiveSubjects) {
      return getActiveSubjects();
    }
    // Fallback to old system
    return getEnrichedSubjects(studyState);
  };

  const subjects = getSubjects();
  const examSummary = getExamSummary(subjects);
  const filteredSubjects = subjects.filter((subject) => matchesSubjectFilter(subject, filter));
  const activeSemester = studyState?.semesters
    ? getActiveSemester(studyState.semesters, studyState.activeSemesterId)
    : null;

  // Handler functions for new system
  const handleAddSubject = () => {
    setEditingSubject(null);
    setIsDrawerOpen(true);
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setIsDrawerOpen(true);
  };

  const handleSaveSubject = (subjectData) => {
    if (useNewSystem && addSubjectToSemester) {
      if (editingSubject) {
        updateSubjectInSemester(editingSubject.id, subjectData);
      } else {
        addSubjectToSemester(subjectData);
      }
    } else {
      // Legacy system
      if (editingSubject) {
        editSubject(editingSubject.code, subjectData);
      } else {
        addSubject(subjectData);
      }
    }
    setIsDrawerOpen(false);
    setEditingSubject(null);
  };

  const handleDeleteSubject = (subjectId) => {
    if (useNewSystem && deleteSubjectFromSemester) {
      deleteSubjectFromSemester(subjectId);
    } else {
      // Legacy system - find subject by ID
      const subject = subjects.find((s) => s.code === subjectId || s.id === subjectId);
      if (subject) {
        deleteSubject(subject.code || subject.id);
      }
    }
  };

  const handleDuplicateSubject = (subject) => {
    if (useNewSystem && duplicateSubject) {
      duplicateSubject(subject.id);
    }
  };

  // Legacy checklist toggle
  const toggleChecklist = (subject, item) => {
    updateSubject(subject.code, {
      checklist: {
        ...subject.checklist,
        [item]: !subject.checklist?.[item],
      },
    });
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">{t("subjects.eyebrow")}</p>
        <h2 className="page-title">{t("subjects.title")}</h2>
      </header>

      {/* Semester Manager */}
      {useNewSystem && studyState?.semesters && (
        <div className="rounded-2xl bg-gradient-to-br from-ink-800/5 to-amber-500/5 border border-ink-900/10 p-6">
          <SemesterManager
            semesters={studyState.semesters}
            activeSemesterId={studyState.activeSemesterId}
            onCreateSemester={createSemester}
            onDeleteSemester={deleteSemester}
            onSwitchSemester={switchSemester}
          />
          <SemesterExamSummary summary={examSummary} t={t} />
        </div>
      )}

      {/* View Mode Toggle & Add Subject */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("cards")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              viewMode === "cards"
                ? "bg-ink-800 text-paper-100 shadow-lifted"
                : "border border-ink-900/20 bg-paper-50 text-ink-700 hover:bg-paper-100"
            }`}
          >
            {t("subjects.gridView")}
          </button>
          <button
            onClick={() => setViewMode("checklist")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              viewMode === "checklist"
                ? "bg-ink-800 text-paper-100 shadow-lifted"
                : "border border-ink-900/20 bg-paper-50 text-ink-700 hover:bg-paper-100"
            }`}
          >
            {t("subjects.checklist")}
          </button>
        </div>
        <button onClick={handleAddSubject} className="btn-primary rounded-lg px-4 py-2 text-sm">
          {t("subjects.addSubject")}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((filterId) => (
          <button
            key={filterId}
            onClick={() => setFilter(filterId)}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition ${
              filter === filterId
                ? "bg-ink-800 text-paper-100 shadow-lifted"
                : "border border-ink-900/10 bg-paper-50 text-ink-600 hover:bg-paper-100"
            }`}
          >
            {t(`subjects.filters.${filterId}`)}
          </button>
        ))}
      </div>

      {/* Grid View */}
      {viewMode === "cards" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredSubjects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-12"
              >
                <p className="text-ink-500">
                  {subjects.length === 0 ? t("subjects.noSubjects") : t("subjects.noFilteredSubjects")}
                </p>
              </motion.div>
            ) : (
              filteredSubjects.map((subject) => (
                <SubjectCard
                  key={subject.id || subject.code}
                  subject={subject}
                  onEdit={handleEditSubject}
                  onDuplicate={handleDuplicateSubject}
                  onDelete={handleDeleteSubject}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Checklist View - Legacy */}
      {viewMode === "checklist" && !useNewSystem && (
        <div className="space-y-4">
          {filteredSubjects.map((subject) => (
            <motion.article
              key={subject.code}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs text-ink-500">{subject.code}</p>
                  <h3 className="mt-1 font-serif text-xl">{subject.name}</h3>
                  <p className="mt-2 text-sm text-ink-500">
                    {subject.semester} - {subject.credits} credits - {subject.difficulty}
                  </p>
                </div>
                <span className="rounded-full bg-paper-200 px-3 py-1 text-xs font-semibold text-ink-600">
                  {subject.progressPercentage}%
                </span>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-paper-300">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: `${subject.progressPercentage}%` }}
                />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Status
                  <select
                    className="field normal-case tracking-normal"
                    value={subject.status}
                    onChange={(event) => updateSubject(subject.code, { status: event.target.value })}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Videos watched
                  <input
                    className="field"
                    min="0"
                    max={subject.totalVideos}
                    type="number"
                    value={subject.videosWatched || 0}
                    onChange={(event) =>
                      updateSubject(subject.code, { videosWatched: Number(event.target.value) })
                    }
                  />
                </label>
              </div>

              <div className="mt-4 grid gap-2">
                {CHECKLIST.map((item) => (
                  <label key={item} className="flex cursor-pointer items-center gap-3 rounded-lg bg-paper-50 p-3 text-sm">
                    <input
                      checked={Boolean(subject.checklist?.[item])}
                      className="h-4 w-4 accent-amber-500"
                      type="checkbox"
                      onChange={() => toggleChecklist(subject, item)}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>

              <textarea
                className="field mt-4 min-h-24 resize-none"
                placeholder="Notes, exam warnings, concepts to revise..."
                value={subject.notes || ""}
                onChange={(event) => updateSubject(subject.code, { notes: event.target.value })}
              />
            </motion.article>
          ))}
        </div>
      )}

      {/* Checklist View - New System */}
      {viewMode === "checklist" && useNewSystem && subjects.length > 0 && (
        <div className="space-y-4">
          {filteredSubjects.map((subject) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-mono text-xs text-ink-500">{subject.code}</p>
                  <h3 className="mt-1 font-serif text-xl">{subject.title}</h3>
                  <p className="mt-2 text-sm text-ink-500">
                    {subject.credits} credits - {subject.difficulty}
                  </p>
                </div>
                <span className="rounded-full bg-paper-200 px-3 py-1 text-xs font-semibold text-ink-600">
                  {subject.progress}%
                </span>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-paper-300">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: `${subject.progress}%` }}
                />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Status
                  <select
                    className="field normal-case tracking-normal"
                    value={subject.status}
                    onChange={(event) =>
                      updateSubjectInSemester(subject.id, { status: event.target.value })
                    }
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Videos watched
                  <input
                    className="field"
                    min="0"
                    max={subject.totalVideos}
                    type="number"
                    value={subject.videosWatched || 0}
                    onChange={(event) =>
                      updateSubjectInSemester(subject.id, { videosWatched: Number(event.target.value) })
                    }
                  />
                </label>
              </div>

              <div className="mt-4 grid gap-2">
                {CHECKLIST.map((item) => (
                  <label key={item} className="flex cursor-pointer items-center gap-3 rounded-lg bg-paper-50 p-3 text-sm">
                    <input
                      checked={Boolean(subject.checklist?.[item])}
                      className="h-4 w-4 accent-amber-500"
                      type="checkbox"
                      onChange={() => {
                        const updated = { ...subject.checklist, [item]: !subject.checklist?.[item] };
                        updateSubjectInSemester(subject.id, { checklist: updated });
                      }}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>

              <textarea
                className="field mt-4 min-h-24 resize-none"
                placeholder="Notes, exam warnings, concepts to revise..."
                value={subject.notes || ""}
                onChange={(event) => updateSubjectInSemester(subject.id, { notes: event.target.value })}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Subject Edit Drawer */}
      <SubjectEditDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingSubject(null);
        }}
        subject={editingSubject}
        onSave={handleSaveSubject}
      />
    </div>
  );
}

function SemesterExamSummary({ summary, t }) {
  const next = summary.nextExam;

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-3">
      <SummaryMetric label={t("subjects.examSummary.total")} value={summary.totalExams} />
      <SummaryMetric
        label={t("subjects.examSummary.next")}
        value={next ? t("subjects.examSummary.daysLeft", { count: next.daysUntil }) : t("subjects.examSummary.none")}
        detail={next ? `${next.subject.code} - ${next.subject.title || next.subject.name}` : undefined}
        tone={next?.daysUntil <= 7 ? "urgent" : "normal"}
      />
      <SummaryMetric
        label={t("subjects.examSummary.missing")}
        value={summary.missingExamCount}
        detail={summary.missingExamCount > 0 ? t("subjects.examSummary.missingHint") : t("subjects.examSummary.complete")}
        tone={summary.missingExamCount > 0 ? "warning" : "normal"}
      />
    </div>
  );
}

function SummaryMetric({ detail, label, tone = "normal", value }) {
  const toneClass = {
    normal: "border-ink-900/10 bg-paper-50 text-ink-900",
    urgent: "border-red-500/20 bg-red-500/5 text-red-700",
    warning: "border-amber-500/25 bg-amber-500/10 text-amber-700",
  }[tone];

  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] opacity-75">{label}</p>
      <p className="mt-2 font-serif text-2xl">{value}</p>
      {detail && <p className="mt-1 text-xs text-ink-500">{detail}</p>}
    </div>
  );
}

function getExamSummary(subjects) {
  const today = getToday();
  const activeSubjects = subjects.filter((subject) => !isCompleted(subject));
  const upcomingExams = activeSubjects
    .flatMap((subject) =>
      (subject.exams || [])
        .filter((exam) => exam?.date)
        .map((exam) => {
          const examDate = new Date(exam.date);
          examDate.setHours(0, 0, 0, 0);
          return {
            exam,
            subject,
            daysUntil: Math.ceil((examDate - today) / (1000 * 60 * 60 * 24)),
          };
        })
    )
    .filter((item) => item.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil || (a.exam.start || "").localeCompare(b.exam.start || ""));

  return {
    missingExamCount: activeSubjects.filter((subject) => !getUpcomingExam(subject)).length,
    nextExam: upcomingExams[0] || null,
    totalExams: upcomingExams.length,
  };
}

function matchesSubjectFilter(subject, filter) {
  const exam = getUpcomingExam(subject);

  if (filter === "urgent") return Boolean(exam && exam.daysUntil <= 7);
  if (filter === "upcoming") return Boolean(exam && exam.daysUntil <= 30);
  if (filter === "missingExam") return !isCompleted(subject) && !exam;
  if (filter === "notStarted") return subject.status === "not started";
  return true;
}

function getUpcomingExam(subject) {
  const today = getToday();
  return (subject.exams || [])
    .filter((exam) => exam?.date)
    .map((exam) => {
      const examDate = new Date(exam.date);
      examDate.setHours(0, 0, 0, 0);
      return {
        exam,
        daysUntil: Math.ceil((examDate - today) / (1000 * 60 * 60 * 24)),
      };
    })
    .filter(({ daysUntil }) => daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil || (a.exam.start || "").localeCompare(b.exam.start || ""))[0] || null;
}

function getToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function isCompleted(subject) {
  return subject.status === "passed" || subject.status === "completed";
}
