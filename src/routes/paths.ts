/**
 * Все адреса экранов в одном месте, чтобы не рассыпать строки по коду
 * и не искать опечатки в ссылках.
 */
export const paths = {
  home: "/",
  newRecipe: "/recipe/new",
  recipe: (id: number | string) => `/recipe/${id}`,
  editRecipe: (id: number | string) => `/recipe/${id}/edit`,
  settings: "/settings",
} as const;
