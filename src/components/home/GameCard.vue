<script setup lang="ts">
import { onMounted, useTemplateRef } from "vue"
import { useGroveStreetRun } from "@/composables/useGroveStreetRun"

defineEmits<{
  open: []
}>()

const canvasRef = useTemplateRef<HTMLCanvasElement>("demoCanvas")
const { mount, CANVAS_W, CANVAS_H } = useGroveStreetRun(canvasRef, { demo: true })
onMounted(mount)
</script>

<template>
  <button
    type="button"
    class="game-card group relative flex shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm transition-all duration-200 hover:-translate-y-px hover:border-amber-400/35 hover:bg-white/[0.05] hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)] active:translate-y-0 active:shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
    style="-webkit-app-region: no-drag; height: clamp(150px, 21.6vh, 240px); aspect-ratio: 9 / 16"
    @click="$emit('open')"
  >
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas
        ref="demoCanvas"
        :width="CANVAS_W"
        :height="CANVAS_H"
        class="absolute inset-0 h-full w-full object-cover blur-[2px]"
        style="image-rendering: pixelated"
        aria-hidden="true"
      />
      <div class="absolute inset-0 bg-black/25" />
    </div>

    <!-- top accent line -->
    <span
      class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent"
      aria-hidden="true"
    />

    <!-- halo glow -->
    <span
      class="play-halo pointer-events-none absolute left-1/2 top-[40%] h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full"
      aria-hidden="true"
    />

    <!-- content -->
    <div class="relative flex flex-col items-center">
      <svg
        class="h-11 w-11 text-orange-400 transition-transform duration-200 group-hover:scale-110"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d="M8.5 5.5 L19 11.13 a1 1 0 0 1 0 1.74 L8.5 18.5 a1 1 0 0 1 -1.5 -.87 V6.37 a1 1 0 0 1 1.5 -.87 z"
          fill="currentColor"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linejoin="round"
        />
      </svg>

      <span class="mt-3 text-sm font-extrabold uppercase leading-none tracking-wider text-white">
        Jugar
      </span>

      <span class="mt-1.5 text-[9px] font-medium tracking-widest text-white/35">
        GROVE ST. RUN
      </span>
    </div>

    <!-- bottom gradient -->
    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/40 to-transparent"
    />
  </button>
</template>

<style scoped>
.play-halo {
  background: radial-gradient(
    circle,
    rgba(251, 146, 60, 0.18) 0%,
    rgba(251, 146, 60, 0.08) 40%,
    transparent 70%
  );
  animation: play-halo-breathe 3.6s ease-in-out infinite;
  filter: blur(2px);
}

@keyframes play-halo-breathe {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(0.95);
    opacity: 0.7;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.05);
    opacity: 1;
  }
}

.game-card:hover .play-halo {
  animation-duration: 1.8s;
}
</style>
