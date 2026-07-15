<template>
  <canvas ref="canvasRef" class="scene3d-canvas" aria-hidden="true"></canvas>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useThreeScene } from '../composables/useThreeScene'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { init, dispose } = useThreeScene(canvasRef)

onMounted(init)
onBeforeUnmount(dispose)
</script>

<style scoped>
.scene3d-canvas {
  width: 100%;
  height: 100%;
  display: block;
  touch-action: none;
  cursor: pointer;
}
</style>
