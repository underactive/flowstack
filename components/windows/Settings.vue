<template>
  <div class="settings-page">
    <div class="settings-container">
      <h1>Settings</h1>
      <p class="subtitle">Customize your AMFM.video experience</p>
      
      <div class="settings-content">
        <div class="settings-section">
          <h2>Appearance</h2>
          <div class="setting-item">
            <div class="setting-info">
              <h3>Theme</h3>
              <p>Choose your preferred color scheme</p>
            </div>
            <div class="setting-control">
              <select v-model="settings.theme" class="select-input">
                <option value="auto">Auto</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h3>Background</h3>
              <p>Select your desktop background</p>
            </div>
            <div class="setting-control">
              <div class="background-options">
                <div 
                  v-for="bg in backgrounds" 
                  :key="bg.id"
                  class="bg-option"
                  :class="{ active: settings.background === bg.id }"
                  @click="settings.background = bg.id"
                >
                  <div class="bg-preview" :style="{ background: bg.gradient }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="settings-section">
          <h2>Interface</h2>
          <div class="setting-item">
            <div class="setting-info">
              <h3>Auto-hide Dock</h3>
              <p>Automatically hide the dock when not in use</p>
            </div>
            <div class="setting-control">
              <input 
                type="checkbox" 
                v-model="settings.autoHideDock"
                class="checkbox-input"
              />
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h3>Show Clock</h3>
              <p>Display the clock in the menu bar</p>
            </div>
            <div class="setting-control">
              <input 
                type="checkbox" 
                v-model="settings.showClock"
                class="checkbox-input"
              />
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h3>24-hour Format</h3>
              <p>Display time in 24-hour format instead of 12-hour</p>
            </div>
            <div class="setting-control">
              <input 
                type="checkbox" 
                v-model="settings.use24HourFormat"
                class="checkbox-input"
              />
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h3>Dock Magnification</h3>
              <p>Enable dock icon magnification on hover</p>
            </div>
            <div class="setting-control">
              <input 
                type="checkbox" 
                v-model="settings.dockMagnification"
                class="checkbox-input"
              />
            </div>
          </div>
        </div>
        
        <div class="settings-section">
          <h2>Notifications</h2>
          <div class="setting-item">
            <div class="setting-info">
              <h3>Enable Notifications</h3>
              <p>Receive notifications for updates and messages</p>
            </div>
            <div class="setting-control">
              <input 
                type="checkbox" 
                v-model="settings.notifications"
                class="checkbox-input"
              />
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h3>Sound Effects</h3>
              <p>Play sounds for system events</p>
            </div>
            <div class="setting-control">
              <input 
                type="checkbox" 
                v-model="settings.soundEffects"
                class="checkbox-input"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div class="settings-actions">
        <button @click="resetSettings" class="reset-btn">
          <UIcon name="i-heroicons-arrow-path" class="btn-icon" />
          Reset to Defaults
        </button>
        <button @click="saveSettings" class="save-btn">
          <UIcon name="i-heroicons-check" class="btn-icon" />
          Save Settings
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const { theme, setTheme } = useTheme()
const { background, backgrounds, setBackground } = useBackground()
const { settings, saveSettings: saveGlobalSettings, resetSettings: resetGlobalSettings } = useSettings()

// Watch for theme changes and update settings
watch(theme, (newTheme) => {
  settings.value.theme = newTheme
})

// Watch for background changes and update settings
watch(background, (newBackground) => {
  settings.value.background = newBackground
})

// Watch for settings theme changes and update theme
watch(() => settings.value.theme, (newTheme) => {
  setTheme(newTheme)
})

// Watch for settings background changes and update background
watch(() => settings.value.background, (newBackground) => {
  setBackground(newBackground)
})

// Load saved settings on mount
onMounted(() => {
  // Ensure theme and background are applied from global settings
  setTheme(settings.value.theme)
  setBackground(settings.value.background)
})

function saveSettings() {
  saveGlobalSettings()
  console.log('Settings saved:', settings.value)
  alert('Settings saved successfully!')
}

function resetSettings() {
  resetGlobalSettings()
  // Reset theme and background to defaults
  setTheme('auto')
  setBackground('gradient-1')
  alert('Settings reset to defaults!')
}
</script>

<style scoped>
.settings-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100%;
  padding: 20px;
}

.settings-container {
  max-width: 800px;
  width: 100%;
}

.settings-container h1 {
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  text-align: center;
  transition: color 0.3s ease, text-shadow 0.3s ease;
}

.theme-light .settings-container h1 {
  color: #1d1d1f;
  text-shadow: 0 2px 4px rgba(255, 255, 255, 0.3);
}

.subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.2rem;
  margin-bottom: 40px;
  text-align: center;
  transition: color 0.3s ease;
}

.theme-light .subtitle {
  color: rgba(29, 29, 31, 0.8);
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.settings-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.theme-light .settings-section {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.settings-section h2 {
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 20px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  transition: color 0.3s ease, text-shadow 0.3s ease;
}

.theme-light .settings-section h2 {
  color: #1d1d1f;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: border-color 0.3s ease;
}

.theme-light .setting-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info h3 {
  color: white;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 4px;
  transition: color 0.3s ease;
}

.theme-light .setting-info h3 {
  color: #1d1d1f;
}

.setting-info p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin: 0;
  transition: color 0.3s ease;
}

.theme-light .setting-info p {
  color: rgba(29, 29, 31, 0.7);
}

.select-input {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px 12px;
  color: white;
  font-size: 0.9rem;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.theme-light .select-input {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #1d1d1f;
}

.select-input option {
  background: #333;
  color: white;
}

.theme-light .select-input option {
  background: #f5f5f7;
  color: #1d1d1f;
}

.checkbox-input {
  width: 20px;
  height: 20px;
  accent-color: #667eea;
}

.background-options {
  display: flex;
  gap: 8px;
}

.bg-option {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s ease;
}

.bg-option.active {
  border-color: #667eea;
}

.bg-preview {
  width: 100%;
  height: 100%;
  border-radius: 6px;
}

.settings-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 32px;
}

.reset-btn, .save-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.reset-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.save-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.reset-btn:hover, .save-btn:hover {
  transform: translateY(-2px);
}

.btn-icon {
  width: 16px;
  height: 16px;
}
</style> 