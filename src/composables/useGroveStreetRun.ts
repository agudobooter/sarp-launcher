import { onUnmounted, ref, type Ref } from "vue"

export type GameState = "idle" | "playing" | "dead"

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

type ObstacleKind = "car" | "cone" | "lspd" | "balla" | "sttam"

interface Obstacle extends Rect {
  kind: ObstacleKind
  speed: number
// Sttam oscillates vertically
  phase?: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
}
/////////////////////////////

const CANVAS_W = 640
const CANVAS_H = 200
const GROUND_Y = 160
const PLAYER_W = 18
const PLAYER_H = 30
const GRAVITY = 0.65
const JUMP_FORCE = -11
const DUCK_H = 16
const BASE_SPEED = 3.2
const SPEED_INCREASE = 0.0008
const MAX_SPEED = 9
const OBSTACLE_INTERVAL_MIN = 55
const OBSTACLE_INTERVAL_MAX = 120
const STTAM_INTERVAL = 800
const STTAM_W = 28
const STTAM_H = 38

/////////////////////////////
const COL_SKY_TOP = "#0c0c0e"
const COL_SKY_BOT = "#1a1a20"
const COL_GROUND = "#18181b"
const COL_GROUND_LINE = "#27272a"
const COL_PLAYER = "#f59e0b"
const COL_PLAYER_OUTLINE = "#d97706"
const COL_CAR_BODY = ["#ef4444", "#3b82f6", "#22c55e", "#a855f7", "#64748b"]
const COL_LSPD = "#1e3a5f"
const COL_BALLA = "#7c3aed"
const COL_STTAM = "#dc2626"
const COL_STTAM_GLOW = "rgba(220, 38, 38, 0.25)"
const COL_CONE = "#fb923c"
const COL_TEXT = "#fafafa"
const COL_TEXT_DIM = "rgba(255,255,255,0.4)"
const COL_SCORE = "#f59e0b"

//////////////////  Helpers //////////////////

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1))
}

function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
////////////////////////////////////////////////

function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, ducking: boolean) {
  // Body
  ctx.fillStyle = COL_PLAYER
  ctx.fillRect(Math.round(x), Math.round(y), w, h)

  // Outline
  ctx.strokeStyle = COL_PLAYER_OUTLINE
  ctx.lineWidth = 1
  ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, w - 1, h - 1)

  // Head (small square on top)
  if (!ducking) {
    ctx.fillStyle = "#fbbf24"
    ctx.fillRect(Math.round(x) + 4, Math.round(y) - 6, 10, 7)
    ctx.strokeStyle = COL_PLAYER_OUTLINE
    ctx.strokeRect(Math.round(x) + 4.5, Math.round(y) - 5.5, 9, 6)
  }

  // Eyes
  const eyeY = ducking ? Math.round(y) + 3 : Math.round(y) - 3
  ctx.fillStyle = "#000"
  ctx.fillRect(Math.round(x) + 6, eyeY, 2, 2)
  ctx.fillRect(Math.round(x) + 11, eyeY, 2, 2)
}

function drawCar(ctx: CanvasRenderingContext2D, o: Obstacle) {
  const color = COL_CAR_BODY[Math.abs(Math.round(o.x * 7)) % COL_CAR_BODY.length]
  // Body
  ctx.fillStyle = color
  ctx.fillRect(Math.round(o.x), Math.round(o.y) + 6, o.w, o.h - 10)
  // Roof
  ctx.fillStyle = color
  ctx.fillRect(Math.round(o.x) + 6, Math.round(o.y), o.w - 14, 8)
  // Wheels
  ctx.fillStyle = "#0a0a0a"
  ctx.fillRect(Math.round(o.x) + 3, Math.round(o.y) + o.h - 6, 6, 6)
  ctx.fillRect(Math.round(o.x) + o.w - 9, Math.round(o.y) + o.h - 6, 6, 6)
  // Windshield
  ctx.fillStyle = "rgba(150,200,255,0.4)"
  ctx.fillRect(Math.round(o.x) + o.w - 10, Math.round(o.y) + 2, 6, 5)
}

