import type { Recipe, RecipeDraft, RecipeFull } from "./types";

/**
 * Единый интерфейс хранилища. Экраны работают только с ним и не знают,
 * лежат ли данные в SQLite на телефоне или во временном веб-хранилище.
 */
export interface RecipeStore {
  listRecipes(): Promise<Recipe[]>;
  getRecipe(id: number): Promise<RecipeFull | null>;
  createRecipe(draft: RecipeDraft): Promise<number>;
  updateRecipe(id: number, draft: RecipeDraft): Promise<void>;
  deleteRecipe(id: number): Promise<void>;

  /** Сжимает и сохраняет снимок, возвращает ссылку на него */
  savePhoto(file: Blob): Promise<string>;
  /** Превращает ссылку в адрес, который можно подставить в <img src> */
  photoUrl(ref: string): Promise<string>;

  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string): Promise<void>;
}

/**
 * Приложение запущено внутри Tauri (на телефоне), а не просто открыто
 * в браузере командой `npm run dev`.
 */
export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

let storePromise: Promise<RecipeStore> | null = null;

/**
 * Возвращает хранилище: настоящее на телефоне, временное в браузере.
 * Модули подгружаются лениво, чтобы код Tauri не попадал в веб-сборку
 * и не падал при обычном открытии страницы.
 */
export function getStore(): Promise<RecipeStore> {
  if (!storePromise) {
    storePromise = isTauri()
      ? import("./tauriStore").then((m) => m.createTauriStore())
      : import("./webStore").then((m) => m.createWebStore());
  }
  return storePromise;
}
