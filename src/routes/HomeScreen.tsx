import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import ErrorNote from "../components/ErrorNote";
import IconButton from "../components/IconButton";
import ListSkeleton from "../components/ListSkeleton";
import RecipeCard from "../components/RecipeCard";
import Screen from "../components/Screen";
import { IconPlus, IconSettings } from "../components/icons";
import { useRecipes } from "../data/hooks";
import { pluralRu } from "../lib/plural";
import "./HomeScreen.css";
import { paths } from "./paths";

export default function HomeScreen() {
  const { data: recipes, loading, error } = useRecipes();

  const subtitle = loading
    ? "Мои рецепты"
    : `${recipes.length} ${pluralRu(recipes.length, ["рецепт", "рецепта", "рецептов"])}`;

  return (
    <Screen
      title="FollowCook"
      subtitle={subtitle}
      headerRight={
        <IconButton to={paths.settings} label="Настройки" icon={<IconSettings />} />
      }
      footer={
        <Button
          to={paths.newRecipe}
          variant="primary"
          size="lg"
          block
          icon={<IconPlus />}
        >
          Новый рецепт
        </Button>
      }
    >
      {error ? (
        <ErrorNote text={error} />
      ) : loading ? (
        <ListSkeleton />
      ) : recipes.length === 0 ? (
        <EmptyState
          title="Пока пусто"
          message="Добавьте первый рецепт — и он появится здесь."
        />
      ) : (
        <div className="recipeList">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              stepsLabel={`${recipe.stepCount} ${pluralRu(recipe.stepCount, [
                "этап",
                "этапа",
                "этапов",
              ])}`}
            />
          ))}
        </div>
      )}
    </Screen>
  );
}
