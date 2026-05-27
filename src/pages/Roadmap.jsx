import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTranslation } from "react-i18next";
import { getGraduationStats } from "../utils/calculations.js";

export function Roadmap({ studyState }) {
  const { t } = useTranslation();
  const graduation = getGraduationStats(studyState);

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">{t("roadmap.eyebrow")}</p>
        <h2 className="page-title">{t("roadmap.title", { term: graduation.graduationTerm })}</h2>
      </header>

      <section className="card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">{t("roadmap.creditTracking")}</p>
            <h3 className="section-title">{graduation.graduationPercentage}% {t("roadmap.complete")}</h3>
          </div>
          <p className="font-mono text-sm text-ink-500">
            {graduation.completedCredits}/{graduation.totalCreditsRequired} {t("roadmap.credits")}
          </p>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-paper-300">
          <div className="h-full rounded-full bg-amber-500" style={{ width: `${graduation.graduationPercentage}%` }} />
        </div>
      </section>

      <section className="card">
        <p className="eyebrow">{t("roadmap.semesterWorkload")}</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={graduation.semesters}>
              <XAxis dataKey="semester" tick={{ fontSize: 11, fill: "#8a8070" }} />
              <YAxis tick={{ fontSize: 11, fill: "#8a8070" }} />
              <Tooltip />
              <Bar dataKey="subjectCount" fill="#c8861a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid gap-4">
        {graduation.semesters.map((semester) => (
          <article key={semester.semester} className="card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-serif text-xl">{semester.semester}</h3>
                <p className="mt-1 text-sm text-ink-500">
                  {semester.subjectCount} {t("roadmap.subjects")} - {semester.credits} {t("roadmap.credits")} - {t("roadmap.cumulative")} {semester.cumulativeCredits}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  semester.overloaded
                    ? "bg-red-100 text-red-800"
                    : "bg-amber-500/10 text-amber-700"
                }`}
              >
                {semester.overloaded ? t("roadmap.overloadWarning") : semester.workload}
              </span>
            </div>
            {semester.overloaded && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {t("roadmap.semesterHeavyWarning")}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {semester.subjects.map((subject) => (
                <span key={subject.code} className="rounded-md border border-ink-900/10 bg-paper-50 px-2 py-1 font-mono text-xs text-ink-600">
                  {subject.code}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
