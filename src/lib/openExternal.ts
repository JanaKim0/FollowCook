import { isTauri } from "../data/store";

/**
 * Открывает ссылку во внешнем браузере.
 *
 * Внутри приложения это делает системный обработчик Android — иначе
 * страница открылась бы прямо в окне приложения и оттуда некуда было бы
 * вернуться. В браузере при разработке хватает обычной новой вкладки.
 */
export async function openExternal(url: string): Promise<void> {
  if (!isTauri()) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  const { openUrl } = await import("@tauri-apps/plugin-opener");
  await openUrl(url);
}
