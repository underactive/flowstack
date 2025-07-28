export const useBackground = () => {
  // Background state with localStorage persistence
  const background = useState<string>('dxos-background', () => {
    // Check localStorage first, then default to 'gradient-1'
    if (import.meta.client) {
      return localStorage.getItem('dxos-background') || 'gradient-1'
    }
    return 'gradient-1'
  })

  // Available backgrounds
  const backgrounds = [
    { id: 'gradient-1', gradient: 'linear-gradient(155deg, #151515 0%, #2b2a2a 50%, #3d0b50 100%)' },
    { id: 'gradient-2', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'gradient-3', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { id: 'gradient-4', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { id: 'gradient-5', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { id: 'gradient-6', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }
  ]

  // Get current background gradient
  const currentBackground = computed(() => {
    const bg = backgrounds.find(b => b.id === background.value)
    return bg ? bg.gradient : backgrounds[0].gradient
  })

  // Apply background to desktop
  const applyBackground = (newBackground: string) => {
    if (!import.meta.client) return

    const bg = backgrounds.find(b => b.id === newBackground)
    if (bg) {
      // Apply to the desktop element
      const desktop = document.querySelector('.macos-desktop') as HTMLElement
      if (desktop) {
        desktop.style.background = bg.gradient
      }
    }
  }

  // Set background and save to localStorage
  const setBackground = (newBackground: string) => {
    background.value = newBackground
    if (import.meta.client) {
      localStorage.setItem('dxos-background', newBackground)
    }
    applyBackground(newBackground)
  }

  // Watch for background changes and apply them
  watch(background, (newBackground) => {
    applyBackground(newBackground)
  })

  // Initialize background on mount
  onMounted(() => {
    applyBackground(background.value)
  })

  return {
    background,
    backgrounds,
    currentBackground,
    setBackground
  }
}