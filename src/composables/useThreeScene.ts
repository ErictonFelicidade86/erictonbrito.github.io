import * as THREE from 'three'
import gsap from 'gsap'
import type { Ref } from 'vue'

/**
 * Composable que monta uma cena Three.js dentro de um <canvas>: uma mesa de
 * trabalho estilizada (baixo-poly) com um personagem digitando em frente a um
 * monitor e um notebook que exibem "código" sendo escrito em tempo real.
 *
 * A cena é 100% procedural (primitivas do Three.js) — não depende de um
 * modelo .glb do Blender. Se um dia você modelar o avatar no Blender e
 * exportar um .glb/.gltf para /public/models, basta trocar `createDeskScene()`
 * por um GLTFLoader carregando esse arquivo.
 *
 * Interações:
 *  - idle: leve balanço do personagem, "dedos" digitando, código rolando nas telas
 *  - scroll: gira sutilmente o diorama e ajusta o zoom da câmera
 *  - clique: dispara uma rajada de "digitação" (linhas novas nas telas + flash de luz)
 *
 * Realismo: sombras reais (luz direcional + chão), textura de madeira na
 * mesa, teclado com teclas individuais + mouse, e um personagem com silhueta
 * de moletom afunilada (ombros largos, cintura mais estreita) + capuz e
 * orelhas, em vez do "blob" uniforme anterior.
 */

const PALETTE = {
  bg: '#0e1017',
  keyword: '#a48fff',
  string: '#00e5c7',
  text: '#c9d1e0',
  comment: '#5b6270',
} as const

const CODE_SNIPPETS = [
  "describe('login', () => {",
  "  it('deve autenticar', () => {",
  "cy.visit('/login')",
  "cy.get('#user').type(name)",
  "cy.get('#senha').type(pass)",
  "// valida resposta da API",
  'const res = await request(app)',
  'expect(res.status).toBe(200)',
  'export default defineComponent({',
  '  setup() {',
  '    const loading = ref(false)',
  'if (!token) throw new Error(msg)',
  'k6 run --vus 50 script.js',
  'test.describe.parallel(suite)',
  "git commit -m 'fix: qa pipeline'",
  'docker compose up -d',
  'SELECT * FROM logs WHERE ok = false',
  'function runTests() {',
  '  return results.every(Boolean)',
  '}',
  'await page.click(submitBtn)',
  'assert.strictEqual(a, b)',
]

function lineColor(line: string): string {
  const trimmed = line.trim()
  if (trimmed.startsWith('//')) return PALETTE.comment
  if (trimmed.includes("'") || trimmed.includes('"')) return PALETTE.string
  if (/^(const|let|var|function|return|if|export|class|describe|it|test|import|await|git|docker|SELECT)/i.test(trimmed))
    return PALETTE.keyword
  return PALETTE.text
}

/** Liga cast/receive shadow em todos os meshes de uma subárvore de uma vez. */
function enableShadows(root: THREE.Object3D, options: { cast?: boolean; receive?: boolean } = {}): void {
  const { cast = true, receive = false } = options
  root.traverse((child) => {
    const mesh = child as THREE.Mesh
    if ((mesh as THREE.Mesh).isMesh) {
      mesh.castShadow = cast
      mesh.receiveShadow = receive
    }
  })
}

/** Textura procedural de veios de madeira (canvas), pra tampo da mesa não ficar liso demais. */
function createWoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

  ctx.fillStyle = '#4a3527'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < 46; i++) {
    const y = (i / 46) * canvas.height + Math.random() * 4
    ctx.strokeStyle = `rgba(20, 11, 6, ${0.1 + Math.random() * 0.16})`
    ctx.lineWidth = 1 + Math.random() * 2.2
    ctx.beginPath()
    ctx.moveTo(0, y)
    for (let x = 0; x <= canvas.width; x += 14) {
      ctx.lineTo(x, y + Math.sin(x * 0.045 + i * 1.3) * 5)
    }
    ctx.stroke()
  }

  // veios claros ocasionais, pra quebrar a repetição
  for (let i = 0; i < 10; i++) {
    const y = Math.random() * canvas.height
    ctx.strokeStyle = 'rgba(255, 220, 190, 0.05)'
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvas.width, y + (Math.random() - 0.5) * 10)
    ctx.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(3.2, 1.3)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function createCodeScreen() {
  const canvas = document.createElement('canvas')
  canvas.width = 320
  canvas.height = 260
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  const lineHeight = 17
  const fontSize = 13

  ctx.fillStyle = PALETTE.bg
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.font = `${fontSize}px "Fira Code", Consolas, monospace`
  ctx.textBaseline = 'top'

  function addLine(): void {
    // rola o conteúdo existente uma linha para cima
    ctx.drawImage(canvas, 0, -lineHeight)
    ctx.fillStyle = PALETTE.bg
    ctx.fillRect(0, canvas.height - lineHeight, canvas.width, lineHeight)

    const line = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)]
    const indent = (line.match(/^\s*/)?.[0].length ?? 0) * 5
    ctx.fillStyle = lineColor(line)
    ctx.fillText(line.trimStart(), 10 + indent, canvas.height - lineHeight + 3)
  }

  for (let i = 0; i < 16; i++) addLine()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return { canvas, texture, addLine }
}

