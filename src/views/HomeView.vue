<template>
  <div>
    <!-- Hero: cena de "codando -> rodando teste -> sucesso" + apresentação -->
    <section class="hero">
      <CodingScene class="hero-canvas" />
      <v-container class="hero-content" fluid>
        <v-row align="center" class="fill-height" no-gutters>
          <v-col cols="12" md="6">
            <!-- O painel com fundo/blur fica num wrapper à parte, e não
                 direto no v-col: o grid do Vuetify define a largura do
                 v-col via flex-basis (50% no desktop), e isso ignora
                 qualquer `width` que a gente tente aplicar nele mesmo.
                 Com o wrapper, o painel encolhe pro tamanho do conteúdo. -->
            <div class="hero-text">
              <p class="hero-eyebrow">{{ t('hero.greeting') }}</p>
              <h1 class="hero-name">{{ profile.name }}</h1>
              <h2 class="hero-role">{{ t('profile.role') }}</h2>
              <p class="hero-location">{{ t('profile.location') }}</p>
              <p class="hero-summary">{{ t('profile.summary') }}</p>
              <div class="hero-actions">
                <v-btn color="primary" size="large" variant="flat" @click="scrollToSection('experiencia')">
                  {{ t('hero.ctaExperience') }}
                </v-btn>
                <v-btn color="secondary" size="large" variant="outlined" @click="scrollToSection('contato')">
                  {{ t('nav.contact') }}
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Experiência -->
    <section id="experiencia" class="section">
      <v-container>
        <h2 class="section-title">{{ t('experience.title') }}</h2>
        <v-timeline align="start" side="end" density="comfortable">
          <v-timeline-item
            v-for="exp in experiences"
            :key="exp.company + exp.period"
            dot-color="primary"
            size="small"
          >
            <v-card class="pa-4 experience-card reveal-card" elevation="4">
              <div class="experience-card__header">
                <div class="d-flex flex-wrap justify-space-between align-center mb-1">
                  <h3 class="text-h6">{{ exp.company }}</h3>
                  <span class="text-caption text-medium-emphasis">{{ exp.period }}</span>
                </div>
                <p class="text-subtitle-2 text-primary mb-2">{{ exp.role }}</p>
              </div>
              <div class="experience-card__body">
                <p class="text-body-2 mb-3 experience-card__description">{{ exp.description }}</p>
                <div class="experience-card__skills">
                  <v-chip
                    v-for="skill in exp.skills"
                    :key="skill"
                    size="small"
                    class="mr-1 mb-1"
                    variant="tonal"
                    color="secondary"
                  >
                    {{ skill }}
                  </v-chip>
                </div>
              </div>
            </v-card>
          </v-timeline-item>
        </v-timeline>
      </v-container>
    </section>

    <!-- Formação -->
    <section id="formacao" class="section section-alt">
      <v-container>
        <h2 class="section-title">{{ t('education.title') }}</h2>
        <p class="text-body-1 mb-6">{{ t('education.description') }}</p>

        <v-row>
          <v-col cols="12" md="6">
            <v-card class="pa-4 mb-4 reveal-card" elevation="4">
              <h3 class="text-h6 mb-3">{{ t('education.academicTitle') }}</h3>
              <ul class="plain-list">
                <li v-for="deg in degrees" :key="deg.title">
                  <strong>{{ deg.title }}</strong>
                  <span v-if="deg.school"> — {{ deg.school }}</span>
                  <span v-if="deg.period" class="text-caption text-medium-emphasis"> ({{ deg.period }})</span>
                </li>
              </ul>
            </v-card>

            <v-card class="pa-4 reveal-card" elevation="4">
              <h3 class="text-h6 mb-3">{{ t('education.skillsTitle') }}</h3>
              <ul class="plain-list">
                <li v-for="skill in educationSkills" :key="skill">{{ skill }}</li>
              </ul>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="pa-4 mb-4 reveal-card" elevation="4">
              <h3 class="text-h6 mb-3">{{ t('education.coursesTitle') }}</h3>
              <ul class="plain-list">
                <li v-for="course in courses" :key="course.title">
                  {{ course.title }}
                  <span class="text-caption text-medium-emphasis">— {{ course.provider }}</span>
                </li>
              </ul>
            </v-card>

            <v-card class="pa-4 reveal-card" elevation="4">
              <h3 class="text-h6 mb-3">{{ t('education.languagesTitle') }}</h3>
              <ul class="plain-list">
                <li v-for="lang in languages" :key="lang">{{ lang }}</li>
              </ul>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Projetos -->
    <section id="projeto" class="section">
      <v-container>
        <h2 class="section-title">{{ t('projects.title') }}</h2>
        <p class="text-body-1 mb-6">{{ t('projects.subtitle') }}</p>

        <v-row>
          <v-col v-for="proj in projects" :key="proj.url" cols="12" sm="6" md="4">
            <v-card
              class="pa-4 h-100 project-card reveal-card"
              elevation="4"
              :href="proj.url"
              target="_blank"
              rel="noopener"
            >
              <v-icon icon="mdi-github" size="28" class="mb-2" />
              <h3 class="text-subtitle-1 font-weight-bold">{{ proj.title }}</h3>
              <p class="text-body-2 text-medium-emphasis">{{ proj.subtitle }}</p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Contato -->
    <footer id="contato" class="section footer">
      <v-container class="text-center">
        <h2 class="section-title">{{ t('contact.title') }}</h2>
        <p class="text-body-1 mb-6">{{ t('profile.contactMessage') }}</p>

        <div class="d-flex flex-wrap justify-center ga-4 mb-6">
          <v-btn variant="tonal" color="primary" prepend-icon="mdi-email" :href="`mailto:${profile.email}`">
            {{ profile.email }}
          </v-btn>
          <v-btn variant="tonal" color="secondary" prepend-icon="mdi-whatsapp" :href="profile.whatsapp" target="_blank">
            {{ profile.whatsappLabel }}
          </v-btn>
          <v-btn variant="tonal" prepend-icon="mdi-linkedin" :href="profile.linkedin" target="_blank">
            LinkedIn
          </v-btn>
        </div>

        <p class="text-caption text-medium-emphasis">{{ t('contact.developedBy', { name: profile.name }) }}</p>
      </v-container>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import CodingScene from '../components/CodingScene.vue'
