import logoUrl from "../assets/logo.png";
import Button from "../components/Button";
import Card from "../components/Card";
import Screen from "../components/Screen";
import { useI18n, type Language } from "../i18n/I18nProvider";
import { openExternal } from "../lib/openExternal";
import "./SettingsScreen.css";
import { paths } from "./paths";

/** Адрес проекта на GitHub */
const REPO_URL = "https://github.com/JanaKim0/FollowCook";

export default function SettingsScreen() {
  const { t, language, setLanguage } = useI18n();

  const options: Array<{ value: Language; label: string }> = [
    { value: "ru", label: t.languageRussian },
    { value: "en", label: t.languageEnglish },
  ];

  return (
    <Screen title={t.settings} backTo={paths.home}>
      {/* --- Выбор языка --- */}
      <section className="settings__section">
        <h2 className="settings__heading">{t.language}</h2>

        <div className="langSwitch" role="group" aria-label={t.language}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={
                "langSwitch__option" +
                (language === option.value ? " langSwitch__option--active" : "")
              }
              aria-pressed={language === option.value}
              onClick={() => setLanguage(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      {/* --- Об авторе --- */}
      <section className="settings__section">
        <h2 className="settings__heading">{t.author}</h2>

        <Card>
          <div className="settings__author">
            <img className="settings__authorArt" src={logoUrl} alt="" />
            <div className="settings__authorText">
              <p className="settings__authorName">{t.authorName}</p>
              <p className="settings__authorLink">github.com/JanaKim0</p>
            </div>
          </div>

          <Button
            variant="secondary"
            block
            className="settings__githubBtn"
            onClick={() => void openExternal(REPO_URL)}
          >
            {t.openGithub}
          </Button>
        </Card>
      </section>

      <p className="settings__madeFor">{t.madeFor} 💚</p>
    </Screen>
  );
}
