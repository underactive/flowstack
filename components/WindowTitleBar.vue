<template>
  <div 
    class="window-container"
    :style="{ 
      left: position.x + 'px', 
      top: position.y + 'px',
      width: width + 'px',
      height: height + 'px'
    }"
  >
    <div 
      class="title-bar"
      @mousedown="startDrag"
      @touchstart="startDrag"
    >
      <div class="title-bar-left">
        <div class="window-icon">
          <UIcon name="i-heroicons-window" class="icon" />
        </div>
        <span class="window-title">{{ title }}</span>
      </div>
      <div class="title-bar-right">
        <button class="title-bar-btn minimize" @click="minimize">
          <UIcon name="i-heroicons-minus" class="btn-icon" />
        </button>
        <button class="title-bar-btn maximize" @click="maximize">
          <UIcon name="i-heroicons-arrows-pointing-out" class="btn-icon" />
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
  title: {
    type: String,
    default: 'Window'
  },
  width: {
    type: Number,
    default: 800
  },
  height: {
    type: Number,
    default: 600
  },
  initialX: {
    type: Number,
    default: 100
  },
  initialY: {
    type: Number,
    default: 100
  }
})

const emit = defineEmits(['close', 'minimize', 'maximize'])

const position = ref({
  x: props.initialX,
  y: props.initialY
})

const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

function startDrag(event) {
  isDragging.value = true
  
  const rect = event.target.closest('.window-container').getBoundingClientRect()
  dragOffset.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag, { passive: false })
  document.addEventListener('touchend', stopDrag)
}

function onDrag(event) {
  if (!isDragging.value) return
  
  event.preventDefault()
  
  const clientX = event.clientX || (event.touches && event.touches[0].clientX)
  const clientY = event.clientY || (event.touches && event.touches[0].clientY)
  
  if (clientX && clientY) {
    position.value = {
      x: clientX - dragOffset.value.x,
      y: clientY - dragOffset.value.y
    }
  }
}

function stopDrag() {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
}

function close() {
  emit('close')
}

function minimize() {
  emit('minimize')
}

function maximize() {
  emit('maximize')
}
</script>

<style scoped>
.window-container {
  position: fixed;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  z-index: 1000;
  resize: both;
  min-width: 400px;
  min-height: 300px;
}

.title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: move;
  user-select: none;
  height: 40px;
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
.window-container::after {
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