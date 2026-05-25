import { CHECKLIST, MASTER_SUBJECTS, SEMESTERS } from "../data/subjects.js";
import { TOTAL_CREDITS_REQUIRED } from "../data/defaultState.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function subjectProgress(subject, stateForSubject) {
  if (stateForSubject?.status === "passed") return 100;
  const checklist = stateForSubject?.checklist || {};
  const done = CHECKLIST.filter((item) => checklist[item]).length;
  return Math.round((done / CHECKLIST.length) * 100);
}

export function getEnrichedSubjects(studyState) {
  // Get subject list from metadata, fallback to MASTER_SUBJECTS if not defined
  const subjectMetadata = studyState.subjectMetadata || {};
  const subjectCodes = Object.keys(studyState.subjects || {});
  
  // Build subject list from stored metadata or MASTER_SUBJECTS
  const subjects = subjectCodes
    .map((code) => {
      const stored = subjectMetadata[code];
      if (stored) {
        return stored;
      }
      // Fallback to MASTER_SUBJECTS if not in metadata
      return MASTER_SUBJECTS.find((s) => s.code === code);
    })
    .filter(Boolean);

  return subjects.map((subject) => {
    const progress = studyState.subjects?.[subject.code] || {};
    const progressPercentage = subjectProgress(subject, progress);
    return {
      ...subject,
      ...progress,
      progressPercentage,
      remainingVideos: Math.max(subject.totalVideos - Number(progress.videosWatched || 0), 0),
      remainingStudyHours: Math.max(
        Math.ceil(subject.estimatedStudyHours * (1 - progressPercentage / 100)),
        0
      ),
    };
  });
}

export function getGraduationStats(studyState) {
  const enriched = getEnrichedSubjects(studyState);
  const passedFutureCredits = enriched
    .filter((subject) => subject.status === "passed")
    .reduce((sum, subject) => sum + subject.credits, 0);
  const completedCredits = Math.min(
    TOTAL_CREDITS_REQUIRED,
    Number(studyState.completedCreditsBase || 0) + passedFutureCredits
  );
  const remainingCredits = Math.max(TOTAL_CREDITS_REQUIRED - completedCredits, 0);
  const graduationPercentage = Number(((completedCredits / TOTAL_CREDITS_REQUIRED) * 100).toFixed(1));

  let cumulative = completedCredits;
  const semesters = SEMESTERS.map((semester) => {
    const subjects = enriched.filter((subject) => subject.semester === semester);
    const credits = subjects.reduce((sum, subject) => sum + subject.credits, 0);
    cumulative = Math.min(TOTAL_CREDITS_REQUIRED, cumulative + credits);
    return {
      semester,
      subjects,
      subjectCount: subjects.length,
      credits,
      cumulativeCredits: cumulative,
      workload: getWorkloadLabel(subjects.length, credits),
      overloaded: subjects.length > 7 || credits > 21,
    };
  });

  const graduationTerm =
    semesters.find((semester) => semester.cumulativeCredits >= TOTAL_CREDITS_REQUIRED)?.semester ||
    "needs planning";

  return {
    completedCredits,
    remainingCredits,
    graduationPercentage,
    totalCreditsRequired: TOTAL_CREDITS_REQUIRED,
    graduationTerm,
    semesters,
  };
}

export function getDailyPlan(studyState) {
  const enriched = getEnrichedSubjects(studyState);
  const activeSubjects = enriched
    .filter((subject) => subject.status !== "passed")
    .sort((a, b) => b.remainingStudyHours - a.remainingStudyHours);
  const remainingVideos = activeSubjects.reduce((sum, subject) => sum + subject.remainingVideos, 0);
  const remainingHours = activeSubjects.reduce((sum, subject) => sum + subject.remainingStudyHours, 0);
  const daysUntilExam = Math.max(
    1,
    Math.ceil((new Date(studyState.examDate).getTime() - Date.now()) / MS_PER_DAY)
  );
  const videosPerDay = Math.max(1, Math.ceil(remainingVideos / daysUntilExam));
  const hoursPerDay = Math.max(1, Math.ceil(remainingHours / daysUntilExam));

  return {
    daysUntilExam,
    focusSubjects: activeSubjects.slice(0, 3),
    hoursPerDay,
    remainingHours,
    remainingVideos,
    videosPerDay,
    warning:
      videosPerDay > 3 || hoursPerDay > 4
        ? "You are behind pace. Use shorter daily blocks and prioritize hard subjects first."
        : "Current pace is realistic. Keep the daily target small and consistent.",
  };
}

function getWorkloadLabel(subjectCount, credits) {
  if (subjectCount > 7 || credits > 21) return "overloaded";
  if (subjectCount >= 6 || credits >= 18) return "heavy";
  if (subjectCount >= 3) return "balanced";
  return "light";
}
