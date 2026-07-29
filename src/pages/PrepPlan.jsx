import { motion } from "framer-motion";
import {
  CATCH_UP_PRIORITY,
  EXAM_PREP_PHASES,
  EXAM_PREP_RULES,
  NEW_TERM_CLASSES,
  NEW_TERM_EXAMS,
  OLD_TERM_EXAMS,
  OLD_TERM_PRIORITY,
  POL2200_FOCUS,
} from "../data/examPrepPlan.js";

const TH_DATE_FORMAT = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function PrepPlan() {
  const nextOldExam = getNextExam(OLD_TERM_EXAMS);
  const nextNewExam = getNextExam(NEW_TERM_EXAMS);

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">แผนอ่านก่อนสอบ</p>
        <h2 className="page-title">โฟกัสงานที่สำคัญตามวันสอบจริง</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-500">
          ก่อน 25 สิงหาคมให้เน้นวิชาเก่า 2/68 เป็นหลัก และรักษาวิชา 1/69 เฉพาะตัวที่เสี่ยงหรือสอบต้นรอบ
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-ink-800 p-5 text-paper-100 shadow-lifted"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">Current strategy</p>
          <h3 className="mt-3 font-serif text-3xl">2/68 = 85% ของแรงอ่าน</h3>
          <p className="mt-3 text-sm leading-6 text-paper-100/70">
            ใช้สรุปเป็นแกน ดูคลิปเฉพาะจุดสำคัญ ทำข้อสอบเก่าเร็ว และจดข้อผิดพลาดทันที
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <HeroMetric label="สอบ 2/68 ถัดไป" value={nextOldExam ? nextOldExam.code : "-"} detail={nextOldExam ? formatExam(nextOldExam) : "ยังไม่มี"} />
            <HeroMetric label="รักษา 1/69" value="15%" detail="ECO1121, POL4100, POL2106" />
          </div>
        </motion.div>

        <section className="card">
          <p className="eyebrow">Next October exam</p>
          <h3 className="section-title">{nextNewExam ? nextNewExam.code : "ยังไม่มีวันสอบ"}</h3>
          <p className="mt-2 text-sm text-ink-600">{nextNewExam ? formatExam(nextNewExam) : "เพิ่มวันสอบเพื่อดูแผนถัดไป"}</p>
          <div className="mt-4 border-t border-ink-900/10 pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">หลักสำคัญ</p>
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-ink-600">
              {EXAM_PREP_RULES.map((rule) => (
                <li key={rule} className="rounded-lg bg-paper-50 px-3 py-2">{rule}</li>
              ))}
            </ul>
          </div>
        </section>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <PriorityCard title="ลำดับเตรียมตัว 2/68" items={OLD_TERM_PRIORITY} tone="urgent" />
        <PriorityCard title="ลำดับไล่ตาม 1/69 หลัง 25 ส.ค." items={CATCH_UP_PRIORITY} />
      </section>

      <section className="card">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Work phases</p>
            <h3 className="section-title">งานที่ต้องทำตามช่วงเวลา</h3>
          </div>
        </div>
        <div className="mt-5 grid gap-4">
          {EXAM_PREP_PHASES.map((phase, index) => (
            <motion.article
              key={phase.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="rounded-xl border border-ink-900/10 bg-paper-50 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-xs font-semibold text-amber-700">{phase.period}</p>
                  <h4 className="mt-1 font-serif text-xl text-ink-900">{phase.title}</h4>
                  <p className="mt-1 text-sm text-ink-500">{phase.ratio}</p>
                </div>
              </div>
              <ul className="mt-4 grid gap-2 text-sm leading-6 text-ink-700 sm:grid-cols-2">
                {phase.tasks.map((task) => (
                  <li key={task} className="rounded-lg bg-paper-100 px-3 py-2">{task}</li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ExamTable title="ตารางสอบวิชาเก่า 2/68" exams={OLD_TERM_EXAMS} />
        <ExamTable title="ตารางสอบ 1/69" exams={NEW_TERM_EXAMS} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="card">
          <p className="eyebrow">POL2200 focus</p>
          <h3 className="section-title">คลิปที่ต้องให้ความสำคัญ</h3>
          <div className="mt-4 grid gap-2">
            {POL2200_FOCUS.importantVideos.map((video) => (
              <p key={video} className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-800">
                {video}
              </p>
            ))}
          </div>
        </section>
        <section className="card">
          <p className="eyebrow">Core concepts</p>
          <h3 className="section-title">แนวคิดที่ต้องแยกให้ได้</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {POL2200_FOCUS.concepts.map((concept) => (
              <span key={concept} className="rounded-lg border border-ink-900/10 bg-paper-50 px-3 py-2 text-sm text-ink-700">
                {concept}
              </span>
            ))}
          </div>
        </section>
      </section>

      <section className="card">
        <p className="eyebrow">1/69 class conflict</p>
        <h3 className="section-title">ตารางเรียนและจุดซ้อนวันพุธ</h3>
        <div className="mt-4 grid gap-2">
          {NEW_TERM_CLASSES.map((item) => (
            <div key={`${item.day}-${item.code}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-paper-50 px-3 py-2 text-sm">
              <span className="font-semibold text-ink-800">{item.day} {item.time}</span>
              <span className="font-mono text-amber-700">{item.code}</span>
              <span className="text-ink-500">{item.room}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-sm text-ink-700">
          วันพุธให้เข้า POL2106 สด เพราะสอบวันที่ 16 ต.ค. ส่วน RAM1121 ให้เรียนย้อนหลังทุกวันศุกร์
        </p>
      </section>
    </div>
  );
}

function HeroMetric({ detail, label, value }) {
  return (
    <div className="rounded-xl border border-paper-100/10 bg-paper-100/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-paper-100/45">{label}</p>
      <p className="mt-2 font-serif text-2xl text-paper-100">{value}</p>
      <p className="mt-1 text-xs text-paper-100/55">{detail}</p>
    </div>
  );
}

function PriorityCard({ items, title, tone = "normal" }) {
  const toneClass = tone === "urgent" ? "border-red-500/20 bg-red-500/5" : "border-ink-900/10 bg-paper-50";
  return (
    <section className={`rounded-2xl border p-5 ${toneClass}`}>
      <p className="eyebrow">Priority order</p>
      <h3 className="section-title">{title}</h3>
      <div className="mt-4 grid gap-2">
        {items.map((code, index) => (
          <div key={code} className="flex items-center gap-3 rounded-lg bg-paper-100 px-3 py-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-ink-900 text-xs font-semibold text-paper-100">{index + 1}</span>
            <span className="font-mono text-sm font-semibold text-ink-800">{code}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ExamTable({ exams, title }) {
  return (
    <section className="card">
      <p className="eyebrow">Exam schedule</p>
      <h3 className="section-title">{title}</h3>
      <div className="mt-4 overflow-hidden rounded-xl border border-ink-900/10">
        {exams.map((exam) => (
          <div key={`${exam.date}-${exam.time}-${exam.code}`} className="grid grid-cols-[1fr_auto] gap-3 border-b border-ink-900/10 bg-paper-50 px-3 py-3 last:border-b-0">
            <div>
              <p className="font-mono text-sm font-semibold text-amber-700">{exam.code}</p>
              <p className="mt-1 text-sm text-ink-700">{exam.title}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-ink-800">{formatThaiDate(exam.date)}</p>
              <p className="mt-1 text-xs text-ink-500">{exam.time}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function getNextExam(exams) {
  const today = getToday();
  return exams
    .map((exam) => ({ ...exam, dateObject: parseThaiYearDate(exam.date) }))
    .filter((exam) => exam.dateObject >= today)
    .sort((a, b) => a.dateObject - b.dateObject || examTime(a).localeCompare(examTime(b)))[0] || null;
}

function formatExam(exam) {
  return `${formatThaiDate(exam.date)} เวลา ${exam.time}`;
}

function formatThaiDate(date) {
  return TH_DATE_FORMAT.format(parseThaiYearDate(date));
}

function parseThaiYearDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year - 543, month - 1, day);
}

function examTime(exam) {
  return String(exam.time || "").split("-")[0];
}

function getToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}
