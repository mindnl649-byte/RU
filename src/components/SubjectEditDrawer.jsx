import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { STATUS_OPTIONS } from "../data/subjects.js";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DIFFICULTY_OPTIONS = ["easy", "medium", "hard"];
const EXAM_TYPES = ["midterm", "final", "quiz", "practical"];

const BLANK_SUBJECT = {
  code: "",
  title: "",
  category: "",
  credits: 3,
  lecturer: "",
  room: "",
  difficulty: "medium",
  status: "not started",
  progress: 0,
  classDays: [],
  exams: [],
  notes: "",
  totalVideos: 10,
  videosWatched: 0,
  estimatedStudyHours: 40,
  isWrittenExam: false,
};

function normalizeSubjectForForm(subject) {
  if (!subject) return BLANK_SUBJECT;

  const status = STATUS_OPTIONS.includes(subject.status) ? subject.status : "not started";

  return {
    ...BLANK_SUBJECT,
    ...subject,
    title: subject.title || subject.name || "",
    category: subject.category || "",
    credits: Number(subject.credits || BLANK_SUBJECT.credits),
    progress: Number(subject.progress ?? subject.progressPercentage ?? BLANK_SUBJECT.progress),
    classDays: Array.isArray(subject.classDays) ? subject.classDays : [],
    exams: Array.isArray(subject.exams) ? subject.exams : [],
    totalVideos: Number(subject.totalVideos || BLANK_SUBJECT.totalVideos),
    videosWatched: Number(subject.videosWatched || 0),
    estimatedStudyHours: Number(subject.estimatedStudyHours || BLANK_SUBJECT.estimatedStudyHours),
    status,
    isWrittenExam: Boolean(subject.isWrittenExam),
  };
}

