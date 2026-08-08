import { useNavigate } from "react-router-dom";

import RecipeForm from "../components/RecipeForm";
import { getStore } from "../data/store";
import type { RecipeDraft } from "../data/types";
import { useT } from "../i18n/I18nProvider";
import { paths } from "./paths";

export default function NewRecipeScreen() {
  const t = useT();
  const navigate = useNavigate();

  async function handleSubmit(draft: RecipeDraft) {
    const store = await getStore();
    const id = await store.createRecipe(draft);

    // Сразу открываем сохранённый рецепт: человек видит результат
    // своей работы, а не возвращается в общий список.
    // replace — чтобы кнопка «назад» вела на главную, а не в форму.
    navigate(paths.recipe(id), { replace: true });
  }

  return (
    <RecipeForm
      screenTitle={t.newRecipeTitle}
      backTo={paths.home}
      submitLabel={t.saveRecipe}
      onSubmit={handleSubmit}
    />
  );
}
