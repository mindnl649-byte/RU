# StudyPath Semester Planner - Complete Upgrade Guide

## Overview

The StudyPath Ramkhamhaeng app has been upgraded to a full **semester-based university planner** with advanced subject management, calendar integration, and GPA calculations.

## ✨ New Features

### 1. **Semester Management System**

Users can now organize subjects across multiple semesters:

- **Create semesters** with custom names and date ranges
- **Switch between semesters** seamlessly
- **Delete semesters** (removes all contained subjects)
- **Track active semester** across the app

**Usage:**
```
Dashboard → Subjects page → Semester Manager
Create: "+ New Semester" button
Switch: Click semester tabs at top
```

### 2. **Advanced Subject CRUD**

Comprehensive subject management with rich data:

- **Add subjects** with full information
- **Edit subjects** with multi-tab interface
- **Delete subjects** from current semester
- **Duplicate subjects** to quickly copy with reset progress

**Data Structure:**
```javascript
{
  id: "unique-id",
  code: "POL2200",
  title: "Thai Politics",
  credits: 3,
  lecturer: "Dr. Smith",
  room: "Room 101",
  difficulty: "medium",
  status: "watching lectures",
  progress: 45,
  classDays: [{day: "Monday", start: "09:00", end: "10:30", room: "101"}],
  exams: [{type: "final", date: "2025-08-08", start: "09:00", end: "11:00"}],
  totalVideos: 10,
  videosWatched: 5,
  notes: "Important concepts to review..."
}
```

### 3. **Subject Edit Drawer**

Right-side drawer UI with organized tabs:

#### **Basic Information Tab**
- Subject code and title
- Credits and difficulty level
- Lecturer name and room
- Notes and descriptions

#### **Class Schedule Tab**
- Add/remove class days
- Time pickers (start/end times)
- Room assignments per class
- Multiple classes per week supported

#### **Exams Tab**
- Add/remove exams
- Exam types: Midterm, Final, Quiz, Practical
- Date and time pickers
- Room assignments

#### **Progress Tab**
- Status selector (6 options)
- Progress slider (0-100%)
- Video tracking
- Visual progress bar

### 4. **Subject Cards**

Beautiful grid display of subjects showing:

- Subject code and title
- Difficulty badge (easy/medium/hard)
- Progress bar with percentage
- Credits display
- Status badge
- Next class information with time and room
- Next exam countdown
- Lecturer and room details
- Hover actions: Edit, Duplicate, Delete

### 5. **Calendar Integration**

Full calendar view with three modes:

#### **Month View**
- Visual month calendar
- Color-coded events (classes and exams)
- Today highlighting
- Navigation between months

#### **Week View**
- Weekly timetable display
- All classes sorted by time
- Easy schedule overview
- Compact class card display

#### **Upcoming Events**
- Next 7 days preview
- Sorted by date and time
- Exam and class distinctions
- Location information

### 6. **GPA Calculator**

Automatic GPA calculations:

- **Semester GPA**: Based on completed subjects
- **Cumulative GPA**: Across all semesters
- **Grade estimation**: From progress percentage
- **Credit tracking**: Completed vs total
- **Progress statistics**: Average progress by semester

**Supported Grading Scale:**
- A (4.0), A- (3.7)
- B+ (3.5), B (3.0), B- (2.7)
- C+ (2.5), C (2.0), C- (1.7)
- D+ (1.5), D (1.0)
- F (0.0)

### 7. **Dashboard Enhancements**

Updated dashboard shows:

- **Semester overview** (when using new system)
- **Current semester GPA**
- **Credits completed** (completed/total)
- **Average progress** across subjects
- **Completion rate** percentage
- **In-progress credit count**
- **Daily focus** on highest priority subjects
- **Prioritized subject list** based on:
  - Study status (revision > assignments > reading > lectures)
  - Days until exam
  - Difficulty level
  - Current progress percentage

### 8. **Persistence & Sync**

All data is automatically saved:

- **localStorage**: Immediate local storage
- **Firebase**: Cloud sync for logged-in users
- **Backward compatible**: Supports legacy system
- **Conflict resolution**: Cloud data takes priority

**Storage Structure:**
```
studyPath/
  users/
    {uid}/
      semesters/
        {semesterId}/
          subjects/
      studies/ (legacy)
```

### 9. **Mobile Responsive Design**

Fully responsive across all devices:

- **Mobile**: 5-item bottom navigation
- **Tablet**: Optimized grid layouts
- **Desktop**: Full sidebar + content
- **Touch-friendly**: Large tap targets
- **Adaptive drawers**: Slide from right on all screens

## 🎨 UI/UX Features

- **Cinematic aesthetic**: Glassmorphism and gradient overlays
- **Smooth animations**: Framer Motion transitions
- **Color-coded indicators**: Difficulty, status, exam vs class
- **Intuitive forms**: Multi-tab interface with instant feedback
- **Empty states**: Helpful guidance when no data exists
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation

## 🔄 Data Flow

### Creating a Subject

```
User clicks "+ Add Subject"
  ↓
SubjectEditDrawer opens
  ↓
User fills out tabs (Basic → Schedule → Exams → Progress)
  ↓
Click "Save Subject"
  ↓
addSubjectToSemester() called
  ↓
New subject added to active semester
  ↓
Dashboard and Calendar auto-update
  ↓
Data synced to localStorage + Firebase
```

