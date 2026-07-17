<template>
  <div ref="stageRef" class="coding-scene" aria-hidden="true">
    <div class="wall"></div>

    <!-- "palco" menor e alinhado à direita, pra não brigar de tamanho com
         o painel de texto (que fica à esquerda no desktop e sobreposto no
         mobile) -->
    <div class="stage">
      <div class="desk"></div>

      <!-- planta -->
      <div ref="plantRef" class="plant">
        <div class="plant-pot"></div>
        <div class="plant-leaf plant-leaf--1"></div>
        <div class="plant-leaf plant-leaf--2"></div>
        <div class="plant-leaf plant-leaf--3"></div>
      </div>

      <!-- monitor externo -->
      <div class="monitor">
        <div class="monitor-stand-base"></div>
        <div class="monitor-stand-pole"></div>
        <div class="monitor-bezel">
          <div class="monitor-screen">
            <div class="terminal-path">~/checkout-app</div>
            <div
              v-for="(line, i) in terminalLines"
              :key="'term-' + i"
              :ref="(el) => setTerminalRef(el as HTMLElement | null, i)"
              class="terminal-line"
              :style="{ color: line.color }"
            >
              {{ line.text }}
            </div>
            <div ref="badgeRef" class="passed-badge">24 passed · 0 failed</div>
          </div>
        </div>
      </div>

      <!-- personagem (visto de costas) -->
      <div ref="characterRef" class="character">
        <div class="character-hood"></div>
        <div class="character-head"></div>
        <div ref="leftArmRef" class="character-arm character-arm--left"></div>
        <div ref="rightArmRef" class="character-arm character-arm--right"></div>
        <div class="character-torso"></div>
      </div>

      <!-- notebook -->
      <div class="laptop">
        <div class="laptop-base"></div>
        <div class="laptop-screen">
          <div class="laptop-path">checkout.spec.ts</div>
          <div
            v-for="(line, i) in codeLines"
            :key="'code-' + i"
            :ref="(el) => setCodeRef(el as HTMLElement | null, i)"
            class="code-line"
          >
            <span v-for="(tok, j) in line" :key="j" :style="{ color: tok.color }">{{ tok.text }}</span>
            <span v-if="i === codeLines.length - 1" ref="cursorRef" class="code-cursor">▍</span>
          </div>
        </div>
      </div>

      <!-- caneca com vapor -->
      <div class="mug">
        <div class="mug-body"></div>
        <div class="mug-handle"></div>
        <div ref="steamRef" class="steam">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'

/**
 * Recriação autoral (Vue + CSS + GSAP, sem WebGL) de uma animação de
 * referência que o usuário mandou (feita em React/DOM, mesmo princípio de
 * "recortes" planos posicionados em CSS). Não reaproveita nenhum código
 * daquele arquivo — só a ideia de composição/narrativa (personagem
 * codando -> rodando teste -> sucesso), reimplementada do zero na paleta
 * do site (violeta/teal) em vez da paleta bege original.
 *
 * DOM+CSS em vez de Three.js de propósito: são só formas planas (retângulos
 * arredondados, círculos), então WebGL seria complexidade desnecessária —
 * e como fica leve, dá pra deixar rodando até no mobile.
 */

const PALETTE = {
  keyword: '#a48fff',
  string: '#00e5c7',
  text: '#c9d1e0',
  comment: '#5b6270',
}

type Token = { text: string; color: string }

const codeLines: Token[][] = [
  [{ text: "describe('checkout', ", color: PALETTE.text }, { text: '() => {', color: PALETTE.text }],
  [{ text: "  it('deve finalizar compra', ", color: PALETTE.text }, { text: '() => {', color: PALETTE.text }],
  [{ text: '    cy.visit(', color: PALETTE.keyword }, { text: "'/checkout'", color: PALETTE.string }, { text: ')', color: PALETTE.text }],
  [{ text: '    cy.get(', color: PALETTE.keyword }, { text: "'#pay'", color: PALETTE.string }, { text: ').click()', color: PALETTE.text }],
  [{ text: '    // valida resposta da API', color: PALETTE.comment }],
  [{ text: '    expect(res.status).toBe(', color: PALETTE.text }, { text: '200', color: PALETTE.string }, { text: ')', color: PALETTE.text }],
]

