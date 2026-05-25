import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { generateWeeklySchedule } from "../utils/semesterStats.js";

export function Calendar({ studyState, getActiveSubjects }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month"); // "month", "week", "day"

  // Support both old and new systems
  const useNewSystem = studyState?.semesters && Object.keys(studyState.semesters).length > 0;
  const subjects = useNewSystem && getActiveSubjects ? getActiveSubjects() : [];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Schedule</p>
        <h2 className="page-title">Your classes and exams calendar.</h2>
      </header>

      {/* View Mode Toggle */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setViewMode("month")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            viewMode === "month"
              ? "bg-ink-800 text-paper-100 shadow-lifted"
              : "border border-ink-900/20 bg-paper-50 text-ink-700 hover:bg-paper-100"
          }`}
        >
          Month
        </button>
        <button
          onClick={() => setViewMode("week")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            viewMode === "week"
              ? "bg-ink-800 text-paper-100 shadow-lifted"
              : "border border-ink-900/20 bg-paper-50 text-ink-700 hover:bg-paper-100"
          }`}
        >
          Week
        </button>
        <button
          onClick={handleToday}
          className="rounded-lg border border-ink-900/20 bg-paper-50 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-paper-100 transition"
        >
          Today
        </button>
      </div>

      {/* Month View */}
      {viewMode === "month" && (
        <MonthView date={currentDate} onPrevMonth={handlePrevMonth} onNextMonth={handleNextMonth} subjects={subjects} />
      )}

      {/* Week View */}
      {viewMode === "week" && (
        <WeekView date={currentDate} onPrevMonth={handlePrevMonth} onNextMonth={handleNextMonth} subjects={subjects} />
      )}

      {/* Upcoming Events */}
      <div className="card">
        <p className="eyebrow">Upcoming Events</p>
        <h3 className="section-title">Next 7 days</h3>
        <UpcomingEvents subjects={subjects} daysAhead={7} />
      </div>
    </div>
  );
}

