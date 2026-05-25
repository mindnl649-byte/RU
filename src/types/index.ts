// Semester types
export interface Semester {
  id: string;
  name: string;
  displayName: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

// Class schedule types
export interface ClassDay {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  start: string; // HH:mm format
  end: string; // HH:mm format
  room?: string;
}

// Exam types
export interface Exam {
  id: string;
  type: "midterm" | "final" | "quiz" | "practical";
  date: string; // YYYY-MM-DD
  start: string; // HH:mm
  end: string; // HH:mm
  room?: string;
  weight?: number; // percentage
}

// Subject status enum
export type SubjectStatus =
  | "not started"
  | "watching lectures"
  | "reading"
  | "assignments"
  | "revision"
  | "completed";

// Difficulty enum
export type DifficultyLevel = "easy" | "medium" | "hard";

// Subject type
export interface Subject {
  id: string;
  code: string;
  title: string;
  credits: number;
  lecturer?: string;
  room?: string;
  difficulty: DifficultyLevel;
  progress: number; // 0-100
  status: SubjectStatus;
  classDays: ClassDay[];
  exams: Exam[];
  notes?: string;
  estimatedGrade?: number; // 0-4 GPA scale
  videosWatched?: number;
  totalVideos?: number;
  checklist?: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
}

// Study state type
export interface StudyState {
  version: number;
  activeSemesterId: string;
  semesters: Record<string, Semester>;
  subjects: Record<string, Subject>; // keyed by subject.id
  subjectsBySemester: Record<string, string[]>; // semesterId -> subjectIds[]
  stats: {
    totalCredits: number;
    completedCredits: number;
    gpa: number;
    streak: number;
  };
  timerSeconds: number;
  flashcards: Flashcard[];
  lastSync?: string;
}

// Flashcard type
export interface Flashcard {
  q: string;
  a: string;
}

// Export utility types
export type SubjectInput = Omit<Subject, "id" | "createdAt" | "updatedAt">;
