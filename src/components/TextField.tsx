import { useId } from "react";

import "./TextField.css";

type TextFieldProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Подсказка под полем — маленьким серым текстом */
  hint?: string;
  /** Многострочное поле: для описания этапа приготовления */
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  autoFocus?: boolean;
  /** Что делает клавиша Enter на экранной клавиатуре Android */
  enterKeyHint?: "enter" | "done" | "go" | "next" | "send";
  onEnter?: () => void;
};

export default function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  multiline = false,
  rows = 3,
  maxLength,
  autoFocus,
  enterKeyHint,
  onEnter,
}: TextFieldProps) {
  const id = useId();

  const shared = {
    id,
    value,
    placeholder,
    maxLength,
    autoFocus,
    enterKeyHint,
    className: "field__input",
    onChange: (e: { target: { value: string } }) => onChange(e.target.value),
  };

  return (
    <div className="field">
      {label ? (
        <label className="field__label" htmlFor={id}>
          {label}
        </label>
      ) : null}

      {multiline ? (
        <textarea {...shared} rows={rows} className="field__input field__input--multiline" />
      ) : (
        <input
          {...shared}
          type="text"
          onKeyDown={(e) => {
            if (e.key === "Enter" && onEnter) {
              e.preventDefault();
              onEnter();
            }
          }}
        />
      )}

      {hint ? <p className="field__hint">{hint}</p> : null}
    </div>
  );
}