function createArm(side: 1 | -1, skin: THREE.Material, sleeve: THREE.Material) {
  const group = new THREE.Group()
  group.position.set(side * 0.28, 0.7, 0.14)
  group.rotation.set(1.0, 0, side * 0.12)

  const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.095, 10, 10), sleeve)
  group.add(shoulder)

  const upperLength = 0.3
  const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.068, upperLength, 8), sleeve)
  upper.position.y = -upperLength / 2
  group.add(upper)

  // punho da manga: um leve rebordo mais claro, onde a manga termina
  const cuff = new THREE.Mesh(
    new THREE.CylinderGeometry(0.052, 0.052, 0.03, 8),
    new THREE.MeshStandardMaterial({ color: 0x272149, roughness: 0.75 }),
  )
  cuff.position.y = -upperLength + 0.015
  group.add(cuff)

  const elbow = new THREE.Group()
  elbow.position.y = -upperLength
  elbow.rotation.x = -0.85
  group.add(elbow)

  const elbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), skin)
  elbow.add(elbowJoint)

  const foreLength = 0.28
  const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.048, foreLength, 8), skin)
  forearm.position.y = -foreLength / 2
  elbow.add(forearm)

  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), skin)
  hand.position.y = -foreLength
  elbow.add(hand)

  return { group, hand }
}

function createCharacter() {
  const character = new THREE.Group()

  const skin = new THREE.MeshStandardMaterial({ color: 0xe8bd97, roughness: 0.6 })
  const hoodie = new THREE.MeshStandardMaterial({ color: 0x342d54, roughness: 0.78 })
  const hoodieDark = new THREE.MeshStandardMaterial({ color: 0x272149, roughness: 0.8 })
  const hair = new THREE.MeshStandardMaterial({ color: 0x34323c, roughness: 0.5 })

  // torso afunilado (ombros largos, cintura mais estreita) em vez da cápsula
  // uniforme anterior — silhueta de moletom bem mais convincente vista de trás.
  const torsoHeight = 0.5
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.21, torsoHeight, 16, 1, false), hoodie)
  torso.position.y = 0.32
  character.add(torso)

  // "cúpula" nos ombros, arredondando o topo do cilindro do torso
  const shoulderCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.29, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    hoodie,
  )
  shoulderCap.position.y = 0.32 + torsoHeight / 2
  character.add(shoulderCap)

  // capuz caído nas costas: dois "flaps" sobrepostos, sugerindo o cordão e a dobra do tecido
  const hoodFlap = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.22, 12, 1, true), hoodieDark)
  hoodFlap.position.set(0, 0.56, -0.16)
  hoodFlap.rotation.x = Math.PI * 0.92
  character.add(hoodFlap)

  // colarinho: um leve detalhe teal no pescoço da hoodie, pra tirar o visual "blob"
  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(0.145, 0.018, 8, 16),
    new THREE.MeshStandardMaterial({ color: 0x00e5c7, roughness: 0.5, metalness: 0.1 }),
  )
  collar.position.y = 0.61
  collar.rotation.x = Math.PI / 2
  character.add(collar)

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.1, 12), skin)
  neck.position.y = 0.67
  character.add(neck)

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.21, 22, 18), skin)
  head.position.y = 0.9
  character.add(head)

  // orelhas: dois discos achatados nas laterais da cabeça
  const earMaterial = skin
  const earGeometry = new THREE.SphereGeometry(0.032, 10, 8)
  ;[-1, 1].forEach((side) => {
    const ear = new THREE.Mesh(earGeometry, earMaterial)
    ear.position.set(side * 0.205, 0.895, 0.01)
    ear.scale.set(0.6, 1, 1)
    character.add(ear)
  })

  // cabelo curto cobrindo topo/laterais/franja
  const hairMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.216, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.62),
    hair,
  )
  hairMesh.position.y = 0.9
  character.add(hairMesh)

  const leftArm = createArm(-1, skin, hoodie)
  const rightArm = createArm(1, skin, hoodie)
  character.add(leftArm.group, rightArm.group)

  enableShadows(character, { cast: true })

  return { character, head, leftHand: leftArm.hand, rightHand: rightArm.hand }
}

