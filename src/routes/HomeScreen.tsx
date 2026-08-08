import { Link } from "react-router-dom";

import { paths } from "./paths";

export default function HomeScreen() {
  return (
    <main className="screen">
      <header className="screen__head">
        <h1>FollowCook</h1>
        <Link to={paths.settings}>Настройки</Link>
      </header>

      <p>Здесь будет список рецептов.</p>

      <Link to={paths.newRecipe}>＋ Новый рецепт</Link>
    </main>
  );
}
