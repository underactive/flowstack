<template>
  <div class="settings-page">
    <div class="settings-container">
      <h1>Settings</h1>
      <p class="subtitle">Customize your DXOS experience</p>
      
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
              <h3>Dock Position</h3>
              <p>Choose where the dock appears</p>
            </div>
            <div class="setting-control">
              <select v-model="settings.dockPosition" class="select-input">
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
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
const settings = ref({
  theme: 'auto',
  background: 'gradient-1',
  dockPosition: 'bottom',
  showClock: true,
  dockMagnification: true,
  notifications: true,
  soundEffects: false
})

const backgrounds = [
  { id: 'gradient-1', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'gradient-2', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'gradient-3', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: 'gradient-4', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { id: 'gradient-5', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { id: 'gradient-6', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }
]

function saveSettings() {
  // Here you would typically save settings to localStorage or backend
  console.log('Settings saved:', settings.value)
  alert('Settings saved successfully!')
}

function resetSettings() {
  settings.value = {
    theme: 'auto',
    background: 'gradient-1',
    dockPosition: 'bottom',
    showClock: true,
    dockMagnification: true,
    notifications: true,
    soundEffects: false
  }
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
}

.subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.2rem;
  margin-bottom: 40px;
  text-align: center;
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
}

.settings-section h2 {
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 20px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info h3 {
  color: white;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.setting-info p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin: 0;
}

.select-input {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px 12px;
  color: white;
  font-size: 0.9rem;
}

.select-input option {
  background: #333;
  color: white;
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