function createChair() {
  const chair = new THREE.Group()
  const fabric = new THREE.MeshStandardMaterial({ color: 0x22242c, roughness: 0.85 })

  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.07, 0.5), fabric)
  seat.position.set(0, 0.02, 0.08)
  chair.add(seat)

  const back = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.68, 0.08), fabric)
  back.position.set(0, 0.4, 0.32)
  chair.add(back)

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 0.4, 8),
    new THREE.MeshStandardMaterial({ color: 0x3a3d47, metalness: 0.5, roughness: 0.35 }),
  )
  pole.position.set(0, -0.2, 0.08)
  chair.add(pole)

  return chair
}

function createPlant() {
  const plant = new THREE.Group()
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.07, 0.12, 10),
    new THREE.MeshStandardMaterial({ color: 0x8a5a3c, roughness: 0.9 }),
  )
  pot.position.y = 0.06
  plant.add(pot)

  const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x2fbf8f, flatShading: true, roughness: 0.6 })
  for (let i = 0; i < 5; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.22, 6), leafMaterial)
    const angle = (i / 5) * Math.PI * 2
    leaf.position.set(Math.cos(angle) * 0.03, 0.24 + Math.random() * 0.05, Math.sin(angle) * 0.03)
    leaf.rotation.z = Math.cos(angle) * 0.4
    leaf.rotation.x = Math.sin(angle) * 0.4
    plant.add(leaf)
  }
  return plant
}

function createLamp() {
  const lamp = new THREE.Group()
  const metal = new THREE.MeshStandardMaterial({ color: 0x2a2c33, metalness: 0.6, roughness: 0.35 })

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.03, 12), metal)
  lamp.add(base)

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8), metal)
  pole.position.y = 0.2
  pole.rotation.z = -0.25
  lamp.add(pole)

  const shade = new THREE.Mesh(
    new THREE.ConeGeometry(0.09, 0.14, 12, 1, true),
    new THREE.MeshStandardMaterial({ color: 0xf2e6d8, emissive: 0xffb37a, emissiveIntensity: 0.4, side: THREE.DoubleSide }),
  )
  shade.position.set(0.17, 0.42, 0)
  shade.rotation.z = Math.PI
  lamp.add(shade)

  return lamp
}

/** Teclado com teclas individuais (em vez de um bloco liso) + mouse ao lado. */
function createKeyboard() {
  const keyboard = new THREE.Group()
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.022, 0.29),
    new THREE.MeshStandardMaterial({ color: 0x1c1e24, roughness: 0.65 }),
  )
  base.position.y = 0.011
  keyboard.add(base)

  const keyMaterial = new THREE.MeshStandardMaterial({ color: 0x2b2e38, roughness: 0.5 })
  const keyGeometry = new THREE.BoxGeometry(0.036, 0.012, 0.036)
  const cols = 13
  const rows = 4
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = new THREE.Mesh(keyGeometry, keyMaterial)
      key.position.set(-0.275 + c * 0.0435, 0.028, -0.11 + r * 0.04)
      keyboard.add(key)
    }
  }
  const spaceBar = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.012, 0.036), keyMaterial)
  spaceBar.position.set(-0.02, 0.028, -0.11 + rows * 0.04)
  keyboard.add(spaceBar)

  enableShadows(keyboard, { cast: true })
  return keyboard
}

