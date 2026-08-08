import logoUrl from "../assets/logo.png";
import type { Recipe } from "../data/types";
import Photo from "./Photo";
import "./RecipeCard.css";
import { paths } from "../routes/paths";
import Card from "./Card";

type RecipeCardProps = {
  recipe: Recipe;
  /** Подпись о количестве этапов — приходит с учётом выбранного языка */
  stepsLabel: string;
};

/** Карточка рецепта в списке на главном экране. */
export default function RecipeCard({ recipe, stepsLabel }: RecipeCardProps) {
  return (
    <Card to={paths.recipe(recipe.id)} className="recipeCard">
      {recipe.coverPhoto ? (
        <Photo photo={recipe.coverPhoto} alt={recipe.title} ratio="cover" />
      ) : (
        // Без обложки карточка не должна выглядеть сломанной —
        // вместо фото мятная плашка с белочкой
        <div className="recipeCard__placeholder">
          <img src={logoUrl} alt="" className="recipeCard__placeholderArt" />
        </div>
      )}

      <div className="recipeCard__text">
        <h2 className="recipeCard__title">{recipe.title}</h2>
        <p className="recipeCard__meta">{stepsLabel}</p>
      </div>
    </Card>
  );
}
