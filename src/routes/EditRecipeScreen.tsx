import { Link, useParams } from "react-router-dom";

import { paths } from "./paths";

export default function EditRecipeScreen() {
  const { id = "" } = useParams();

  return (
    <main className="screen">
      <header className="screen__head">
        <Link to={paths.recipe(id)}>← Назад</Link>
        <h1>Редактирование</h1>
      </header>

      <p>Здесь можно будет изменить рецепт №{id}.</p>
    </main>
  );
}
