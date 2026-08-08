import type { ReactNode } from "react";

import { useT } from "../i18n/I18nProvider";
import IconButton from "./IconButton";
import { IconBack } from "./icons";
import "./Screen.css";

type ScreenProps = {
  /** Заголовок в мятной шапке */
  title: ReactNode;
  /** Куда ведёт стрелка «назад». Если не передать — стрелки не будет */
  backTo?: string;
  /**
   * Своя обработка «назад» вместо простого перехода. Нужна там, где
   * уход с экрана может стоить пользователю несохранённой работы.
   * Если передан, backTo не используется.
   */
  onBack?: () => void;
  /** Кнопки справа в шапке */
  headerRight?: ReactNode;
  /** Строка под заголовком: количество рецептов, подсказка и т.п. */
  subtitle?: ReactNode;
  /**
   * Блок в самом низу шапки — для поиска и сортировки.
   * Прилипает к верху вместе с шапкой, поэтому остаётся под рукой
   * при прокрутке длинного списка.
   */
  headerBottom?: ReactNode;
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
  onBack,
  headerRight,
  subtitle,
  headerBottom,
  children,
  footer,
}: ScreenProps) {
  const t = useT();

  return (
    <div className="screen">
      <div className="screen__headerWrap">
        <header className="screen__header">
          <div className="screen__headerRow">
            {onBack ? (
              <IconButton label={t.back} icon={<IconBack />} onClick={onBack} />
            ) : backTo ? (
              <IconButton to={backTo} label={t.back} icon={<IconBack />} />
            ) : null}

            <h1 className="screen__title">{title}</h1>

            {headerRight ? (
              <div className="screen__headerRight">{headerRight}</div>
            ) : null}
          </div>

          {subtitle ? <p className="screen__subtitle">{subtitle}</p> : null}

          {headerBottom ? (
            <div className="screen__headerBottom">{headerBottom}</div>
          ) : null}
        </header>
      </div>

      <div className="screen__body">{children}</div>

      {footer ? <div className="screen__footer">{footer}</div> : null}
    </div>
  );
}