import { profile } from '../data/resume'
import { useScrollReveal } from '../composables/useScrollReveal'
import type { Experience, Degree, Course, Project } from '../types/resume'

const { t, tm } = useI18n()

useScrollReveal()

// CodingScene é DOM/CSS (sem WebGL), então ao contrário da cena 3D antiga
// não pesa no mobile — não precisa de gate de isMobile pra esconder.

const experiences = computed(() => tm('experience.items') as unknown as Experience[])
const degrees = computed(() => tm('education.degrees') as unknown as Degree[])
const educationSkills = computed(() => tm('education.skills') as unknown as string[])
const courses = computed(() => tm('education.courses') as unknown as Course[])
const languages = computed(() => tm('education.languages') as unknown as string[])
const projects = computed(() => tm('projects.items') as unknown as Project[])

function scrollToSection(id: string): void {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
}

/* Nessas larguras "de meio-termo" (tablet / notebook pequeno) o card de
   texto ocupa uma fatia maior da tela e a cena passa a colidir com ele —
   não tem espaço limpo pra encaixar os dois lado a lado. Mais simples
   esconder a cena aqui do que forçar um layout espremido; ela volta a
   aparecer no mobile (empilhada abaixo do card) e no desktop bem largo
   (espaço de sobra ao lado do card). */
@media (min-width: 601px) and (max-width: 1800px) {
  .hero-canvas {
    display: none;
  }
}

.hero-content {
  position: relative;
  z-index: 1;
  pointer-events: none;
}

.hero-content :deep(.v-btn) {
  pointer-events: auto;
}

.hero-text {
  position: relative;
  padding: 24px;
  border-radius: 16px;
  /* Largura pelo conteúdo, não pela coluna inteira — senão o painel se
     estica por cima do avatar/mesa no desktop (a coluna ocupa metade da
     tela, bem mais larga que o texto). */
  width: fit-content;
  max-width: 100%;
  /* Painel escuro semi-transparente atrás do texto, pra destacar da cena 3D
     e da chuva Matrix que ficam por trás — sem isso o texto fica ilegível.
     Sem backdrop-filter/blur de propósito: em alguns navegadores, blur
     sobre um canvas WebGL atrás (o avatar 3D e a chuva) trava a animação
     do que está por trás dele. */
  background: rgba(9, 11, 15, 0.75);
}

.hero-eyebrow {
  color: rgb(var(--v-theme-secondary));
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-size: 0.85rem;
  margin-bottom: 8px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.9);
}

.hero-name {
  font-size: clamp(2.2rem, 6vw, 3.5rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 8px;
  background: linear-gradient(90deg, #ffffff, #7c5cff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 10px rgba(0, 0, 0, 0.9));
}

.hero-role {
  font-size: clamp(1.1rem, 3vw, 1.5rem);
  font-weight: 500;
  color: rgb(var(--v-theme-secondary));
  margin-bottom: 8px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.9);
}

.hero-location {
  opacity: 0.9;
  margin-bottom: 16px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9);
}

.hero-summary {
  max-width: 480px;
  opacity: 0.95;
  margin-bottom: 16px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9);
}

@media (max-width: 600px) {
  .hero-text {
    /* No mobile a coluna já ocupa a tela toda, então aqui faz sentido o
       painel ir de ponta a ponta (e quase opaco, pra máxima legibilidade). */
    width: 100%;
    background: rgba(9, 11, 15, 0.94);
  }
}

.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.section {
  padding: 80px 0;
}

.section-alt {
  background: rgba(255, 255, 255, 0.02);
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 32px;
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: '';
  display: block;
  width: 48px;
  height: 4px;
  background: rgb(var(--v-theme-primary));
  border-radius: 2px;
  margin-top: 8px;
}

.experience-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 340px;
  box-sizing: border-box;
}

:deep(.v-timeline-item__body) {
  width: 100%;
}

@media (max-width: 600px) {
  :deep(.v-timeline--vertical.v-timeline) {
    row-gap: 40px;
  }
}

.experience-card__header {
  flex: 0 0 auto;
}

.experience-card__body {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.experience-card__description {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 0 0 auto;
}

.experience-card__skills {
  flex: 0 0 auto;
  overflow: hidden;
  max-height: 68px;
}

@media (max-width: 600px) {
  .experience-card {
    height: auto !important;
    min-height: 0 !important;
    margin-bottom: 8px;
  }

  .experience-card__body {
    overflow: visible !important;
    justify-content: flex-start;
  }

  .experience-card__description {
    -webkit-line-clamp: unset !important;
    overflow: visible !important;
  }

  .experience-card__skills {
    max-height: none !important;
    overflow: visible !important;
  }
}

.plain-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.plain-list li {
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.92rem;
}

.plain-list li:last-child {
  border-bottom: none;
}

.project-card {
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease;
}

.project-card:hover {
  transform: translateY(-4px);
}

.footer {
  background: rgba(255, 255, 255, 0.02);
}
</style>
