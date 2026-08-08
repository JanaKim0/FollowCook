import { useT } from "../i18n/I18nProvider";
import "./ErrorNote.css";

/** Спокойное сообщение об ошибке вместо пустого экрана без объяснений. */
export default function ErrorNote({ text }: { text: string }) {
  const t = useT();

  return (
    <div className="errorNote" role="alert">
      <p className="errorNote__title">{t.errorTitle}</p>
      <p className="errorNote__detail">{text}</p>
    </div>
  );
}