function MonthView({ date, onPrevMonth, onNextMonth, subjects }) {
  const year = date.getFullYear();
  const month = date.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Create calendar grid
  const calendarDays = [];

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({ day: daysInPrevMonth - i, month: month - 1, isCurrentMonth: false });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, month, isCurrentMonth: true });
  }

  // Next month days
  const remaining = 42 - calendarDays.length;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({ day: i, month: month + 1, isCurrentMonth: false });
  }

  const getEventsForDay = (day, monthOffset) => {
    const eventDate = new Date(year, month + monthOffset, day);
    const events = [];

    // Get classes and exams for this day
    subjects.forEach((subject) => {
      // Add exams
      if (subject.exams) {
        subject.exams.forEach((exam) => {
          if (new Date(exam.date).toDateString() === eventDate.toDateString()) {
            events.push({ type: "exam", ...exam, subject });
          }
        });
      }

      // Add classes
      if (subject.classDays) {
        const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
          eventDate.getDay()
        ];
        subject.classDays.forEach((classDay) => {
          if (classDay.day === dayName) {
            events.push({ type: "class", ...classDay, subject });
          }
        });
      }
    });

    return events;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="card">
      {/* Month header */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-serif text-2xl">
          {monthNames[month]} {year}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onPrevMonth}
            className="rounded-lg p-2 hover:bg-ink-900/5 transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={onNextMonth}
            className="rounded-lg p-2 hover:bg-ink-900/5 transition"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Day names */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-ink-600">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dayObj, index) => {
          const events = dayObj.isCurrentMonth ? getEventsForDay(dayObj.day, 0) : [];
          const isToday =
            dayObj.isCurrentMonth &&
            dayObj.day === new Date().getDate() &&
            month === new Date().getMonth() &&
            year === new Date().getFullYear();

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`min-h-24 rounded-lg border p-2 ${
                dayObj.isCurrentMonth
                  ? isToday
                    ? "border-amber-500 bg-amber-500/10"
                    : "border-ink-900/10 bg-paper-50 hover:border-ink-900/20"
                  : "border-ink-900/5 bg-paper-100"
              }`}
            >
              <p className={`text-xs font-semibold mb-1 ${dayObj.isCurrentMonth ? "text-ink-900" : "text-ink-400"}`}>
                {dayObj.day}
              </p>
              <div className="space-y-0.5">
                {events.map((event, i) => (
                  <div
                    key={i}
                    className={`text-xs rounded px-1.5 py-0.5 truncate ${
                      event.type === "exam"
                        ? "bg-red-500/20 text-red-700"
                        : "bg-amber-500/20 text-amber-700"
                    }`}
                    title={`${event.subject.title} - ${event.type === "exam" ? event.type : `${event.start}-${event.end}`}`}
                  >
                    {event.type === "exam" ? "📝" : "📚"} {event.subject.code}
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({ date, onPrevMonth, onNextMonth, subjects }) {
  // Get Monday of the week containing date
  const dayOfWeek = date.getDay();
  const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(day.getDate() + i);
    weekDays.push(day);
  }

  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const getClassesForDay = (day) => {
    const dayName = dayNames[day.getDay() === 0 ? 6 : day.getDay() - 1];
    const classes = [];

    subjects.forEach((subject) => {
      if (subject.classDays) {
        subject.classDays.forEach((classDay) => {
          if (classDay.day === dayName) {
            classes.push({ ...classDay, subject });
          }
        });
      }
    });

    return classes.sort((a, b) => a.start.localeCompare(b.start));
  };

  return (
    <div className="card overflow-x-auto">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-lg">
          Week of {monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onPrevMonth}
            className="rounded-lg p-2 hover:bg-ink-900/5 transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={onNextMonth}
            className="rounded-lg p-2 hover:bg-ink-900/5 transition"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 min-w-max">
        {weekDays.map((day, dayIndex) => {
          const classes = getClassesForDay(day);
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <div
              key={dayIndex}
              className={`min-w-[140px] rounded-lg border p-3 ${
                isToday ? "border-amber-500 bg-amber-500/10" : "border-ink-900/10 bg-paper-50"
              }`}
            >
              <p className="text-xs font-semibold text-ink-600 mb-2">
                {day.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </p>
              <div className="space-y-1.5">
                {classes.length === 0 ? (
                  <p className="text-xs text-ink-400">No classes</p>
                ) : (
                  classes.map((cls, i) => (
                    <div key={i} className="text-xs rounded-lg bg-amber-500/20 text-amber-700 p-1.5">
                      <p className="font-semibold truncate">{cls.subject.code}</p>
                      <p className="text-xs text-amber-600">
                        {cls.start} - {cls.end}
                      </p>
                      {cls.room && <p className="text-xs text-amber-600">{cls.room}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UpcomingEvents({ subjects, daysAhead = 7 }) {
  const events = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Collect all events
  subjects.forEach((subject) => {
    // Exams
    if (subject.exams) {
      subject.exams.forEach((exam) => {
        const examDate = new Date(exam.date);
        examDate.setHours(0, 0, 0, 0);
        const daysUntil = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
        if (daysUntil >= 0 && daysUntil <= daysAhead) {
          events.push({
            date: exam.date,
            type: "exam",
            title: `${subject.code}: ${exam.type} exam`,
            subject,
            ...exam,
          });
        }
      });
    }

    // Classes (next occurrence)
    if (subject.classDays) {
      subject.classDays.forEach((classDay) => {
        const dayIndex = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(
          classDay.day
        );
        const currentDayIndex = today.getDay();
        let daysUntil = (dayIndex - currentDayIndex + 7) % 7;
        if (daysUntil === 0) daysUntil = 7;

        if (daysUntil <= daysAhead) {
          const nextDate = new Date(today);
          nextDate.setDate(nextDate.getDate() + daysUntil);
          events.push({
            date: nextDate.toISOString().split("T")[0],
            type: "class",
            title: `${subject.code}: ${subject.title}`,
            subject,
            time: `${classDay.start} - ${classDay.end}`,
            room: classDay.room,
          });
        }
      });
    }
  });

  // Sort by date
  events.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="mt-4 space-y-2">
      {events.length === 0 ? (
        <p className="text-sm text-ink-500">No events scheduled</p>
      ) : (
        events.map((event, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className={`rounded-lg border p-3 ${
              event.type === "exam"
                ? "border-red-500/25 bg-red-500/10"
                : "border-amber-500/25 bg-amber-500/10"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`text-sm font-semibold ${event.type === "exam" ? "text-red-700" : "text-amber-700"}`}>
                  {event.title}
                </p>
                <p className="mt-1 text-xs text-ink-600">
                  {new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                  {event.time && ` • ${event.time}`}
                </p>
                {event.room && <p className="text-xs text-ink-600">📍 {event.room}</p>}
              </div>
              {event.type === "exam" && (
                <span className="rounded-full bg-red-500/20 px-2 py-1 text-xs font-medium text-red-700">
                  {event.type}
                </span>
              )}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}
