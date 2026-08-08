import { useMemo, useState } from "react";

import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import ErrorNote from "../components/ErrorNote";
import IconButton from "../components/IconButton";
import ListSkeleton from "../components/ListSkeleton";
import RecipeCard from "../components/RecipeCard";
import Screen from "../components/Screen";
import SearchField from "../components/SearchField";
import { IconPlus, IconSettings, IconSort } from "../components/icons";
import { useRecipes, useSetting } from "../data/hooks";
import { useT } from "../i18n/I18nProvider";
import "./HomeScreen.css";
import { paths } from "./paths";

/** Ключ, под которым выбранный порядок списка лежит в настройках */
const SORT_KEY = "recipeSort";

export default function HomeScreen() {
  const t = useT();
  const { data: recipes, loading, error } = useRecipes();

  const [query, setQuery] = useState("");
  const [sort, setSort] = useSetting(SORT_KEY, "newest");
  const oldestFirst = sort === "oldest";

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const found = needle
      ? recipes.filter((recipe) => recipe.title.toLowerCase().includes(needle))
      : recipes;

    // Из хранилища рецепты приходят от свежих к старым,
    // поэтому обратный порядок — это просто перевёрнутый список
    return oldestFirst ? found.slice().reverse() : found;
  }, [recipes, query, oldestFirst]);

  const searching = query.trim().length > 0;
  const hasRecipes = recipes.length > 0;

  return (
    <Screen
      title={t.appName}
      subtitle={
        loading
          ? t.myRecipes
          : searching
            ? t.foundCount(visible.length)
            : t.recipesCount(recipes.length)
      }
      headerRight={
        <IconButton to={paths.settings} label={t.settings} icon={<IconSettings />} />
      }
      headerBottom={
        // Пока рецептов нет, искать и сортировать нечего —
        // не занимаем место на экране
        hasRecipes ? (
          <div className="homeTools">
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder={t.searchPlaceholder}
              clearLabel={t.clearSearch}
            />

            <button
              type="button"
              className="sortBtn"
              onClick={() => setSort(oldestFirst ? "newest" : "oldest")}
            >
              <IconSort />
              <span>{oldestFirst ? t.sortOldest : t.sortNewest}</span>
            </button>
          </div>
        ) : undefined
      }
      footer={
        <Button
          to={paths.newRecipe}
          variant="primary"
          size="lg"
          block
          icon={<IconPlus />}
        >
          {t.newRecipe}
        </Button>
      }
    >
      {error ? (
        <ErrorNote text={error} />
      ) : loading ? (
        <ListSkeleton />
      ) : !hasRecipes ? (
        <EmptyState title={t.emptyTitle} message={t.emptyMessage} />
      ) : visible.length === 0 ? (
        <EmptyState
          title={t.nothingFoundTitle}
          message={t.nothingFoundMessage(query.trim())}
        />
      ) : (
        <div className="recipeList">
          {visible.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              stepsLabel={t.stepsCount(recipe.stepCount)}
            />
          ))}
        </div>
      )}
    </Screen>
  );
}
