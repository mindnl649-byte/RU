import { useTranslation } from "react-i18next";

export function Timer({ studyState, updateStudyState }) {
  const { t } = useTranslation();
  const seconds = studyState.timerSeconds || 25 * 60;
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const rest = String(seconds % 60).padStart(2, "0");

  function setPreset(nextSeconds) {
    updateStudyState({ timerSeconds: nextSeconds });
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">{t("timer.eyebrow")}</p>
        <h2 className="page-title">{t("timer.title")}</h2>
      </header>
      <section className="card mx-auto max-w-lg text-center">
        <div className="mx-auto grid h-44 w-44 place-items-center rounded-full border border-ink-900/10 bg-paper-50 sm:h-56 sm:w-56">
          <div>
            <p className="font-serif text-5xl tabular-nums">{minutes}:{rest}</p>
            <p className="mt-2 text-sm text-ink-500">{t("timer.ready")}</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2">
          <button className="btn-secondary" onClick={() => setPreset(25 * 60)}>{t("timer.twenty_five_min")}</button>
          <button className="btn-secondary" onClick={() => setPreset(50 * 60)}>{t("timer.fifty_min")}</button>
          <button className="btn-secondary" onClick={() => setPreset(5 * 60)}>{t("timer.break")}</button>
        </div>
      </section>
    </div>
  );
}
