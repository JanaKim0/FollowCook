import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { useT } from "../i18n/I18nProvider";
import Button from "./Button";
import "./PhotoCropper.css";
import { PHOTO_ASPECT } from "./photoRatios";

/** Наибольшая сторона сохраняемого кадра */
const MAX_OUTPUT_WIDTH = 1600;

/** Меньше этого рамку не ужать — иначе в неё не попасть пальцем */
const MIN_FRAME = 64;

type Rect = { x: number; y: number; w: number; h: number };

type Corner = "nw" | "ne" | "sw" | "se";

/** Что именно начали тянуть */
type DragInit = { kind: "move" } | { kind: "resize"; corner: Corner };

/** Тянем прямо сейчас: с чего начали и какой была рамка в тот момент */
type Drag = DragInit & { startX: number; startY: number; rect: Rect };

type PhotoCropperProps = {
  /** Файл, который пользователь только что выбрал */
  file: Blob;
  onCancel: () => void;
  onConfirm: (cropped: Blob) => void;
};

/**
 * Выбор кадра перед сохранением.
 *
 * Без него снимок обрезался бы по центру сам, и вертикальные фотографии
 * с телефона превращались в непонятный кусок середины. Здесь человек сам
 * решает, что попадёт в рецепт.
 *
 * Пропорции рамки жёстко заданы: она всегда широкая горизонтальная,
 * растянуть её в вертикальную или квадратную нельзя. Поэтому фотографии
 * в рецепте выглядят одинаково аккуратно, что бы ни выбрали.
 */
