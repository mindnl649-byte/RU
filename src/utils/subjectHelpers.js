export function formatTime(time) {
  if (!time) return "";
  return time; // Already in HH:mm format
}

export function getNextClass(classDays) {
  if (!classDays || classDays.length === 0) return null;

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = new Date();
  const currentDay = daysOfWeek[today.getDay()];
  const currentHour = today.getHours();
  const currentMinute = today.getMinutes();

  // Sort by day of week, starting from today
  const sorted = [...classDays].sort((a, b) => {
    const aIndex = daysOfWeek.indexOf(a.day);
    const bIndex = daysOfWeek.indexOf(b.day);
    const currentIndex = daysOfWeek.indexOf(currentDay);

    const aOffset = (aIndex - currentIndex + 7) % 7;
    const bOffset = (bIndex - currentIndex + 7) % 7;

    if (aOffset !== bOffset) return aOffset - bOffset;

    // If same day, prefer future times
    const [aHour, aMin] = a.start.split(":").map(Number);
    const [bHour, bMin] = b.start.split(":").map(Number);

    if (aOffset === 0) {
      // Today: prefer future times
      const aIsFuture = aHour > currentHour || (aHour === currentHour && aMin > currentMinute);
      const bIsFuture = bHour > currentHour || (bHour === currentHour && bMin > currentMinute);
      if (aIsFuture !== bIsFuture) return bIsFuture ? 1 : -1;
    }

    return aHour !== bHour ? aHour - bHour : aMin - bMin;
  });

  return sorted[0] || null;
}

export function getNextExam(exams) {
  if (!exams || exams.length === 0) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter to future exams
  const futureExams = exams.filter((exam) => {
    const examDate = new Date(exam.date);
    examDate.setHours(0, 0, 0, 0);
    return examDate >= today;
  });

  if (futureExams.length === 0) return exams[exams.length - 1]; // Return last exam if none are future

  // Sort by date and time
  return futureExams.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (dateA.getTime() !== dateB.getTime()) return dateA.getTime() - dateB.getTime();
    return a.start.localeCompare(b.start);
  })[0];
}

export function getDifficultyColor(difficulty) {
  switch (difficulty) {
    case "easy":
      return "bg-green-500/10 text-green-700";
    case "medium":
      return "bg-amber-500/10 text-amber-700";
    case "hard":
      return "bg-red-500/10 text-red-700";
    default:
      return "bg-ink-900/5 text-ink-600";
  }
}

export function calculateGPA(subjects) {
  if (subjects.length === 0) return 0;

  const gradeMap = {
    "A": 4.0,
    "B+": 3.5,
    "B": 3.0,
    "C+": 2.5,
    "C": 2.0,
    "D+": 1.5,
    "D": 1.0,
    "F": 0.0,
  };

  const completedSubjects = subjects.filter((s) => s.status === "completed");
  if (completedSubjects.length === 0) return 0;

  const totalGradePoints = completedSubjects.reduce((sum, subject) => {
    const estimatedGrade = subject.estimatedGrade || gradeMap["B"] || 0;
    return sum + estimatedGrade * subject.credits;
  }, 0);

  const totalCredits = completedSubjects.reduce((sum, s) => sum + s.credits, 0);
  return totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;
}

export function estimateGradeFromProgress(progress) {
  if (progress >= 90) return "A";
  if (progress >= 80) return "B+";
  if (progress >= 75) return "B";
  if (progress >= 70) return "C+";
  if (progress >= 60) return "C";
  if (progress >= 50) return "D+";
  if (progress >= 40) return "D";
  return "F";
}

export function daysUntilExam(exam) {
  if (!exam) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const examDate = new Date(exam.date);
  examDate.setHours(0, 0, 0, 0);
  return Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
}
