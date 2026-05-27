import { useEffect, useMemo, useRef, useState } from "react";
import { doc, onSnapshot, serverTimestamp, setDoc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase.js";
import { createDefaultState } from "../data/defaultState.js";
import { CHECKLIST } from "../data/subjects.js";
import { sortSemesters } from "../utils/semesters.js";

const LOCAL_KEY = "studypath.study-state.v3";
const FIRESTORE_COLLECTION = "users";
const FIRESTORE_DOC = "studyState";

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function readLocalState() {
  try {
    const saved = JSON.parse(localStorage.getItem(LOCAL_KEY) || "null");
    return saved || createDefaultState();
  } catch {
    return createDefaultState();
  }
}

function writeLocalState(state) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
  } catch {
    // Ignore private-mode storage failures. In-memory state still works.
  }
}

async function readFirestoreState(userId) {
  if (!db || !userId) return null;
  try {
    const docRef = doc(db, FIRESTORE_COLLECTION, userId, "data", FIRESTORE_DOC);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data().state;
    }
    return null;
  } catch (err) {
    console.error("Error reading from Firestore:", err);
    return null;
  }
}

async function writeFirestoreState(userId, state) {
  if (!db || !userId) return { success: false, error: "Firebase is not configured." };
  try {
    const docRef = doc(db, FIRESTORE_COLLECTION, userId, "data", FIRESTORE_DOC);
    await setDoc(
      docRef,
      {
        state: state,
        updatedAt: serverTimestamp(),
        version: 3,
      },
      { merge: true }
    );
    return { success: true, error: "" };
  } catch (err) {
    console.error("Error writing to Firestore:", err);
    return { success: false, error: err.message || "Unable to save to cloud." };
  }
}

