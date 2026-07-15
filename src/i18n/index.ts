import { createI18n } from 'vue-i18n'
import pt from './locales/pt'
import en from './locales/en'

export type MessageSchema = typeof pt

export const SUPPORTED_LOCALES = ['pt', 'en'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

const STORAGE_KEY = 'curriculo-locale'

function detectInitialLocale(): SupportedLocale {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'pt' || saved === 'en') return saved

  const browserLang = navigator.language.slice(0, 2).toLowerCase()
  return browserLang === 'en' ? 'en' : 'pt'
}

const i18n = createI18n({
  legacy: false,
  locale: detectInitialLocale(),
  fallbackLocale: 'pt',
  messages: { pt, en } satisfies Record<SupportedLocale, MessageSchema>,
})

export function setLocale(locale: SupportedLocale): void {
  i18n.global.locale.value = locale
  localStorage.setItem(STORAGE_KEY, locale)
  document.documentElement.lang = locale === 'pt' ? 'pt-br' : 'en'
}

export default i18n
