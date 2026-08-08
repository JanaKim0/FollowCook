import { Link } from "react-router-dom";

import { paths } from "./paths";

export default function SettingsScreen() {
  return (
    <main className="screen">
      <header className="screen__head">
        <Link to={paths.home}>← Назад</Link>
        <h1>Настройки</h1>
      </header>

      <p>Здесь будет выбор языка и информация об авторе.</p>
    </main>
  );
}
