import { motion } from "framer-motion";
import { getDailyPlan, getEnrichedSubjects, getGraduationStats } from "../utils/calculations.js";
import { calculateSemesterStats, calculateSemesterGPA, prioritizeSubjects } from "../utils/semesterStats.js";

export function Dashboard({
  studyState,
  updateSubject,
  updateSubjectInSemester,
  getActiveSubjects,
}) {
  // Support both old and new systems
  const useNewSystem = studyState?.semesters && Object.keys(studyState.semesters).length > 0;

  let subjects = [];
  let semesterStats = null;
  let activeSemester = null;

  if (useNewSystem && getActiveSubjects) {
    subjects = getActiveSubjects();
    semesterStats = calculateSemesterStats(subjects);
    activeSemester = Object.values(studyState.semesters || {}).find((s) => s.isActive);
  } else {
    // Legacy system
    subjects = getEnrichedSubjects(studyState);
  }

  const graduation = getGraduationStats(studyState);
  const daily = getDailyPlan(studyState);

  // Get focused subjects for today
  const prioritized = useNewSystem ? prioritizeSubjects(subjects) : daily.focusSubjects || [];
  const todayFocus = prioritized[0] || subjects[0];

  const handleMarkVideoWatched = (subject) => {
    if (useNewSystem && updateSubjectInSemester) {
      updateSubjectInSemester(subject.id, {
        videosWatched: Math.min(subject.totalVideos || 10, (subject.videosWatched || 0) + 1),
        status: subject.status === "not started" ? "watching lectures" : subject.status,
      });
    } else {
      // Legacy system
      updateSubject(subject.code, {
        videosWatched: Math.min(subject.totalVideos, Number(subject.videosWatched || 0) + 1),
        status: subject.status === "not started" ? "watching lectures" : subject.status,
      });
    }
  };

  if (!todayFocus) {
    return (
      <div className="space-y-6">
        <header>
          <p className="eyebrow">Dashboard</p>
          <h2 className="page-title">Welcome to StudyPath</h2>
        </header>
        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-6 text-center">
          <p className="text-ink-700">No subjects yet. Go to Subjects to create your first subject.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Today</p>
        <h2 className="page-title">Keep today small and steady.</h2>
        {activeSemester && <p className="mt-1 text-sm text-ink-500">{activeSemester.displayName}</p>}
      </header>

      {/* Main Focus Card */}
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-ink-800 p-5 text-paper-100 shadow-lifted"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">Daily focus</p>
          <h3 className="mt-3 font-serif text-2xl">
            {todayFocus.name || todayFocus.title}
          </h3>
          <p className="mt-1 font-mono text-xs text-paper-100/45">
            {todayFocus.code} - {(todayFocus.totalVideos || 10) - (todayFocus.videosWatched || 0)} videos
            left - {todayFocus.status}
          </p>
          <button
            className="mt-5 w-full rounded-lg bg-amber-500 px-4 py-3 text-sm font-bold text-ink-900 transition hover:bg-amber-400"
            onClick={() => handleMarkVideoWatched(todayFocus)}
          >
            Mark one lecture video watched
          </button>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-paper-100/10">
            <div
              className="h-full rounded-full bg-amber-500"
              style={{ width: `${todayFocus.progress || todayFocus.progressPercentage || 0}%` }}
            />
          </div>
        </motion.div>

        {/* Stats Card */}
        <div className="card">
          <p className="eyebrow">
            {useNewSystem ? "Semester Overview" : "Automatic planner"}
          </p>
          {useNewSystem && semesterStats ? (
            <>
              <h3 className="mt-2 font-serif text-2xl">{semesterStats.gpa.toFixed(2)} GPA</h3>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Metric label="Credits" value={semesterStats.completedCredits} detail={`of ${semesterStats.totalCredits}`} />
                <Metric label="Progress" value={`${semesterStats.completionRate}%`} />
                <Metric label="Avg Score" value={`${semesterStats.averageProgress}%`} />
                <Metric label="In Progress" value={semesterStats.inProgressCredits} />
              </div>
            </>
          ) : (
            <>
              <h3 className="mt-2 font-serif text-2xl">{daily.daysUntilExam} days until exams</h3>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Metric label="Videos left" value={daily.remainingVideos} />
                <Metric label="Hours left" value={daily.remainingHours} />
                <Metric label="Videos/day" value={daily.videosPerDay} />
                <Metric label="Hours/day" value={daily.hoursPerDay} />
              </div>
            </>
          )}
        </div>
      </section>

      {/* Graduation Stats */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Metric
          label="Degree complete"
          value={`${graduation.graduationPercentage}%`}
          detail={`${graduation.completedCredits}/${graduation.totalCreditsRequired} credits`}
        />
        <Metric
          label="Remaining credits"
          value={graduation.remainingCredits}
          detail="Calculated from passed subjects"
        />
        <Metric label="Forecast" value={graduation.graduationTerm} detail="Based on planned semesters" />
      </section>

      {/* Focus Subjects */}
      <section className="card">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Daily study targets</p>
            <h3 className="section-title">Focus subjects</h3>
          </div>
        </div>
        <div className="mt-4 grid gap-3">
          {(useNewSystem ? prioritized.slice(0, 5) : daily.focusSubjects || []).map((subject) => (
            <motion.div
              key={subject.code || subject.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border border-ink-900/10 bg-paper-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-serif text-lg">
                    {subject.name || subject.title}
                  </p>
                  <p className="mt-1 font-mono text-xs text-ink-500">
                    {subject.code} - {subject.status}
                  </p>
                </div>
                <span className="rounded-full bg-paper-200 px-3 py-1 text-xs font-semibold text-ink-600">
                  {subject.progress || subject.progressPercentage || 0}%
                </span>
              </div>
              <p className="mt-3 text-sm text-ink-600">
                {(subject.totalVideos || 10) - (subject.videosWatched || 0)} videos remaining
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, detail }) {
  return (
    <div className="rounded-xl border border-ink-900/10 bg-paper-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">{label}</p>
      <p className="mt-2 font-serif text-2xl text-ink-900">{value}</p>
      {detail && <p className="mt-1 text-xs text-ink-500">{detail}</p>}
    </div>
  );
}
