<template>
  <div class="macos-desktop">
    <!-- Menu Bar -->
    <div class="menu-bar">
      <div class="menu-left">
        <div class="apple-menu">
          <svg class="apple-logo" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
        </div>
        <div class="menu-items">
          <span class="menu-item">Nuxt</span>
          <span class="menu-item">File</span>
          <span class="menu-item">Edit</span>
          <span class="menu-item">View</span>
          <span class="menu-item">Window</span>
          <span class="menu-item">Help</span>
        </div>
      </div>
      <div class="menu-right">
        <div class="status-icons">
          <UIcon name="i-heroicons-wifi" class="status-icon" />
          <UIcon name="i-heroicons-battery-100" class="status-icon" />
          <div class="clock">
            {{ currentTime }}
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop Content -->
    <div class="desktop-content">
      <WindowManager />
    </div>

    <!-- Dock -->
    <div class="dock" ref="dockRef">
      <div class="dock-container">
        <!-- Regular dock items -->
        <div class="dock-section">
          <div 
            v-for="(item, index) in dockItems" 
            :key="index"
            class="dock-item"
            @click="navigateToPage(item.route)"
          >
            <div class="dock-icon">
              <UIcon :name="item.icon" class="icon" />
            </div>
            <div class="dock-label">{{ item.label }}</div>
          </div>
        </div>

        <!-- Vertical divider -->
        <div v-if="minimizedWindows.length > 0" class="dock-divider"></div>

        <!-- Minimized windows -->
        <div v-if="minimizedWindows.length > 0" class="dock-section">
          <TransitionGroup name="dock-item" tag="div" class="minimized-windows-container">
            <div 
              v-for="window in minimizedWindows" 
              :key="window.id"
              class="dock-item minimized-window"
              @click="restoreWindow(window.id)"
            >
              <div class="dock-icon">
                <UIcon name="i-heroicons-window" class="icon" />
              </div>
              <div class="dock-label">{{ window.title }}</div>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const currentTime = ref('')
const windowManager = useWindowManager()
const { openWindow, windows, restoreWindow } = windowManager


// Get minimized windows
const minimizedWindows = computed(() => 
  windows.value.filter(w => w.isMinimized)
)





// Update time every second
onMounted(() => {
  updateTime()
  setInterval(updateTime, 1000)
  
  // Open home window by default
  openWindow('/', 'Welcome to DXOS', {
    width: 900,
    height: 700
  })
})

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const dockItems = [
  { label: 'Home', icon: 'i-heroicons-home', route: '/' },
  { label: 'About', icon: 'i-heroicons-information-circle', route: '/about' },
  { label: 'Projects', icon: 'i-heroicons-folder', route: '/projects' },
  { label: 'Contact', icon: 'i-heroicons-envelope', route: '/contact' },
  { label: 'Settings', icon: 'i-heroicons-cog-6-tooth', route: '/settings' }
]

function navigateToPage(route) {
  const windowTitles = {
    '/': 'Welcome to DXOS',
    '/about': 'About DXOS',
    '/contact': 'Contact Us',
    '/projects': 'Projects',
    '/settings': 'Settings'
  }
  
  const windowSizes = {
    '/': { width: 900, height: 700 },
    '/about': { width: 1000, height: 800 },
    '/contact': { width: 1200, height: 900 },
    '/projects': { width: 1200, height: 900 },
    '/settings': { width: 900, height: 800 }
  }
  
  // Check if there's already a minimized window for this route
  const existingMinimizedWindow = windows.value.find(w => w.route === route && w.isMinimized)
  
  if (existingMinimizedWindow) {
    // Restore the existing minimized window
    restoreWindow(existingMinimizedWindow.id)
  } else {
    // Open a new window
    openWindow(route, windowTitles[route], windowSizes[route])
  }
}
</script>

<style scoped>
.macos-desktop {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
}

/* Menu Bar */
.menu-bar {
  height: 24px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  color: white;
  font-size: 13px;
  font-weight: 500;
  z-index: 1000;
  transition: background-color 0.3s ease;
}

.theme-light .menu-bar {
  background: rgba(255, 255, 255, 0.8);
  color: #1d1d1f;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.apple-menu {
  display: flex;
  align-items: center;
}

.apple-logo {
  width: 16px;
  height: 16px;
  color: white;
  transition: color 0.3s ease;
}

.theme-light .apple-logo {
  color: #1d1d1f;
}

.menu-items {
  display: flex;
  gap: 20px;
}

.menu-item {
  cursor: pointer;
  transition: opacity 0.2s;
}

.menu-item:hover {
  opacity: 0.7;
}

.menu-right {
  display: flex;
  align-items: center;
}

.status-icons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-icon {
  width: 16px;
  height: 16px;
  color: white;
  transition: color 0.3s ease;
}

.theme-light .status-icon {
  color: #1d1d1f;
}

.clock {
  font-weight: 500;
  margin-left: 8px;
}

/* Desktop Content */
.desktop-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* Dock */
.dock {
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 8px;
  transition: transform 0.3s ease;
}



.dock-container {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 8px 16px;
  display: flex;
  gap: 8px;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.theme-light .dock-container {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.dock-section {
  display: flex;
  gap: 8px;
  align-items: center;
}

.dock-divider {
  width: 1px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.2);
  margin: 0 8px;
}

/* Dock item transition animations */
.minimized-windows-container {
  display: flex;
  gap: 8px;
  align-items: center;
}

.dock-item-enter-active,
.dock-item-leave-active {
  transition: all 0.3s ease;
}

.dock-item-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.dock-item-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(-20px);
}

.dock-item-move {
  transition: transform 0.3s ease;
}

.dock-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px 4px;
  border-radius: 8px;
  min-width: 60px;
}

.dock-item:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.1);
}

.minimized-window {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.minimized-window:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
}

.dock-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.icon {
  width: 24px;
  height: 24px;
  color: #333;
}

.dock-label {
  font-size: 11px;
  color: white;
  text-align: center;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  transition: color 0.3s ease, text-shadow 0.3s ease;
}

.theme-light .dock-label {
  color: #1d1d1f;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
}
</style>
