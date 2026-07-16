📁 Meu Portfólio Pessoal

Bem-vindo ao repositório do meu portfólio pessoal! 🎉 Este projeto foi desenvolvido para apresentar minhas habilidades técnicas, projetos e trajetória profissional. Ele reflete minha dedicação ao aprendizado contínuo.

## 🚀 Tecnologias Utilizadas

Este portfólio foi construído utilizando uma combinação de tecnologias modernas para Desenvolvimento Web Frontend e Teste de Software:

- **Vue 3**: Framework reativo, usando `<script setup>` e Composition API.
- **TypeScript**: Tipagem estática em modo estrito (`strict`), em todos os componentes e composables.
- **Vuetify**: Biblioteca de componentes Material Design (app-bar, cards, timeline, grid).
- **Three.js**: Renderização da cena 3D (mesa, monitor, personagem digitando, sombras reais).
- **GSAP + ScrollTrigger**: Animações de entrada dos cards conforme o scroll, e as transições de clique/digitação da cena 3D.
- **vue-i18n**: Internacionalização (PT/EN) com troca de idioma via bandeiras no cabeçalho.
- **vue-router**: Navegação em hash mode (compatível com hospedagem estática, sem rewrite de servidor).
- **Vite**: Build e dev server.
- **Yarn**: Gerenciador de pacotes do projeto.
- **Blender**: Reservado para os futuros modelos `.glb`/`.gltf` do avatar 3D — hoje o avatar e a mesa são gerados 100% via código (primitivas do Three.js), sem depender de modelo externo.

## 🌐 Destaques do Projeto

- Cena 3D interativa no topo da página: avatar digitando em uma mesa, com código "rodando" na tela do monitor e do notebook em tempo real.
- Sombras reais e textura de madeira procedural, deixando o cenário 3D mais fiel a um ambiente real.
- Animações de entrada (fade + slide) nos cards de Experiência, Formação e Projetos conforme o usuário rola a página.
- Internacionalização completa (PT/EN) com troca de idioma via bandeiras no menu.
- Design responsivo para dispositivos móveis, tablets e desktop.
- Tipagem estática de ponta a ponta com TypeScript.

Gera a pasta `dist/`, pronta pra publicar.

## 🚢 Deploy (GitHub Pages)

O deploy é automático via GitHub Actions (`.github/workflows/deploy.yml`): a cada push na branch `main`, o workflow instala as dependências, roda `yarn build` e publica o conteúdo de `dist/` no GitHub Pages.

Pré-requisito único (configuração feita uma vez no repositório): em **Settings → Pages → Build and deployment → Source**, selecionar **GitHub Actions**.

Sem isso, o GitHub Pages tende a servir o `index.html` da raiz do repositório (o de desenvolvimento, com `<script src="/src/main.ts">`) em vez do build gerado pelo Vite — o que quebra o carregamento do site.

Para forçar um novo deploy sem dar push, é só rodar o workflow manualmente pela aba **Actions** do repositório (`workflow_dispatch`).

---

<p align="left">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Vuetify-1867C0?style=for-the-badge&logo=vuetify&logoColor=white" />
  <img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Yarn-2C8EBB?style=for-the-badge&logo=yarn&logoColor=white" />
  <img src="https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white" />
  <img src="https://img.shields.io/badge/Blender-F5792A?style=for-the-badge&logo=blender&logoColor=white" />
  <img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white" />
  <img src="https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white" />
</p>

## 🌐 Link do Projeto

# [Erictonbrito](https://github.com/ErictonFelicidade86/erictonbrito.github.io)