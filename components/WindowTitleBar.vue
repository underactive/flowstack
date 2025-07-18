<template>
  <div 
    v-if="windowState && windowState.isVisible && (!windowState.isMinimized || (windowState.isAnimating && !windowState.isMinimized))"
    class="window-container"
    :class="{ 
      'maximized': windowState.isMaximized, 
      'dragging': isDragging,
      'resizing': isResizing,
      'minimizing': windowState.isAnimating && windowState.isMinimized,
      'restoring': windowState.isAnimating && !windowState.isMinimized
    }"
    :style="{ 
      transform: windowState.isMaximized ? 'none' : `translate(${windowState.x}px, ${windowState.y}px)`,
      width: windowState.isMaximized ? '100vw' : windowState.width + 'px',
      height: windowState.isMaximized ? getMaximizedHeight() : windowState.height + 'px',
      top: windowState.isMaximized ? '24px' : '0',
      zIndex: windowState.zIndex,
      opacity: windowState.isAnimating && windowState.isMinimized ? 0 : 1
    }"
    @mousedown="handleWindowClick"
  >
    <div 
      class="title-bar"
      @mousedown="startDrag"
      @dblclick="toggleMaximize"
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
        <button 
          v-if="!(windowState.fixedWidth && windowState.fixedHeight)"
          class="title-bar-btn maximize" 
          @click="maximize"
        >
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
    <!-- Custom resize handle -->
    <div 
      v-if="!windowState.isMaximized && windowState.isResizable !== false"
      class="resize-handle"
      @mousedown="startResize"
    ></div>
  </div>
</template>

<script setup>
const props = defineProps({
  windowState: {
    type: Object,
    required: true
  }
})

const { minimizeWindowWithAnimation, maximizeWindow, closeWindow, bringToFront, updateWindowPosition, smoothUpdateSize } = useWindowManager()
const { settings } = useSettings()
const { isDockVisible } = useDockAutoHide()

const isDragging = ref(false)
const isResizing = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const dragStartPos = ref({ x: 0, y: 0 })
const resizeStartSize = ref({ width: 0, height: 0 })
const resizeStartPos = ref({ x: 0, y: 0 })

// Get the actual dock container position to calculate maximized height
const getMaximizedHeight = () => {
  const dockContainer = document.querySelector('.dock-container')
  if (dockContainer) {
    const dockRect = dockContainer.getBoundingClientRect()
    const menuBarHeight = 24
    
    // Check if dock is auto-hidden
    if (!settings.value.autoHideDock || isDockVisible.value) {
      return `${dockRect.top - menuBarHeight}px`
    } else {
      // If dock is auto-hidden, use full height
      return 'calc(100vh - 24px)'
    }
  }
  // Fallback if dock not found
  return 'calc(100vh - 24px - 80px)'
}

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
  
  // Get actual menu bar and dock positions
  const menuBar = document.querySelector('.menu-bar')
  const dockContainer = document.querySelector('.dock-container')
  
  let minY = 0
  let maxY = window.innerHeight - props.windowState.height
  
  if (menuBar) {
    const menuBarRect = menuBar.getBoundingClientRect()
    minY = menuBarRect.bottom + 8 // Start below the menu bar with 8px spacing
  }
  
  if (dockContainer) {
    const dockRect = dockContainer.getBoundingClientRect()
    // Check if dock is auto-hidden
    if (!settings.value.autoHideDock || isDockVisible.value) {
      maxY = dockRect.top - props.windowState.height // Stop above the dock
    } else {
      // If dock is auto-hidden, allow windows to go to bottom of screen
      maxY = window.innerHeight - props.windowState.height
    }
  }
  
  // Keep window within viewport bounds
  const maxX = window.innerWidth - props.windowState.width
  
  const clampedX = Math.max(0, Math.min(newX, maxX))
  const clampedY = Math.max(minY, Math.min(newY, maxY))
  
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

function startResize(event) {
  if (props.windowState.isMaximized) return
  
  // Prevent resizing if window is not resizable or has fixed dimensions
  if (props.windowState.isResizable === false || 
      (props.windowState.fixedWidth && props.windowState.fixedHeight)) {
    return
  }
  
  event.preventDefault()
  event.stopPropagation()
  
  isResizing.value = true
  bringToFront(props.windowState.id)
  
  // Store initial size and position
  resizeStartSize.value = {
    width: props.windowState.width,
    height: props.windowState.height
  }
  resizeStartPos.value = {
    x: event.clientX,
    y: event.clientY
  }
  
  // Use passive listeners for better performance
  document.addEventListener('mousemove', onResize, { passive: false })
  document.addEventListener('mouseup', stopResize, { passive: true })
  
  // Prevent text selection during resize
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'se-resize'
}

