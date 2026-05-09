<script setup lang="ts">
import { onMounted, useTemplateRef } from "vue"
import { useGroveStreetRun } from "@/composables/useGroveStreetRun"

const canvasRef = useTemplateRef<HTMLCanvasElement>("canvasRef")
const { state, mount, onCanvasClick, CANVAS_W, CANVAS_H } = useGroveStreetRun(canvasRef)
onMounted(mount)
</script>

<template>
  <section class="game-wrapper group relative w-full overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm transition-colors hover:border-white/20">
    <canvas
      ref="canvasRef"
      :width="CANVAS_W"
      :height="CANVAS_H"
      class="block w-full"
      :class="state === 'playing' ? 'cursor-none' : 'cursor-pointer'"
      style="-webkit-app-region: no-drag; image-rendering: pixelated"
      @click="onCanvasClick"
    />
    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-3 py-1.5"
    >
      <span class="text-[9px] font-medium uppercase tracking-widest text-white/25">
        Grove Street Run
      </span>
      <span class="text-[9px] tracking-wider text-white/20">
        {{ state === "playing" ? "↑ Saltar · ↓ Agacharse" : "" }}
      </span>
    </div>
  </section>
</template>
