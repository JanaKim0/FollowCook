import { usePhotoUrl } from "../data/hooks";
import "./Photo.css";

type PhotoProps = {
  /** Ссылка на снимок из хранилища, или null если фото нет */
  photo: string | null;
  alt: string;
  className?: string;
};

/**
 * Снимок из хранилища. Адрес файла достаётся асинхронно, поэтому пока
 * он не готов — на месте фото мятная плашка, а не прыгающая пустота.
 */
export default function Photo({ photo, alt, className = "" }: PhotoProps) {
  const url = usePhotoUrl(photo);

  return (
    <div className={["photo", className].filter(Boolean).join(" ")}>
      {url ? <img className="photo__img" src={url} alt={alt} /> : null}
    </div>
  );
}
