export const useSettings = () => {
  // Settings state with localStorage persistence
  const settings = useState('dxos-settings', () => {
    // Check localStorage first, then use defaults
    if (import.meta.client) {
      const savedSettings = localStorage.getItem('dxos-settings')
      if (savedSettings) {
        try {
          return JSON.parse(savedSettings)
        } catch (e) {
          console.error('Failed to load saved settings:', e)
        }
      }
    }
    
    // Default settings
    return {
      theme: 'dark',
      background: 'gradient-1',
      dockPosition: 'bottom',
      showClock: true,
      dockMagnification: true,
      notifications: true,
      soundEffects: false
    }
  })

  // Save settings to localStorage
  const saveSettings = () => {
    if (import.meta.client) {
      localStorage.setItem('dxos-settings', JSON.stringify(settings.value))
    }
  }

  // Reset settings to defaults
  const resetSettings = () => {
    settings.value = {
      theme: 'dark',
      background: 'gradient-1',
      dockPosition: 'bottom',
      showClock: true,
      dockMagnification: true,
      notifications: true,
      soundEffects: false
    }
    saveSettings()
  }

  // Watch for settings changes and save to localStorage
  watch(settings, () => {
    saveSettings()
  }, { deep: true })

  return {
    settings,
    saveSettings,
    resetSettings
  }
} 