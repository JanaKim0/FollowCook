import { useRef, useState } from "react";

import { getStore } from "../data/store";
import Button from "./Button";
import Photo from "./Photo";
import { IconCamera, IconClose } from "./icons";
import "./PhotoPicker.css";

type PhotoPickerProps = {
  photo: string | null;
  onChange: (photo: string | null) => void;
  /** Подпись на кнопке, когда фото ещё нет */
  addLabel: string;
  ratio?: "cover" | "step";
};

/**
 * Выбор фотографии.
 *
 * Используется обычное поле выбора файла: Android сам показывает окно,
 * где можно и сделать снимок камерой, и взять готовый из галереи —
 * поэтому отдельная кнопка для камеры не нужна.
 */
export default function PhotoPicker({
  photo,
  onChange,
  addLabel,
  ratio = "cover",
}: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;

    setBusy(true);
    try {
      const store = await getStore();
      onChange(await store.savePhoto(file));
    } catch (e) {
      console.error("[FollowCook] не удалось сохранить фото", e);
    } finally {
      setBusy(false);
      // Сбрасываем поле, иначе повторный выбор того же файла не сработает
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="picker">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="picker__input"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />

      {photo ? (
        <div className="picker__preview">
          <Photo photo={photo} alt="Выбранная фотография" ratio={ratio} />

          <div className="picker__actions">
            <Button
              variant="secondary"
              size="sm"
              icon={<IconCamera />}
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              Заменить
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<IconClose />}
              onClick={() => onChange(null)}
            >
              Убрать
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="picker__add"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <IconCamera className="picker__addIcon" />
          <span>{busy ? "Сохраняем…" : addLabel}</span>
        </button>
      )}
    </div>
  );
}
