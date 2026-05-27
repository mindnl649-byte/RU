import { useTranslation } from "react-i18next";

export function Flashcards({ studyState, updateStudyState }) {
  const { t } = useTranslation();
  const cards = studyState.flashcards || [];

  function addCard(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const q = String(form.get("question") || "").trim();
    const a = String(form.get("answer") || "").trim();
    if (!q || !a) return;
    updateStudyState({ flashcards: [...cards, { q, a }] });
    event.currentTarget.reset();
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">{t("flashcards.eyebrow")}</p>
        <h2 className="page-title">{t("flashcards.title")}</h2>
      </header>
      <form className="card grid gap-3" onSubmit={addCard}>
        <input className="field" name="question" placeholder={t("flashcards.question")} />
        <textarea className="field min-h-24 resize-none" name="answer" placeholder={t("flashcards.answer")} />
        <button className="btn-primary" type="submit">{t("flashcards.addFlashcard")}</button>
      </form>
      <section className="grid gap-4 md:grid-cols-2">
        {cards.map((card, index) => (
          <article key={`${card.q}-${index}`} className="card">
            <p className="eyebrow">{t("flashcards.questionLabel")}</p>
            <p className="mt-2 font-lora text-base leading-7">{card.q}</p>
            <p className="eyebrow mt-5">{t("flashcards.answerLabel")}</p>
            <p className="mt-2 text-sm leading-6 text-ink-600">{card.a}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
