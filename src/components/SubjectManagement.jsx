import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { CHECKLIST, STATUS_OPTIONS } from "../data/subjects.js";

export function SubjectManagement({ subjects, onAddSubject, onEditSubject, onDeleteSubject }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [formData, setFormData] = useState(getEmptyForm());
  const [validationError, setValidationError] = useState("");

  function getEmptyForm() {
    return {
      code: "",
      name: "",
      credits: 3,
      semester: "",
      difficulty: "medium",
      estimatedStudyHours: 40,
      totalVideos: 10,
    };
  }

  function openAddForm() {
    setEditingCode(null);
    setFormData(getEmptyForm());
    setValidationError("");
    setIsOpen(true);
  }

  function openEditForm(subject) {
    setEditingCode(subject.code);
    setFormData({
      code: subject.code,
      name: subject.name,
      credits: subject.credits,
      semester: subject.semester,
      difficulty: subject.difficulty,
      estimatedStudyHours: subject.estimatedStudyHours,
      totalVideos: subject.totalVideos,
    });
    setValidationError("");
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
    setEditingCode(null);
    setFormData(getEmptyForm());
    setValidationError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    setValidationError("");

    if (!formData.code.trim()) {
      setValidationError("Subject code is required");
      return;
    }
    if (!formData.name.trim()) {
      setValidationError("Subject name is required");
      return;
    }

    const codeExists = subjects.some((s) => s.code === formData.code && s.code !== editingCode);
    if (codeExists) {
      setValidationError("Subject code already exists");
      return;
    }

    if (editingCode) {
      onEditSubject(editingCode, formData);
    } else {
      onAddSubject(formData);
    }

    closeModal();
  }

  function handleDelete(code) {
    if (confirm(`Delete "${code}" subject? This cannot be undone.`)) {
      onDeleteSubject(code);
    }
  }

  return (
    <>
      <button className="btn-primary" onClick={openAddForm}>
        + Add subject
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-4 z-50 flex items-center justify-center sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-h-[90vh] sm:w-full sm:max-w-md sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2"
            >
              <div className="w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-paper-100 shadow-lifted border border-ink-900/10">
                <div className="sticky top-0 z-10 border-b border-ink-900/10 bg-paper-100/95 backdrop-blur p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="eyebrow">Subject management</p>
                      <h2 className="mt-1 font-serif text-xl">
                        {editingCode ? "Edit subject" : "Add new subject"}
                      </h2>
                    </div>
                    <button
                      onClick={closeModal}
                      className="group rounded-lg p-2 transition hover:bg-ink-900/5"
                      aria-label="Close"
                    >
                      <svg
                        className="h-5 w-5 text-ink-500 transition group-hover:text-ink-900"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                  {validationError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      {validationError}
                    </div>
                  )}

                  <label className="grid gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">Subject code</span>
                    <input
                      type="text"
                      className="field"
                      placeholder="e.g., POL2200"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      disabled={!!editingCode}
                    />
                  </label>

                  <label className="grid gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">Subject name</span>
                    <input
                      type="text"
                      className="field"
                      placeholder="e.g., การเมืองไทย"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="grid gap-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">Credits</span>
                      <input
                        type="number"
                        className="field"
                        min="1"
                        max="6"
                        value={formData.credits}
                        onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                      />
                    </label>

                    <label className="grid gap-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">Difficulty</span>
                      <select
                        className="field normal-case tracking-normal"
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </label>
                  </div>

                  <label className="grid gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">Semester</span>
                    <input
                      type="text"
                      className="field"
                      placeholder="e.g., Aug 2025"
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="grid gap-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">Study hours</span>
                      <input
                        type="number"
                        className="field"
                        min="1"
                        max="200"
                        value={formData.estimatedStudyHours}
                        onChange={(e) => setFormData({ ...formData, estimatedStudyHours: Number(e.target.value) })}
                      />
                    </label>

                    <label className="grid gap-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">Total videos</span>
                      <input
                        type="number"
                        className="field"
                        min="1"
                        max="100"
                        value={formData.totalVideos}
                        onChange={(e) => setFormData({ ...formData, totalVideos: Number(e.target.value) })}
                      />
                    </label>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="btn-primary flex-1">
                      {editingCode ? "Update subject" : "Add subject"}
                    </button>
                    <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                      Cancel
                    </button>
                  </div>

                  {editingCode && (
                    <button
                      type="button"
                      onClick={() => {
                        handleDelete(editingCode);
                        closeModal();
                      }}
                      className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                    >
                      Delete subject
                    </button>
                  )}
                </form>

                {/* Recent subjects list */}
                {subjects.length > 0 && (
                  <div className="border-t border-ink-900/10 p-5">
                    <p className="eyebrow mb-3">Recent subjects</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {subjects.slice(-5).map((subject) => (
                        <button
                          key={subject.code}
                          onClick={() => openEditForm(subject)}
                          className="w-full text-left rounded-lg border border-ink-900/10 bg-paper-50 p-3 transition hover:bg-paper-200 hover:border-amber-500/50"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-mono text-xs text-ink-500">{subject.code}</p>
                              <p className="font-serif text-sm font-medium text-ink-900">{subject.name}</p>
                            </div>
                            <span className="rounded-full bg-paper-200 px-2 py-1 text-xs font-semibold text-ink-600 whitespace-nowrap">
                              {subject.difficulty}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
