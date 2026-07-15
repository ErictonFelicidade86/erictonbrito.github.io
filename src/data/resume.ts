import type { Profile } from '../types/resume'

// Dados que não mudam entre idiomas (nomes próprios e links de contato).
// O texto traduzido (cargos, descrições, habilidades) vem de src/i18n/locales.
export const profile: Profile = {
  name: 'Ericton Brito',
  email: 'erictonbrito@yahoo.com.br',
  whatsapp: 'https://api.whatsapp.com/send/?phone=5592984660806&text&type=phone_number&app_absent=0',
  whatsappLabel: '(92) 98466-0806',
  linkedin: 'https://www.linkedin.com/in/ericton-brito-1b511b14b/',
}
