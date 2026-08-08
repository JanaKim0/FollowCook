import { useEffect } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";

import { getStore } from "./data/store";
import HomeScreen from "./routes/HomeScreen";
import NewRecipeScreen from "./routes/NewRecipeScreen";
import RecipeScreen from "./routes/RecipeScreen";
import EditRecipeScreen from "./routes/EditRecipeScreen";
import SettingsScreen from "./routes/SettingsScreen";

/**
 * HashRouter, а не BrowserRouter: внутри Android-вебвью нет сервера,
 * который отдавал бы index.html на произвольный путь, поэтому навигация
 * живёт в хеше адреса (#/recipe/3) и переживает перезагрузку страницы.
 */
export default function App() {
  // Разовая уборка при запуске: удаляем фотографии, прикреплённые
  // к рецептам, которые в итоге так и не сохранили
  useEffect(() => {
    getStore()
      .then((store) => store.cleanupPhotos())
      .catch((e: unknown) => console.warn("[FollowCook] уборка фото", e));
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/recipe/new" element={<NewRecipeScreen />} />
        <Route path="/recipe/:id" element={<RecipeScreen />} />
        <Route path="/recipe/:id/edit" element={<EditRecipeScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        {/* Любой неизвестный адрес возвращает на главную */}
        <Route path="*" element={<HomeScreen />} />
      </Routes>
    </HashRouter>
  );
}
