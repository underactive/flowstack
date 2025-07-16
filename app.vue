<template>
  <div class="macos-desktop">
    <!-- Menu Bar -->
    <div class="menu-bar">
      <div class="menu-left">
        <div class="apple-menu">
          <UIcon name="i-heroicons-apple-logo" class="apple-logo" />
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
      <NuxtPage />
    </div>

    <!-- Dock -->
    <div class="dock">
      <div class="dock-container">
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
    </div>
  </div>
</template>

<script setup>
const currentTime = ref('')

// Update time every second
onMounted(() => {
  updateTime()
  setInterval(updateTime, 1000)
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
  navigateTo(route)
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
}
</style>
