import type { ReactNode } from "react";

import logoUrl from "../assets/logo.png";
import "./EmptyState.css";

type EmptyStateProps = {
  title: string;
  message?: string;
  /** Кнопка под текстом, если пустому экрану есть что предложить */
  action?: ReactNode;
};

/** Заглушка для пустых списков: белочка вместо унылого «нет данных». */
export default function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="empty">
      <img className="empty__art" src={logoUrl} alt="" />
      <h2 className="empty__title">{title}</h2>
      {message ? <p className="empty__message">{message}</p> : null}
      {action ? <div className="empty__action">{action}</div> : null}
    </div>
  );
}
