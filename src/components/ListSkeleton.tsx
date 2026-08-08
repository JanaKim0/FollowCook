import "./ListSkeleton.css";

/**
 * Мягкие заглушки вместо пустого экрана, пока читается база.
 * Без них на долю секунды мелькает «Пока пусто», хотя рецепты есть.
 */
export default function ListSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="skeleton" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div className="skeleton__card" key={i}>
          <div className="skeleton__cover" />
          <div className="skeleton__line skeleton__line--title" />
          <div className="skeleton__line skeleton__line--meta" />
        </div>
      ))}
    </div>
  );
}
