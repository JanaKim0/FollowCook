import type { Dict } from "./ru";

/** Английский словарь. Форму задаёт русский — см. тип Dict. */
export const en: Dict = {
  appName: "FollowCook",

  // --- Общее ---
  back: "Back",
  cancel: "Cancel",
  saving: "Saving…",
  errorTitle: "Something went wrong",

  // --- Главный экран ---
  myRecipes: "My recipes",
  recipesCount: (n) => `${n} ${n === 1 ? "recipe" : "recipes"}`,
  stepsCount: (n) => `${n} ${n === 1 ? "step" : "steps"}`,
  newRecipe: "New recipe",
  emptyTitle: "Nothing here yet",
  emptyMessage: "Add your first recipe and it will show up here.",

  // --- Поиск и сортировка ---
  searchPlaceholder: "Find a recipe",
  clearSearch: "Clear search",
  sortNewest: "Newest first",
  sortOldest: "Oldest first",
  foundCount: (n) => `Found ${n} ${n === 1 ? "recipe" : "recipes"}`,
  nothingFoundTitle: "Nothing found",
  nothingFoundMessage: (query) => `No recipes match “${query}”.`,

  // --- Форма рецепта ---
  newRecipeTitle: "New recipe",
  editTitle: "Edit recipe",
  saveRecipe: "Save recipe",
  saveChanges: "Save changes",
  needTitleHint: "Give the recipe a name to save it",

  leaveTitle: "Leave without saving?",
  leaveMessage: "Everything you typed on this screen will be lost.",
  leaveConfirm: "Leave",
  leaveStay: "Stay",

  titleLabel: "Dish name",
  titlePlaceholder: "For example: creamy chicken pasta",

  ingredients: "Ingredients",
  noIngredientsYet: "No ingredients added yet",
  ingredientPlaceholder: (n) => `Ingredient ${n}`,
  addIngredient: "Add ingredient",
  removeIngredient: "Remove ingredient",

  stepsHeading: "Cooking steps",
  stepsHint: "Describe the cooking step by step — each one can have a photo",
  stepNumber: (n) => `Step ${n}`,
  stepPlaceholder: "What to do at this step",
  addStep: "Add step",
  removeStep: "Delete step",
  moveUp: "Move up",
  moveDown: "Move down",

  // --- Фотографии ---
  addCoverPhoto: "Add a photo of the dish",
  addStepPhoto: "Add a photo to this step",
  replacePhoto: "Replace",
  removePhoto: "Remove",
  chosenPhotoAlt: "Selected photo",
  cropTitle: "Choose the frame",
  cropHint: "Move the frame and drag its corners — only what is inside goes into the recipe",
  cropConfirm: "Done",
  cropLoading: "Opening the photo…",
  stepPhotoAlt: (n) => `Photo for step ${n}`,

  // --- Экран рецепта ---
  recipeFallbackTitle: "Recipe",
  cooking: "How to cook",
  noIngredients: "No ingredients listed",
  noSteps: "No steps added yet",
  notFoundTitle: "Recipe not found",
  notFoundMessage: "It may have been deleted.",
  edit: "Edit",
  deleteRecipe: "Delete recipe",
  deleteQuestion: "Delete this recipe?",
  deleteWarning: (title) =>
    `“${title}” and all of its steps will be deleted permanently.`,
  confirmDelete: "Yes, delete",
  deleting: "Deleting…",

  // --- Настройки ---
  settings: "Settings",
  language: "Interface language",
  languageRussian: "Русский",
  languageEnglish: "English",
  author: "Author",
  authorName: "Jana Kim",
  openGithub: "Open on GitHub",
  madeFor: "Made for Sofia Kim",
};
