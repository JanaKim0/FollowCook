import { convertFileSrc } from "@tauri-apps/api/core";
import { appDataDir, join } from "@tauri-apps/api/path";
import { BaseDirectory, mkdir, readDir, remove, writeFile } from "@tauri-apps/plugin-fs";
import Database from "@tauri-apps/plugin-sql";

import { compressImage } from "./imageCompress";
import type { RecipeStore } from "./store";
import type { Ingredient, Recipe, RecipeDraft, RecipeFull, Step } from "./types";

/** Та же база, что создаётся миграциями в src-tauri/src/lib.rs */
const DB_URL = "sqlite:followcook.db";

/** Папка со снимками внутри личной папки приложения */
const PHOTO_DIR = "photos";

/** Строки таблиц приходят из SQL в змеином регистре — переводим их в наш вид */
type RecipeRow = {
  id: number;
  title: string;
  cover_photo: string | null;
  created_at: number;
  updated_at: number;
  step_count: number;
};

type IngredientRow = { id: number; text: string };
type StepRow = { id: number; text: string; photo: string | null };

/**
 * Короткий уникальный идентификатор для имени файла.
 * Своя реализация вместо crypto.randomUUID(), потому что тот доступен
 * не в любом окружении, а имя файла нам нужно всегда.
 */
