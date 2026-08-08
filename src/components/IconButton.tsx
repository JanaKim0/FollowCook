import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

import "./IconButton.css";

type Tone = "surface" | "mint" | "ghost" | "danger";

type CommonProps = {
  /** Подпись для скринридера — иконка сама по себе ничего не говорит */
  label: string;
  icon: ReactNode;
  tone?: Tone;
  className?: string;
};

type Props =
  | (CommonProps & { to: string })
  | (CommonProps &
      Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & { to?: undefined });

/** Круглая кнопка с одной иконкой: «назад», «настройки», «удалить этап». */
export default function IconButton(props: Props) {
  const { label, icon, tone = "surface", className = "" } = props;
  const cls = ["iconBtn", `iconBtn--${tone}`, className].filter(Boolean).join(" ");

  if ("to" in props && props.to !== undefined) {
    return (
      <Link to={props.to} className={cls} aria-label={label} title={label}>
        {icon}
      </Link>
    );
  }

  const { label: _l, icon: _i, tone: _t, className: _c, ...rest } = props;

  return (
    <button type="button" {...rest} className={cls} aria-label={label} title={label}>
      {icon}
    </button>
  );
}
