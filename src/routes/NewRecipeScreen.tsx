import { Link } from "react-router-dom";

import { paths } from "./paths";

export default function NewRecipeScreen() {
  return (
    <main className="screen">
      <header className="screen__head">
        <Link to={paths.home}>← Назад</Link>
        <h1>Новый рецепт</h1>
      </header>

      <p>Здесь будет форма: название, ингредиенты и этапы приготовления.</p>
    </main>
  );
}
