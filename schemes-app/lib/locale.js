import { cookies } from "next/headers";
import { DEFAULT_LOCALE, SUPPORTED_LOCALE_CODES } from "./i18n";
import { LOCALE_COOKIE } from "./localeCookie";

export { LOCALE_COOKIE };

export function getLocale() {
  const value = cookies().get(LOCALE_COOKIE)?.value;
  return SUPPORTED_LOCALE_CODES.includes(value) ? value : DEFAULT_LOCALE;
}
