<script setup lang="ts">
defineEmits<{
  open: []
}>()
</script>

<template>
  <button
    type="button"
    class="game-card group relative flex shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm transition-all duration-200 hover:-translate-y-px hover:border-amber-400/35 hover:bg-white/[0.05] hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)] active:translate-y-0 active:shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
    style="-webkit-app-region: no-drag; height: clamp(150px, 21.6vh, 240px); aspect-ratio: 9 / 16"
    @click="$emit('open')"
  >
    <!-- Blurred game preview background -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        class="absolute inset-0 h-full w-full"
        viewBox="0 0 90 160"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0c0c0e" />
            <stop offset="100%" stop-color="#1a1a20" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="90" height="104" fill="url(#sky)" />
        <rect x="12" y="8" width="1.5" height="1.5" fill="rgba(255,255,255,0.25)" />
        <rect x="45" y="14" width="1" height="1" fill="rgba(255,255,255,0.2)" />
        <rect x="70" y="6" width="1.5" height="1.5" fill="rgba(255,255,255,0.18)" />
        <rect x="28" y="22" width="1" height="1" fill="rgba(255,255,255,0.15)" />
        <rect x="3" y="60" width="16" height="44" fill="#1a1a1e" />
        <rect x="5" y="68" width="3" height="3" fill="rgba(255,200,100,0.15)" />
        <rect x="10" y="74" width="3" height="3" fill="rgba(255,200,100,0.12)" />
        <rect x="21" y="50" width="14" height="54" fill="#151518" />
        <rect x="24" y="56" width="3" height="3" fill="rgba(255,200,100,0.18)" />
        <rect x="28" y="66" width="3" height="3" fill="rgba(255,200,100,0.1)" />
        <rect x="37" y="68" width="18" height="36" fill="#1c1c20" />
        <rect x="41" y="74" width="3" height="3" fill="rgba(255,200,100,0.12)" />
        <rect x="57" y="54" width="12" height="50" fill="#171719" />
        <rect x="60" y="60" width="3" height="3" fill="rgba(255,200,100,0.13)" />
        <rect x="71" y="64" width="18" height="40" fill="#1b1b1f" />
        <rect x="75" y="70" width="3" height="3" fill="rgba(255,200,100,0.15)" />
        <rect x="0" y="104" width="90" height="56" fill="#18181b" />
        <line x1="0" y1="104" x2="90" y2="104" stroke="rgba(255,255,255,0.06)" stroke-width="0.5" />
        <line x1="20" y1="104" x2="20" y2="160" stroke="#27272a" stroke-width="0.5" />
        <line x1="50" y1="104" x2="50" y2="160" stroke="#27272a" stroke-width="0.5" />
        <line x1="80" y1="104" x2="80" y2="160" stroke="#27272a" stroke-width="0.5" />
        <rect x="18" y="86" width="6" height="4" fill="#fbbf24" stroke="#d97706" stroke-width="0.5" />
        <rect x="17" y="90" width="8" height="14" fill="#f59e0b" stroke="#d97706" stroke-width="0.5" />
        <rect x="58" y="94" width="20" height="10" fill="#ef4444" rx="1" />
        <rect x="62" y="90" width="10" height="5" fill="#ef4444" rx="1" />
        <rect x="60" y="102" width="5" height="4" fill="#0a0a0a" />
        <rect x="72" y="102" width="5" height="4" fill="#0a0a0a" />
      </svg>
      <div class="absolute inset-0 bg-black/40 backdrop-blur-[6px]" />
    </div>

    <!-- Top accent line -->
    <span
      class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent"
      aria-hidden="true"
    />

    <!-- Halo glow -->
    <span
      class="play-halo pointer-events-none absolute left-1/2 top-[40%] h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full"
      aria-hidden="true"
    />

    <!-- Content -->
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