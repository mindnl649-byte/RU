import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { getActiveSemester, sortSemesters } from "../utils/semesters.js";

export function SemesterManager({ semesters, activeSemesterId, onCreateSemester, onDeleteSemester, onSwitchSemester, onEditSemester }) {
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="eyebrow">Active Semester</p>
          <h3 className="section-title">{activeSemester?.displayName || "No semester"}</h3>
          {activeSemester?.examPeriod && (
            <p className="text-sm text-ink-600 mt-1">📚 Exam Period: {activeSemester.examPeriod}</p>
          )}
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="btn-primary rounded-lg px-4 py-2 text-sm"
        >
          + New Semester
        </button>
      </div>

      {/* Semester tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sortedSemesters.map((semester) => (
          <button
            key={semester.id}
            onClick={() => onSwitchSemester(semester.id)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition flex-shrink-0 ${
              semester.isActive
                ? "bg-ink-800 text-paper-100 shadow-lifted"
                : "border border-ink-900/20 bg-paper-50 text-ink-700 hover:bg-paper-100"
            }`}
            title={semester.examPeriod ? `Exam: ${semester.examPeriod}` : undefined}
          >
            <div className="flex flex-col items-start">
              <span>{semester.name}</span>
              {semester.examPeriod && <span className="text-xs opacity-75">{semester.examPeriod}</span>}
            </div>
          </button>
        ))}
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
              <h2 className="font-serif text-2xl text-ink-900">New Semester</h2>
              <div className="mt-4 space-y-4">
                <input
                  type="text"
                  placeholder="e.g., Semester 1/2025"
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
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateSemester}
                    className="btn-primary flex-1 rounded-lg px-4 py-2 text-sm"
                  >
                    Create
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
