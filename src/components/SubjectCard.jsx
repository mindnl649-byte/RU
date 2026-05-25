import { motion } from "framer-motion";
import { Edit2, Copy, Trash2, Clock, BookOpen } from "lucide-react";
import { formatTime, getNextClass, getNextExam, getDifficultyColor } from "../utils/subjectHelpers.js";

export function SubjectCard({ subject, onEdit, onDuplicate, onDelete }) {
  const nextClass = getNextClass(subject.classDays);
  const nextExam = getNextExam(subject.exams);
  const difficultyColor = getDifficultyColor(subject.difficulty);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      className="group rounded-xl border border-ink-900/10 bg-paper-50 hover:border-ink-900/20 hover:shadow-lifted transition p-4 h-full flex flex-col"
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
          subject.status === "completed"
            ? "bg-green-500/10 text-green-700"
            : subject.status === "revision"
            ? "bg-blue-500/10 text-blue-700"
            : "bg-amber-500/10 text-amber-700"
        }`}>
          {subject.status}
        </span>
        {subject.isWrittenExam && (
          <span className="rounded-lg bg-red-500/10 px-2 py-1 text-xs font-medium text-red-700">
            Written Exam
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-medium text-ink-600">Progress</p>
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
              <p className="text-xs font-medium text-ink-700">Next Class</p>
              <p className="text-xs text-ink-600 truncate">
                {nextClass.day} at {nextClass.start}
                {nextClass.room && ` • ${nextClass.room}`}
              </p>
            </div>
          </div>
        )}
        {nextExam && (
          <div className="flex items-start gap-2 rounded-lg bg-red-500/5 p-2">
            <BookOpen className="h-4 w-4 mt-0.5 text-red-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-ink-700">Next {nextExam.type}</p>
              <p className="text-xs text-ink-600 truncate">
                {new Date(nextExam.date).toLocaleDateString()} at {nextExam.start}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Lecturer & Room */}
      {(subject.lecturer || subject.room) && (
        <div className="mb-3 text-xs text-ink-600 space-y-0.5 border-t border-ink-900/10 pt-3">
          {subject.lecturer && <p><span className="font-medium">Lecturer:</span> {subject.lecturer}</p>}
          {subject.room && <p><span className="font-medium">Room:</span> {subject.room}</p>}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={() => onEdit(subject)}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-500/20 transition"
        >
          <Edit2 className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          onClick={() => onDuplicate(subject)}
          className="flex items-center justify-center rounded-lg bg-ink-900/5 px-3 py-2 text-xs font-medium text-ink-600 hover:bg-ink-900/10 transition"
          title="Duplicate"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(subject.id)}
          className="flex items-center justify-center rounded-lg bg-red-500/5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-500/10 transition"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
