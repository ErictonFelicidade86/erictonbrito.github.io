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
  bgTrail: 'rgba(11, 13, 18, 0.065)',
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
  let material: THREE.MeshBasicMaterial | undefined
  let raf = 0
  let disposed = false
  let resizeObserver: ResizeObserver | undefined

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

  /**
   * Recria a CanvasTexture do zero (em vez de reaproveitar a existente).
   * Motivo: quando o <canvas> 2D fonte muda de tamanho (`rainCanvas.width/
   * height`), o Three.js pode tentar atualizar a textura já alocada na GPU
   * com um `copySubTexture` parcial que assume o tamanho ANTIGO — o driver
   * rejeita com `GL_INVALID_VALUE: glCopySubTextureCHROMIUM: Offset
   * overflows texture dimensions`, e depois de acumular erros o Chrome para
   * de aplicar novas atualizações naquele contexto (a chuva trava pra
   * sempre no último frame que subiu com sucesso). Recriar a textura força
   * uma alocação nova do tamanho certo, evitando esse caminho quebrado.
   */
  function recreateTexture(): void {
    const old = texture
    texture = new THREE.CanvasTexture(rainCanvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    if (material) {
      material.map = texture
      material.needsUpdate = true
    }
    old?.dispose()
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
    recreateTexture()
  }

  function draw(): void {
    ctx.fillStyle = COLORS.bgTrail
    ctx.fillRect(0, 0, rainCanvas.width, rainCanvas.height)
    ctx.font = `bold ${FONT_SIZE}px "Fira Code", Consolas, monospace`
    ctx.textBaseline = 'top'

    // Cada coluna é isolada num try/catch: se uma delas tiver um índice fora
    // do array (ex.: os arrays de estado ficarem fora de sincronia por causa
    // de um resize no meio do frame), um erro não interrompe o desenho das
    // colunas seguintes nem impede a textura de ser atualizada — sem isso,
    // uma exceção não tratada aqui deixava a "chuva" congelada no último
    // frame que desenhou com sucesso.
    for (let i = 0; i < columns; i++) {
      try {
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
      } catch (error) {
        console.error('[MatrixRain] falha ao desenhar coluna', i, error)
      }
    }

    if (texture) texture.needsUpdate = true
  }

  function resize(width?: number, height?: number): void {
    const canvas = canvasRef.value
    if (!canvas || !renderer) return
    const w = width ?? canvas.clientWidth
    const h = height ?? canvas.clientHeight
    // Em mobile, o container (position: fixed) pode reportar 0x0 no instante
    // do mount ou durante a troca de viewport (ex.: barra de endereço do
    // navegador escondendo/aparecendo). Ignora esses eventos espúrios pra não
    // zerar as colunas da chuva e travar a animação.
    if (w <= 0 || h <= 0) return
    renderer.setSize(w, h, false)
    setupColumns(Math.ceil(w * RESOLUTION_SCALE), Math.ceil(h * RESOLUTION_SCALE))
  }

  function animate(): void {
    if (disposed) return
    raf = requestAnimationFrame(animate)
    draw()
    try {
      if (renderer && scene && camera) renderer.render(scene, camera)
    } catch (error) {
      console.error('[MatrixRain] falha ao renderizar frame', error)
    }
  }

  function init(): void {
    const canvas = canvasRef.value
    if (!canvas) return

    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

    scene = new THREE.Scene()
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    // A textura de verdade só é criada dentro de setupColumns()/
    // recreateTexture(), já no tamanho certo — aqui o material nasce sem
    // `map`, e o `resize()` logo abaixo preenche isso no primeiro frame.
    material = new THREE.MeshBasicMaterial()
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
    scene.add(plane)

    // ResizeObserver reage ao tamanho real do canvas (inclusive nas
    // mudanças de viewport em mobile, como a barra de endereço recolhendo),
    // ao contrário do evento 'resize' da window, que nem sempre dispara
    // nesses casos e pode deixar a chuva "congelada" com 0 colunas.
    resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      resize(width, height)
    })
    resizeObserver.observe(canvas)

    resize()
    animate()
  }

  function dispose(): void {
    disposed = true
    cancelAnimationFrame(raf)
    resizeObserver?.disconnect()
    texture?.dispose()
    material?.dispose()
    scene?.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (mesh.geometry) mesh.geometry.dispose()
    })
    renderer?.dispose()
  }

  return { init, dispose }
}
