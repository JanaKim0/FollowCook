import { useCallback, useEffect, useState } from "react";

import { getStore } from "./store";
import type { Recipe, RecipeFull } from "./types";

type Async<T> = {
  data: T;
  loading: boolean;
  error: string | null;
  /** Перечитать данные — например, после возвращения с другого экрана */
  reload: () => void;
};

/** Список рецептов для главного экрана. */
export function useRecipes(): Async<Recipe[]> {
  const [data, setData] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getStore()
      .then((store) => store.listRecipes())
      .then((recipes) => {
        if (cancelled) return;
        setData(recipes);
        setError(null);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Если экран закрыли, пока данные грузились, результат уже не нужен
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, reload };
}

/** Один рецепт целиком: ингредиенты и этапы. */
export function useRecipe(id: number | null): Async<RecipeFull | null> {
  const [data, setData] = useState<RecipeFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (id === null) {
      setData(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getStore()
      .then((store) => store.getRecipe(id))
      .then((recipe) => {
        if (cancelled) return;
        setData(recipe);
        setError(null);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, reload };
}

/**
 * Превращает ссылку на снимок в адрес для <img src>.
 * На телефоне это асинхронный вызов, поэтому первый кадр приходит пустым.
 */
export function usePhotoUrl(ref: string | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!ref) {
      setUrl(null);
      return;
    }

    let cancelled = false;
    getStore()
      .then((store) => store.photoUrl(ref))
      .then((resolved) => {
        if (!cancelled) setUrl(resolved);
      })
      .catch(() => {
        if (!cancelled) setUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [ref]);

  return url;
}