function createMouse() {
  const mouse = new THREE.Group()
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.032, 0.05, 4, 10),
    new THREE.MeshStandardMaterial({ color: 0x24262e, roughness: 0.45 }),
  )
  body.rotation.z = Math.PI / 2
  body.rotation.y = Math.PI / 2
  body.scale.set(1, 0.72, 1)
  body.position.y = 0.024
  mouse.add(body)

  enableShadows(mouse, { cast: true })
  return mouse
}

/** Notebook aberto sobre a mesa, com a tela espelhando o mesmo "código" do monitor. */
function createLaptop(sharedScreenTexture: THREE.CanvasTexture) {
  const laptop = new THREE.Group()
  const aluminum = new THREE.MeshStandardMaterial({ color: 0xaeb4c0, metalness: 0.55, roughness: 0.35 })

  const base = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.025, 0.42), aluminum)
  base.position.y = 0.0125
  laptop.add(base)

  const keys = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.006, 0.28),
    new THREE.MeshStandardMaterial({ color: 0x1c1e24, roughness: 0.7 }),
  )
  keys.position.set(0, 0.028, -0.02)
  laptop.add(keys)

  // tela grande e bem visível, presa por uma dobradiça na borda de trás da base
  const hinge = new THREE.Group()
  hinge.position.set(0, 0.02, -0.2)
  hinge.rotation.x = -1.85
  laptop.add(hinge)

  const lidHeight = 0.42
  const lidBack = new THREE.Mesh(new THREE.BoxGeometry(0.6, lidHeight, 0.02), aluminum)
  lidBack.position.y = lidHeight / 2
  hinge.add(lidBack)

  const screenFace = new THREE.Mesh(
    new THREE.PlaneGeometry(0.54, 0.36),
    new THREE.MeshBasicMaterial({ map: sharedScreenTexture }),
  )
  screenFace.position.set(0, lidHeight / 2 + 0.01, 0.011)
  hinge.add(screenFace)

  enableShadows(laptop, { cast: true })
  return laptop
}