const terminalLines = [
  { text: '$ yarn cypress run --spec checkout.spec.ts', color: PALETTE.text },
  { text: '  Running: checkout.spec.ts', color: PALETTE.comment },
  { text: '  ✓ deve finalizar compra (842ms)', color: PALETTE.string },
  { text: '  ✓ deve validar cupom (310ms)', color: PALETTE.string },
  { text: '  ✓ deve calcular frete (198ms)', color: PALETTE.string },
]

const stageRef = ref<HTMLElement | null>(null)
const characterRef = ref<HTMLElement | null>(null)
const leftArmRef = ref<HTMLElement | null>(null)
const rightArmRef = ref<HTMLElement | null>(null)
const plantRef = ref<HTMLElement | null>(null)
const steamRef = ref<HTMLElement | null>(null)
const badgeRef = ref<HTMLElement | null>(null)
const cursorRef = ref<HTMLElement | null>(null)

const codeRefs: (HTMLElement | null)[] = []
const terminalRefs: (HTMLElement | null)[] = []
function setCodeRef(el: HTMLElement | null, i: number): void {
  codeRefs[i] = el
}
function setTerminalRef(el: HTMLElement | null, i: number): void {
  terminalRefs[i] = el
}

let masterTimeline: gsap.core.Timeline | undefined
let idleTweens: gsap.core.Tween[] = []

function buildTimeline(): gsap.core.Timeline {
  const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'power2.out' } })

  // filtra nulls por segurança — refs de v-for só ficam garantidas depois
  // que o Vue termina de montar a lista
  const codeEls = codeRefs.filter((el): el is HTMLElement => el !== null)
  const terminalEls = terminalRefs.filter((el): el is HTMLElement => el !== null)

  // estado inicial: tudo escondido
  gsap.set(codeEls, { autoAlpha: 0, x: -8 })
  gsap.set(terminalEls, { autoAlpha: 0, x: -8 })
  gsap.set(badgeRef.value, { autoAlpha: 0, scale: 0.85 })
  gsap.set([leftArmRef.value, rightArmRef.value], { rotate: 0 })

  // Ato 1: codando — linhas de código aparecem uma a uma
  tl.addLabel('coding')
  codeEls.forEach((el, i) => {
    tl.to(el, { autoAlpha: 1, x: 0, duration: 0.35 }, i === 0 ? 'coding' : '>-0.12')
  })
  tl.to({}, { duration: 1 }) // pausa lendo o resultado

  // Ato 2: some o código, aparece o terminal com os logs
  tl.addLabel('testrun')
  tl.to(codeEls, { autoAlpha: 0, duration: 0.3 })
  terminalEls.forEach((el, i) => {
    tl.to(el, { autoAlpha: 1, x: 0, duration: 0.3 }, i === 0 ? 'testrun+=0.2' : '>-0.08')
  })

  // Ato 3: sucesso — badge brilha + personagem comemora
  tl.addLabel('success', '+=0.4')
  tl.to(badgeRef.value, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, 'success')
  tl.to([leftArmRef.value, rightArmRef.value], { rotate: (i) => (i === 0 ? -145 : 145), duration: 0.35, ease: 'back.out(2)' }, 'success')
  tl.to({}, { duration: 1.1 }) // segura a comemoração
  tl.to([leftArmRef.value, rightArmRef.value], { rotate: 0, duration: 0.4, ease: 'power2.inOut' })

  // reset: some tudo e volta pro início do loop
  tl.to([...terminalEls, badgeRef.value], { autoAlpha: 0, duration: 0.35 }, '+=0.3')

  return tl
}

