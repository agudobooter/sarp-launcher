<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue"
import ShellLayout from "@/layouts/ShellLayout.vue"
import HealthCheckList from "@/components/home/HealthCheckList.vue"
import PlayCard from "@/components/home/PlayCard.vue"
import EventsCarousel from "@/components/home/EventsCarousel.vue"
import EventModal from "@/components/home/EventModal.vue"
import LogoMark from "@/components/brand/LogoMark.vue"
import ServerStatus from "@/components/home/ServerStatus.vue"
import GameCard from "@/components/home/GameCard.vue"
import GameModal from "@/components/home/GameModal.vue"
import { useHealthCheckStore } from "@/stores/healthCheck"
import { useEvents } from "@/composables/useEvents"
import { useRotatingTagline } from "@/composables/useRotatingTagline"
import { useGameStatus } from "@/composables/useGameStatus"
import type { ServerEvent } from "@/api/public"

const health = useHealthCheckStore()
const { events, loading: eventsLoading, load: loadEvents } = useEvents()
const { tagline } = useRotatingTagline()
const { phase, launchMessage, launch } = useGameStatus()
const blockHint = ref<string | null>(null)
const selectedIndex = ref<number | null>(null)
const gameOpen = ref(false)

const host = import.meta.env.VITE_GAME_SERVER_IP
const port = Number(import.meta.env.VITE_GAME_SERVER_PORT)

// "ready" gates the swap from skeleton to real content. We need:
//   1) Vue has actually painted at least one frame (post-mount + nextTick).
//   2) The first health-check pass has finished — that's when the most
//      visible chunk of the page (the install/server status list) settles.
// We also fall back to a hard 2.5 s timeout: if the network is slow or
// healthCheck is stuck, we'd rather show the real UI in its loading state
// than a permanent skeleton.
const ready = ref(false)
const READY_TIMEOUT_MS = 2500
let firstHealthRunSeen = false

onMounted(() => {
  loadEvents()

  const timeout = window.setTimeout(() => {
    ready.value = true
  }, READY_TIMEOUT_MS)

  const stop = watch(
    () => health.running,
    async (isRunning, wasRunning) => {
      // Track the running -> idle edge of the very first run.
      if (wasRunning && !isRunning && !firstHealthRunSeen) {
        firstHealthRunSeen = true
        await nextTick()
        ready.value = true
        window.clearTimeout(timeout)
        stop()
      }
    },
    { immediate: true },
  )
})

const eventsList = computed(() => events.value)

function openEvent(event: ServerEvent) {
  const idx = eventsList.value.findIndex((e) => e.id === event.id)
  selectedIndex.value = idx >= 0 ? idx : null
}

function closeEvent() {
  selectedIndex.value = null
}

function prevEvent() {
  if (selectedIndex.value !== null && selectedIndex.value > 0) {
    selectedIndex.value -= 1
  }
}

function nextEvent() {
  if (selectedIndex.value !== null && selectedIndex.value < eventsList.value.length - 1) {
    selectedIndex.value += 1
  }
}

async function play() {
  if (phase.value !== "idle") return
  if (!health.allOk) {
    showBlockHint()
    return
  }
  await launch(host, port)
}

function openSignup() {
  window.open("https://ucp.sarp.es/auth/signup", "_blank", "noopener")
}

function showBlockHint() {
  const failing = health.entries.find(
    (e) => e.id !== "server" && e.state !== "ok" && e.state !== "checking",
  )
  blockHint.value = failing?.detail ?? "Faltan archivos del juego — verifica tu instalación."
  setTimeout(() => {
    blockHint.value = null
  }, 3500)
}
</script>

