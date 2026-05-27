import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher.jsx";

const NAV_ITEMS_CONFIG = [
  { id: "today", labelKey: "nav.today", icon: "T" },
  { id: "subjects", labelKey: "nav.subjects", icon: "S" },
  { id: "calendar", labelKey: "nav.calendar", icon: "📅" },
  { id: "roadmap", labelKey: "nav.roadmap", icon: "R" },
  { id: "timer", labelKey: "nav.focus", icon: "F" },
  { id: "cards", labelKey: "nav.cards", icon: "C" },
];

export function Shell({ activePage, children, setActivePage, syncStatus, user }) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col bg-paper-100 text-ink-900 lg:flex-row lg:bg-transparent">
      <aside className="hidden w-72 shrink-0 border-r border-ink-900/10 bg-paper-100/90 p-5 backdrop-blur lg:block">
        <Brand syncStatus={syncStatus} user={user} />
        <nav className="mt-8 grid gap-1" aria-label="Primary navigation">
          {NAV_ITEMS_CONFIG.map((item) => (
            <button
              key={item.id}
              className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold transition ${
                activePage === item.id
                  ? "bg-ink-900 text-paper-100"
                  : "text-ink-600 hover:bg-ink-900/5 hover:text-ink-900"
              }`}
              onClick={() => setActivePage(item.id)}
            >
              <span className="grid h-7 w-7 place-items-center rounded-md bg-paper-200 text-xs">{item.icon}</span>
              {t(item.labelKey)}
            </button>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 pb-24 lg:pb-8">
        <div className="sticky top-0 z-20 border-b border-ink-900/10 bg-paper-100/90 px-5 py-4 backdrop-blur lg:hidden">
          <Brand compact syncStatus={syncStatus} user={user} />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="px-5 py-6 sm:px-7 lg:px-9"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto grid h-16 max-w-md grid-cols-5 border-t border-ink-900/10 bg-paper-100/95 px-2 backdrop-blur lg:hidden">
        {NAV_ITEMS_CONFIG.slice(0, 5).map((item) => (
          <button
            key={item.id}
            className={`grid place-items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              activePage === item.id ? "text-amber-500" : "text-ink-400"
            }`}
            onClick={() => setActivePage(item.id)}
          >
            <span className="font-mono text-base">{item.icon}</span>
            {t(item.labelKey)}
          </button>
        ))}
      </nav>
    </div>
  );
}

function Brand({ compact = false, syncStatus, user }) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-500">{t("brand.studium")}</p>
        <h1 className={`${compact ? "text-xl" : "text-3xl"} font-serif font-medium leading-tight`}>
          {t("brand.title")}
        </h1>
      </div>
      <div className="flex flex-col items-end gap-3">
        <div className="rounded-full border border-ink-900/10 bg-paper-200 px-3 py-1 text-xs font-semibold text-ink-600">
          {user ? syncStatus : "local"}
        </div>
        <LanguageSwitcher />
      </div>
    </div>
  );
}
