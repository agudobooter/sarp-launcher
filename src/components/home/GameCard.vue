<script setup lang="ts">
defineEmits<{
  open: []
}>()
</script>

<template>
  <button
    type="button"
    class="game-card group relative flex shrink-0 snap-start flex-col items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] transition hover:border-amber-400/30 hover:shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
    style="-webkit-app-region: no-drag; height: clamp(150px, 21.6vh, 240px); aspect-ratio: 9 / 16"
    @click="$emit('open')"
  >
    <div
      class="pointer-events-none absolute inset-0 bg-gradient-to-b from-amber-500/[0.08] via-transparent to-orange-500/[0.06]"
    />

    <div class="relative flex flex-col items-center gap-3 px-3">
      <svg
        class="h-8 w-8 text-amber-400 transition-transform duration-300 group-hover:scale-110"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d="M8.5 5.5 L19 11.13 a1 1 0 0 1 0 1.74 L8.5 18.5 a1 1 0 0 1 -1.5 -.87 V6.37 a1 1 0 0 1 1.5 -.87 z"
          fill="currentColor"
        />
      </svg>

      <span
        class="text-center text-[10px] font-bold uppercase leading-tight tracking-wider text-white/70 transition-colors group-hover:text-white/90"
      >
        Grove<br />Street<br />Run
      </span>
    </div>

    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent"
    />
  </button>
</template>

<style scoped>
.game-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    115deg,
    transparent 35%,
    rgba(245, 158, 11, 0.12) 50%,
    transparent 65%
  );
  background-size: 250% 100%;
  background-repeat: no-repeat;
  pointer-events: none;
  animation: card-shimmer 4s ease-in-out infinite;
}

@keyframes card-shimmer {
  0% {
    background-position: 200% 0;
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    background-position: -100% 0;
    opacity: 1;
  }
  100% {
    background-position: -100% 0;
    opacity: 0;
  }
}
</style>