export default function PhotoCropper({ file, onCancel, onConfirm }: PhotoCropperProps) {
  const t = useT();
  const aspect = PHOTO_ASPECT;

  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag | null>(null);

  /** Снимок, развёрнутый по метке EXIF: и показываем, и режем именно его */
  const [source, setSource] = useState<{
    url: string;
    blob: Blob;
    width: number;
    height: number;
  } | null>(null);

  const [stage, setStage] = useState({ w: 0, h: 0 });
  const [rect, setRect] = useState<Rect | null>(null);
  const [saving, setSaving] = useState(false);

  // --- Готовим снимок ---
  // Фото с телефона часто лежит на боку, а поворот записан отдельной меткой.
  // Разворачиваем его один раз здесь, чтобы рамка и результат совпадали.
  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    (async () => {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      canvas.getContext("2d")?.drawImage(bitmap, 0, 0);
      const { width, height } = bitmap;
      bitmap.close();

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.92),
      );
      if (!blob || cancelled) return;

      objectUrl = URL.createObjectURL(blob);
      setSource({ url: objectUrl, blob, width, height });
    })().catch((e: unknown) => {
      console.error("[FollowCook] не удалось открыть снимок", e);
      onCancel();
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file, onCancel]);

  // Пока кадратор открыт, экран под ним не прокручивается
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // --- Размер области показа ---
  useLayoutEffect(() => {
    const node = stageRef.current;
    if (!node) return;

    const measure = () =>
      setStage({ w: node.clientWidth, h: node.clientHeight });

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [source]);

  /** Снимок вписан в область показа целиком — виден весь кадр */
  const fitted =
    source && stage.w > 0 && stage.h > 0
      ? (() => {
          const scale = Math.min(stage.w / source.width, stage.h / source.height);
          return { w: source.width * scale, h: source.height * scale };
        })()
      : null;

  /** Размер области показа на прошлом пересчёте — чтобы отличать первый от последующих */
  const prevFit = useRef<{ w: number; h: number; aspect: number } | null>(null);

  useEffect(() => {
    if (!fitted) return;

    const prev = prevFit.current;
    prevFit.current = { w: fitted.w, h: fitted.h, aspect };

    setRect((current) => {
      // Первый раз или сменились пропорции: самая большая рамка по центру
      if (!current || !prev || prev.aspect !== aspect) {
        let w = fitted.w;
        let h = w / aspect;
        if (h > fitted.h) {
          h = fitted.h;
          w = h * aspect;
        }
        return { x: (fitted.w - w) / 2, y: (fitted.h - h) / 2, w, h };
      }

      // Область показа изменилась уже после того, как человек выбрал кадр
      // (например, повернули телефон). Рамку не сбрасываем, а тянем
      // вместе со снимком — иначе выбранный кадр пропадёт.
      const k = fitted.w / prev.w;
      return {
        x: current.x * k,
        y: current.y * k,
        w: current.w * k,
        h: current.h * k,
      };
    });
  }, [fitted?.w, fitted?.h, aspect]);

  // --- Перетаскивание ---

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent, init: DragInit) => {
      if (!rect) return;
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = { ...init, startX: e.clientX, startY: e.clientY, rect };
    },
    [rect],
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent) => {
      const drag = dragRef.current;
      if (!drag || !fitted) return;

      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      const start = drag.rect;

      if (drag.kind === "move") {
        setRect({
          ...start,
          x: clamp(start.x + dx, 0, fitted.w - start.w),
          y: clamp(start.y + dy, 0, fitted.h - start.h),
        });
        return;
      }

      // Изменение размера: противоположный угол остаётся на месте,
      // а пропорции рамки не меняются никогда
      const right = start.x + start.w;
      const bottom = start.y + start.h;
      const growsRight = drag.corner === "ne" || drag.corner === "se";
      const growsDown = drag.corner === "sw" || drag.corner === "se";

      let w = growsRight ? start.w + dx : start.w - dx;

      // Не выходим за края снимка ни по ширине, ни по высоте
      const maxW = growsRight ? fitted.w - start.x : right;
      const maxH = growsDown ? fitted.h - start.y : bottom;
      w = clamp(w, MIN_FRAME, Math.min(maxW, maxH * aspect));

      const h = w / aspect;
      setRect({
        x: growsRight ? start.x : right - w,
        y: growsDown ? start.y : bottom - h,
        w,
        h,
      });
    },
    [fitted, aspect],
  );

  const endDrag = useCallback(() => {
    dragRef.current = null;
  }, []);

  // --- Сохранение ---

  async function handleConfirm() {
    if (!source || !fitted || !rect) return;

    setSaving(true);
    try {
      // Из экранных пикселей обратно в пиксели самого снимка
      const scale = source.width / fitted.w;
      const sx = Math.round(rect.x * scale);
      const sy = Math.round(rect.y * scale);
      const sw = Math.round(rect.w * scale);
      const sh = Math.round(rect.h * scale);

      const outW = Math.min(sw, MAX_OUTPUT_WIDTH);
      const outH = Math.round(outW / aspect);

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("нет холста для обрезки");

      const bitmap = await createImageBitmap(source.blob);
      ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, outW, outH);
      bitmap.close();

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.9),
      );
      if (blob) onConfirm(blob);
    } catch (e) {
      console.error("[FollowCook] не удалось обрезать снимок", e);
      setSaving(false);
    }
  }

  return (
    <div className="cropper" role="dialog" aria-modal="true" aria-label={t.cropTitle}>
      <header className="cropper__head">
        <h2 className="cropper__title">{t.cropTitle}</h2>
        <p className="cropper__hint">{t.cropHint}</p>
      </header>

      <div className="cropper__stage" ref={stageRef}>
        {source && fitted && rect ? (
          <div
            className="cropper__canvas"
            style={{ width: fitted.w, height: fitted.h }}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <img className="cropper__img" src={source.url} alt="" draggable={false} />

            {/* Затемнение вокруг рамки: наружная тень «дырки» */}
            <div
              className="cropper__shade"
              style={{
                left: rect.x,
                top: rect.y,
                width: rect.w,
                height: rect.h,
              }}
            />

            <div
              className="cropper__frame"
              style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
              onPointerDown={(e) => handlePointerDown(e, { kind: "move" })}
            >
              <span className="cropper__grid" aria-hidden="true" />

              {(["nw", "ne", "sw", "se"] as Corner[]).map((corner) => (
                <span
                  key={corner}
                  className={`cropper__handle cropper__handle--${corner}`}
                  onPointerDown={(e) =>
                    handlePointerDown(e, { kind: "resize", corner })
                  }
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="cropper__loading">{t.cropLoading}</p>
        )}
      </div>

      <div className="cropper__actions">
        <Button
          variant="primary"
          size="lg"
          block
          disabled={!rect || saving}
          onClick={() => void handleConfirm()}
        >
          {saving ? t.saving : t.cropConfirm}
        </Button>
        <Button variant="secondary" block onClick={onCancel} disabled={saving}>
          {t.cancel}
        </Button>
      </div>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}
