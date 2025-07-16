<template>
  <div 
    v-if="windowState && windowState.isVisible && !windowState.isMinimized"
    class="window-container"
    :class="{ 'maximized': windowState.isMaximized, 'dragging': isDragging }"
    :style="{ 
      transform: windowState.isMaximized ? 'none' : `translate(${windowState.x}px, ${windowState.y}px)`,
      width: windowState.isMaximized ? '100vw' : windowState.width + 'px',
      height: windowState.isMaximized ? 'calc(100vh - 104px)' : windowState.height + 'px',
      zIndex: windowState.zIndex
    }"
  >
    <div 
      class="title-bar"
      @mousedown="startDrag"
    >
      <div class="title-bar-left">
        <div class="window-icon">
          <UIcon name="i-heroicons-window" class="icon" />
        </div>
        <span class="window-title">{{ windowState.title }}</span>
      </div>
      <div class="title-bar-right">
        <button class="title-bar-btn minimize" @click="minimize">
          <UIcon name="i-heroicons-minus" class="btn-icon" />
        </button>
        <button class="title-bar-btn maximize" @click="maximize">
          <UIcon :name="windowState.isMaximized ? 'i-heroicons-arrows-pointing-in' : 'i-heroicons-arrows-pointing-out'" class="btn-icon" />
        </button>
        <button class="title-bar-btn close" @click="close">
          <UIcon name="i-heroicons-x-mark" class="btn-icon" />
        </button>
      </div>
    </div>
    <div class="window-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  windowState: {
    type: Object,
    required: true
  }
})

const { minimizeWindow, maximizeWindow, closeWindow, bringToFront, updateWindowPosition } = useWindowManager()

const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const dragStartPos = ref({ x: 0, y: 0 })

// Throttle function for performance
function throttle(func, limit) {
  let inThrottle
  return (...args) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Throttled update function
const throttledUpdatePosition = throttle((x, y) => {
  updateWindowPosition(props.windowState.id, x, y)
}, 16) // ~60fps

function startDrag(event) {
  if (props.windowState.isMaximized) return
  
  event.preventDefault()
  event.stopPropagation()
  
  isDragging.value = true
  bringToFront(props.windowState.id)
  
  // Store initial position
  dragStartPos.value = {
    x: props.windowState.x,
    y: props.windowState.y
  }
  
  // Calculate offset from mouse to window corner
  const rect = event.currentTarget.getBoundingClientRect()
  dragOffset.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
  
  // Use passive listeners for better performance
  document.addEventListener('mousemove', onDrag, { passive: false })
  document.addEventListener('mouseup', stopDrag, { passive: true })
  
  // Prevent text selection during drag
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'grabbing'
}

function onDrag(event) {
  if (!isDragging.value) return
  
  event.preventDefault()
  
  const newX = event.clientX - dragOffset.value.x
  const newY = event.clientY - dragOffset.value.y
  
  // Keep window within viewport bounds
  const maxX = window.innerWidth - props.windowState.width
  const maxY = window.innerHeight - props.windowState.height
  
  const clampedX = Math.max(0, Math.min(newX, maxX))
  const clampedY = Math.max(24, Math.min(newY, maxY)) // Account for menu bar
  
  // Use throttled update for smooth performance
  throttledUpdatePosition(clampedX, clampedY)
}

function stopDrag() {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  
  // Restore cursor and selection
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
}

function close() {
  closeWindow(props.windowState.id)
}

function minimize() {
  minimizeWindow(props.windowState.id)
}

function maximize() {
  maximizeWindow(props.windowState.id)
}
</script>

<style scoped>
.window-container {
  position: fixed;
  left: 0;
  top: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  resize: both;
  min-width: 400px;
  min-height: 300px;
  transition: all 0.3s ease;
  will-change: transform;
}

.window-container.maximized {
  border-radius: 0;
  resize: none;
  transform: none !important;
}

.window-container.dragging {
  transition: none;
  cursor: grabbing;
}

.title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: grab;
  user-select: none;
  height: 40px;
}

.title-bar:active {
  cursor: grabbing;
}

.title-bar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.window-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  width: 14px;
  height: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.window-title {
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.title-bar-right {
  display: flex;
  gap: 4px;
}

.title-bar-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.title-bar-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.title-bar-btn.close:hover {
  background: #ff5f57;
}

.title-bar-btn.minimize:hover {
  background: #ffbd2e;
}

.title-bar-btn.maximize:hover {
  background: #28ca42;
}

.btn-icon {
  width: 12px;
  height: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.window-content {
  height: calc(100% - 40px);
  overflow: auto;
  padding: 20px;
}

/* Custom scrollbar for window content */
.window-content::-webkit-scrollbar {
  width: 8px;
}

.window-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.window-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.window-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Resize handle */
.window-container:not(.maximized)::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 15px;
  height: 15px;
  cursor: se-resize;
  background: linear-gradient(-45deg, transparent 30%, rgba(255, 255, 255, 0.3) 30%, rgba(255, 255, 255, 0.3) 50%, transparent 50%);
}
</style> 