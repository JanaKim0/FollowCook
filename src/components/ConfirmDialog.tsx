import { useEffect } from "react";

import Button from "./Button";
import "./ConfirmDialog.css";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  /** Красная кнопка подтверждения — для удаления */
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Окно подтверждения. Используется там, где действие нельзя отменить —
 * прежде всего при удалении рецепта.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Пока окно открыто, экран под ним не прокручивается,
  // а кнопка «назад» на Android закрывает окно, а не уводит с экрана
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="dialog" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        className="dialog__backdrop"
        aria-label={cancelLabel}
        onClick={onCancel}
      />

      <div className="dialog__panel">
        <h2 className="dialog__title">{title}</h2>
        {message ? <p className="dialog__message">{message}</p> : null}

        <div className="dialog__actions">
          <Button variant={danger ? "danger" : "primary"} block onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button variant="secondary" block onClick={onCancel}>
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
