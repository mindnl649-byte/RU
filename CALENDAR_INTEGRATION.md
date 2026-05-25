# FullCalendar Integration Guide (Optional)

This guide shows how to replace the built-in Calendar component with FullCalendar for advanced features.

## Installation

```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction @fullcalendar/list
```

## Implementation

Replace the Calendar component in `src/pages/Calendar.jsx`:

```jsx
import { useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";

export function Calendar({ studyState, getActiveSubjects }) {
  const calendarRef = useRef(null);
  const useNewSystem = studyState?.semesters && Object.keys(studyState.semesters).length > 0;
  const subjects = useNewSystem && getActiveSubjects ? getActiveSubjects() : [];

  // Convert subjects to FullCalendar events
  const events = [];

  subjects.forEach((subject) => {
    // Add exams
    if (subject.exams) {
      subject.exams.forEach((exam) => {
        events.push({
          id: `exam-${subject.id}-${exam.type}`,
          title: `${subject.code}: ${exam.type.toUpperCase()}`,
          start: `${exam.date}T${exam.start}`,
          end: `${exam.date}T${exam.end}`,
          extendedProps: {
            type: "exam",
            subject: subject.code,
            room: exam.room,
          },
          backgroundColor: "#dc2626",
          borderColor: "#991b1b",
        });
      });
    }

    // Add recurring classes
    if (subject.classDays) {
      subject.classDays.forEach((classDay) => {
        events.push({
          id: `class-${subject.id}-${classDay.day}`,
          title: `${subject.code}: ${subject.title}`,
          daysOfWeek: [getDayIndex(classDay.day)],
          startTime: classDay.start,
          endTime: classDay.end,
          extendedProps: {
            type: "class",
            subject: subject.code,
            room: classDay.room,
          },
          backgroundColor: "#f59e0b",
          borderColor: "#d97706",
        });
      });
    }
  });

  const handleEventClick = (info) => {
    const { type, subject, room } = info.event.extendedProps;
    alert(
      `${info.event.title}\n${info.event.start?.toLocaleString() || info.event.startStr}\n${
        room ? `Room: ${room}` : ""
      }`
    );
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Schedule</p>
        <h2 className="page-title">Your classes and exams calendar.</h2>
      </header>

      <div className="card calendar-container">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          events={events}
          eventClick={handleEventClick}
          height="auto"
          eventDisplay="block"
          weekends={true}
        />
      </div>

      <style>{`
        .calendar-container :global(.fc) {
          font-family: inherit;
          color: #1a1a1a;
        }

        .calendar-container :global(.fc-button-primary) {
          background-color: #1a1a1a;
          border-color: #1a1a1a;
        }

        .calendar-container :global(.fc-button-primary:hover) {
          background-color: #333333;
        }

        .calendar-container :global(.fc-button-primary.fc-button-active) {
          background-color: #f59e0b;
          border-color: #f59e0b;
        }

        .calendar-container :global(.fc-daygrid-day.fc-day-today) {
          background-color: #fef3c7 !important;
        }

        .calendar-container :global(.fc-event-title) {
          padding: 2px 4px;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
}

function getDayIndex(dayName) {
  const days = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };
  return days[dayName] || 0;
}
```

## Features Added

- **Drag-and-drop**: Reorganize events (optional)
- **Color coding**: Automatic colors for event types
- **Multiple views**: Month, week, day, list
- **Time grid**: Shows exact class times
- **Recurring events**: Classes repeat weekly
- **Click details**: Show more info on click
- **Print friendly**: Built-in print support

## Styling Customization

The FullCalendar styling can be customized via CSS. Add to `src/styles.css`:

```css
.fc {
  font-family: var(--font-serif), serif;
}

.fc-button-primary {
  background-color: var(--ink-900);
  border-color: var(--ink-900);
}

.fc-daygrid-day.fc-day-today {
  background-color: rgba(245, 158, 11, 0.1);
}

.fc-event {
  border: 1px solid currentColor;
}

.fc-event-title {
  font-size: 0.875rem;
  font-weight: 500;
}
```

## Alternative: react-big-calendar

If you prefer `react-big-calendar`, install it:

```bash
npm install react-big-calendar moment
```

Then use:

```jsx
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";

const localizer = momentLocalizer(moment);

export function Calendar({ studyState, getActiveSubjects }) {
  // Convert to BigCalendar format
  const events = convertToCalendarEvents(getActiveSubjects?.());

  return (
    <BigCalendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 500 }}
    />
  );
}
```

## Recommendations

### Use built-in Calendar when:
- ✓ Lightweight, no dependencies needed
- ✓ Simple month/week view sufficient
- ✓ Faster load times important
- ✓ Mobile-first approach

### Use FullCalendar when:
- ✓ Advanced features needed
- ✓ Drag-and-drop functionality
- ✓ Custom event rendering
- ✓ Professional appearance

## Performance Considerations

- **Event limit**: Cap at ~500 events for smooth performance
- **Lazy loading**: Load semesters on demand
- **Caching**: Cache computed event lists
- **Virtualization**: Only render visible events

---

**Note**: The built-in Calendar is fully featured and recommended for most users. FullCalendar is optional for advanced use cases.
