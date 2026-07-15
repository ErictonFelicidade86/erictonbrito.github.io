# Currículo 3D — Ericton Brito

Currículo interativo com um avatar 3D central que reage ao **scroll** e a **cliques**.

## Stack

- **Vue 3** (`<script setup>`, Composition API)
- **Vuetify 3** — layout, cards, timeline, botões
- **Three.js** — cena 3D, luzes, animação
- **GSAP** — animações suaves de clique (pulso/escala/cor)
- **Vite** — build e dev server

## Estrutura

```
src/
  components/
    Scene3D.vue         # <canvas> que hospeda a cena Three.js
  composables/
    useThreeScene.js    # toda a lógica Three.js: cena, câmera, luzes,
                         # avatar placeholder, scroll e clique
  data/
    resume.js            # conteúdo do currículo (experiências, formação, projetos)
  views/
    HomeView.vue          # layout Vuetify com todas as seções
  App.vue                 # app-bar + navegação
  router/index.js         # hash router (evita 404 no GitHub Pages)
public/
  models/                 # <- coloque aqui os .glb/.gltf exportados do Blender
```

## Rodando localmente

```bash
npm install
npm run dev
```

## Build de produção

```bash
npm run build
```

Gera a pasta `dist/`, pronta pra publicar.

## Publicando no GitHub Pages

1. `vite.config.js` já está com `base: './'` (caminhos relativos), então funciona em
   qualquer nome de repositório sem configuração extra.
2. Faça o build (`npm run build`) e publique o conteúdo de `dist/` na branch
   `gh-pages` (ou configure o GitHub Actions para isso).
3. Opção simples: usar a action `peaceiris/actions-gh-pages` ou o pacote `gh-pages`:
   ```bash
   npm install -D gh-pages
   npx gh-pages -d dist
   ```

## Trocando o avatar placeholder pelo modelo do Blender

Hoje o avatar é geométrico (núcleo + casca wireframe + partículas), gerado em
`createPlaceholderAvatar()` dentro de `src/composables/useThreeScene.js`.

Quando o modelo `.glb`/`.gltf` estiver pronto:

1. Exporte do Blender como **glTF 2.0 (.glb)** — formato binário, mais leve.
2. Coloque o arquivo em `public/models/avatar.glb`.
3. Troque `createPlaceholderAvatar()` por um carregamento assíncrono com
   `GLTFLoader` (posso implementar isso assim que tivermos o modelo).
4. Se o modelo tiver animações (armature actions) exportadas do Blender, dá pra
   tocá-las com `THREE.AnimationMixer`, inclusive alternando entre "idle",
   "hover" e "click" conforme a interação.

## Próximos passos sugeridos

- [ ] Trocar avatar placeholder pelo modelo real do Blender
- [ ] Adicionar loading screen enquanto o modelo `.glb` carrega
- [ ] Internacionalização (PT/EN) como no site anterior
- [ ] Code-splitting do Vuetify para reduzir o tamanho do bundle
- [ ] Deploy automatizado via GitHub Actions
