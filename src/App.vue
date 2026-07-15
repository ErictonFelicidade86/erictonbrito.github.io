<template>
  <div class="tech-bg" aria-hidden="true">
    <div class="tech-glow tech-glow--primary"></div>
    <div class="tech-glow tech-glow--secondary"></div>
    <MatrixRain class="tech-bg-canvas" />
  </div>

  <v-app>
    <v-app-bar :elevation="scrolled ? 4 : 0" :color="scrolled ? 'surface' : 'transparent'" density="comfortable">
      <v-container class="d-flex align-center">
        <span class="app-logo">Ericton<span class="text-primary">.</span></span>
        <v-spacer />
        <div class="d-none d-sm-flex align-center">
          <v-btn variant="text" @click="scrollToSection('experiencia')">{{ t('nav.experience') }}</v-btn>
          <v-btn variant="text" @click="scrollToSection('formacao')">{{ t('nav.education') }}</v-btn>
          <v-btn variant="text" @click="scrollToSection('projeto')">{{ t('nav.projects') }}</v-btn>
          <v-btn variant="text" @click="scrollToSection('contato')">{{ t('nav.contact') }}</v-btn>
          <div class="lang-switcher ml-2">
            <button
              type="button"
              class="lang-flag"
              :class="{ 'lang-flag--active': locale === 'pt' }"
              aria-label="Português"
              @click="changeLocale('pt')"
            >
              <img :src="brasilFlag" alt="Português" />
            </button>
            <button
              type="button"
              class="lang-flag"
              :class="{ 'lang-flag--active': locale === 'en' }"
              aria-label="English"
              @click="changeLocale('en')"
            >
              <img :src="usaFlag" alt="English" />
            </button>
          </div>
        </div>
        <v-btn class="d-flex d-sm-none" icon="mdi-menu" variant="text" @click="drawer = !drawer" />
      </v-container>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary location="right">
      <v-list>
        <v-list-item :title="t('nav.experience')" @click="scrollToSection('experiencia')" />
        <v-list-item :title="t('nav.education')" @click="scrollToSection('formacao')" />
        <v-list-item :title="t('nav.projects')" @click="scrollToSection('projeto')" />
        <v-list-item :title="t('nav.contact')" @click="scrollToSection('contato')" />
      </v-list>
      <v-divider />
      <div class="lang-switcher lang-switcher--drawer">
        <button
          type="button"
          class="lang-flag"
          :class="{ 'lang-flag--active': locale === 'pt' }"
          aria-label="Português"
          @click="changeLocale('pt')"
        >
          <img :src="brasilFlag" alt="Português" />
        </button>
        <button
          type="button"
          class="lang-flag"
          :class="{ 'lang-flag--active': locale === 'en' }"
          aria-label="English"
          @click="changeLocale('en')"
        >
          <img :src="usaFlag" alt="English" />
        </button>
      </div>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import MatrixRain from './components/MatrixRain.vue'
import { setLocale, type SupportedLocale } from './i18n'
import brasilFlag from './assets/flags/brasil.png'
import usaFlag from './assets/flags/usa.png'

const { t, locale } = useI18n()

const drawer = ref(false)
const scrolled = ref(false)

function onScroll(): void {
  scrolled.value = window.scrollY > 40
}

function changeLocale(lang: SupportedLocale): void {
  setLocale(lang)
}

// Rolagem suave até a seção, sem tocar no hash da URL (o router usa hash
// history, e um href="#id" mudaria a rota e deixaria a página em branco).
function scrollToSection(id: string): void {
  drawer.value = false
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.app-logo {
  font-weight: 800;
  font-size: 1.3rem;
}

.lang-switcher {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lang-switcher--drawer {
  padding: 12px 16px;
}

.lang-flag {
  width: 26px;
  height: 26px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 50%;
  overflow: hidden;
  background: transparent;
  cursor: pointer;
  opacity: 0.55;
  transition: opacity 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
}

.lang-flag img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.lang-flag:hover {
  opacity: 0.85;
  transform: scale(1.05);
}

.lang-flag--active {
  opacity: 1;
  border-color: rgb(var(--v-theme-secondary));
}

/* Fundo tecnológico fixo (chuva estilo Matrix + glows), atrás de todas as seções */
.tech-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background: #0b0d12;
  pointer-events: none;
}

.tech-bg-canvas {
  position: absolute;
  inset: 0;
}

.tech-glow {
  position: absolute;
  width: 46vw;
  height: 46vw;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.3;
  animation: glowFloat 18s ease-in-out infinite;
}

.tech-glow--primary {
  top: -12%;
  left: -10%;
  background: radial-gradient(circle, #7c5cff, transparent 70%);
}

.tech-glow--secondary {
  bottom: -16%;
  right: -10%;
  background: radial-gradient(circle, #00e5c7, transparent 70%);
  animation-delay: -9s;
}

@keyframes glowFloat {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(4%, 6%) scale(1.15);
  }
}

/* deixa o fundo escuro do Vuetify transparente para o tech-bg aparecer por trás */
:deep(.v-application),
:deep(.v-application__wrap) {
  background: transparent !important;
}

:deep(.v-main) {
  position: relative;
  z-index: 1;
  background: transparent !important;
}

:deep(.v-app-bar) {
  z-index: 2 !important;
}
</style>
