<script setup lang="ts">
import { onBeforeUnmount, onMounted } from "vue"
import GroveStreetRun from "./GroveStreetRun.vue"

const emit = defineEmits<{
  close: []
}>()

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    e.preventDefault()
    e.stopPropagation()
    emit("close")
  }
}

onMounted(() => window.addEventListener("keydown", onKeydown, true))
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown, true))
</script>

<template>
  <Transition name="game-modal">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-6"
      style="-webkit-app-region: no-drag"
    >
      <div class="absolute inset-0 bg-black/75 backdrop-blur-sm" @click="$emit('close')" />

      <div
        class="relative flex w-full max-w-[720px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-[0_24px_60px_rgba(0,0,0,0.7)]"
      >
        <div class="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
          <span class="text-xs font-medium uppercase tracking-widest text-white/50">
            Grove Street Run
          </span>
          <button
            type="button"
            class="flex h-7 w-7 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
            @click="$emit('close')"
          >
            <i class="pi pi-times text-xs" />
          </button>
        </div>

        <div class="p-3">
          <GroveStreetRun />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.game-modal-enter-active,
.game-modal-leave-active {
  transition: opacity 0.2s ease;
}
.game-modal-enter-from,
.game-modal-leave-to {
  opacity: 0;
}
</style>
