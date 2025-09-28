let currentLanguage = 'pt'; // Idioma padrão

const translations = {
  pt: null,
  en: null,
};

// Função para carregar as traduções
async function loadTranslations(lang) {
  if (!translations[lang]) {
    const response = await fetch(`assets/lang/${lang}.json`);
    translations[lang] = await response.json();
  }
  return translations[lang];
}

// Função para aplicar as traduções no DOM
async function applyTranslations(lang) {
  const i18n = await loadTranslations(lang);

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    if (i18n[key]) {
      element.textContent = i18n[key];
    }
  });
}

// Função para alternar idioma
function setLanguage(lang) {
  currentLanguage = lang;
  applyTranslations(lang);
}

// Inicializa o idioma padrão
window.onload = () => {
  applyTranslations(currentLanguage);
};

// Exporta a função para uso global
window.setLanguage = setLanguage;
