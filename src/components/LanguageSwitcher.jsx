import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="flex gap-2 text-xs font-semibold">
      <button
        onClick={() => handleLanguageChange("th")}
        className={`px-2 py-1 rounded transition ${
          i18n.language === "th"
            ? "bg-amber-500 text-white"
            : "text-amber-500 hover:bg-amber-500/10"
        }`}
      >
        ไทย
      </button>
      <span className="text-ink-300">|</span>
      <button
        onClick={() => handleLanguageChange("en")}
        className={`px-2 py-1 rounded transition ${
          i18n.language === "en"
            ? "bg-amber-500 text-white"
            : "text-amber-500 hover:bg-amber-500/10"
        }`}
      >
        English
      </button>
    </div>
  );
}
