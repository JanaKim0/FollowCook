import { Link, useParams } from "react-router-dom";

import { paths } from "./paths";

export default function RecipeScreen() {
  const { id = "" } = useParams();

  return (
    <main className="screen">
      <header className="screen__head">
        <Link to={paths.home}>← Назад</Link>
        <Link to={paths.editRecipe(id)}>Редактировать</Link>
      </header>

      <p>Здесь будет рецепт №{id}: ингредиенты и этапы с фотографиями.</p>
    </main>
  );
}
