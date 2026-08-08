import { blobToDataUrl, compressImage } from "./imageCompress";
import type { RecipeStore } from "./store";
import type { Recipe, RecipeDraft, RecipeFull } from "./types";

/**
 * Запасное хранилище для разработки: когда приложение открыто просто
 * в браузере (`npm run dev`), настоящих SQLite и файловой системы нет.
 *
 * На телефоне этот код не используется — там работает tauriStore.
 * Нужен он для того, чтобы экраны можно было верстать и проверять
 * без пересборки приложения под Android.
 */

const STORAGE_KEY = "followcook.dev";

type Snapshot = {
  nextId: number;
  recipes: RecipeFull[];
  settings: Record<string, string>;
};

function emptySnapshot(): Snapshot {
  return { nextId: 1, recipes: [], settings: {} };
}

function read(): Snapshot {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Snapshot) : emptySnapshot();
  } catch {
    return emptySnapshot();
  }
}

function write(snapshot: Snapshot) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // В браузере на всё хранилище около 5 МБ, и несколько фотографий
    // его переполняют. Для разработки это не беда — предупреждаем и живём дальше.
    console.warn(
      "[FollowCook] Хранилище браузера переполнено. " +
        "Это ограничение только режима разработки, на телефоне его нет.",
    );
  }
}

export function createWebStore(): RecipeStore {
  return {
    async listRecipes(): Promise<Recipe[]> {
      return read()
        .recipes.slice()
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map((r) => ({
          id: r.id,
          title: r.title,
          coverPhoto: r.coverPhoto,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          stepCount: r.steps.length,
        }));
    },

    async getRecipe(id: number): Promise<RecipeFull | null> {
      return read().recipes.find((r) => r.id === id) ?? null;
    },

    async createRecipe(draft: RecipeDraft): Promise<number> {
      const snapshot = read();
      const id = snapshot.nextId++;
      const now = Date.now();

      snapshot.recipes.push({
        id,
        title: draft.title,
        coverPhoto: draft.coverPhoto,
        createdAt: now,
        updatedAt: now,
        ingredients: draft.ingredients.map((text, i) => ({ id: i + 1, text })),
        steps: draft.steps.map((step, i) => ({ id: i + 1, ...step })),
      });

      write(snapshot);
      return id;
    },

    async updateRecipe(id: number, draft: RecipeDraft): Promise<void> {
      const snapshot = read();
      const recipe = snapshot.recipes.find((r) => r.id === id);
      if (!recipe) return;

      recipe.title = draft.title;
      recipe.coverPhoto = draft.coverPhoto;
      recipe.updatedAt = Date.now();
      recipe.ingredients = draft.ingredients.map((text, i) => ({ id: i + 1, text }));
      recipe.steps = draft.steps.map((step, i) => ({ id: i + 1, ...step }));

      write(snapshot);
    },

    async deleteRecipe(id: number): Promise<void> {
      const snapshot = read();
      snapshot.recipes = snapshot.recipes.filter((r) => r.id !== id);
      write(snapshot);
    },

    async savePhoto(file: Blob): Promise<string> {
      // В браузере снимок сам себе ссылка: храним его как data-URL
      return blobToDataUrl(await compressImage(file));
    },

    async photoUrl(ref: string): Promise<string> {
      return ref;
    },

    async getSetting(key: string): Promise<string | null> {
      return read().settings[key] ?? null;
    },

    async setSetting(key: string, value: string): Promise<void> {
      const snapshot = read();
      snapshot.settings[key] = value;
      write(snapshot);
    },

    async cleanupPhotos(): Promise<void> {
      // В браузере снимки лежат прямо внутри рецептов, отдельных файлов нет —
      // значит и убирать нечего
    },
  };
}
