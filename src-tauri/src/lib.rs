use tauri_plugin_sql::{Migration, MigrationKind};

/// Имя базы данных. Файл лежит в личной папке приложения на устройстве,
/// поэтому рецепты никуда не уходят и доступны без интернета.
const DB_URL: &str = "sqlite:followcook.db";

/// Миграции применяются по порядку при запуске. Уже применённые
/// пропускаются, так что обновление приложения не теряет рецепты.
fn migrations() -> Vec<Migration> {
    vec![Migration {
        version: 1,
        description: "recipes, ingredients, steps and settings",
        kind: MigrationKind::Up,
        sql: "
            CREATE TABLE recipes (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                title       TEXT    NOT NULL,
                cover_photo TEXT,
                created_at  INTEGER NOT NULL,
                updated_at  INTEGER NOT NULL
            );

            -- Ингредиенты и этапы хранятся отдельными строками, а не одним
            -- текстом: так их можно менять местами и удалять по одному.
            CREATE TABLE ingredients (
                id        INTEGER PRIMARY KEY AUTOINCREMENT,
                recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
                position  INTEGER NOT NULL,
                text      TEXT    NOT NULL
            );

            CREATE TABLE steps (
                id        INTEGER PRIMARY KEY AUTOINCREMENT,
                recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
                position  INTEGER NOT NULL,
                text      TEXT    NOT NULL,
                photo     TEXT
            );

            -- position — порядок показа. Индексы нужны, чтобы список этапов
            -- собирался быстро даже когда рецептов станет много.
            CREATE INDEX idx_ingredients_recipe ON ingredients(recipe_id, position);
            CREATE INDEX idx_steps_recipe       ON steps(recipe_id, position);

            -- Простое хранилище настроек: язык интерфейса и всё, что появится позже.
            CREATE TABLE settings (
                key   TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
        ",
    }]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(DB_URL, migrations())
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