function createDeskScene() {
  const group = new THREE.Group()

  const woodTexture = createWoodTexture()
  const wood = new THREE.MeshStandardMaterial({ map: woodTexture, roughness: 0.78 })
  const deskWidth = 2.6
  const deskDepth = 1.1
  const deskTopY = -0.35

  const top = new THREE.Mesh(new THREE.BoxGeometry(deskWidth, 0.08, deskDepth), wood)
  top.position.y = deskTopY
  group.add(top)
  ;[-1, 1].forEach((side) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.9, deskDepth * 0.85), wood)
    leg.position.set((side * deskWidth) / 2 - side * 0.05, deskTopY - 0.49, 0)
    group.add(leg)
  })

  // monitor
  const monitor = new THREE.Group()
  const bezelMaterial = new THREE.MeshStandardMaterial({ color: 0x101014, roughness: 0.5 })
  const standBase = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.2), bezelMaterial)
  const standPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.28, 8), bezelMaterial)
  standPole.position.y = 0.16
  monitor.add(standBase, standPole)

  // bezel mais fino (era 0.05 de profundidade) — silhueta mais próxima de um monitor atual
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.82, 0.035), bezelMaterial)
  bezel.position.y = 0.72
  monitor.add(bezel)

  // aletas de ventilação na tampa traseira do monitor: detalhe pequeno que
  // quebra a superfície lisa quando a câmera vê o monitor de lado/trás
  const ventMaterial = new THREE.MeshStandardMaterial({ color: 0x08080a, roughness: 0.7 })
  for (let i = 0; i < 5; i++) {
    const vent = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.008, 0.006), ventMaterial)
    vent.position.set(0, 0.5 + i * 0.03, -0.019)
    monitor.add(vent)
  }

  const { canvas: screenCanvas, texture: screenTexture, addLine } = createCodeScreen()
  const screenMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 0.72),
    new THREE.MeshBasicMaterial({ map: screenTexture }),
  )
  screenMesh.position.set(0, 0.72, 0.03)
  monitor.add(screenMesh)

  // fina borda emissiva ao redor da tela, sugerindo o brilho "vazando" do monitor
  const glowFrame = new THREE.Mesh(
    new THREE.RingGeometry(0.6, 0.615, 4, 1),
    new THREE.MeshBasicMaterial({ color: 0x00e5c7, transparent: true, opacity: 0.18, side: THREE.DoubleSide }),
  )
  glowFrame.position.set(0, 0.72, 0.028)
  glowFrame.scale.set(1.02, 0.6, 1)
  monitor.add(glowFrame)

  monitor.position.set(-0.35, deskTopY + 0.04, -0.42)
  group.add(monitor)

  const monitorLight = new THREE.PointLight(0x00e5c7, 1.2, 3.5)
  monitorLight.position.set(0, deskTopY + 0.5, -0.15)
  group.add(monitorLight)

  // teclado detalhado (teclas individuais) + mouse do lado direito
  const keyboard = createKeyboard()
  keyboard.position.set(-0.35, deskTopY + 0.05, 0.1)
  group.add(keyboard)

  const mouse = createMouse()
  mouse.position.set(0.05, deskTopY + 0.05, 0.12)
  mouse.rotation.y = -0.15
  group.add(mouse)

  // notebook, com a mesma "tela" do monitor (fica maior e bem visível)
  const laptop = createLaptop(screenTexture)
  laptop.position.set(0.68, deskTopY + 0.04, 0.02)
  laptop.rotation.y = -0.32
  group.add(laptop)

  // planta e luminária nos cantos da mesa
  const plant = createPlant()
  plant.position.set(deskWidth / 2 - 0.22, deskTopY + 0.04, -0.32)
  group.add(plant)

  const lamp = createLamp()
  lamp.position.set(-deskWidth / 2 + 0.3, deskTopY + 0.04, -0.3)
  group.add(lamp)

  // personagem + cadeira
  const chair = createChair()
  chair.position.set(-0.1, deskTopY - 0.08, 0.55)
  group.add(chair)

  const { character, head, leftHand, rightHand } = createCharacter()
  character.position.set(-0.1, deskTopY - 0.02, 0.4)
  group.add(character)

  // poeira ambiente
  const particleCount = 60
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 4
    positions[i * 3 + 1] = Math.random() * 2.2 - 0.6
    positions[i * 3 + 2] = (Math.random() - 0.5) * 3
  }
  const particleGeometry = new THREE.BufferGeometry()
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particles = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.015, transparent: true, opacity: 0.35 }),
  )
  group.add(particles)

  // sombras: tampo da mesa recebe (objetos em cima) e também projeta (no chão);
  // o resto do diorama só projeta sombra.
  enableShadows(top, { cast: true, receive: true })
  enableShadows(monitor, { cast: true })
  enableShadows(chair, { cast: true })
  enableShadows(plant, { cast: true })
  enableShadows(lamp, { cast: true })

  return { group, head, leftHand, rightHand, keyboard, screenMesh, monitorLight, screenCanvas, screenTexture, addLine, particles }
}

