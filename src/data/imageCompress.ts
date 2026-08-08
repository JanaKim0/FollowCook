/**
 * Фотографии с телефона весят по 3–8 МБ, а на экране рецепта показываются
 * в пару сантиметров. Поэтому перед сохранением каждый снимок уменьшается
 * и пережимается в JPEG: приложение не разрастается и листается быстро.
 */

/** Максимальная сторона снимка после сжатия, в пикселях. */
const MAX_SIDE = 1400;

/** Качество JPEG: на глаз неотличимо от оригинала, но втрое легче. */
const QUALITY = 0.82;

export async function compressImage(file: Blob): Promise<Blob> {
  // imageOrientation: "from-image" разворачивает снимок по метке EXIF,
  // иначе фото с телефона окажется лежащим на боку
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    // Без canvas сжать не получится — сохраняем как есть, это лучше отказа
    return file;
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", QUALITY),
  );

  return blob ?? file;
}

/** Blob в data-URL — нужен для веб-версии при разработке. */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
