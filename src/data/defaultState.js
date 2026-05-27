import { CHECKLIST, FLASHCARDS_DEFAULT, MASTER_SUBJECTS } from "./subjects.js";

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const TOTAL_CREDITS_REQUIRED = 126;
export const COMPLETED_CREDITS_INITIAL = 12;
export const EXAM_DATE = "2025-08-08";

const SEMESTERS_DATA = [
  {
    id: "sem-2-68",
    name: "2/68 (August 2569)",
    displayName: "Semester 2/68 - August 2569",
    startDate: "2025-08-01",
    endDate: "2025-12-31",
    examPeriod: "August 2569",
  },
  {
    id: "sem-1-69",
    name: "1/69 (October 2569)",
    displayName: "Semester 1/69 - October 2569",
    startDate: "2025-10-01",
    endDate: "2026-02-28",
    examPeriod: "October 2569",
  },
  {
    id: "sem-2-69",
    name: "2/69 (March 2570)",
    displayName: "Semester 2/69 - March 2570",
    startDate: "2026-03-01",
    endDate: "2026-07-31",
    examPeriod: "March 2570",
  },
  {
    id: "sem-summer-69",
    name: "Summer/69 (May 2570)",
    displayName: "Summer Semester/69 - May 2570",
    startDate: "2026-05-01",
    endDate: "2026-08-31",
    examPeriod: "May 2570",
  },
  {
    id: "sem-1-70",
    name: "1/70 (October 2570)",
    displayName: "Semester 1/70 - October 2570",
    startDate: "2026-10-01",
    endDate: "2027-02-28",
    examPeriod: "October 2570",
  },
  {
    id: "sem-2-70",
    name: "2/70 (March 2571)",
    displayName: "Semester 2/70 - March 2571",
    startDate: "2027-03-01",
    endDate: "2027-07-31",
    examPeriod: "March 2571",
  },
];

export function createDefaultState() {
  const now = new Date().toISOString();
  const semesters = {};
  const subjectsBySemester = {};
  const subjects = {};
  let totalSubjects = 0;

  SEMESTERS_DATA.forEach((semester, index) => {
    semesters[semester.id] = {
      id: semester.id,
      name: semester.name,
      displayName: semester.displayName,
      startDate: semester.startDate,
      endDate: semester.endDate,
      examPeriod: semester.examPeriod,
      isActive: index === 0,
      createdAt: now,
      updatedAt: now,
    };

    const semesterSubjects = MASTER_SUBJECTS.filter((s) => s.semester === semester.name);
    const subjectIds = [];

    semesterSubjects.forEach((subject) => {
      const subjectId = generateId();
      subjectIds.push(subjectId);
      subjects[subjectId] = {
        id: subjectId,
        code: subject.code,
        title: subject.name,
        credits: subject.credits,
        difficulty: subject.difficulty,
        progress: 0,
        status: "not started",
        classDays: [],
        exams: [],
        notes: "",
        videosWatched: 0,
        totalVideos: subject.totalVideos,
        isWrittenExam: subject.isWrittenExam || false,
        checklist: Object.fromEntries(CHECKLIST.map((item) => [item, false])),
        createdAt: now,
        updatedAt: now,
      };
      totalSubjects++;
    });

    subjectsBySemester[semester.id] = subjectIds;
  });

  return {
    version: 2,
    createdAt: now,
    updatedAt: now,
    activeSemesterId: SEMESTERS_DATA[0].id,
    semesters,
    subjects,
    subjectsBySemester,
    stats: {
      totalCredits: 0,
      completedCredits: COMPLETED_CREDITS_INITIAL,
      gpa: 3.5,
      streak: 0,
    },
    timerSeconds: 25 * 60,
    flashcards: FLASHCARDS_DEFAULT,
    completedCreditsBase: COMPLETED_CREDITS_INITIAL,
    examDate: EXAM_DATE,
    streak: 0,
    subjectMetadata: {},
    legacySubjects: {},
  };
}