function onResize(event) {
  if (!isResizing.value) return
  
  event.preventDefault()
  
  const deltaX = event.clientX - resizeStartPos.value.x
  const deltaY = event.clientY - resizeStartPos.value.y
  
  // Get actual menu bar and dock positions
  const menuBar = document.querySelector('.menu-bar')
  const dockContainer = document.querySelector('.dock-container')
  
  let maxHeight = window.innerHeight - 40
  
  if (menuBar) {
    const menuBarRect = menuBar.getBoundingClientRect()
    maxHeight = window.innerHeight - menuBarRect.bottom - 8 - 40 // Account for 8px spacing
  }
  
  if (dockContainer) {
    const dockRect = dockContainer.getBoundingClientRect()
    // Check if dock is auto-hidden
    if (!settings.value.autoHideDock || isDockVisible.value) {
      maxHeight = Math.min(maxHeight, dockRect.top - 40)
    }
    // If dock is auto-hidden, don't limit height
  }
  
  // Handle fixed dimensions
  let newWidth, newHeight
  
  if (props.windowState.fixedWidth) {
    // Keep fixed width unchanged
    newWidth = props.windowState.fixedWidth
  } else {
    newWidth = Math.max(400, resizeStartSize.value.width + deltaX) // Min width 400px
  }
  
  if (props.windowState.fixedHeight) {
    // Keep fixed height unchanged
    newHeight = props.windowState.fixedHeight
  } else {
    newHeight = Math.max(300, resizeStartSize.value.height + deltaY) // Min height 300px
  }
  
  // Ensure window doesn't exceed viewport bounds
  const maxWidth = window.innerWidth
  
  const clampedWidth = props.windowState.fixedWidth ? newWidth : Math.min(maxWidth, newWidth)
  const clampedHeight = props.windowState.fixedHeight ? newHeight : Math.min(maxHeight, newHeight)
  
  // Use smooth update for immediate visual feedback
  smoothUpdateSize(props.windowState.id, clampedWidth, clampedHeight)
}

function stopResize() {
  isResizing.value = false
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
  
  // Restore cursor and selection
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
}

function close() {
  closeWindow(props.windowState.id)
}

function minimize() {
  // Calculate dock position by finding the dock element
  const dockElement = document.querySelector('.dock')
  let dockPosition = { x: 600, y: 700 } // Default fallback
  
  if (dockElement) {
    const dockRect = dockElement.getBoundingClientRect()
    dockPosition = {
      x: dockRect.left + dockRect.width / 2 - 30, // Center of dock
      y: dockRect.top + 20 // Top of dock area
    }
  }
  
  minimizeWindowWithAnimation(props.windowState.id, dockPosition)
}

function maximize() {
  // Prevent maximizing windows with fixed dimensions
  if (props.windowState.fixedWidth && props.windowState.fixedHeight) {
    return
  }
  maximizeWindow(props.windowState.id)
}

function toggleMaximize() {
  // Prevent double-click from triggering drag
  if (isDragging.value) {
    isDragging.value = false
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', stopDrag)
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
    return
  }
  
  // Prevent maximizing windows with fixed dimensions
  if (props.windowState.fixedWidth && props.windowState.fixedHeight) {
    return
  }
  
  // Toggle between maximized and restored state
  maximizeWindow(props.windowState.id)
}

function handleWindowClick(_event) {
  bringToFront(props.windowState.id)
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
  min-width: 400px;
  min-height: 300px;
  transition: all 0.3s ease;
  will-change: transform, width, height, opacity;
}

.theme-light .window-container {
  background: rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.window-container.maximized {
  border-radius: 0;
  transform: none !important;
  border: none;
  box-shadow: none;
  top: 24px !important;
  left: 0 !important;
  width: 100vw !important;
}

.window-container.dragging {
  transition: none;
  cursor: grabbing;
}

.window-container.resizing {
  transition: none;
  cursor: se-resize;
}

.window-container.minimizing {
  transition: none;
  pointer-events: none;
  /* Hide content during System 7 minimize animation */
  opacity: 0;
}

.window-container.restoring {
  transition: none;
  pointer-events: none;
  /* Show content during System 7 restore animation */
  opacity: 1;
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
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.theme-light .title-bar {
  background: rgba(255, 255, 255, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.window-container.maximized .title-bar {
  background: rgba(255, 255, 255, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.theme-light .window-container.maximized .title-bar {
  background: rgba(255, 255, 255, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
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
  transition: color 0.3s ease;
}

.theme-light .icon {
  color: rgba(29, 29, 31, 0.8);
}

.window-title {
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  transition: color 0.3s ease, text-shadow 0.3s ease;
}

.theme-light .window-title {
  color: #1d1d1f;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
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
  transition: background-color 0.2s ease;
}

.theme-light .title-bar-btn:hover {
  background: rgba(0, 0, 0, 0.1);
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
  transition: color 0.3s ease;
}

.theme-light .btn-icon {
  color: rgba(29, 29, 31, 0.8);
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
  transition: background-color 0.3s ease;
}

.theme-light .window-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

.window-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.theme-light .window-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
}

.window-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.theme-light .window-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}

/* Custom resize handle */
.resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 15px;
  height: 15px;
  cursor: se-resize;
  background: linear-gradient(-45deg, transparent 30%, rgba(255, 255, 255, 0.3) 30%, rgba(255, 255, 255, 0.3) 50%, transparent 50%);
  z-index: 10;
  transition: background 0.3s ease;
}

.theme-light .resize-handle {
  background: linear-gradient(-45deg, transparent 30%, rgba(0, 0, 0, 0.3) 30%, rgba(0, 0, 0, 0.3) 50%, transparent 50%);
}

.resize-handle:hover {
  background: linear-gradient(-45deg, transparent 30%, rgba(255, 255, 255, 0.5) 30%, rgba(255, 255, 255, 0.5) 50%, transparent 50%);
}

.theme-light .resize-handle:hover {
  background: linear-gradient(-45deg, transparent 30%, rgba(0, 0, 0, 0.5) 30%, rgba(0, 0, 0, 0.5) 50%, transparent 50%);
}
</style> 