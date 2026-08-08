import { useNavigate, useParams } from "react-router-dom";

import EmptyState from "../components/EmptyState";
import ErrorNote from "../components/ErrorNote";
import ListSkeleton from "../components/ListSkeleton";
import RecipeForm from "../components/RecipeForm";
import Screen from "../components/Screen";
import { useRecipe } from "../data/hooks";
import { getStore } from "../data/store";
import type { RecipeDraft } from "../data/types";
import { useT } from "../i18n/I18nProvider";
import { paths } from "./paths";

export default function EditRecipeScreen() {
  const t = useT();
  const { id: idParam = "" } = useParams();
  const navigate = useNavigate();

  const id = Number(idParam);
  const validId = Number.isInteger(id) && id > 0 ? id : null;

  const { data: recipe, loading, error } = useRecipe(validId);

  async function handleSubmit(draft: RecipeDraft) {
    if (validId === null) return;

    const store = await getStore();
    await store.updateRecipe(validId, draft);

    // Возвращаемся к рецепту, чтобы сразу увидеть результат правки.
    // replace — чтобы кнопка «назад» не вернула обратно в форму.
    navigate(paths.recipe(validId), { replace: true });
  }

  // Форма берёт начальные значения один раз при появлении на экране,
  // поэтому показываем её только когда рецепт уже прочитан
  if (loading || error || recipe === null) {
    return (
      <Screen
        title={t.editTitle}
        backTo={validId === null ? paths.home : paths.recipe(validId)}
      >
        {error ? <ErrorNote text={error} /> : null}
        {loading ? <ListSkeleton count={1} /> : null}
        {!loading && !error && recipe === null ? (
          <EmptyState title={t.notFoundTitle} message={t.notFoundMessage} />
        ) : null}
      </Screen>
    );
  }

  return (
    <RecipeForm
      screenTitle={t.editTitle}
      backTo={paths.recipe(recipe.id)}
      submitLabel={t.saveChanges}
      initial={recipe}
      onSubmit={handleSubmit}
    />
  );
}