function startIdleAnimations(): void {
  // balanço sutil do personagem digitando
  idleTweens.push(
    gsap.to(characterRef.value, { y: '+=3', duration: 1.1, yoyo: true, repeat: -1, ease: 'sine.inOut' }),
  )
  // planta balançando
  idleTweens.push(
    gsap.to(plantRef.value, { rotate: 4, duration: 2.2, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: 'bottom center' }),
  )
  // cursor piscando
  idleTweens.push(
    gsap.to(cursorRef.value, { autoAlpha: 0, duration: 0.5, yoyo: true, repeat: -1, ease: 'steps(1)' }),
  )
  // vapor da caneca: cada partícula sobe e desaparece, em loop escalonado
  const steamSpans = steamRef.value?.querySelectorAll('span')
  steamSpans?.forEach((span, i) => {
    idleTweens.push(
      gsap.fromTo(
        span,
        { y: 0, autoAlpha: 0 },
        { y: -26, autoAlpha: 0.55, duration: 1.8, repeat: -1, delay: i * 0.5, ease: 'sine.out' },
      ),
    )
  })
}

onMounted(() => {
  masterTimeline = buildTimeline()
  startIdleAnimations()
})

onBeforeUnmount(() => {
  masterTimeline?.kill()
  idleTweens.forEach((tween) => tween.kill())
  idleTweens = []
})
</script>

<style scoped>
.coding-scene {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: 'Fira Code', Consolas, monospace;
}

.wall {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(124, 92, 255, 0.05), rgba(0, 229, 199, 0.04));
}

/* Palco: box menor, encostado na direita e centralizado verticalmente —
   sem isso, os elementos abaixo (posicionados em % dentro dele) se
   espalham pela largura inteira do hero e ficam gigantes/colados no
   texto. Todas as posições/tamanhos abaixo são relativos a este box. */
.stage {
  position: absolute;
  /* left+right (sem width fixo) faz o palco preencher exatamente o vão
     entre o card de texto e a borda direita, com folga igual dos dois
     lados — um width com max-width fixo deixava sobra maior à esquerda
     em telas largas. */
  left: 27%;
  right: 1%;
  top: 50%;
  transform: translateY(-50%);
  aspect-ratio: 16 / 12;
}

.desk {
  position: absolute;
  left: 8%;
  right: 4%;
  bottom: 37%;
  height: 3.5%;
  background: linear-gradient(180deg, #8a5a3c, #6b4530);
  border-radius: 4px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.35);
}

/* personagem — sem z-index de propósito: a ordem no template (personagem
   antes do notebook) já garante que o notebook fica na frente dele. */
.character {
  position: absolute;
  left: 22%;
  bottom: 39%;
  width: 12%;
  aspect-ratio: 1 / 1.3;
}

.character-torso {
  position: absolute;
  left: 15%;
  bottom: 0;
  width: 70%;
  height: 68%;
  background: #2c2838;
  border-radius: 40% 40% 20% 20%;
}

.character-hood {
  position: absolute;
  left: 8%;
  bottom: 55%;
  width: 84%;
  height: 30%;
  background: #201c2a;
  border-radius: 50% 50% 30% 30%;
}

.character-head {
  position: absolute;
  left: 28%;
  bottom: 68%;
  width: 44%;
  height: 34%;
  background: #e8bd97;
  border-radius: 50%;
}

.character-arm {
  position: absolute;
  bottom: 30%;
  width: 16%;
  height: 40%;
  background: #2c2838;
  border-radius: 40%;
  transform-origin: top center;
}

.character-arm--left {
  left: 4%;
}

.character-arm--right {
  right: 4%;
}

/* notebook */
.laptop {
  position: absolute;
  left: 16%;
  bottom: 41%;
  width: 20%;
}

.laptop-base {
  width: 100%;
  aspect-ratio: 14 / 1;
  background: #aeb4c0;
  border-radius: 3px;
}

