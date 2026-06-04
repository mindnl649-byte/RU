import { motion } from "framer-motion";
import { Edit2, Copy, Trash2, Clock, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getNextClass, getDifficultyColor } from "../utils/subjectHelpers.js";

export function SubjectCard({ subject, onEdit, onDuplicate, onDelete }) {
  const { t } = useTranslation();
  const nextClass = getNextClass(subject.classDays);
  const upcomingExam = getUpcomingExam(subject);
  const difficultyColor = getDifficultyColor(subject.difficulty);
  const urgency = getExamUrgency(upcomingExam);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      className={`group rounded-xl border bg-paper-50 hover:shadow-lifted transition p-4 h-full flex flex-col ${urgency.cardClass}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-mono text-xs font-semibold text-amber-600">{subject.code}</p>
          <h3 className="mt-1 font-serif text-lg text-ink-900 leading-tight">{subject.title}</h3>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${difficultyColor}`}>
          {subject.difficulty}
        </span>
      </div>

      {/* Credits & Status & Written Exam */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="rounded-lg bg-ink-900/5 px-2 py-1 text-xs font-medium text-ink-600">
          {subject.credits} credits
        </span>
        <span className={`rounded-lg px-2 py-1 text-xs font-medium ${
          subject.status === "passed" || subject.status === "completed"
            ? "bg-green-500/10 text-green-700"
            : subject.status === "reviewing" || subject.status === "practicing exams"
            ? "bg-blue-500/10 text-blue-700"
            : "bg-amber-500/10 text-amber-700"
        }`}>
          {subject.status}
        </span>
        {subject.isWrittenExam && (
          <span className="rounded-lg bg-red-500/10 px-2 py-1 text-xs font-medium text-red-700">
            {t("subjectCard.writtenExam")}
          </span>
        )}
        {upcomingExam ? (
          <span className={`rounded-lg px-2 py-1 text-xs font-semibold ${urgency.badgeClass}`}>
            {upcomingExam.daysUntil === 0
              ? t("subjectCard.examToday")
              : t("subjectCard.daysUntilExam", { count: upcomingExam.daysUntil })}
          </span>
        ) : (
          !isCompleted(subject) && (
            <span className="rounded-lg bg-ink-900/5 px-2 py-1 text-xs font-semibold text-ink-500">
              {t("subjectCard.noExamDate")}
            </span>
          )
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-medium text-ink-600">{t("subjectCard.progress")}</p>
          <p className="text-xs font-semibold text-ink-700">{subject.progress}%</p>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-ink-900/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all"
            style={{ width: `${subject.progress}%` }}
          />
        </div>
      </div>

      {/* Next Class & Exam */}
      <div className="flex-1 mb-4 space-y-2">
        {nextClass && (
          <div className="flex items-start gap-2 rounded-lg bg-ink-900/5 p-2">
            <Clock className="h-4 w-4 mt-0.5 text-amber-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-ink-700">{t("subjectCard.nextClass")}</p>
              <p className="text-xs text-ink-600 truncate">
                {nextClass.day} at {nextClass.start}
                {nextClass.room && ` • ${nextClass.room}`}
              </p>
            </div>
          </div>
        )}
        {upcomingExam && (
          <div className="flex items-start gap-2 rounded-lg bg-red-500/5 p-2">
            <BookOpen className="h-4 w-4 mt-0.5 text-red-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-ink-700">
                {t("subjectCard.nextExam", { examType: upcomingExam.exam.type })}
              </p>
              <p className="text-xs text-ink-600 truncate">
                {new Date(upcomingExam.exam.date).toLocaleDateString()} at {upcomingExam.exam.start}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Lecturer & Room */}
      {(subject.lecturer || subject.room) && (
        <div className="mb-3 text-xs text-ink-600 space-y-0.5 border-t border-ink-900/10 pt-3">
          {subject.lecturer && <p><span className="font-medium">{t("subjectCard.lecturer")}</span> {subject.lecturer}</p>}
          {subject.room && <p><span className="font-medium">{t("subjectCard.room")}</span> {subject.room}</p>}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 opacity-100 transition md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
        <button
          onClick={() => onEdit(subject)}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-500/35 transition"
          aria-label={`Edit ${subject.code}`}
        >
          <Edit2 className="h-3.5 w-3.5" />
          {t("subjectCard.edit")}
        </button>
        <button
          onClick={() => onDuplicate(subject)}
          className="flex items-center justify-center rounded-lg bg-ink-900/5 px-3 py-2 text-xs font-medium text-ink-600 hover:bg-ink-900/10 focus:outline-none focus:ring-2 focus:ring-ink-900/20 transition"
          title={t("subjectCard.duplicate")}
          aria-label={`Duplicate ${subject.code}`}
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(subject.id)}
          className="flex items-center justify-center rounded-lg bg-red-500/5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500/25 transition"
          title={t("subjectCard.delete")}
          aria-label={`Delete ${subject.code}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

function getUpcomingExam(subject) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

function getExamUrgency(upcomingExam) {
  if (!upcomingExam) {
    return {
      badgeClass: "",
      cardClass: "border-ink-900/10 hover:border-ink-900/20",
    };
  }

  if (upcomingExam.daysUntil <= 7) {
    return {
      badgeClass: "bg-red-500/10 text-red-700",
      cardClass: "border-red-500/25 hover:border-red-500/40",
    };
  }

  if (upcomingExam.daysUntil <= 30) {
    return {
      badgeClass: "bg-amber-500/10 text-amber-700",
      cardClass: "border-amber-500/25 hover:border-amber-500/50",
    };
  }

  return {
    badgeClass: "bg-green-500/10 text-green-700",
    cardClass: "border-ink-900/10 hover:border-ink-900/20",
  };
}

function isCompleted(subject) {
  return subject.status === "passed" || subject.status === "completed";
}
