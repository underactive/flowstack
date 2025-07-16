<template>
  <div class="window-manager">
    <div v-if="visibleWindows.length === 0" class="no-windows">
      No windows visible
    </div>
    <WindowTitleBar 
      v-for="window in visibleWindows" 
      :key="window.id"
      :window-state="window"
    >
      <div class="window-page-content">
        <HomePage v-if="window.route === '/'" />
        <AboutPage v-else-if="window.route === '/about'" />
        <ContactPage v-else-if="window.route === '/contact'" />
        <ProjectsPage v-else-if="window.route === '/projects'" />
        <SettingsPage v-else-if="window.route === '/settings'" />
      </div>
    </WindowTitleBar>
  </div>
</template>

<script setup>
const windowManager = useWindowManager()
const { windows } = windowManager

const visibleWindows = computed(() => {
  const allWindows = windows.value
  const visible = allWindows.filter(w => w.isVisible && !w.isMinimized)
  return visible
})
</script>

<style scoped>
.window-manager {
  position: relative;
  width: 100%;
  height: 100%;
}

.window-page-content {
  width: 100%;
  height: 100%;
}

.no-windows {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 1.2rem;
  opacity: 0.7;
}
</style> 