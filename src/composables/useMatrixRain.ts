import * as THREE from 'three'
import type { Ref } from 'vue'

/**
 * "Chuva digital" estilo Matrix, renderizada com Three.js: uma câmera
 * ortográfica projeta um quad fullscreen cuja textura é um <canvas> 2D
 * redesenhado a cada frame com o algoritmo clássico (colunas de glifos
 * caindo + leve fade em preto para o rastro). Fica como plano de fundo
 * fixo, atrás de toda a aplicação.
 */

// Nomes de tecnologias, ferramentas e linguagens do stack usadas no projeto
// e no currículo, caindo verticalmente no lugar dos glifos japoneses clássicos.
const WORDS = [
  'VUE',
  'TYPESCRIPT',
  'JAVASCRIPT',
  'VUETIFY',
  'THREE.JS',
  'BLENDER',
  'VITE',
  'YARN',
  'PYTHON',
  'NODE',
  'CYPRESS',
  'K6',
  'PLAYWRIGHT',
  'LOCUST',
  'DOCKER',
  'JENKINS',
  'GITLAB',
  'GITHUB',
  'MONGODB',
  'POSTGRESQL',
  'ANGULAR',
  'HTML5',
  'CSS3',
  'SCRUM',
  'POSTMAN',
  'REST API',
  'SQL',
  'GSAP',
]

const COLORS = {
  bgOpaque: '#0b0d12',
  bgTrail: 'rgba(11, 13, 18, 0.13)',
  head: '#eafff6',
  bright: '#00e5c7',
  violet: '#a48fff',
} as const

const FONT_SIZE = 16
const RESOLUTION_SCALE = 0.5 // renderiza a chuva numa textura menor (perf) e o plane amplia

export function useMatrixRain(canvasRef: Ref<HTMLCanvasElement | null>) {
  let renderer: THREE.WebGLRenderer | undefined
  let scene: THREE.Scene | undefined
  let camera: THREE.OrthographicCamera | undefined
  let texture: THREE.CanvasTexture | undefined
  let raf = 0
  let disposed = false

  const rainCanvas = document.createElement('canvas')
  const ctx = rainCanvas.getContext('2d') as CanvasRenderingContext2D
  let columns = 0
  let drops: number[] = []
  let columnWords: string[] = []
  let columnCharIndex: number[] = []

  function randomWord(): string {
    // espaços extras entre repetições, pra ficar legível quando a coluna repete a palavra
    return `${WORDS[Math.floor(Math.random() * WORDS.length)]}   `
  }

  function setupColumns(width: number, height: number): void {
    rainCanvas.width = Math.max(1, width)
    rainCanvas.height = Math.max(1, height)
    ctx.fillStyle = COLORS.bgOpaque
    ctx.fillRect(0, 0, rainCanvas.width, rainCanvas.height)
    columns = Math.ceil(rainCanvas.width / FONT_SIZE)
    drops = new Array(columns).fill(0).map(() => Math.floor((Math.random() * rainCanvas.height) / FONT_SIZE) * -1)
    columnWords = new Array(columns).fill(0).map(() => randomWord())
    columnCharIndex = new Array(columns).fill(0).map(() => Math.floor(Math.random() * 6))
  }

  function draw(): void {
    ctx.fillStyle = COLORS.bgTrail
    ctx.fillRect(0, 0, rainCanvas.width, rainCanvas.height)
    ctx.font = `bold ${FONT_SIZE}px "Fira Code", Consolas, monospace`
    ctx.textBaseline = 'top'

    for (let i = 0; i < columns; i++) {
      const y = drops[i] * FONT_SIZE
      if (y >= 0 && y < rainCanvas.height) {
        const word = columnWords[i]
        const char = word[columnCharIndex[i] % word.length]
        if (char !== ' ') {
          const roll = Math.random()
          ctx.fillStyle = roll > 0.985 ? COLORS.head : roll > 0.88 ? COLORS.violet : COLORS.bright
          ctx.fillText(char, i * FONT_SIZE, y)
        }
        columnCharIndex[i] += 1
      }

      drops[i] += 1
      if (y > rainCanvas.height && Math.random() > 0.975) {
        drops[i] = Math.floor(Math.random() * -30)
        columnWords[i] = randomWord()
        columnCharIndex[i] = 0
      }
    }

    if (texture) texture.needsUpdate = true
  }

  function resize(): void {
    const canvas = canvasRef.value
    if (!canvas || !renderer) return
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    renderer.setSize(width, height, false)
    setupColumns(Math.ceil(width * RESOLUTION_SCALE), Math.ceil(height * RESOLUTION_SCALE))
  }

  function animate(): void {
    if (disposed) return
    raf = requestAnimationFrame(animate)
    draw()
    if (renderer && scene && camera) renderer.render(scene, camera)
  }

  function init(): void {
    const canvas = canvasRef.value
    if (!canvas) return

    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

    scene = new THREE.Scene()
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    texture = new THREE.CanvasTexture(rainCanvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter

    const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: texture }))
    scene.add(plane)

    window.addEventListener('resize', resize)
    resize()
    animate()
  }

  function dispose(): void {
    disposed = true
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', resize)
    texture?.dispose()
    scene?.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (mesh.geometry) mesh.geometry.dispose()
      if (mesh.material) {
        if (Array.isArray(mesh.material)) mesh.material.forEach((m) => m.dispose())
        else mesh.material.dispose()
      }
    })
    renderer?.dispose()
  }

  return { init, dispose }
}
