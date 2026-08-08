import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Возвращает страницу наверх при переходе между экранами.
 *
 * Без этого, пролистав длинный рецепт и нажав «Редактировать»,
 * попадаешь в середину формы — выглядит как поломка.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
