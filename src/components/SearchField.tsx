import { IconClose, IconSearch } from "./icons";
import "./SearchField.css";

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** Подпись для скринридера на крестике очистки */
  clearLabel: string;
};

/** Строка поиска в шапке: белая «таблетка» на мятном фоне. */
export default function SearchField({
  value,
  onChange,
  placeholder,
  clearLabel,
}: SearchFieldProps) {
  return (
    <div className="search">
      <IconSearch className="search__icon" />

      <input
        type="search"
        className="search__input"
        value={value}
        placeholder={placeholder}
        // Поиск идёт по мере ввода, поэтому клавиша Enter просто убирает клавиатуру
        enterKeyHint="search"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
      />

      {value ? (
        <button
          type="button"
          className="search__clear"
          aria-label={clearLabel}
          title={clearLabel}
          onClick={() => onChange("")}
        >
          <IconClose />
        </button>
      ) : null}
    </div>
  );
}
