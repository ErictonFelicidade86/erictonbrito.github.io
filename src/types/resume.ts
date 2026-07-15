// Dados estruturais/não traduzíveis (links, nomes próprios). O conteúdo textual
// (cargos, descrições, habilidades) vive nos arquivos de tradução em src/i18n/locales.

export interface Profile {
  name: string
  email: string
  whatsapp: string
  whatsappLabel: string
  linkedin: string
}

// Formatos usados para tipar o retorno de tm() do vue-i18n (arrays vindos das traduções)
export interface Experience {
  company: string
  role: string
  period: string
  description: string
  skills: string[]
}

export interface Degree {
  title: string
  school?: string
  period?: string
}

export interface Course {
  title: string
  provider: string
}

export interface Project {
  title: string
  subtitle: string
  url: string
}
