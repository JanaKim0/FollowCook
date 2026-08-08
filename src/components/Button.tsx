import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

import "./Button.css";

type Variant = "primary" | "secondary" | "mint" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  /** Растянуть на всю ширину — так делаются главные кнопки внизу экрана */
  block?: boolean;
  /** Значок слева от текста */
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    to?: undefined;
  };

type LinkProps = CommonProps & {
  /** Если передан адрес — кнопка становится ссылкой на другой экран */
  to: string;
};

function classes({ variant = "primary", size = "md", block, className }: CommonProps) {
  return [
    "btn",
    `btn--${variant}`,
    `btn--${size}`,
    block ? "btn--block" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Кнопка приложения. Все действия в FollowCook явные, поэтому кнопок
 * много и они должны выглядеть одинаково предсказуемо.
 */
export default function Button(props: ButtonProps | LinkProps) {
  const { icon, children } = props;

  const content = (
    <>
      {icon ? <span className="btn__icon">{icon}</span> : null}
      <span className="btn__label">{children}</span>
    </>
  );

  if ("to" in props && props.to !== undefined) {
    const { to, variant, size, block, className } = props;
    return (
      <Link to={to} className={classes({ variant, size, block, className, children })}>
        {content}
      </Link>
    );
  }

  const { variant, size, block, className, icon: _icon, children: _children, ...rest } =
    props as ButtonProps;

  return (
    <button
      type="button"
      {...rest}
      className={classes({ variant, size, block, className, children })}
    >
      {content}
    </button>
  );
}