export function useThreeScene(canvasRef: Ref<HTMLCanvasElement | null>) {
  let renderer: THREE.WebGLRenderer | undefined
  let scene: THREE.Scene | undefined
  let camera: THREE.PerspectiveCamera | undefined
  let clock: THREE.Clock | undefined
  let scene3d: ReturnType<typeof createDeskScene> | undefined
  let raf = 0
  let scrollProgress = 0
  let disposed = false
  let typeAccumulator = 0
  let nextTypeInterval = 0.4 + Math.random() * 0.4

  const pointer = new THREE.Vector2()
  const raycaster = new THREE.Raycaster()

  function init(): void {
    const canvas = canvasRef.value
    if (!canvas) return

    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
    camera.position.set(0.9, 1.1, 5.3)
    camera.lookAt(0, 0.52, -0.4)

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    resize()

    scene.add(new THREE.AmbientLight(0xffffff, 0.55))

    // luz direcional principal: é ela que projeta as sombras reais no chão
    const sun = new THREE.DirectionalLight(0xfff3e2, 1.1)
    sun.position.set(2.6, 3.4, 3.2)
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    sun.shadow.camera.near = 1
    sun.shadow.camera.far = 12
    sun.shadow.camera.left = -3
    sun.shadow.camera.right = 3
    sun.shadow.camera.top = 3
    sun.shadow.camera.bottom = -3
    sun.shadow.bias = -0.0025
    scene.add(sun)

    const key = new THREE.PointLight(0x7c5cff, 1.4, 20)
    key.position.set(2.5, 2.5, 3)
    scene.add(key)
    const rim = new THREE.PointLight(0x00e5c7, 1.1, 20)
    rim.position.set(-3, 1.5, -2)
    scene.add(rim)
    // luz de preenchimento perto da câmera: sem ela, o personagem (visto de
    // costas/lado) fica só como silhueta escura contra o brilho das telas.
    const fill = new THREE.PointLight(0xd8d2ff, 1.1, 16)
    fill.position.set(1.1, 1.7, 4.6)
    scene.add(fill)

    scene3d = createDeskScene()
    scene.add(scene3d.group)

    // chão que só recebe sombra (invisível fora da sombra), pra "ancorar"
    // o diorama visualmente em vez de flutuar sobre o fundo Matrix.
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.ShadowMaterial({ opacity: 0.32 }))
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -1.32
    floor.receiveShadow = true
    scene.add(floor)

    clock = new THREE.Clock()

    window.addEventListener('resize', resize)
    window.addEventListener('scroll', onScroll, { passive: true })
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('click', onClick)

    onScroll()
    animate()
  }

  function resize(): void {
    const canvas = canvasRef.value
    if (!canvas || !renderer || !camera) return
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  function onScroll(): void {
    const max = document.documentElement.scrollHeight - window.innerHeight
    scrollProgress = max > 0 ? Math.min(window.scrollY / max, 1) : 0
  }

  function onPointerMove(event: PointerEvent): void {
    const canvas = canvasRef.value
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  }

  function typingBurst(): void {
    if (!scene3d) return
    const { group, addLine, monitorLight } = scene3d

    gsap.killTweensOf(group.scale)
    gsap
      .timeline()
      .to(group.scale, { x: 1.03, y: 1.03, z: 1.03, duration: 0.18, ease: 'power2.out' })
      .to(group.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' })

    // rajada de "digitação": novas linhas de código aparecendo rápido
    let i = 0
    const burst = setInterval(() => {
      addLine()
      scene3d?.screenTexture && (scene3d.screenTexture.needsUpdate = true)
      i += 1
      if (i >= 5) clearInterval(burst)
    }, 60)

    gsap.killTweensOf(monitorLight)
    gsap.to(monitorLight, { intensity: 2.4, duration: 0.15, yoyo: true, repeat: 1 })
  }

  function onClick(): void {
    if (!scene3d || !camera) return
    raycaster.setFromCamera(pointer, camera)
    typingBurst()
  }

  function animate(): void {
    if (disposed) return
    raf = requestAnimationFrame(animate)
    // getDelta() precisa ser chamado uma única vez por frame: ele consome o
    // intervalo internamente, então chamar getElapsedTime() depois zeraria o dt.
    const dt = clock?.getDelta() ?? 0
    const t = clock?.elapsedTime ?? 0

    if (scene3d && camera) {
      const { group, head, leftHand, rightHand, particles } = scene3d

      // balanço sutil do diorama + reação ao scroll
      group.rotation.y = Math.sin(t * 0.15) * 0.12 + scrollProgress * 0.9
      group.position.y = Math.sin(t * 0.6) * 0.02

      // "digitando": mãos oscilando em alta frequência
      leftHand.position.y = -0.28 + Math.sin(t * 9) * 0.012
      rightHand.position.y = -0.28 + Math.sin(t * 9 + 1.6) * 0.012

      // leve balanço de cabeça, como quem lê a tela
      head.rotation.x = Math.sin(t * 0.5) * 0.05
      head.rotation.y = Math.sin(t * 0.3) * 0.08

      if (particles) particles.rotation.y = t * 0.02

      camera.position.z = 5.3 - scrollProgress * 1.2
      camera.position.y = 1.1 - scrollProgress * 0.35

      // código "digitando sozinho" continuamente, em ritmo variável (sem precisar de clique)
      typeAccumulator += dt
      if (typeAccumulator > nextTypeInterval) {
        typeAccumulator = 0
        nextTypeInterval = 0.22 + Math.random() * 0.55
        scene3d.addLine()
        scene3d.screenTexture.needsUpdate = true
      }
    }

    if (renderer && scene && camera) renderer.render(scene, camera)
  }

  function dispose(): void {
    disposed = true
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', resize)
    window.removeEventListener('scroll', onScroll)
    const canvas = canvasRef.value
    if (canvas) {
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('click', onClick)
    }
    scene3d?.screenTexture.dispose()
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
