import "./ErrorNote.css";

/** Спокойное сообщение об ошибке вместо пустого экрана без объяснений. */
export default function ErrorNote({ text }: { text: string }) {
  return (
    <div className="errorNote" role="alert">
      <p className="errorNote__title">Что-то пошло не так</p>
      <p className="errorNote__detail">{text}</p>
    </div>
  );
}