.laptop-screen {
  position: absolute;
  bottom: 100%;
  left: 6%;
  width: 88%;
  aspect-ratio: 16 / 11;
  background: #0e1017;
  border: 3px solid #1c1e24;
  border-radius: 4px 4px 0 0;
  padding: 5% 6%;
  overflow: hidden;
  font-size: 6.5px;
  line-height: 1.5;
}

.laptop-path {
  color: #5b6270;
  margin-bottom: 4px;
  font-size: 0.9em;
}

.code-line {
  white-space: nowrap;
}

.code-cursor {
  color: #eafff6;
}

/* monitor externo */
.monitor {
  position: absolute;
  right: 14%;
  bottom: 41%;
  width: 24%;
}

.monitor-stand-base {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 30%;
  height: 6px;
  background: #101014;
  border-radius: 2px;
}

.monitor-stand-pole {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 16px;
  background: #101014;
}

.monitor-bezel {
  background: #101014;
  border-radius: 6px;
  padding: 3.5%;
}

.monitor-screen {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  background: #0e1017;
  border-radius: 2px;
  overflow: hidden;
  padding: 6%;
  font-size: 7px;
  line-height: 1.6;
}

.terminal-path {
  color: #a48fff;
  margin-bottom: 4px;
  font-size: 0.9em;
}

.terminal-line {
  white-space: nowrap;
}

.passed-badge {
  position: absolute;
  right: 10px;
  bottom: 10px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(0, 229, 199, 0.14);
  border: 1px solid #00e5c7;
  color: #00e5c7;
  font-weight: 700;
  font-size: 0.85em;
  box-shadow: 0 0 16px rgba(0, 229, 199, 0.45);
  white-space: nowrap;
}

/* planta */
.plant {
  position: absolute;
  right: 6%;
  bottom: 41%;
  width: 6%;
  transform-origin: bottom center;
}

.plant-pot {
  width: 100%;
  aspect-ratio: 1 / 0.8;
  background: #8a5a3c;
  border-radius: 20% 20% 40% 40%;
}

.plant-leaf {
  position: absolute;
  bottom: 70%;
  left: 50%;
  width: 34%;
  aspect-ratio: 1 / 3;
  background: #2fbf8f;
  border-radius: 50% 50% 0 0;
}

.plant-leaf--1 {
  transform: translateX(-50%) rotate(-18deg);
}

.plant-leaf--2 {
  transform: translateX(-50%) rotate(0deg) translateY(-14%);
}

.plant-leaf--3 {
  transform: translateX(-50%) rotate(18deg);
}

/* caneca */
.mug {
  position: absolute;
  left: 39%;
  bottom: 41%;
  width: 2.6%;
}

.mug-body {
  width: 100%;
  aspect-ratio: 1 / 1.1;
  background: #d8d2ff;
  border-radius: 15% 15% 30% 30%;
}

.mug-handle {
  position: absolute;
  right: -35%;
  top: 20%;
  width: 45%;
  height: 45%;
  border: 2px solid #d8d2ff;
  border-left: none;
  border-radius: 0 50% 50% 0;
}

.steam {
  position: absolute;
  bottom: 100%;
  left: 20%;
  width: 60%;
  height: 30px;
}

.steam span {
  position: absolute;
  bottom: 0;
  left: 30%;
  width: 3px;
  height: 12px;
  background: rgba(234, 255, 246, 0.6);
  border-radius: 2px;
  filter: blur(1px);
}

.steam span:nth-child(2) {
  left: 55%;
}

.steam span:nth-child(3) {
  left: 10%;
}

@media (max-width: 600px) {
  /* No mobile o painel de texto cobre quase a tela toda (ver .hero-text),
     então o palco só precisa aparecer pequeno, espiando embaixo dele. */
  .stage {
    left: auto;
    width: min(78%, 360px);
    right: 50%;
    top: auto;
    bottom: 4%;
    transform: translateX(50%);
  }
}
</style>