export function useStudyState(user) {
  const [studyState, setStudyState] = useState(() => readLocalState());
  const [syncStatus, setSyncStatus] = useState(user ? "loading" : "local");
  const [syncError, setSyncError] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState("");
  const [cloudReady, setCloudReady] = useState(false);
  const lastCloudStateRef = useRef("");
  const saveTimerRef = useRef(null);

  const docRef = useMemo(() => {
    if (!db || !user) return null;
    return doc(db, FIRESTORE_COLLECTION, user.uid, "data", FIRESTORE_DOC);
  }, [user]);

  // Initialize from Firestore on user login
  useEffect(() => {
    if (!user) {
      setCloudReady(false);
      setSyncStatus("local");
      const localState = readLocalState();
      setStudyState(localState);
      return;
    }

    if (!docRef) return;

    setSyncStatus("loading");

    const unsubscribe = onSnapshot(
      docRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          const firestoreState = snapshot.data().state;
          lastCloudStateRef.current = JSON.stringify(firestoreState);
          setStudyState(firestoreState);
          writeLocalState(firestoreState);
          setCloudReady(true);
          setSyncStatus("synced");
          setSyncError("");
          setLastSyncedAt(new Date().toISOString());
        } else {
          // First time user - upload local state to Firestore
          const localState = readLocalState();
          setStudyState(localState);
          const result = await writeFirestoreState(user.uid, localState);
          if (result.success) {
            lastCloudStateRef.current = JSON.stringify(localState);
            setCloudReady(true);
            setSyncStatus("synced");
            setSyncError("");
            setLastSyncedAt(new Date().toISOString());
          } else {
            setSyncStatus("offline");
            setSyncError(result.error);
            setCloudReady(false);
          }
        }
      },
      (err) => {
        console.error("Firestore listener error:", err);
        setSyncStatus("offline");
        setSyncError(err.message || "Unable to listen for cloud updates.");
        setCloudReady(false);
      }
    );

    return () => unsubscribe();
  }, [docRef, user]);

  // Auto-sync to Firestore
  useEffect(() => {
    writeLocalState(studyState);

    if (!user || !cloudReady || !docRef) return;

    const serializedState = JSON.stringify(studyState);
    if (serializedState === lastCloudStateRef.current) {
      setSyncStatus("synced");
      return;
    }

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(async () => {
      setSyncStatus("saving");
      const result = await writeFirestoreState(user.uid, studyState);
      if (result.success) {
        lastCloudStateRef.current = serializedState;
        setSyncError("");
        setLastSyncedAt(new Date().toISOString());
      }
      setSyncStatus(result.success ? "synced" : "offline");
      if (!result.success) setSyncError(result.error);
    }, 250);

    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [studyState, user, cloudReady, docRef]);

  function updateStudyState(updater) {
    setStudyState((current) => {
      const next = typeof updater === "function" ? updater(current) : { ...current, ...updater };
      return {
        ...next,
        updatedAt: new Date().toISOString(),
      };
    });
  }

  async function saveCloudNow() {
    if (!user || !docRef) {
      setSyncStatus("local");
      setSyncError("Sign in before syncing.");
      return false;
    }

    setSyncStatus("saving");
    const stateToSave = {
      ...studyState,
      updatedAt: new Date().toISOString(),
    };
    const result = await writeFirestoreState(user.uid, stateToSave);
    if (result.success) {
      lastCloudStateRef.current = JSON.stringify(stateToSave);
      setStudyState(stateToSave);
      writeLocalState(stateToSave);
      setSyncStatus("synced");
      setSyncError("");
      setLastSyncedAt(new Date().toISOString());
      return true;
    }

    setSyncStatus("offline");
    setSyncError(result.error);
    return false;
  }

  async function loadCloudNow() {
    if (!user || !docRef) {
      setSyncStatus("local");
      setSyncError("Sign in before loading cloud data.");
      return false;
    }

    setSyncStatus("loading");
    try {
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) {
        setSyncStatus("offline");
        setSyncError("No cloud study data exists yet. Save this device to cloud first.");
        return false;
      }

      const cloudState = snapshot.data().state;
      lastCloudStateRef.current = JSON.stringify(cloudState);
      setStudyState(cloudState);
      writeLocalState(cloudState);
      setCloudReady(true);
      setSyncStatus("synced");
      setSyncError("");
      setLastSyncedAt(new Date().toISOString());
      return true;
    } catch (err) {
      setSyncStatus("offline");
      setSyncError(err.message || "Unable to load cloud data.");
      return false;
    }
  }

  // ========== Legacy subject functions (backward compatible) ==========
  function updateSubject(code, patch) {
    updateStudyState((current) => {
      if (current.subjects?.[code]?.id) {
        return {
          ...current,
          subjects: {
            ...current.subjects,
            [code]: {
              ...current.subjects[code],
              ...patch,
              updatedAt: new Date().toISOString(),
            },
          },
        };
      } else {
        return {
          ...current,
          subjects: {
            ...current.subjects,
            [code]: {
              ...current.subjects?.[code],
              ...patch,
            },
          },
        };
      }
    });
  }

  function addSubject(subjectData) {
    const code = subjectData.code;
    const title = subjectData.title || subjectData.name;
    updateStudyState((current) => ({
      ...current,
      subjectMetadata: {
        ...current.subjectMetadata,
        [code]: {
          code: subjectData.code,
          name: title,
          credits: subjectData.credits,
          semester: subjectData.semester,
          category: subjectData.category,
          difficulty: subjectData.difficulty,
          estimatedStudyHours: subjectData.estimatedStudyHours,
          totalVideos: subjectData.totalVideos,
          isWrittenExam: subjectData.isWrittenExam || false,
        },
      },
      subjects: {
        ...current.subjects,
        [code]: {
          checklist: Object.fromEntries(CHECKLIST.map((item) => [item, false])),
          notes: subjectData.notes || "",
          status: subjectData.status || "not started",
          videosWatched: Number(subjectData.videosWatched || 0),
          progress: Number(subjectData.progress || 0),
        },
      },
    }));
  }

  function editSubject(oldCode, subjectData) {
    updateStudyState((current) => {
      const newCode = subjectData.code;
      const subjectMetadata = { ...current.subjectMetadata };
      const subjects = { ...current.subjects };

      if (oldCode !== newCode) {
        delete subjectMetadata[oldCode];
        subjects[newCode] = subjects[oldCode];
        delete subjects[oldCode];
      }

      subjectMetadata[newCode] = {
        code: subjectData.code,
        name: subjectData.title || subjectData.name,
        credits: subjectData.credits,
        semester: subjectData.semester,
        category: subjectData.category,
        difficulty: subjectData.difficulty,
        estimatedStudyHours: subjectData.estimatedStudyHours,
        totalVideos: subjectData.totalVideos,
        isWrittenExam: subjectData.isWrittenExam || false,
      };

      return {
        ...current,
        subjectMetadata,
        subjects,
      };
    });
  }

  function deleteSubject(code) {
    updateStudyState((current) => {
      const subjectMetadata = { ...current.subjectMetadata };
      const subjects = { ...current.subjects };
      delete subjectMetadata[code];
      delete subjects[code];

      return {
        ...current,
        subjectMetadata,
        subjects,
      };
    });
  }

  // ========== New semester-based functions ==========
  function createSemester(name, startDate, endDate) {
    const semesterId = generateId();
    updateStudyState((current) => ({
      ...current,
      semesters: {
        ...current.semesters,
        [semesterId]: {
          id: semesterId,
          name,
          displayName: name,
          startDate,
          endDate,
          isActive: false,
          createdAt: new Date().toISOString(),
        },
      },
      subjectsBySemester: {
        ...current.subjectsBySemester,
        [semesterId]: [],
      },
    }));
    return semesterId;
  }

  function updateSemester(semesterId, patch) {
    updateStudyState((current) => ({
      ...current,
      semesters: {
        ...current.semesters,
        [semesterId]: {
          ...current.semesters[semesterId],
          ...patch,
        },
      },
    }));
  }

  function deleteSemester(semesterId) {
    updateStudyState((current) => {
      const semesters = { ...current.semesters };
      const subjectsBySemester = { ...current.subjectsBySemester };
      const subjects = { ...current.subjects };

      const subjectIds = subjectsBySemester[semesterId] || [];
      subjectIds.forEach((id) => delete subjects[id]);

      delete semesters[semesterId];
      delete subjectsBySemester[semesterId];

      const nextActiveSemesterId =
        current.activeSemesterId === semesterId ? sortSemesters(semesters)[0]?.id : current.activeSemesterId;

      return {
        ...current,
        semesters,
        subjectsBySemester,
        subjects,
        activeSemesterId: nextActiveSemesterId,
      };
    });
  }

  function switchSemester(semesterId) {
    updateStudyState((current) => ({
      ...current,
      activeSemesterId: semesterId,
      semesters: Object.fromEntries(
        Object.entries(current.semesters || {}).map(([id, sem]) => [
          id,
          {
            ...sem,
            isActive: id === semesterId,
          },
        ])
      ),
    }));
  }

  // ========== Subject CRUD in active semester ==========
  function addSubjectToSemester(subjectData) {
    const subjectId = generateId();
    updateStudyState((current) => {
      const activeSemesterId = current.activeSemesterId;

      return {
        ...current,
        subjects: {
          ...current.subjects,
          [subjectId]: {
            id: subjectId,
            code: subjectData.code,
            title: subjectData.title,
            name: subjectData.title,
            category: subjectData.category || "",
            credits: subjectData.credits,
            difficulty: subjectData.difficulty,
            estimatedStudyHours: Number(subjectData.estimatedStudyHours || 40),
            progress: Number(subjectData.progress || 0),
            status: subjectData.status || "not started",
            classDays: subjectData.classDays || [],
            exams: subjectData.exams || [],
            lecturer: subjectData.lecturer || "",
            room: subjectData.room || "",
            notes: subjectData.notes || "",
            videosWatched: Number(subjectData.videosWatched || 0),
            totalVideos: subjectData.totalVideos || 10,
            isWrittenExam: subjectData.isWrittenExam || false,
            checklist: Object.fromEntries(CHECKLIST.map((item) => [item, false])),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
        subjectsBySemester: {
          ...current.subjectsBySemester,
          [activeSemesterId]: [
            ...(current.subjectsBySemester?.[activeSemesterId] || []),
            subjectId,
          ],
        },
      };
    });
    return subjectId;
  }

  function updateSubjectInSemester(subjectId, patch) {
    updateStudyState((current) => ({
      ...current,
      subjects: {
        ...current.subjects,
        [subjectId]: {
          ...current.subjects?.[subjectId],
          ...patch,
          updatedAt: new Date().toISOString(),
        },
      },
    }));
  }

  function deleteSubjectFromSemester(subjectId) {
    updateStudyState((current) => {
      const subjects = { ...current.subjects };
      delete subjects[subjectId];

      const subjectsBySemester = Object.fromEntries(
        Object.entries(current.subjectsBySemester || {}).map(([semId, ids]) => [
          semId,
          ids.filter((id) => id !== subjectId),
        ])
      );

      return {
        ...current,
        subjects,
        subjectsBySemester,
      };
    });
  }

  function duplicateSubject(sourceSubjectId) {
    updateStudyState((current) => {
      const source = current.subjects[sourceSubjectId];
      if (!source) return current;

      const newSubjectId = generateId();
      const activeSemesterId = current.activeSemesterId;

      return {
        ...current,
        subjects: {
          ...current.subjects,
          [newSubjectId]: {
            ...source,
            id: newSubjectId,
            progress: 0,
            status: "not started",
            videosWatched: 0,
            checklist: Object.fromEntries(CHECKLIST.map((item) => [item, false])),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
        subjectsBySemester: {
          ...current.subjectsBySemester,
          [activeSemesterId]: [
            ...(current.subjectsBySemester?.[activeSemesterId] || []),
            newSubjectId,
          ],
        },
      };
    });
  }

  function getActiveSubjects() {
    const activeSemesterId = studyState.activeSemesterId;
    const subjectIds = studyState.subjectsBySemester?.[activeSemesterId] || [];
    return subjectIds.map((id) => studyState.subjects?.[id]).filter(Boolean);
  }

  return {
    studyState,
    syncStatus,
    syncError,
    lastSyncedAt,
    updateStudyState,
    saveCloudNow,
    loadCloudNow,
    // Legacy functions
    updateSubject,
    addSubject,
    editSubject,
    deleteSubject,
    // New semester functions
    createSemester,
    updateSemester,
    deleteSemester,
    switchSemester,
    addSubjectToSemester,
    updateSubjectInSemester,
    deleteSubjectFromSemester,
    duplicateSubject,
    getActiveSubjects,
  };
}
