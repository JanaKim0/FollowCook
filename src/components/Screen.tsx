import type { ReactNode } from "react";

import IconButton from "./IconButton";
import { IconBack } from "./icons";
import "./Screen.css";

type ScreenProps = {
  /** Заголовок в мятной шапке */
  title: ReactNode;
  /** Куда ведёт стрелка «назад». Если не передать — стрелки не будет */
  backTo?: string;
  /** Кнопки справа в шапке */
  headerRight?: ReactNode;
  /** Строка под заголовком: количество рецептов, подсказка и т.п. */
  subtitle?: ReactNode;
  children: ReactNode;
  /** Панель, прилипшая к низу экрана — для главных кнопок вроде «Сохранить» */
  footer?: ReactNode;
};

/**
 * Общий каркас всех экранов: мятная шапка со скруглением снизу,
 * прокручиваемое тело и опциональная нижняя панель.
 *
 * Шапка прилипает к верху, но сидит на подложке цвета фона — поэтому
 * контент уезжает под неё, а в скруглённых углах виден фон, а не текст.
 */
export default function Screen({
  title,
  backTo,
  headerRight,
  subtitle,
  children,
  footer,
}: ScreenProps) {
  return (
    <div className="screen">
      <div className="screen__headerWrap">
        <header className="screen__header">
          <div className="screen__headerRow">
            {backTo ? (
              <IconButton to={backTo} label="Назад" icon={<IconBack />} />
            ) : null}

            <h1 className="screen__title">{title}</h1>

            {headerRight ? (
              <div className="screen__headerRight">{headerRight}</div>
            ) : null}
          </div>

          {subtitle ? <p className="screen__subtitle">{subtitle}</p> : null}
        </header>
      </div>

      <div className="screen__body">{children}</div>

      {footer ? <div className="screen__footer">{footer}</div> : null}
    </div>
  );
}
