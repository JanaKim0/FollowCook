import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import ErrorNote from "../components/ErrorNote";
import IconButton from "../components/IconButton";
import ListSkeleton from "../components/ListSkeleton";
import RecipeCard from "../components/RecipeCard";
import Screen from "../components/Screen";
import { IconPlus, IconSettings } from "../components/icons";
import { useRecipes } from "../data/hooks";
import { useT } from "../i18n/I18nProvider";
import "./HomeScreen.css";
import { paths } from "./paths";

export default function HomeScreen() {
  const t = useT();
  const { data: recipes, loading, error } = useRecipes();

  return (
    <Screen
      title={t.appName}
      subtitle={loading ? t.myRecipes : t.recipesCount(recipes.length)}
      headerRight={
        <IconButton to={paths.settings} label={t.settings} icon={<IconSettings />} />
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
      ) : recipes.length === 0 ? (
        <EmptyState title={t.emptyTitle} message={t.emptyMessage} />
      ) : (
        <div className="recipeList">
          {recipes.map((recipe) => (
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
