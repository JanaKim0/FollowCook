import { pluralRu } from "../lib/plural";

/**
 * Русский словарь. Он же задаёт форму словаря для остальных языков:
 * тип Dict выводится отсюда, поэтому забыть перевести строку не получится —
 * TypeScript не даст собрать проект.
 *
 * Там, где число меняет окончание, в словаре лежит функция: правила
 * у языков разные, и решать это должен сам язык, а не экран.
 */
export const ru = {
  appName: "FollowCook",

  // --- Общее ---
  back: "Назад",
  cancel: "Отмена",
  saving: "Сохраняем…",
  errorTitle: "Что-то пошло не так",

  // --- Главный экран ---
  myRecipes: "Мои рецепты",
  recipesCount: (n: number) =>
    `${n} ${pluralRu(n, ["рецепт", "рецепта", "рецептов"])}`,
  stepsCount: (n: number) => `${n} ${pluralRu(n, ["этап", "этапа", "этапов"])}`,
  newRecipe: "Новый рецепт",
  emptyTitle: "Пока пусто",
  emptyMessage: "Добавьте первый рецепт — и он появится здесь.",

  // --- Форма рецепта ---
  newRecipeTitle: "Новый рецепт",
  editTitle: "Редактирование",
  saveRecipe: "Сохранить рецепт",
  saveChanges: "Сохранить изменения",
  needTitleHint: "Чтобы сохранить, дайте рецепту название",

  titleLabel: "Название блюда",
  titlePlaceholder: "Например: паста с курицей",

  ingredients: "Ингредиенты",
  noIngredientsYet: "Пока не добавлено ни одного ингредиента",
  ingredientPlaceholder: (n: number) => `Ингредиент ${n}`,
  addIngredient: "Добавить ингредиент",
  removeIngredient: "Убрать ингредиент",

  stepsHeading: "Этапы приготовления",
  stepsHint: "Опишите приготовление по шагам — к каждому можно добавить фото",
  stepNumber: (n: number) => `Этап ${n}`,
  stepPlaceholder: "Что нужно сделать на этом шаге",
  addStep: "Добавить этап",
  removeStep: "Удалить этап",
  moveUp: "Переместить выше",
  moveDown: "Переместить ниже",

  // --- Фотографии ---
  addCoverPhoto: "Добавить фото блюда",
  addStepPhoto: "Добавить фото к этапу",
  replacePhoto: "Заменить",
  removePhoto: "Убрать",
  chosenPhotoAlt: "Выбранная фотография",
  stepPhotoAlt: (n: number) => `Фото к этапу ${n}`,

  // --- Экран рецепта ---
  recipeFallbackTitle: "Рецепт",
  cooking: "Приготовление",
  noIngredients: "Ингредиенты не указаны",
  noSteps: "Этапы пока не добавлены",
  notFoundTitle: "Рецепт не найден",
  notFoundMessage: "Возможно, он был удалён.",
  edit: "Редактировать",
  deleteRecipe: "Удалить рецепт",
  deleteQuestion: "Удалить рецепт?",
  deleteWarning: (title: string) =>
    `«${title}» и все его этапы будут удалены без возможности восстановить.`,
  confirmDelete: "Да, удалить",
  deleting: "Удаляем…",

  // --- Настройки ---
  settings: "Настройки",
  language: "Язык интерфейса",
  languageRussian: "Русский",
  languageEnglish: "English",
  author: "Автор",
  authorName: "Яна Ким",
  openGithub: "Открыть на GitHub",
  madeFor: "Сделано для Софии Ким",
};

/** Форма словаря: любой другой язык обязан её повторить. */
export type Dict = typeof ru;
