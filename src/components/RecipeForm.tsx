import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { RecipeDraft, RecipeFull } from "../data/types";
import { useT } from "../i18n/I18nProvider";
import Button from "./Button";
import Card from "./Card";
import ConfirmDialog from "./ConfirmDialog";
import ErrorNote from "./ErrorNote";
import IconButton from "./IconButton";
import PhotoPicker from "./PhotoPicker";
import Screen from "./Screen";
import TextField from "./TextField";
import {
  IconArrowDown,
  IconArrowUp,
  IconCheck,
  IconClose,
  IconPlus,
} from "./icons";
import "./RecipeForm.css";

/** Строки списков получают собственный ключ: по нему React отличает
 *  их друг от друга, даже когда текст одинаковый или пустой. */
type IngredientRow = { key: string; text: string };
type StepRow = { key: string; text: string; photo: string | null };

type RecipeFormProps = {
  /** Заголовок экрана */
  screenTitle: string;
  backTo: string;
  submitLabel: string;
  /** Рецепт, который правим. Для нового рецепта — ничего */
  initial?: RecipeFull | null;
  onSubmit: (draft: RecipeDraft) => Promise<void>;
};

let keyCounter = 0;
function newKey() {
  keyCounter += 1;
  return `row-${keyCounter}`;
}

/**
 * Общая форма для создания и правки рецепта.
 *
 * Ничего не сохраняется само: изменения живут в форме, пока
 * пользователь не нажмёт кнопку внизу. Так понятнее — по опыту людей
 * сбивает с толку, когда приложение «уже всё сохранило» без спроса.
 */