### Switching Semesters

```
User clicks semester tab
  ↓
switchSemester() called
  ↓
Active semester ID updated
  ↓
All subjects re-filtered for new semester
  ↓
Dashboard shows new semester's stats
  ↓
Calendar displays new semester's events
```

## 📱 Component Tree

```
App.jsx
├── Shell (Navigation)
├── Dashboard
│   ├── SemesterStats
│   └── FocusedSubjects
├── Subjects
│   ├── SemesterManager
│   ├── SubjectCard[] (Grid View)
│   └── SubjectEditDrawer
│       ├── BasicInfoTab
│       ├── ClassScheduleTab
│       ├── ExamsTab
│       └── ProgressTab
└── Calendar
    ├── MonthView
    ├── WeekView
    └── UpcomingEvents
```

## 🛠 Utilities

### subjectHelpers.js
- `getNextClass()`: Find nearest upcoming class
- `getNextExam()`: Find nearest exam
- `getDifficultyColor()`: Color coding
- `estimateGradeFromProgress()`: Grade calculation
- `daysUntilExam()`: Countdown calculation

### semesterStats.js
- `calculateSemesterGPA()`: Semester GPA
- `calculateCumulativeGPA()`: Overall GPA
- `calculateSemesterStats()`: Comprehensive stats
- `prioritizeSubjects()`: Smart prioritization
- `generateWeeklySchedule()`: Timetable generation
- `getExamCountdown()`: Exam info

## 🔧 Hook: useStudyState

**Legacy Functions** (backward compatible):
```javascript
updateSubject(code, patch)
addSubject(subjectData)
editSubject(oldCode, subjectData)
deleteSubject(code)
```

**New Semester Functions:**
```javascript
createSemester(name, startDate, endDate)
updateSemester(semesterId, patch)
deleteSemester(semesterId)
switchSemester(semesterId)
addSubjectToSemester(subjectData)
updateSubjectInSemester(subjectId, patch)
deleteSubjectFromSemester(subjectId)
duplicateSubject(sourceSubjectId)
getActiveSubjects()
```

## 📊 Status Options

- **not started**: Subject just added
- **watching lectures**: Currently learning
- **reading**: Studying textbooks/materials
- **assignments**: Working on homework
- **revision**: Final preparation
- **completed**: Subject finished

## 🎯 Difficulty Levels

- **Easy**: Green indicator, ~30-40 hours, basic concepts
- **Medium**: Amber indicator, ~40-50 hours, moderate complexity
- **Hard**: Red indicator, ~48-60 hours, complex topics

## 🔄 Exam Types

- **Midterm**: Mid-semester evaluation
- **Final**: End-of-semester exam
- **Quiz**: Short assessment
- **Practical**: Hands-on evaluation

## 🚀 Performance Tips

1. **Use Calendar**: Plan subjects around exam dates
2. **Check Dashboard**: See daily priorities automatically calculated
3. **Update Progress**: Mark videos watched to track momentum
4. **Review Stats**: Monitor GPA trends across semesters
5. **Duplicate Smart**: Copy similar subjects to save time

## 🔐 Data Privacy

- **Local-only mode**: Works completely offline
- **Firebase sync**: Only with user consent
- **No tracking**: Anonymous studies supported
- **User-owned data**: Full control over subjects/semesters

## 🐛 Troubleshooting

### Subjects not showing?
- Check active semester (tab should be highlighted)
- Ensure subjects are assigned to that semester
- Try refreshing the page

### Exams not appearing in calendar?
- Verify exam dates are set correctly
- Check if subject is in active semester
- Ensure exam date format is valid (YYYY-MM-DD)

### GPA not calculating?
- Set subject status to "completed"
- Ensure credits are assigned
- Progress should reflect expected grade

## 📝 Usage Example

### Setting up Semester 1/2025

1. **Create Semester**
   - Click "+ New Semester" on Subjects page
   - Name: "1/2025"
   - Dates: 2025-08-01 to 2025-12-31

2. **Add Subjects**
   - Click "+ Add Subject"
   - Fill Basic Info: Code, Title, Credits, Difficulty
   - Add Schedule: Add class days and times
   - Add Exams: Enter midterm and final dates
   - Set Progress: Start at 0%, update as you study

3. **Track Progress**
   - Dashboard shows daily focus
   - Update videos watched daily
   - Check Calendar for upcoming events
   - Monitor GPA on Dashboard

4. **Switch to Next Semester**
   - Create "2/2025" semester
   - Click tab to switch
   - Repeat subject setup

## 🎉 Features Coming Soon

- **FullCalendar integration**: Advanced calendar with drag-drop
- **Study timer**: Pomodoro integration with notifications
- **Export to PDF**: Generate semester reports
- **Grade prediction**: Based on current progress
- **Study recommendations**: AI-powered suggestions
- **Collaboration**: Share semester with classmates

## 📞 Support

For issues or feature requests, check the latest version or contact support.

---

**Version**: 2.0 (Semester-based)  
**Last Updated**: May 2025  
**Status**: Production Ready