<template>
  <ShellLayout :loading="!ready">
    <template #skeleton>
      <div class="flex w-full max-w-2xl flex-col items-center gap-4 md:gap-6">
        <header class="flex items-center gap-5">
          <LogoMark size="md" />
          <!-- Heights mirror the real header (h1 ~32 px, ServerStatus ~16 px,
               tagline slot 40 px) so the swap from skeleton to content is
               CLS-free. -->
          <div class="flex min-w-0 flex-col gap-1">
            <div class="skeleton-block h-7 w-4/5" />
            <div class="skeleton-block h-4 w-3/5" />
            <div class="skeleton-block h-10 w-11/12" />
          </div>
        </header>

        <section
          class="relative w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-sm"
        >
          <div class="mb-3 flex items-center justify-between">
            <div class="skeleton-block h-3 w-40" />
            <div class="skeleton-block h-5 w-5 rounded-md" />
          </div>
          <div class="divide-y divide-white/5">
            <div
              v-for="i in 4"
              :key="i"
              class="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div class="flex flex-1 items-center gap-3">
                <div class="skeleton-block h-4 w-4 rounded-full" />
                <div class="flex flex-1 flex-col gap-1.5">
                  <div class="skeleton-block h-3.5 w-1/2" />
                  <div class="skeleton-block h-2.5 w-3/4" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- No event placeholders here on purpose: events are dynamic and may
             legitimately be empty. EventsCarousel itself renders nothing when
             there are no events, so faking 5 cards would lie to the user. The
             real carousel handles its own loading state once `ready` flips. -->

        <div class="flex w-full flex-col items-center gap-3 pt-2">
          <div class="skeleton-block h-14 w-full max-w-xs rounded-2xl" />
          <div class="skeleton-block h-3 w-48" />
        </div>
      </div>
    </template>

    <div class="flex w-full max-w-2xl flex-col items-center gap-4 md:gap-6">
      <header class="flex items-center gap-5">
        <LogoMark size="md" />
        <div class="flex min-w-0 flex-col gap-1">
          <h1 class="text-2xl tracking-tight text-white">
            <span class="font-light text-white/85">Bienvenido a</span>
            <span
              class="bg-gradient-to-r from-amber-300 via-orange-400 to-red-400 bg-clip-text font-extrabold text-transparent"
            >
              San Andreas Roleplay
            </span>
          </h1>
          <ServerStatus />
          <div class="relative h-10 w-full overflow-hidden">
            <Transition name="tagline" mode="out-in">
              <p
                :key="tagline"
                class="absolute inset-x-0 line-clamp-2 text-sm italic leading-5 text-white/55"
              >
                « {{ tagline }} »
              </p>
            </Transition>
          </div>
        </div>
      </header>

      <div class="grid w-full grid-cols-[1fr_auto] items-stretch gap-3">
        <HealthCheckList />
        <PlayCard
          class="w-44"
          :phase="phase"
          :disabled="!health.allOk"
          :launch-message="launchMessage"
          :block-hint="blockHint"
          @play="play"
          @signup="openSignup"
        />
      </div>

      <div class="flex w-full items-start gap-3">
        <GameCard @open="gameOpen = true" />
        <EventsCarousel
          class="min-w-0 flex-1"
          :events="events"
          :loading="eventsLoading"
          @open="openEvent"
        />
      </div>
    </div>

    <GameModal v-if="gameOpen" @close="gameOpen = false" />

    <EventModal
      :events="events"
      :index="selectedIndex"
      @close="closeEvent"
      @prev="prevEvent"
      @next="nextEvent"
    />
  </ShellLayout>
</template>

<style scoped>
.hint-enter-active,
.hint-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.hint-enter-from,
.hint-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

.tagline-enter-active,
.tagline-leave-active {
  transition:
    opacity 0.45s ease,
    transform 0.45s cubic-bezier(0.4, 0, 0.2, 1),
    filter 0.45s ease;
}
.tagline-enter-from {
  opacity: 0;
  transform: translateY(8px);
  filter: blur(4px);
}
.tagline-leave-to {
  opacity: 0;
  transform: translateY(-8px);
  filter: blur(4px);
}
</style>
