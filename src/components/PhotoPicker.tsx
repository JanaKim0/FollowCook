import { useRef, useState } from "react";

import { getStore } from "../data/store";
import { useT } from "../i18n/I18nProvider";
import Button from "./Button";
import Photo from "./Photo";
import PhotoCropper from "./PhotoCropper";
import { IconCamera, IconClose } from "./icons";
import "./PhotoPicker.css";

type PhotoPickerProps = {
  photo: string | null;
  onChange: (photo: string | null) => void;
  /** Подпись на кнопке, когда фото ещё нет */
  addLabel: string;
};

/**
 * Выбор фотографии.
 *
 * Используется обычное поле выбора файла: Android сам показывает окно,
 * где можно и сделать снимок камерой, и взять готовый из галереи —
 * поэтому отдельная кнопка для камеры не нужна.
 *
 * Выбранный снимок сразу открывается в кадраторе: сохраняется ровно тот
 * кусок, который человек выбрал, а не обрезанная по центру середина.
 */
export default function PhotoPicker({ photo, onChange, addLabel }: PhotoPickerProps) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);

  /** Снимок, выбранный в галерее, но ещё не обрезанный */
  const [pending, setPending] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  function resetInput() {
    // Без сброса повторный выбор того же файла не вызовет событие
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleCropped(cropped: Blob) {
    setPending(null);
    setBusy(true);
    try {
      const store = await getStore();
      onChange(await store.savePhoto(cropped));
    } catch (e) {
      console.error("[FollowCook] не удалось сохранить фото", e);
    } finally {
      setBusy(false);
      resetInput();
    }
  }

  return (
    <div className="picker">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="picker__input"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) setPending(file);
        }}
      />

      {photo ? (
        <div className="picker__preview">
          <Photo photo={photo} alt={t.chosenPhotoAlt} />

          <div className="picker__actions">
            <Button
              variant="secondary"
              size="sm"
              icon={<IconCamera />}
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              {t.replacePhoto}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<IconClose />}
              onClick={() => onChange(null)}
            >
              {t.removePhoto}
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
          <span>{busy ? t.saving : addLabel}</span>
        </button>
      )}

      {pending ? (
        <PhotoCropper
          file={pending}
          onCancel={() => {
            setPending(null);
            resetInput();
          }}
          onConfirm={(cropped) => void handleCropped(cropped)}
        />
      ) : null}
    </div>
  );
}