export function SubjectEditDrawer({ isOpen, onClose, subject, onSave }) {
  const isEditMode = Boolean(subject);
  const initialFormData = useMemo(() => normalizeSubjectForForm(subject), [subject]);
  const [formData, setFormData] = useState(initialFormData);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
      setActiveTab("basic");
    }
  }, [initialFormData, isOpen]);

  const handleSave = () => {
    const cleanedCode = formData.code.trim().toUpperCase();
    const cleanedTitle = formData.title.trim();

    if (cleanedCode && cleanedTitle) {
      onSave({
        ...formData,
        code: cleanedCode,
        title: cleanedTitle,
        name: cleanedTitle,
        credits: Number(formData.credits || 0),
        progress: Number(formData.progress || 0),
        totalVideos: Number(formData.totalVideos || 0),
        videosWatched: Number(formData.videosWatched || 0),
        estimatedStudyHours: Number(formData.estimatedStudyHours || 0),
      });
      onClose();
    }
  };

  const addClassDay = () => {
    setFormData({
      ...formData,
      classDays: [...formData.classDays, { day: "Monday", start: "09:00", end: "10:30" }],
    });
  };

  const removeClassDay = (index) => {
    setFormData({
      ...formData,
      classDays: formData.classDays.filter((_, i) => i !== index),
    });
  };

  const updateClassDay = (index, field, value) => {
    const updated = [...formData.classDays];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, classDays: updated });
  };

  const addExam = () => {
    setFormData({
      ...formData,
      exams: [...formData.exams, { type: "midterm", date: "", start: "09:00", end: "11:00" }],
    });
  };

  const removeExam = (index) => {
    setFormData({
      ...formData,
      exams: formData.exams.filter((_, i) => i !== index),
    });
  };

  const updateExam = (index, field, value) => {
    const updated = [...formData.exams];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, exams: updated });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-screen w-full max-w-md overflow-y-auto bg-paper-100 shadow-2xl md:max-w-lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="subject-drawer-title"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-ink-900/10 bg-paper-100 px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                  {isEditMode ? "Edit mode" : "Add mode"}
                </p>
                <h2 id="subject-drawer-title" className="font-serif text-2xl text-ink-900">
                  {isEditMode ? "Edit Subject" : "Add Subject"}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 transition hover:bg-ink-900/5 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                aria-label="Close subject editor"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-ink-900/10 px-6 pt-4">
              {["basic", "schedule", "exams", "progress"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition capitalize ${
                    activeTab === tab
                      ? "border-ink-900 text-ink-900"
                      : "border-transparent text-ink-500 hover:text-ink-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Basic Information Tab */}
              {activeTab === "basic" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1">
                      Subject Code *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g., POL2200"
                      readOnly={isEditMode}
                      aria-describedby={isEditMode ? "subject-code-help" : undefined}
                      className={`w-full rounded-lg border border-ink-900/20 px-4 py-2 text-sm outline-none focus:border-ink-900/50 ${
                        isEditMode ? "cursor-not-allowed bg-ink-900/5 text-ink-500" : ""
                      }`}
                    />
                    {isEditMode && (
                      <p id="subject-code-help" className="mt-1 text-xs text-ink-500">
                        Subject code is the unique ID and cannot be changed while editing.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1">
                      Subject Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Thai Politics"
                      className="w-full rounded-lg border border-ink-900/20 px-4 py-2 text-sm outline-none focus:border-ink-900/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category || ""}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Political Science, Economics"
                      className="w-full rounded-lg border border-ink-900/20 px-4 py-2 text-sm outline-none focus:border-ink-900/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-1">
                        Credits
                      </label>
                      <input
                        type="number"
                        value={formData.credits}
                        onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                        min="1"
                        max="4"
                        className="w-full rounded-lg border border-ink-900/20 px-4 py-2 text-sm outline-none focus:border-ink-900/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-1">
                        Difficulty
                      </label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                        className="w-full rounded-lg border border-ink-900/20 px-4 py-2 text-sm outline-none focus:border-ink-900/50"
                      >
                        {DIFFICULTY_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isWrittenExam || false}
                      onChange={(e) => setFormData({ ...formData, isWrittenExam: e.target.checked })}
                      className="h-4 w-4 accent-red-500"
                    />
                    <span className="text-sm font-medium text-ink-700">Written Exam</span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1">
                      Lecturer
                    </label>
                    <input
                      type="text"
                      value={formData.lecturer || ""}
                      onChange={(e) => setFormData({ ...formData, lecturer: e.target.value })}
                      placeholder="e.g., Dr. Smith"
                      className="w-full rounded-lg border border-ink-900/20 px-4 py-2 text-sm outline-none focus:border-ink-900/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1">
                      Default Room
                    </label>
                    <input
                      type="text"
                      value={formData.room || ""}
                      onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                      placeholder="e.g., Room 101"
                      className="w-full rounded-lg border border-ink-900/20 px-4 py-2 text-sm outline-none focus:border-ink-900/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes || ""}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Add any notes..."
                      rows="3"
                      className="w-full rounded-lg border border-ink-900/20 px-4 py-2 text-sm outline-none focus:border-ink-900/50"
                    />
                  </div>
                </div>
              )}

              {/* Schedule Tab */}
              {activeTab === "schedule" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-ink-900">Class Schedule</h3>
                    <button
                      onClick={addClassDay}
                      className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-500/20 transition"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </button>
                  </div>

                  {formData.classDays.length === 0 ? (
                    <p className="text-sm text-ink-500">No classes added yet</p>
                  ) : (
                    <div className="space-y-3">
                      {formData.classDays.map((classDay, index) => (
                        <div key={index} className="rounded-lg border border-ink-900/10 p-3 space-y-2">
                          <div className="flex items-end gap-2">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-ink-600 mb-1">
                                Day
                              </label>
                              <select
                                value={classDay.day}
                                onChange={(e) => updateClassDay(index, "day", e.target.value)}
                                className="w-full rounded-lg border border-ink-900/20 px-3 py-1.5 text-sm outline-none focus:border-ink-900/50"
                              >
                                {DAYS.map((day) => (
                                  <option key={day} value={day}>
                                    {day}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <button
                              onClick={() => removeClassDay(index)}
                              className="rounded-lg p-1.5 hover:bg-red-500/10 transition"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-medium text-ink-600 mb-1">
                                Start Time
                              </label>
                              <input
                                type="time"
                                value={classDay.start}
                                onChange={(e) => updateClassDay(index, "start", e.target.value)}
                                className="w-full rounded-lg border border-ink-900/20 px-3 py-1.5 text-sm outline-none focus:border-ink-900/50"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-ink-600 mb-1">
                                End Time
                              </label>
                              <input
                                type="time"
                                value={classDay.end}
                                onChange={(e) => updateClassDay(index, "end", e.target.value)}
                                className="w-full rounded-lg border border-ink-900/20 px-3 py-1.5 text-sm outline-none focus:border-ink-900/50"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-ink-600 mb-1">
                              Room (optional)
                            </label>
                            <input
                              type="text"
                              value={classDay.room || ""}
                              onChange={(e) => updateClassDay(index, "room", e.target.value)}
                              placeholder="Room number"
                              className="w-full rounded-lg border border-ink-900/20 px-3 py-1.5 text-sm outline-none focus:border-ink-900/50"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Exams Tab */}
              {activeTab === "exams" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-ink-900">Exams</h3>
                    <button
                      onClick={addExam}
                      className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-500/20 transition"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </button>
                  </div>

                  {formData.exams.length === 0 ? (
                    <p className="text-sm text-ink-500">No exams scheduled yet</p>
                  ) : (
                    <div className="space-y-3">
                      {formData.exams.map((exam, index) => (
                        <div key={index} className="rounded-lg border border-ink-900/10 p-3 space-y-2">
                          <div className="flex items-end gap-2">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-ink-600 mb-1">
                                Exam Type
                              </label>
                              <select
                                value={exam.type}
                                onChange={(e) => updateExam(index, "type", e.target.value)}
                                className="w-full rounded-lg border border-ink-900/20 px-3 py-1.5 text-sm outline-none focus:border-ink-900/50"
                              >
                                {EXAM_TYPES.map((type) => (
                                  <option key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <button
                              onClick={() => removeExam(index)}
                              className="rounded-lg p-1.5 hover:bg-red-500/10 transition"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-ink-600 mb-1">
                              Date
                            </label>
                            <input
                              type="date"
                              value={exam.date}
                              onChange={(e) => updateExam(index, "date", e.target.value)}
                              className="w-full rounded-lg border border-ink-900/20 px-3 py-1.5 text-sm outline-none focus:border-ink-900/50"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-medium text-ink-600 mb-1">
                                Start Time
                              </label>
                              <input
                                type="time"
                                value={exam.start}
                                onChange={(e) => updateExam(index, "start", e.target.value)}
                                className="w-full rounded-lg border border-ink-900/20 px-3 py-1.5 text-sm outline-none focus:border-ink-900/50"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-ink-600 mb-1">
                                End Time
                              </label>
                              <input
                                type="time"
                                value={exam.end}
                                onChange={(e) => updateExam(index, "end", e.target.value)}
                                className="w-full rounded-lg border border-ink-900/20 px-3 py-1.5 text-sm outline-none focus:border-ink-900/50"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-ink-600 mb-1">
                              Room (optional)
                            </label>
                            <input
                              type="text"
                              value={exam.room || ""}
                              onChange={(e) => updateExam(index, "room", e.target.value)}
                              placeholder="Room number"
                              className="w-full rounded-lg border border-ink-900/20 px-3 py-1.5 text-sm outline-none focus:border-ink-900/50"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Progress Tab */}
              {activeTab === "progress" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-2">
                      Status: {formData.status}
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full rounded-lg border border-ink-900/20 px-4 py-2 text-sm outline-none focus:border-ink-900/50"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-2">
                      Progress: {formData.progress}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.progress}
                      onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 p-3">
                    <div className="h-2 overflow-hidden rounded-full bg-amber-500/20">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all"
                        style={{ width: `${formData.progress}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1">
                      Total Videos
                    </label>
                    <input
                      type="number"
                      value={formData.totalVideos}
                      onChange={(e) => setFormData({ ...formData, totalVideos: Number(e.target.value) })}
                      min="1"
                      className="w-full rounded-lg border border-ink-900/20 px-4 py-2 text-sm outline-none focus:border-ink-900/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1">
                      Estimated Study Hours
                    </label>
                    <input
                      type="number"
                      value={formData.estimatedStudyHours || 0}
                      onChange={(e) => setFormData({ ...formData, estimatedStudyHours: Number(e.target.value) })}
                      min="0"
                      className="w-full rounded-lg border border-ink-900/20 px-4 py-2 text-sm outline-none focus:border-ink-900/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1">
                      Videos Watched
                    </label>
                    <input
                      type="number"
                      value={formData.videosWatched || 0}
                      onChange={(e) => setFormData({ ...formData, videosWatched: Number(e.target.value) })}
                      min="0"
                      className="w-full rounded-lg border border-ink-900/20 px-4 py-2 text-sm outline-none focus:border-ink-900/50"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="sticky bottom-0 flex gap-3 border-t border-ink-900/10 bg-paper-100 px-6 py-4">
              <button onClick={onClose} className="btn-ghost flex-1 rounded-lg px-4 py-2">
                Cancel
              </button>
              <button onClick={handleSave} className="btn-primary flex-1 rounded-lg px-4 py-2">
                {isEditMode ? "Update Subject" : "Add Subject"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
