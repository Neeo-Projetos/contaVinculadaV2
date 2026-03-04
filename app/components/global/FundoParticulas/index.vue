<template>
  <canvas ref="canvas" class="particles-canvas" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  color: { type: String, default: '#3b82f6' },
  count: { type: Number, default: 90 },
  speed: { type: Number, default: 0.6 }
})

const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let raf: number
let W = 0
let H = 0
let mouse = { x: -9999, y: -9999 }

interface Particle {
  x: number; y: number
  vx: number; vy: number
  r: number; alpha: number
}

let particles: Particle[] = []

const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

const init = () => {
  if (!canvas.value) return
  W = canvas.value.offsetWidth
  H = canvas.value.offsetHeight
  canvas.value.width = W
  canvas.value.height = H
  ctx = canvas.value.getContext('2d')

  particles = Array.from({ length: props.count }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * props.speed,
    vy: (Math.random() - 0.5) * props.speed,
    r: Math.random() * 2 + 1,
    alpha: Math.random() * 0.4 + 0.2
  }))
}

const rgb = hexToRgb(props.color)
const LINK_DIST = 150
const REPULSE_DIST = 120

const draw = () => {
  if (!ctx || !canvas.value) return
  ctx.clearRect(0, 0, W, H)

  // Move & bounce
  for (const p of particles) {
    // Repulse from mouse
    const dx = p.x - mouse.x
    const dy = p.y - mouse.y
    const d = Math.sqrt(dx * dx + dy * dy)
    if (d < REPULSE_DIST && d > 0) {
      const force = (REPULSE_DIST - d) / REPULSE_DIST * 0.04
      p.vx += (dx / d) * force
      p.vy += (dy / d) * force
    }

    p.x += p.vx
    p.y += p.vy

    // Speed clamp
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
    if (speed > props.speed * 3) { p.vx *= 0.95; p.vy *= 0.95 }

    if (p.x < 0 || p.x > W) p.vx *= -1
    if (p.y < 0 || p.y > H) p.vy *= -1

    // Draw circle
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${rgb},${p.alpha})`
    ctx.fill()
  }

  // Draw links
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i] as Particle
      const b = particles[j] as Particle
      
      const dx = a.x - b.x
      const dy = a.y - b.y
      const d = Math.sqrt(dx * dx + dy * dy)
      
      if (d < LINK_DIST) {
        const opacity = (1 - d / LINK_DIST) * 0.35
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = `rgba(${rgb},${opacity})`
        ctx.lineWidth = 0.8
        ctx.stroke()
      }
    }
  }

  raf = requestAnimationFrame(draw)
}

const onMouseMove = (e: MouseEvent) => {
  if (!canvas.value) return
  const rect = canvas.value.getBoundingClientRect()
  mouse.x = e.clientX - rect.left
  mouse.y = e.clientY - rect.top
}
const onMouseLeave = () => { mouse.x = -9999; mouse.y = -9999 }

const onResize = () => { cancelAnimationFrame(raf); init(); draw() }

onMounted(() => {
  init()
  draw()
  window.addEventListener('resize', onResize)
  canvas.value?.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseleave', onMouseLeave)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseleave', onMouseLeave)
})
</script>

<style scoped src="./style.css"></style>