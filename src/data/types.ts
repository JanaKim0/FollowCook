/** Ингредиент рецепта. */
export type Ingredient = {
  id: number;
  text: string;
};

/** Один этап приготовления с необязательной фотографией. */
export type Step = {
  id: number;
  text: string;
  /**
   * Ссылка на фото. Что именно внутри — знает только хранилище:
   * на телефоне это имя файла, в браузере при разработке — data-URL.
   * Экраны получают готовый адрес через store.photoUrl().
   */
  photo: string | null;
};

/** Рецепт в списке на главном экране — без ингредиентов и этапов. */
export type Recipe = {
  id: number;
  title: string;
  coverPhoto: string | null;
  createdAt: number;
  updatedAt: number;
  /** Сколько всего этапов — показываем на карточке */
  stepCount: number;
};

/** Рецепт целиком: то, что показывается на экране рецепта. */
export type RecipeFull = Omit<Recipe, "stepCount"> & {
  ingredients: Ingredient[];
  steps: Step[];
};

/** Что приходит из формы создания или редактирования. */
export type RecipeDraft = {
  title: string;
  coverPhoto: string | null;
  /** Ингредиенты — просто строки, порядок задаётся массивом */
  ingredients: string[];
  steps: Array<{ text: string; photo: string | null }>;
};
