export function sortSemesters(semesters = {}) {
  return Object.values(semesters).sort((a, b) => {
    const aDate = Date.parse(a.startDate || "");
    const bDate = Date.parse(b.startDate || "");

    if (!Number.isNaN(aDate) && !Number.isNaN(bDate) && aDate !== bDate) {
      return aDate - bDate;
    }

    if (!Number.isNaN(aDate) && Number.isNaN(bDate)) return -1;
    if (Number.isNaN(aDate) && !Number.isNaN(bDate)) return 1;

    return (a.name || a.displayName || "").localeCompare(b.name || b.displayName || "");
  });
}

export function getActiveSemester(semesters = {}, activeSemesterId) {
  return semesters[activeSemesterId] || Object.values(semesters).find((semester) => semester.isActive) || null;
}
