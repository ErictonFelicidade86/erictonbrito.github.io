import { onMounted, onBeforeUnmount, nextTick } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Efeito de "entrada" ao rolar a página (estilo ScrollMagic), feito com o
 * plugin GSAP ScrollTrigger: cada elemento com a classe informada (padrão
 * `.reveal-card`) some/desce um pouco e é animado para a posição final
 * (fade + slide-up) assim que entra na viewport.
 *
 * Teste rápido: se não ficar bom, é só remover a chamada de
 * `useScrollReveal()` no componente e apagar este arquivo.
 */
export function useScrollReveal(selector = '.reveal-card'): void {
  let triggers: ScrollTrigger[] = []

  onMounted(async () => {
    await nextTick()

    const elements = gsap.utils.toArray<HTMLElement>(selector)
    elements.forEach((el, index) => {
      const tween = gsap.fromTo(
        el,
        { autoAlpha: 0, y: 48 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          delay: (index % 3) * 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        },
      )
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger)
    })
  })

  onBeforeUnmount(() => {
    triggers.forEach((trigger) => trigger.kill())
    triggers = []
  })
}