function drawLSPD(ctx: CanvasRenderingContext2D, o: Obstacle, frame: number) {
  // Body
  ctx.fillStyle = COL_LSPD
  ctx.fillRect(Math.round(o.x), Math.round(o.y) + 4, o.w, o.h - 8)
  // Roof
  ctx.fillStyle = "#f0f0f0"
  ctx.fillRect(Math.round(o.x) + 4, Math.round(o.y), o.w - 8, 6)
  // Siren (flashing)
  ctx.fillStyle = frame % 30 < 15 ? "#ef4444" : "#3b82f6"
  ctx.fillRect(Math.round(o.x) + o.w / 2 - 3, Math.round(o.y) - 3, 6, 4)
  // Wheels
  ctx.fillStyle = "#0a0a0a"
  ctx.fillRect(Math.round(o.x) + 3, Math.round(o.y) + o.h - 6, 6, 6)
  ctx.fillRect(Math.round(o.x) + o.w - 9, Math.round(o.y) + o.h - 6, 6, 6)
  // LSPD text
  ctx.fillStyle = "#ffffff"
  ctx.font = "bold 5px monospace"
  ctx.fillText("PD", Math.round(o.x) + o.w / 2 - 4, Math.round(o.y) + o.h / 2 + 3)
}

function drawCone(ctx: CanvasRenderingContext2D, o: Obstacle) {
  ctx.fillStyle = COL_CONE
  // Triangle-ish cone shape
  const cx = Math.round(o.x) + o.w / 2
  const bottom = Math.round(o.y) + o.h
  ctx.beginPath()
  ctx.moveTo(cx, Math.round(o.y))
  ctx.lineTo(Math.round(o.x) + o.w, bottom)
  ctx.lineTo(Math.round(o.x), bottom)
  ctx.closePath()
  ctx.fill()
  // Stripe
  ctx.fillStyle = "#fff"
  ctx.fillRect(Math.round(o.x) + 2, Math.round(o.y) + o.h * 0.5, o.w - 4, 3)
}

function drawBalla(ctx: CanvasRenderingContext2D, o: Obstacle) {
  // Body
  ctx.fillStyle = COL_BALLA
  ctx.fillRect(Math.round(o.x), Math.round(o.y) + 8, o.w, o.h - 8)
  // Head
  ctx.fillStyle = "#8b5cf6"
  ctx.fillRect(Math.round(o.x) + 3, Math.round(o.y), o.w - 6, 10)
  // Bandana
  ctx.fillStyle = "#6d28d9"
  ctx.fillRect(Math.round(o.x) + 2, Math.round(o.y) + 2, o.w - 4, 4)
  // Eyes
  ctx.fillStyle = "#000"
  ctx.fillRect(Math.round(o.x) + 5, Math.round(o.y) + 5, 2, 2)
  ctx.fillRect(Math.round(o.x) + o.w - 7, Math.round(o.y) + 5, 2, 2)
}

function drawSttam(ctx: CanvasRenderingContext2D, o: Obstacle, frame: number) {
  // Aura of Sttam xD
  ctx.fillStyle = COL_STTAM_GLOW
  ctx.fillRect(Math.round(o.x) - 4, Math.round(o.y) - 4, o.w + 8, o.h + 8)

  // Body
  ctx.fillStyle = COL_STTAM
  ctx.fillRect(Math.round(o.x), Math.round(o.y) + 10, o.w, o.h - 10)

  // Head
  ctx.fillStyle = "#fbbf24"
  ctx.fillRect(Math.round(o.x) + 6, Math.round(o.y), o.w - 12, 12)

  // Admin halo (flashes)
  ctx.fillStyle = frame % 20 < 10 ? "#fbbf24" : "#f59e0b"
  ctx.fillRect(Math.round(o.x) + 4, Math.round(o.y) - 6, 4, 6)
  ctx.fillRect(Math.round(o.x) + o.w - 8, Math.round(o.y) - 6, 4, 6)
  ctx.fillRect(Math.round(o.x) + o.w / 2 - 2, Math.round(o.y) - 8, 4, 8)

  // Eyes (angry)
  ctx.fillStyle = "#000"
  ctx.fillRect(Math.round(o.x) + 9, Math.round(o.y) + 4, 3, 2)
  ctx.fillRect(Math.round(o.x) + o.w - 12, Math.round(o.y) + 4, 3, 2)

  // Ban hammer
  const hammerX = Math.round(o.x) + o.w - 2
  const hammerY = Math.round(o.y) + 14
  ctx.fillStyle = "#78716c"
  ctx.fillRect(hammerX, hammerY, 3, 16) // handle
  ctx.fillStyle = "#a8a29e"
  ctx.fillRect(hammerX - 3, hammerY - 4, 9, 6) // head

  // Label
  ctx.fillStyle = "#fff"
  ctx.font = "bold 5px monospace"
  ctx.textAlign = "center"
  ctx.fillText("ADMIN", Math.round(o.x) + o.w / 2, Math.round(o.y) + o.h - 2)
  ctx.textAlign = "left"
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  const alpha = Math.max(0, p.life / p.maxLife)
  ctx.globalAlpha = alpha
  ctx.fillStyle = p.color
  ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size)
  ctx.globalAlpha = 1
}

