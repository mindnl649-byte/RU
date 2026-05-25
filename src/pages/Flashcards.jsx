export function Flashcards({ studyState, updateStudyState }) {
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
        <p className="eyebrow">Revision cards</p>
        <h2 className="page-title">Exam review, not generic trivia.</h2>
      </header>
      <form className="card grid gap-3" onSubmit={addCard}>
        <input className="field" name="question" placeholder="Question" />
        <textarea className="field min-h-24 resize-none" name="answer" placeholder="Answer" />
        <button className="btn-primary" type="submit">Add flashcard</button>
      </form>
      <section className="grid gap-4 md:grid-cols-2">
        {cards.map((card, index) => (
          <article key={`${card.q}-${index}`} className="card">
            <p className="eyebrow">Question</p>
            <p className="mt-2 font-lora text-base leading-7">{card.q}</p>
            <p className="eyebrow mt-5">Answer</p>
            <p className="mt-2 text-sm leading-6 text-ink-600">{card.a}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
