import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getStore } from "../data/store";
import { en } from "./en";
import { ru, type Dict } from "./ru";

export type Language = "ru" | "en";

const DICTS: Record<Language, Dict> = { ru, en };

/** Ключ, под которым выбранный язык лежит в настройках приложения */
const SETTING_KEY = "language";

type I18nValue = {
  t: Dict;
  language: Language;
  setLanguage: (language: Language) => void;
};

const I18nContext = createContext<I18nValue | null>(null);

/** Язык телефона — им пользуемся, пока человек не выбрал свой */
function deviceLanguage(): Language {
  return navigator.language?.toLowerCase().startsWith("ru") ? "ru" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(deviceLanguage);

  // Пока язык не прочитан из настроек, интерфейс не показываем:
  // иначе на долю секунды мелькнёт не тот язык
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getStore()
      .then((store) => store.getSetting(SETTING_KEY))
      .then((saved) => {
        if (cancelled) return;
        if (saved === "ru" || saved === "en") setLanguageState(saved);
      })
      .catch(() => {
        // Настройки не прочитались — остаёмся на языке телефона
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Атрибут lang нужен браузеру для правильных переносов и озвучки
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    void getStore().then((store) => store.setSetting(SETTING_KEY, next));
  }, []);

  const value = useMemo<I18nValue>(
    () => ({ t: DICTS[language], language, setLanguage }),
    [language, setLanguage],
  );

  if (!ready) return null;

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Тексты и текущий язык. Работает только внутри I18nProvider. */
export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n вызван вне I18nProvider");
  return value;
}

/** Короткая форма, когда нужны только тексты. */
export function useT(): Dict {
  return useI18n().t;
}
