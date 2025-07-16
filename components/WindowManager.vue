<template>
  <div class="window-manager">
    <!-- System 7 Animation Outlines -->
    <div 
      v-for="window in animatingWindowsWithOutlines" 
      :key="`outlines-${window.id}`"
      class="animation-outlines"
    >
      <div 
        v-for="(outline, index) in window.animationOutlines" 
        :key="`${window.id}-outline-${index}`"
        class="animation-outline"
        :style="{
          left: outline.x + 'px',
          top: outline.y + 'px',
          width: outline.width + 'px',
          height: outline.height + 'px',
          opacity: outline.opacity
        }"
      ></div>
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

const animatingWindowsWithOutlines = computed(() => {
  return windows.value.filter(w => w.isAnimating && w.animationOutlines)
})
</script>

<style scoped>
.window-manager {
  position: relative;
  width: 100%;
  height: 100%;
}

/* System 7 Animation Outlines */
.animation-outlines {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999;
}

.animation-outline {
  position: absolute;
  border: 2px solid rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.3),
    inset 0 0 0 1px rgba(255, 255, 255, 0.2);
  /* System 7 style - more pixelated, less smooth */
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

.window-page-content {
  width: 100%;
  height: 100%;
}
</style> 