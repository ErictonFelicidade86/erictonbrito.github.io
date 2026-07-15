<template>
  <canvas ref="canvasRef" class="matrix-rain-canvas" aria-hidden="true"></canvas>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useMatrixRain } from '../composables/useMatrixRain'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { init, dispose } = useMatrixRain(canvasRef)

onMounted(init)
onBeforeUnmount(dispose)
</script>

<style scoped>
.matrix-rain-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  mix-blend-mode: screen;
}
</style>
