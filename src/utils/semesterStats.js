// GPA and statistics utilities for semester-based system

export function calculateSemesterGPA(subjects) {
  if (!subjects || subjects.length === 0) return 0;

  const completedSubjects = subjects.filter((s) => s.status === "completed");
  if (completedSubjects.length === 0) return 0;

  const totalGradePoints = completedSubjects.reduce((sum, subject) => {
    const grade = estimateGradeFromProgress(subject.progress);
    const gradePoint = gradeToPoint(grade);
    return sum + gradePoint * subject.credits;
  }, 0);

  const totalCredits = completedSubjects.reduce((sum, s) => sum + s.credits, 0);
  return totalCredits > 0 ? Number((totalGradePoints / totalCredits).toFixed(2)) : 0;
}

export function calculateCumulativeGPA(allSemesters) {
  const allSubjects = Object.values(allSemesters)
    .flatMap((sem) => sem.subjects || [])
    .filter((s) => s.status === "completed");

  return calculateSemesterGPA(allSubjects);
}

export function gradeToPoint(grade) {
  const gradeMap = {
    "A": 4.0,
    "A-": 3.7,
    "B+": 3.5,
    "B": 3.0,
    "B-": 2.7,
    "C+": 2.5,
    "C": 2.0,
    "C-": 1.7,
    "D+": 1.5,
    "D": 1.0,
    "F": 0.0,
  };
  return gradeMap[grade] || 0;
}

export function estimateGradeFromProgress(progress) {
  if (progress >= 95) return "A";
  if (progress >= 90) return "A-";
  if (progress >= 85) return "B+";
  if (progress >= 80) return "B";
  if (progress >= 75) return "B-";
  if (progress >= 70) return "C+";
  if (progress >= 65) return "C";
  if (progress >= 60) return "C-";
  if (progress >= 55) return "D+";
  if (progress >= 50) return "D";
  return "F";
}

export function calculateSemesterStats(subjects) {
  if (!subjects || subjects.length === 0) {
    return {
      totalCredits: 0,
      completedCredits: 0,
      inProgressCredits: 0,
      notStartedCredits: 0,
      averageProgress: 0,
      gpa: 0,
      completionRate: 0,
    };
  }

  const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
  const completedCredits = subjects
    .filter((s) => s.status === "completed")
    .reduce((sum, s) => sum + s.credits, 0);
  const inProgressCredits = subjects
    .filter((s) => ["watching lectures", "reading", "assignments", "revision"].includes(s.status))
    .reduce((sum, s) => sum + s.credits, 0);
  const notStartedCredits = totalCredits - completedCredits - inProgressCredits;

  const averageProgress =
    subjects.length > 0
      ? Math.round(subjects.reduce((sum, s) => sum + s.progress, 0) / subjects.length)
      : 0;

  const gpa = calculateSemesterGPA(subjects);
  const completionRate = totalCredits > 0 ? Math.round((completedCredits / totalCredits) * 100) : 0;

  return {
    totalCredits,
    completedCredits,
    inProgressCredits,
    notStartedCredits,
    averageProgress,
    gpa,
    completionRate,
  };
}

export function getExamCountdown(exams) {
  if (!exams || exams.length === 0) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingExams = exams
    .filter((exam) => {
      const examDate = new Date(exam.date);
      examDate.setHours(0, 0, 0, 0);
      return examDate >= today;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (upcomingExams.length === 0) return null;

  const nextExam = upcomingExams[0];
  const examDate = new Date(nextExam.date);
  examDate.setHours(0, 0, 0, 0);
  const daysUntil = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));

  return {
    exam: nextExam,
    daysUntil,
    examsRemaining: upcomingExams.length,
  };
}

export function prioritizeSubjects(subjects) {
  if (!subjects || subjects.length === 0) return [];

  // Priority scoring:
  // 1. Status (revision > assignments > reading > watching lectures > completed > not started)
  // 2. Days until exam
  // 3. Difficulty
  // 4. Progress (lower progress = higher priority)

  const statusPriority = {
    "revision": 5,
    "assignments": 4,
    "reading": 3,
    "watching lectures": 2,
    "completed": 0,
    "not started": 1,
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return [...subjects].sort((a, b) => {
    const aPriority = statusPriority[a.status] || 0;
    const bPriority = statusPriority[b.status] || 0;

    if (aPriority !== bPriority) return bPriority - aPriority;

    // Get nearest exam
    const aExam = getExamCountdown(a.exams);
    const bExam = getExamCountdown(b.exams);

    if (aExam && bExam) {
      if (aExam.daysUntil !== bExam.daysUntil) {
        return aExam.daysUntil - bExam.daysUntil;
      }
    } else if (aExam) return -1;
    else if (bExam) return 1;

    // Difficulty (hard > medium > easy)
    const difficultyOrder = { hard: 3, medium: 2, easy: 1 };
    const aDiff = difficultyOrder[a.difficulty] || 0;
    const bDiff = difficultyOrder[b.difficulty] || 0;
    if (aDiff !== bDiff) return bDiff - aDiff;

    // Progress (lower = higher priority)
    return a.progress - b.progress;
  });
}

export function generateWeeklySchedule(subjects) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const schedule = Object.fromEntries(days.map((day) => [day, []]));

  subjects.forEach((subject) => {
    if (subject.classDays && subject.classDays.length > 0) {
      subject.classDays.forEach((classDay) => {
        schedule[classDay.day].push({
          subject,
          start: classDay.start,
          end: classDay.end,
          room: classDay.room,
        });
      });
    }
  });

  // Sort by time
  Object.keys(schedule).forEach((day) => {
    schedule[day].sort((a, b) => a.start.localeCompare(b.start));
  });

  return schedule;
}

export function calculateStudyPlan(subjects, hoursPerDay = 4) {
  const totalSubjects = subjects.length;
  const totalHoursNeeded = subjects.reduce((sum, s) => sum + s.totalVideos * 1.5, 0); // ~1.5 hours per video
  const totalDaysAvailable = Math.ceil(
    (new Date("2025-08-08") - new Date()) / (1000 * 60 * 60 * 24)
  );
  const daysNeeded = Math.ceil(totalHoursNeeded / hoursPerDay);
  const feasible = daysNeeded <= totalDaysAvailable;

  return {
    totalSubjects,
    totalHoursNeeded,
    totalDaysAvailable,
    daysNeeded,
    feasible,
    hoursPerDay,
    hoursPerDayNeeded: (totalHoursNeeded / totalDaysAvailable).toFixed(1),
  };
}
