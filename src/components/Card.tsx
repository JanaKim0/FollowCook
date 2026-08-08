import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import "./Card.css";

type CardProps = {
  children: ReactNode;
  /** Если передан адрес — вся карточка становится ссылкой */
  to?: string;
  /** Мятная заливка вместо белой: так выделяются этапы приготовления */
  tone?: "surface" | "mint";
  className?: string;
};

export default function Card({
  children,
  to,
  tone = "surface",
  className = "",
}: CardProps) {
  const cls = ["card", `card--${tone}`, to ? "card--tappable" : "", className]
    .filter(Boolean)
    .join(" ");

  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    );
  }

  return <div className={cls}>{children}</div>;
}
