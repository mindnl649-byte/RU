import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getActiveSemester, sortSemesters } from "../utils/semesters.js";

const MONTHS = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

export function SemesterManager({ semesters, activeSemesterId, onCreateSemester, onDeleteSemester, onSwitchSemester, onEditSemester }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  const handleCreateSemester = () => {
    if (formData.name && formData.startDate && formData.endDate) {
      onCreateSemester(formData.name, formData.startDate, formData.endDate);
      setFormData({ name: "", startDate: "", endDate: "" });
      setIsOpen(false);
    }
  };

  const sortedSemesters = sortSemesters(semesters);
  const activeSemester = getActiveSemester(semesters, activeSemesterId);
  const activeCountdown = getSemesterExamCountdown(activeSemester);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="eyebrow">{t("semesterManager.activeSemester")}</p>
          <h3 className="section-title">{activeSemester?.displayName || t("semesterManager.noSemester")}</h3>
          {activeSemester?.examPeriod && (
            <div className="mt-1 space-y-1">
              <p className="text-sm text-ink-600">
                {t("semesterManager.examPeriod", { period: activeSemester.examPeriod })}
              </p>
              {activeCountdown && (
                <p className="text-sm font-semibold text-amber-700">
                  {formatSemesterCountdown(activeCountdown, t)}
                </p>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="btn-primary rounded-lg px-4 py-2 text-sm"
        >
          {t("semesterManager.newSemester")}
        </button>
      </div>

      {/* Semester tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sortedSemesters.map((semester) => {
          const countdown = getSemesterExamCountdown(semester);

          return (
            <button
              key={semester.id}
              onClick={() => onSwitchSemester(semester.id)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition flex-shrink-0 ${
                semester.isActive
                  ? "bg-ink-800 text-paper-100 shadow-lifted"
                  : "border border-ink-900/20 bg-paper-50 text-ink-700 hover:bg-paper-100"
              }`}
              title={semester.examPeriod ? t("semesterManager.examPeriod", { period: semester.examPeriod }) : undefined}
            >
              <div className="flex flex-col items-start">
                <span>{semester.name}</span>
                {semester.examPeriod && <span className="text-xs opacity-75">{semester.examPeriod}</span>}
                {countdown && (
                  <span className={`text-xs ${semester.isActive ? "text-amber-400" : "text-amber-700"}`}>
                    {formatSemesterCountdown(countdown, t)}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Create semester modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-paper-100 p-6 shadow-xl"
            >
              <h2 className="font-serif text-2xl text-ink-900">{t("semesterManager.semesterTitle")}</h2>
              <div className="mt-4 space-y-4">
                <input
                  type="text"
                  placeholder={t("semesterManager.nameExample")}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-ink-900/20 px-4 py-2 text-sm outline-none focus:border-ink-900/50"
                />
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full rounded-lg border border-ink-900/20 px-4 py-2 text-sm outline-none focus:border-ink-900/50"
                />
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full rounded-lg border border-ink-900/20 px-4 py-2 text-sm outline-none focus:border-ink-900/50"
                />
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="btn-ghost flex-1 rounded-lg px-4 py-2 text-sm"
                  >
                    {t("semesterManager.cancel")}
                  </button>
                  <button
                    onClick={handleCreateSemester}
                    className="btn-primary flex-1 rounded-lg px-4 py-2 text-sm"
                  >
                    {t("semesterManager.create")}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getSemesterExamCountdown(semester) {
  const examMonth = parseExamPeriodMonth(semester?.examPeriod);
  if (!examMonth) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(examMonth.year, examMonth.month, 1);
  const endOfMonth = new Date(examMonth.year, examMonth.month + 1, 0);
  startOfMonth.setHours(0, 0, 0, 0);
  endOfMonth.setHours(0, 0, 0, 0);

  const daysUntil = Math.ceil((startOfMonth - today) / (1000 * 60 * 60 * 24));

  if (today >= startOfMonth && today <= endOfMonth) {
    return { status: "current", daysUntil: 0 };
  }

  if (today > endOfMonth) {
    return { status: "past", daysUntil };
  }

  return { status: "upcoming", daysUntil };
}

function parseExamPeriodMonth(examPeriod) {
  if (!examPeriod) return null;

  const match = String(examPeriod).trim().match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (!match) return null;

  const month = MONTHS[match[1].toLowerCase()];
  const displayYear = Number(match[2]);

  if (month === undefined || Number.isNaN(displayYear)) return null;

  return {
    month,
    year: displayYear > 2400 ? displayYear - 543 : displayYear,
  };
}

function formatSemesterCountdown(countdown, t) {
  if (countdown.status === "current") return t("semesterManager.examMonthNow");
  if (countdown.status === "past") return t("semesterManager.examMonthPassed");
  return t("semesterManager.daysUntilExamMonth", { count: countdown.daysUntil });
}
