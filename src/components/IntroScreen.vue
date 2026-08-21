<template>
  <div ref="screenRef" class="intro-screen" role="dialog" aria-modal="true" :aria-label="t('intro.title')">
    <MatrixRain class="intro-matrix-bg" aria-hidden="true" />

    <div class="intro-panel">
      <div
        v-for="(line, i) in lines"
        :key="i"
        :ref="(el) => setLineRef(el as HTMLElement | null, i)"
        class="intro-line"
      >
        <span :style="{ color: line.color }">{{ line.text }}</span>
        <span v-if="i === lines.length - 1" ref="cursorRef" class="intro-cursor">▍</span>
      </div>

      <div ref="badgeRef" class="intro-badge">3 passed · 0 failed</div>

      <button ref="enterBtnRef" type="button" class="intro-enter-btn" @click="finish">
        {{ t('intro.enter') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import gsap from 'gsap'
import MatrixRain from './MatrixRain.vue'

/**
 * Tela de entrada opcional: reaproveita a linguagem visual da CodingScene
 * (terminal, paleta violeta/teal) pra "rodar os testes" do próprio
 * portfólio antes de liberar o acesso — em vez de um splash genérico.
 *
 * Decisões deliberadas (ver conversa com o usuário):
 * - Some sozinha se prefers-reduced-motion estiver ativo (quem controla
 *   isso em App.vue, que nem chega a montar este componente nesse caso).
 * - Fundo com a mesma chuva Matrix (MatrixRain) usada no resto do site,
 *   em vez de preto liso — reforça a linguagem visual "terminal".
 * - Curta: a sequência inteira gira em ~1,5s antes do botão aparecer.
 * - "Uma vez por sessão" é responsabilidade de App.vue (sessionStorage),
 *   não deste componente — ele só sabe tocar a animação e avisar quando
 *   o usuário quer entrar.
 */

const emit = defineEmits<{ (e: 'done'): void }>()

const { t } = useI18n()

const LINE_COLOR = '#00e5c7'

const lines = [
  { text: '✓ carregando experiência', color: LINE_COLOR },
  { text: '✓ carregando projetos', color: LINE_COLOR },
  { text: '✓ carregando contato', color: LINE_COLOR },
]

const screenRef = ref<HTMLElement | null>(null)
const badgeRef = ref<HTMLElement | null>(null)
const enterBtnRef = ref<HTMLElement | null>(null)
const cursorRef = ref<HTMLElement | null>(null)
const lineRefs: (HTMLElement | null)[] = []
function setLineRef(el: HTMLElement | null, i: number): void {
  lineRefs[i] = el
}

let masterTimeline: gsap.core.Timeline | undefined
let loopTimeline: gsap.core.Timeline | undefined
let cursorTween: gsap.core.Tween | undefined
let finished = false

function finish(): void {
  if (finished) return
  finished = true
  masterTimeline?.kill()
  loopTimeline?.kill()
  cursorTween?.kill()
  gsap.to(screenRef.value, {
    autoAlpha: 0,
    duration: 0.35,
    ease: 'power2.out',
    onComplete: () => emit('done'),
  })
}

/**
 * Depois da entrada inicial, o checklist "re-testa" em loop infinito (sai e
 * volta com o mesmo stagger) — reforça a ideia de test runner rodando, em
 * vez de ficar parado no fundo. O botão "Acessar portfólio" não participa
 * do loop: fica visível e com foco o tempo todo.
 */
function startLoop(els: HTMLElement[]): void {
  loopTimeline = gsap.timeline({ repeat: -1, delay: 1.4 })
  loopTimeline.to([...els, badgeRef.value], { autoAlpha: 0, duration: 0.25 })
  loopTimeline.set(els, { x: -8 })
  loopTimeline.set(badgeRef.value, { scale: 0.85 })
  els.forEach((el, i) => {
    loopTimeline!.to(el, { autoAlpha: 1, x: 0, duration: 0.28 }, i === 0 ? '+=0.2' : '>-0.05')
  })
  loopTimeline.to(badgeRef.value, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }, '+=0.15')
  loopTimeline.to({}, { duration: 1.4 }) // segura o resultado visível antes do próximo ciclo
}

onMounted(() => {
  const els = lineRefs.filter((el): el is HTMLElement => el !== null)

  gsap.set(els, { autoAlpha: 0, x: -8 })
  gsap.set(badgeRef.value, { autoAlpha: 0, scale: 0.85 })
  gsap.set(enterBtnRef.value, { autoAlpha: 0, y: 8 })

  masterTimeline = gsap.timeline({
    onComplete: () => {
      enterBtnRef.value?.focus()
      startLoop(els)
    },
  })
  els.forEach((el, i) => {
    masterTimeline!.to(el, { autoAlpha: 1, x: 0, duration: 0.28 }, i === 0 ? 0 : '>-0.05')
  })
  masterTimeline.to(badgeRef.value, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }, '+=0.15')
  masterTimeline.to(enterBtnRef.value, { autoAlpha: 1, y: 0, duration: 0.3 }, '+=0.1')

  cursorTween = gsap.to(cursorRef.value, { autoAlpha: 0, duration: 0.5, yoyo: true, repeat: -1, ease: 'steps(1)' })
})

onBeforeUnmount(() => {
  masterTimeline?.kill()
  loopTimeline?.kill()
  cursorTween?.kill()
})
</script>

<style scoped>
.intro-screen {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #0b0d12;
  font-family: 'Fira Code', Consolas, monospace;
}

.intro-matrix-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.intro-panel {
  position: relative;
  z-index: 1;
  width: min(90vw, 460px);
  padding: 28px 28px 32px;
  border-radius: 10px;
  background: #0e1017;
  border: 1px solid #1c1e24;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
}

.intro-line {
  font-size: 0.92rem;
  line-height: 1.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.intro-cursor {
  color: #eafff6;
  margin-left: 2px;
}

.intro-badge {
  display: inline-block;
  margin-top: 16px;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(0, 229, 199, 0.14);
  border: 1px solid #00e5c7;
  color: #00e5c7;
  font-weight: 700;
  font-size: 0.85rem;
  box-shadow: 0 0 16px rgba(0, 229, 199, 0.45);
}

.intro-enter-btn {
  display: block;
  width: 100%;
  margin-top: 24px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(90deg, #7c5cff, #a48fff);
  color: #0b0d12;
  font-family: 'Manrope', 'Fira Code', sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.intro-enter-btn:hover,
.intro-enter-btn:focus-visible {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(124, 92, 255, 0.4);
}

@media (max-width: 480px) {
  .intro-line {
    font-size: 0.8rem;
  }
}
</style>
