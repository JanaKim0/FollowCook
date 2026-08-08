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
import { useT } from "../i18n/I18nProvider";
import "./RecipeScreen.css";
import { paths } from "./paths";

export default function RecipeScreen() {
  const t = useT();
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
      title={recipe?.title ?? (loading ? "" : t.recipeFallbackTitle)}
      backTo={paths.home}
      subtitle={found ? t.stepsCount(recipe.steps.length) : undefined}
      headerRight={
        found ? (
          <>
            <IconButton
              to={paths.editRecipe(recipe.id)}
              label={t.edit}
              icon={<IconEdit />}
            />
            <IconButton
              label={t.deleteRecipe}
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
        <EmptyState title={t.notFoundTitle} message={t.notFoundMessage} />
      ) : null}

      {found ? (
        <>
          {recipe.coverPhoto ? (
            <Photo photo={recipe.coverPhoto} alt={recipe.title} />
          ) : null}

          {/* --- Ингредиенты --- */}
          <section className="view__section">
            <h2 className="view__heading">{t.ingredients}</h2>

            {recipe.ingredients.length === 0 ? (
              <p className="view__empty">{t.noIngredients}</p>
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
            <h2 className="view__heading">{t.cooking}</h2>

            {recipe.steps.length === 0 ? (
              <p className="view__empty">{t.noSteps}</p>
            ) : (
              recipe.steps.map((step, index) => (
                <Card className="stepView" key={step.id}>
                  <div className="stepView__head">
                    <span className="stepView__badge">{index + 1}</span>
                    <p className="stepView__text">{step.text}</p>
                  </div>

                  {step.photo ? (
                    <Photo photo={step.photo} alt={t.stepPhotoAlt(index + 1)} />
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
        title={t.deleteQuestion}
        message={recipe ? t.deleteWarning(recipe.title) : undefined}
        confirmLabel={deleting ? t.deleting : t.confirmDelete}
        cancelLabel={t.cancel}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmOpen(false)}
      />
    </Screen>
  );
}