export default function RecipeForm({
  screenTitle,
  backTo,
  submitLabel,
  initial,
  onSubmit,
}: RecipeFormProps) {
  const t = useT();
  const navigate = useNavigate();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [coverPhoto, setCoverPhoto] = useState<string | null>(
    initial?.coverPhoto ?? null,
  );

  const [ingredients, setIngredients] = useState<IngredientRow[]>(() =>
    (initial?.ingredients ?? []).map((i) => ({ key: newKey(), text: i.text })),
  );

  const [steps, setSteps] = useState<StepRow[]>(() =>
    (initial?.steps ?? []).map((s) => ({
      key: newKey(),
      text: s.text,
      photo: s.photo,
    })),
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);

  // Чтобы только что добавленная строка сразу получала курсор
  const focusNext = useRef(false);

  const canSave = title.trim().length > 0 && !saving;

  // Сравниваем форму с тем, какой она была при открытии. Если человек
  // что-то успел ввести, уход с экрана нужно подтверждать — иначе одно
  // случайное нажатие «назад» стирает весь набранный рецепт.
  const initialSnapshot = useMemo(
    () =>
      JSON.stringify({
        title: initial?.title ?? "",
        coverPhoto: initial?.coverPhoto ?? null,
        ingredients: (initial?.ingredients ?? []).map((i) => i.text),
        steps: (initial?.steps ?? []).map((s) => ({ text: s.text, photo: s.photo })),
      }),
    [initial],
  );

  const currentSnapshot = JSON.stringify({
    title,
    coverPhoto,
    ingredients: ingredients.map((row) => row.text),
    steps: steps.map((row) => ({ text: row.text, photo: row.photo })),
  });

  const dirty = currentSnapshot !== initialSnapshot;

  function handleBack() {
    if (dirty) setLeaveOpen(true);
    else navigate(backTo);
  }

  function addIngredient() {
    focusNext.current = true;
    setIngredients((rows) => [...rows, { key: newKey(), text: "" }]);
  }

  function addStep() {
    focusNext.current = true;
    setSteps((rows) => [...rows, { key: newKey(), text: "", photo: null }]);
  }

  /** Меняет этап местами с соседним: -1 — вверх, +1 — вниз */
  function moveStep(index: number, delta: number) {
    setSteps((rows) => {
      const target = index + delta;
      if (target < 0 || target >= rows.length) return rows;

      const next = rows.slice();
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSubmit() {
    if (!canSave) return;

    setSaving(true);
    setError(null);

    try {
      await onSubmit({
        title: title.trim(),
        coverPhoto,
        // Пустые строки просто выбрасываем: человек мог нажать «добавить»
        // и передумать, ругаться на него за это незачем
        ingredients: ingredients
          .map((row) => row.text.trim())
          .filter((text) => text.length > 0),
        steps: steps
          .map((row) => ({ text: row.text.trim(), photo: row.photo }))
          .filter((step) => step.text.length > 0 || step.photo !== null),
      });
    } catch (e) {
      setError(String(e));
      setSaving(false);
    }
  }

  return (
    <Screen
      title={screenTitle}
      onBack={handleBack}
      footer={
        <>
          <Button
            variant="primary"
            size="lg"
            block
            icon={<IconCheck />}
            disabled={!canSave}
            onClick={() => void handleSubmit()}
          >
            {saving ? t.saving : submitLabel}
          </Button>
          {title.trim().length === 0 ? (
            <p className="form__hintFooter">{t.needTitleHint}</p>
          ) : null}
        </>
      }
    >
      {error ? <ErrorNote text={error} /> : null}

      {/* --- Название и обложка --- */}
      <section className="form__section">
        <TextField
          label={t.titleLabel}
          value={title}
          onChange={setTitle}
          placeholder={t.titlePlaceholder}
          maxLength={120}
          enterKeyHint="done"
        />

        <PhotoPicker
          photo={coverPhoto}
          onChange={setCoverPhoto}
          addLabel={t.addCoverPhoto}
        />
      </section>

      {/* --- Ингредиенты --- */}
      <section className="form__section">
        <h2 className="form__heading">{t.ingredients}</h2>

        {ingredients.length === 0 ? (
          <p className="form__empty">{t.noIngredientsYet}</p>
        ) : (
          <ul className="form__rows">
            {ingredients.map((row, index) => (
              <li className="form__row" key={row.key}>
                <div className="form__rowField">
                  <TextField
                    value={row.text}
                    onChange={(text) =>
                      setIngredients((rows) =>
                        rows.map((r) => (r.key === row.key ? { ...r, text } : r)),
                      )
                    }
                    placeholder={t.ingredientPlaceholder(index + 1)}
                    maxLength={120}
                    enterKeyHint="next"
                    autoFocus={focusNext.current && index === ingredients.length - 1}
                    onEnter={addIngredient}
                  />
                </div>

                <IconButton
                  label={t.removeIngredient}
                  tone="ghost"
                  icon={<IconClose />}
                  onClick={() =>
                    setIngredients((rows) => rows.filter((r) => r.key !== row.key))
                  }
                />
              </li>
            ))}
          </ul>
        )}

        <Button variant="mint" block icon={<IconPlus />} onClick={addIngredient}>
          {t.addIngredient}
        </Button>
      </section>

      {/* --- Этапы приготовления --- */}
      <section className="form__section">
        <h2 className="form__heading">{t.stepsHeading}</h2>

        {steps.length === 0 ? <p className="form__empty">{t.stepsHint}</p> : null}

        {steps.map((row, index) => (
          <Card tone="mint" className="stepEditor" key={row.key}>
            <div className="stepEditor__head">
              <span className="stepEditor__number">{t.stepNumber(index + 1)}</span>

              <div className="stepEditor__tools">
                <IconButton
                  label={t.moveUp}
                  tone="ghost"
                  icon={<IconArrowUp />}
                  disabled={index === 0}
                  onClick={() => moveStep(index, -1)}
                />
                <IconButton
                  label={t.moveDown}
                  tone="ghost"
                  icon={<IconArrowDown />}
                  disabled={index === steps.length - 1}
                  onClick={() => moveStep(index, 1)}
                />
                <IconButton
                  label={t.removeStep}
                  tone="ghost"
                  icon={<IconClose />}
                  onClick={() =>
                    setSteps((rows) => rows.filter((r) => r.key !== row.key))
                  }
                />
              </div>
            </div>

            <TextField
              value={row.text}
              onChange={(text) =>
                setSteps((rows) =>
                  rows.map((r) => (r.key === row.key ? { ...r, text } : r)),
                )
              }
              placeholder={t.stepPlaceholder}
              multiline
              rows={3}
              maxLength={1000}
              autoFocus={focusNext.current && index === steps.length - 1}
            />

            <PhotoPicker
              photo={row.photo}
              onChange={(photo) =>
                setSteps((rows) =>
                  rows.map((r) => (r.key === row.key ? { ...r, photo } : r)),
                )
              }
              addLabel={t.addStepPhoto}
            />
          </Card>
        ))}

        <Button variant="mint" block icon={<IconPlus />} onClick={addStep}>
          {t.addStep}
        </Button>
      </section>

      <ConfirmDialog
        open={leaveOpen}
        danger
        title={t.leaveTitle}
        message={t.leaveMessage}
        confirmLabel={t.leaveConfirm}
        cancelLabel={t.leaveStay}
        onConfirm={() => {
          setLeaveOpen(false);
          navigate(backTo);
        }}
        onCancel={() => setLeaveOpen(false)}
      />
    </Screen>
  );
}
