import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Card from "../components/Card";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import ErrorNote from "../components/ErrorNote";
import IconButton from "../components/IconButton";
import ListSkeleton from "../components/ListSkeleton";
import Photo from "../components/Photo";
import Screen from "../components/Screen";
import { IconEdit, IconTrash } from "../components/icons";
import { useRecipe } from "../data/hooks";
import { getStore } from "../data/store";
import { pluralRu } from "../lib/plural";
import "./RecipeScreen.css";
import { paths } from "./paths";

export default function RecipeScreen() {
  const { id: idParam = "" } = useParams();
  const navigate = useNavigate();

  // Адрес мог оказаться каким угодно, поэтому число проверяем явно
  const id = Number(idParam);
  const validId = Number.isInteger(id) && id > 0 ? id : null;

  const { data: recipe, loading, error } = useRecipe(validId);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (validId === null) return;

    setDeleting(true);
    try {
      const store = await getStore();
      await store.deleteRecipe(validId);
      navigate(paths.home, { replace: true });
    } catch (e) {
      console.error("[FollowCook] не удалось удалить рецепт", e);
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  const found = !loading && !error && recipe !== null;

  return (
    <Screen
      title={recipe?.title ?? (loading ? "" : "Рецепт")}
      backTo={paths.home}
      subtitle={
        found
          ? `${recipe.steps.length} ${pluralRu(recipe.steps.length, [
              "этап",
              "этапа",
              "этапов",
            ])}`
          : undefined
      }
      headerRight={
        found ? (
          <>
            <IconButton
              to={paths.editRecipe(recipe.id)}
              label="Редактировать"
              icon={<IconEdit />}
            />
            <IconButton
              label="Удалить рецепт"
              tone="danger"
              icon={<IconTrash />}
              onClick={() => setConfirmOpen(true)}
            />
          </>
        ) : undefined
      }
    >
      {error ? <ErrorNote text={error} /> : null}

      {loading ? <ListSkeleton count={1} /> : null}

      {!loading && !error && recipe === null ? (
        <EmptyState
          title="Рецепт не найден"
          message="Возможно, он был удалён."
        />
      ) : null}

      {found ? (
        <>
          {recipe.coverPhoto ? (
            <Photo photo={recipe.coverPhoto} alt={recipe.title} ratio="cover" />
          ) : null}

          {/* --- Ингредиенты --- */}
          <section className="view__section">
            <h2 className="view__heading">Ингредиенты</h2>

            {recipe.ingredients.length === 0 ? (
              <p className="view__empty">Ингредиенты не указаны</p>
            ) : (
              <Card tone="mint">
                <ul className="view__ingredients">
                  {recipe.ingredients.map((ingredient) => (
                    <li className="view__ingredient" key={ingredient.id}>
                      {ingredient.text}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </section>

          {/* --- Этапы приготовления --- */}
          <section className="view__section">
            <h2 className="view__heading">Приготовление</h2>

            {recipe.steps.length === 0 ? (
              <p className="view__empty">Этапы пока не добавлены</p>
            ) : (
              recipe.steps.map((step, index) => (
                <Card className="stepView" key={step.id}>
                  <div className="stepView__head">
                    <span className="stepView__badge">{index + 1}</span>
                    <p className="stepView__text">{step.text}</p>
                  </div>

                  {step.photo ? (
                    <Photo
                      photo={step.photo}
                      alt={`Фото к этапу ${index + 1}`}
                      ratio="step"
                    />
                  ) : null}
                </Card>
              ))
            )}
          </section>
        </>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        danger
        title="Удалить рецепт?"
        message={
          recipe
            ? `«${recipe.title}» и все его этапы будут удалены без возможности восстановить.`
            : undefined
        }
        confirmLabel={deleting ? "Удаляем…" : "Да, удалить"}
        cancelLabel="Отмена"
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmOpen(false)}
      />
    </Screen>
  );
}
