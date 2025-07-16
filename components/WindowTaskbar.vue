<template>
  <div class="taskbar">
    <div class="taskbar-container">
      <div 
        v-for="window in minimizedWindows" 
        :key="window.id"
        class="taskbar-item"
        @click="restoreWindow(window.id)"
      >
        <div class="taskbar-icon">
          <UIcon name="i-heroicons-window" class="icon" />
        </div>
        <span class="taskbar-title">{{ window.title }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const { windows } = useWindowManager()

const minimizedWindows = computed(() => 
  windows.value.filter(w => w.isMinimized)
)

function restoreWindow(windowId) {
  const window = windows.value.find(w => w.id === windowId)
  if (window) {
    window.isMinimized = false
  }
}
</script>

<style scoped>
.taskbar {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
}

.taskbar-container {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 8px 16px;
  display: flex;
  gap: 12px;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.taskbar-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  min-width: 120px;
}

.taskbar-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.taskbar-icon {
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

.taskbar-title {
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
}
</style> 