function uniqueName(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function createTauriStore(): Promise<RecipeStore> {
  const db = await Database.load(DB_URL);

  // Путь к папке приложения не меняется — спрашиваем его один раз
  const appDir = await appDataDir();

  async function ensurePhotoDir() {
    await mkdir(PHOTO_DIR, { baseDir: BaseDirectory.AppData, recursive: true });
  }

  /** Удаляет файлы снимков, на которые больше никто не ссылается */
  async function removePhotos(refs: Array<string | null>) {
    for (const ref of refs) {
      if (!ref) continue;
      try {
        await remove(`${PHOTO_DIR}/${ref}`, { baseDir: BaseDirectory.AppData });
      } catch {
        // Файла уже нет — для нас это ровно тот результат, которого мы хотели
      }
    }
  }

  /** Все снимки, на которые ссылается рецепт: обложка и фото этапов */
  async function photosOf(recipeId: number): Promise<Array<string | null>> {
    const cover = await db.select<Array<{ cover_photo: string | null }>>(
      "SELECT cover_photo FROM recipes WHERE id = $1",
      [recipeId],
    );
    const stepPhotos = await db.select<Array<{ photo: string | null }>>(
      "SELECT photo FROM steps WHERE recipe_id = $1",
      [recipeId],
    );
    return [...cover.map((r) => r.cover_photo), ...stepPhotos.map((r) => r.photo)];
  }

  /** Записывает ингредиенты и этапы рецепта, сохраняя порядок */
  async function writeParts(recipeId: number, draft: RecipeDraft) {
    for (const [index, text] of draft.ingredients.entries()) {
      await db.execute(
        "INSERT INTO ingredients (recipe_id, position, text) VALUES ($1, $2, $3)",
        [recipeId, index, text],
      );
    }

    for (const [index, step] of draft.steps.entries()) {
      await db.execute(
        "INSERT INTO steps (recipe_id, position, text, photo) VALUES ($1, $2, $3, $4)",
        [recipeId, index, step.text, step.photo],
      );
    }
  }

  return {
    async listRecipes(): Promise<Recipe[]> {
      const rows = await db.select<RecipeRow[]>(`
        SELECT r.id, r.title, r.cover_photo, r.created_at, r.updated_at,
               (SELECT COUNT(*) FROM steps s WHERE s.recipe_id = r.id) AS step_count
        FROM recipes r
        ORDER BY r.updated_at DESC
      `);

      return rows.map((r) => ({
        id: r.id,
        title: r.title,
        coverPhoto: r.cover_photo,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        stepCount: r.step_count,
      }));
    },

    async getRecipe(id: number): Promise<RecipeFull | null> {
      const rows = await db.select<RecipeRow[]>(
        "SELECT id, title, cover_photo, created_at, updated_at, 0 AS step_count FROM recipes WHERE id = $1",
        [id],
      );
      const recipe = rows[0];
      if (!recipe) return null;

      const ingredients = await db.select<IngredientRow[]>(
        "SELECT id, text FROM ingredients WHERE recipe_id = $1 ORDER BY position",
        [id],
      );
      const steps = await db.select<StepRow[]>(
        "SELECT id, text, photo FROM steps WHERE recipe_id = $1 ORDER BY position",
        [id],
      );

      return {
        id: recipe.id,
        title: recipe.title,
        coverPhoto: recipe.cover_photo,
        createdAt: recipe.created_at,
        updatedAt: recipe.updated_at,
        ingredients: ingredients as Ingredient[],
        steps: steps as Step[],
      };
    },

    async createRecipe(draft: RecipeDraft): Promise<number> {
      const now = Date.now();
      const result = await db.execute(
        "INSERT INTO recipes (title, cover_photo, created_at, updated_at) VALUES ($1, $2, $3, $4)",
        [draft.title, draft.coverPhoto, now, now],
      );

      // Обычно драйвер возвращает id вставленной строки сам,
      // но если вдруг нет — спрашиваем его у SQLite напрямую
      let id = Number(result.lastInsertId);
      if (!Number.isInteger(id) || id <= 0) {
        const rows = await db.select<Array<{ id: number }>>(
          "SELECT last_insert_rowid() AS id",
        );
        id = rows[0].id;
      }

      await writeParts(id, draft);
      return id;
    },

    async updateRecipe(id: number, draft: RecipeDraft): Promise<void> {
      // Снимки, которые были у рецепта до правки
      const before = await photosOf(id);

      await db.execute(
        "UPDATE recipes SET title = $1, cover_photo = $2, updated_at = $3 WHERE id = $4",
        [draft.title, draft.coverPhoto, Date.now(), id],
      );

      // Ингредиенты и этапы переписываются целиком: так порядок и нумерация
      // всегда соответствуют тому, что пользователь видел в форме
      await db.execute("DELETE FROM ingredients WHERE recipe_id = $1", [id]);
      await db.execute("DELETE FROM steps WHERE recipe_id = $1", [id]);
      await writeParts(id, draft);

      // Файлы снимков, отвязанных при правке, удаляем — иначе они копятся мёртвым грузом
      const after = new Set(
        [draft.coverPhoto, ...draft.steps.map((s) => s.photo)].filter(Boolean),
      );
      await removePhotos(before.filter((ref) => ref && !after.has(ref)));
    },

    async deleteRecipe(id: number): Promise<void> {
      const photos = await photosOf(id);

      // Сначала дочерние строки, потом сам рецепт — порядок важен,
      // потому что каскадное удаление в SQLite включено не всегда
      await db.execute("DELETE FROM ingredients WHERE recipe_id = $1", [id]);
      await db.execute("DELETE FROM steps WHERE recipe_id = $1", [id]);
      await db.execute("DELETE FROM recipes WHERE id = $1", [id]);

      await removePhotos(photos);
    },

    async savePhoto(file: Blob): Promise<string> {
      const compressed = await compressImage(file);
      const bytes = new Uint8Array(await compressed.arrayBuffer());
      const name = `${uniqueName()}.jpg`;

      await ensurePhotoDir();
      await writeFile(`${PHOTO_DIR}/${name}`, bytes, {
        baseDir: BaseDirectory.AppData,
      });

      return name;
    },

    async photoUrl(ref: string): Promise<string> {
      const fullPath = await join(appDir, PHOTO_DIR, ref);
      return convertFileSrc(fullPath);
    },

    async getSetting(key: string): Promise<string | null> {
      const rows = await db.select<Array<{ value: string }>>(
        "SELECT value FROM settings WHERE key = $1",
        [key],
      );
      return rows[0]?.value ?? null;
    },

    async setSetting(key: string, value: string): Promise<void> {
      await db.execute(
        `INSERT INTO settings (key, value) VALUES ($1, $2)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        [key, value],
      );
    },

    async cleanupPhotos(): Promise<void> {
      let files;
      try {
        files = await readDir(PHOTO_DIR, { baseDir: BaseDirectory.AppData });
      } catch {
        // Папки ещё нет — значит и мусора в ней быть не может
        return;
      }

      const referenced = await db.select<Array<{ photo: string }>>(`
        SELECT cover_photo AS photo FROM recipes WHERE cover_photo IS NOT NULL
        UNION
        SELECT photo FROM steps WHERE photo IS NOT NULL
      `);

      const inUse = new Set(referenced.map((row) => row.photo));
      const orphans = files
        .filter((entry) => entry.isFile && !inUse.has(entry.name))
        .map((entry) => entry.name);

      await removePhotos(orphans);
    },
  };
}