//////////////////  Back Elements //////////////////

interface BgBuilding {
  x: number
  w: number
  h: number
  color: string
}

function generateBuildings(): BgBuilding[] {
  const buildings: BgBuilding[] = []
  let x = 0
  while (x < CANVAS_W + 100) {
    const w = randInt(30, 70)
    const h = randInt(30, 80)
    const shade = randInt(15, 30)
    buildings.push({ x, w, h, color: `rgb(${shade},${shade},${shade + 4})` })
    x += w + randInt(2, 10)
  }
  return buildings
}

export function useGroveStreetRun(canvasRef: Ref<HTMLCanvasElement | null>) {
  const state = ref<GameState>("idle")
  const score = ref(0)
  const highScore = ref(0)

  // Load high score from store on init
  void window.launcher.getStore("miniGameHighScore").then((v) => {
    highScore.value = v ?? 0
  })

  // Internal game state
  let playerX = 50
  let playerY = GROUND_Y - PLAYER_H
  let vy = 0
  let ducking = false
  let obstacles: Obstacle[] = []
  let particles: Particle[] = []
  let frameCount = 0
  let spawnCounter = 0
  let nextSpawnAt = 60
  let sttamCounter = 0
  let gameSpeed = BASE_SPEED
  let buildings: BgBuilding[] = generateBuildings()
  let bgOffset = 0
  let rafId: number | null = null
  let keysDown = new Set<string>()
  let scoreFloat = 0

  // Handling

  function onKeyDown(e: KeyboardEvent) {
    if (e.repeat) return
    keysDown.add(e.code)

    if (e.code === "Space" || e.code === "ArrowUp") {
      e.preventDefault()
      if (state.value === "idle" || state.value === "dead") {
        startGame()
        return
      }
      jump()
    }
    if (e.code === "ArrowDown") {
      e.preventDefault()
      if (state.value === "playing") {
        ducking = true
      }
    }
  }

  function onKeyUp(e: KeyboardEvent) {
    keysDown.delete(e.code)
    if (e.code === "ArrowDown") {
      ducking = false
    }
  }

  function onCanvasClick() {
    if (state.value === "idle" || state.value === "dead") {
      startGame()
    } else if (state.value === "playing") {
      jump()
    }
  }

  function jump() {
    if (playerY + PLAYER_H >= GROUND_Y) {
      vy = JUMP_FORCE
    }
  }

  // Game cycle

  function startGame() {
    playerX = 50
    playerY = GROUND_Y - PLAYER_H
    vy = 0
    ducking = false
    obstacles = []
    particles = []
    frameCount = 0
    spawnCounter = 0
    nextSpawnAt = 80
    sttamCounter = 0
    gameSpeed = BASE_SPEED
    scoreFloat = 0
    score.value = 0
    buildings = generateBuildings()
    bgOffset = 0
    state.value = "playing"

    if (rafId === null) {
      rafId = requestAnimationFrame(loop)
    }
  }

  function die() {
    state.value = "dead"
    // Death particles
    for (let i = 0; i < 20; i++) {
      particles.push({
        x: playerX + PLAYER_W / 2,
        y: playerY + PLAYER_H / 2,
        vx: rand(-3, 3),
        vy: rand(-5, 1),
        life: rand(20, 45),
        maxLife: 45,
        size: rand(2, 5),
        color: pickRandom(["#f59e0b", "#ef4444", "#fbbf24", "#fff"]),
      })
    }
    // Persist high score
    if (score.value > highScore.value) {
      highScore.value = score.value
      void window.launcher.setStore("miniGameHighScore", score.value)
    }
  }

  // Spawn

  function spawnObstacle() {
    const roll = Math.random()
    let kind: ObstacleKind
    let w: number
    let h: number

    if (roll < 0.3) {
      kind = "cone"
      w = 12
      h = 16
    } else if (roll < 0.55) {
      kind = "car"
      w = randInt(32, 44)
      h = 24
    } else if (roll < 0.75) {
      kind = "balla"
      w = 16
      h = 28
    } else {
      kind = "lspd"
      w = 42
      h = 24
    }

    obstacles.push({
      x: CANVAS_W + 10,
      y: GROUND_Y - h,
      w,
      h,
      kind,
      speed: gameSpeed + rand(-0.3, 0.5),
    })
  }

  function spawnSttam() {
    obstacles.push({
      x: CANVAS_W + 10,
      y: GROUND_Y - STTAM_H - rand(0, 20),
      w: STTAM_W,
      h: STTAM_H,
      kind: "sttam",
      speed: gameSpeed + 1.2,
      phase: 0,
    })
  }

  function loop() {
    update()
    draw()
    rafId = requestAnimationFrame(loop)
  }

  function update() {
    frameCount++

    if (state.value !== "playing") {
      // Still update particles for death animation
      updateParticles()
      return
    }

    // Score
    scoreFloat += gameSpeed * 0.15
    score.value = Math.floor(scoreFloat)

    // Speed ramp
    gameSpeed = Math.min(MAX_SPEED, BASE_SPEED + frameCount * SPEED_INCREASE)

    // Player physics
    if (ducking && playerY + PLAYER_H >= GROUND_Y) {
      // Stay grounded while ducking
    } else {
      vy += GRAVITY
      playerY += vy
      if (playerY + PLAYER_H > GROUND_Y) {
        playerY = GROUND_Y - PLAYER_H
        vy = 0
      }
    }

    // Background scroll
    bgOffset += gameSpeed * 0.3

    // Spawn obstacles
    spawnCounter++
    sttamCounter++
    if (spawnCounter >= nextSpawnAt) {
      spawnObstacle()
      spawnCounter = 0
      nextSpawnAt = randInt(
        Math.max(30, OBSTACLE_INTERVAL_MIN - frameCount * 0.01),
        Math.max(50, OBSTACLE_INTERVAL_MAX - frameCount * 0.02),
      )
    }
    if (sttamCounter >= STTAM_INTERVAL && score.value >= 100) {
      spawnSttam()
      sttamCounter = 0
    }

    // Move obstacles + collision
    const ph = ducking ? DUCK_H : PLAYER_H
    const py = ducking ? GROUND_Y - DUCK_H : playerY
    const playerRect: Rect = {
      x: playerX + 3,
      y: py + 3,
      w: PLAYER_W - 6,
      h: ph - 4,
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
      const o = obstacles[i]
      o.x -= o.speed

      // Sttam oscillates
      if (o.kind === "sttam" && o.phase !== undefined) {
        o.phase += 0.06
        o.y = GROUND_Y - STTAM_H - Math.sin(o.phase) * 18
      }

      // Remove off-screen
      if (o.x + o.w < -10) {
        obstacles.splice(i, 1)
        continue
      }

      // Collision
      const hitbox: Rect = {
        x: o.x + 2,
        y: o.y + 2,
        w: o.w - 4,
        h: o.h - 4,
      }
      if (rectsOverlap(playerRect, hitbox)) {
        die()
        return
      }
    }

    // Dust particles while running
    if (frameCount % 4 === 0 && playerY + PLAYER_H >= GROUND_Y) {
      particles.push({
        x: playerX + 2,
        y: GROUND_Y - 2,
        vx: rand(-1.5, -0.3),
        vy: rand(-1.5, -0.2),
        life: rand(10, 20),
        maxLife: 20,
        size: rand(1, 3),
        color: "rgba(255,255,255,0.3)",
      })
    }

    updateParticles()
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.08
      p.life--
      if (p.life <= 0) {
        particles.splice(i, 1)
      }
    }
  }

  function draw() {
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.imageSmoothingEnabled = false

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y)
    skyGrad.addColorStop(0, COL_SKY_TOP)
    skyGrad.addColorStop(1, COL_SKY_BOT)
    ctx.fillStyle = skyGrad
    ctx.fillRect(0, 0, CANVAS_W, GROUND_Y)

    // Stars (tiny dots)
    ctx.fillStyle = "rgba(255,255,255,0.15)"
    for (let i = 0; i < 30; i++) {
      const sx = ((i * 73 + 17) % CANVAS_W)
      const sy = ((i * 41 + 7) % (GROUND_Y - 30)) + 5
      ctx.fillRect(sx, sy, 1, 1)
    }

    // Buildings (parallax)
    const bOff = bgOffset % (CANVAS_W + 200)
    for (const b of buildings) {
      const bx = b.x - bOff
      const drawX = ((bx % (CANVAS_W + 200)) + CANVAS_W + 200) % (CANVAS_W + 200) - 100
      ctx.fillStyle = b.color
      ctx.fillRect(Math.round(drawX), GROUND_Y - b.h, b.w, b.h)
      // Window dots
      ctx.fillStyle = "rgba(255,200,100,0.15)"
      for (let wy = GROUND_Y - b.h + 6; wy < GROUND_Y - 4; wy += 10) {
        for (let wx = 4; wx < b.w - 4; wx += 8) {
          if (Math.random() > 0.4) {
            ctx.fillRect(Math.round(drawX) + wx, wy, 3, 4)
          }
        }
      }
    }

    // Ground
    ctx.fillStyle = COL_GROUND
    ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y)

    // Ground lines (scrolling)
    ctx.strokeStyle = COL_GROUND_LINE
    ctx.lineWidth = 1
    const lineSpacing = 40
    const lineOffset = bgOffset % lineSpacing
    for (let lx = -lineOffset; lx < CANVAS_W + lineSpacing; lx += lineSpacing) {
      ctx.beginPath()
      ctx.moveTo(lx, GROUND_Y)
      ctx.lineTo(lx, CANVAS_H)
      ctx.stroke()
    }
    // Horizon line
    ctx.strokeStyle = "rgba(255,255,255,0.08)"
    ctx.beginPath()
    ctx.moveTo(0, GROUND_Y)
    ctx.lineTo(CANVAS_W, GROUND_Y)
    ctx.stroke()

    // Particles (behind player)
    for (const p of particles) {
      drawParticle(ctx, p)
    }

    // Player
    if (state.value !== "dead") {
      const ph = ducking ? DUCK_H : PLAYER_H
      const py = ducking ? GROUND_Y - DUCK_H : playerY
      drawPlayer(ctx, playerX, py, PLAYER_W, ph, ducking)
    }

    // Obstacles
    for (const o of obstacles) {
      switch (o.kind) {
        case "car":
          drawCar(ctx, o)
          break
        case "lspd":
          drawLSPD(ctx, o, frameCount)
          break
        case "cone":
          drawCone(ctx, o)
          break
        case "balla":
          drawBalla(ctx, o)
          break
        case "sttam":
          drawSttam(ctx, o, frameCount)
          break
      }
    }

    // Score
    ctx.fillStyle = COL_SCORE
    ctx.font = "bold 14px monospace"
    ctx.textAlign = "right"
    ctx.fillText(`${score.value}`, CANVAS_W - 12, 22)

    // High score
    if (highScore.value > 0) {
      ctx.fillStyle = COL_TEXT_DIM
      ctx.font = "10px monospace"
      ctx.fillText(`HI ${highScore.value}`, CANVAS_W - 12, 36)
    }
    ctx.textAlign = "left"

    // Overlays
    if (state.value === "idle") {
      drawOverlay(ctx, "GROVE STREET RUN", "Presiona ESPACIO para jugar")
    }
    if (state.value === "dead") {
      drawOverlay(ctx, `SCORE: ${score.value}`, "ESPACIO para reintentar")
    }
  }

  function drawOverlay(ctx: CanvasRenderingContext2D, title: string, subtitle: string) {
    // Semi-transparent backdrop
    ctx.fillStyle = "rgba(0,0,0,0.55)"
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    ctx.textAlign = "center"

    // Title
    ctx.fillStyle = COL_TEXT
    ctx.font = "bold 18px monospace"
    ctx.fillText(title, CANVAS_W / 2, CANVAS_H / 2 - 8)

    // Subtitle (pulsing)
    const alpha = 0.4 + Math.sin(frameCount * 0.05) * 0.3
    ctx.fillStyle = `rgba(255,255,255,${alpha})`
    ctx.font = "11px monospace"
    ctx.fillText(subtitle, CANVAS_W / 2, CANVAS_H / 2 + 16)

    // High score
    if (highScore.value > 0) {
      ctx.fillStyle = COL_SCORE
      ctx.font = "10px monospace"
      ctx.fillText(`MEJOR: ${highScore.value}`, CANVAS_W / 2, CANVAS_H / 2 + 36)
    }

    ctx.textAlign = "left"
  }

  function mount() {
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    // Start render loop even in idle so the background animates
    if (rafId === null) {
      rafId = requestAnimationFrame(loop)
    }
  }

  function unmount() {
    window.removeEventListener("keydown", onKeyDown)
    window.removeEventListener("keyup", onKeyUp)
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    keysDown.clear()
  }

  onUnmounted(unmount)

  return {
    state,
    score,
    highScore,
    mount,
    unmount,
    onCanvasClick,
    CANVAS_W,
    CANVAS_H,
  }
}
