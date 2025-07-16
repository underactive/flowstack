export const useTheme = () => {
  // Theme state with localStorage persistence
  const theme = useState<string>('dxos-theme', () => {
    // Check localStorage first, then default to 'auto'
    if (import.meta.client) {
      return localStorage.getItem('dxos-theme') || 'auto'
    }
    return 'auto'
  })

  // Computed property to get the actual theme (resolves 'auto' to system preference)
  const currentTheme = computed(() => {
    if (theme.value === 'auto' && import.meta.client) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme.value
  })

  // Apply theme to document
  const applyTheme = (newTheme: string) => {
    if (!import.meta.client) return

    const actualTheme = newTheme === 'auto' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : newTheme

    // Remove existing theme classes
    document.documentElement.classList.remove('theme-light', 'theme-dark')
    
    // Add new theme class
    document.documentElement.classList.add(`theme-${actualTheme}`)
    
    // Update CSS custom properties for theme colors
    if (actualTheme === 'dark') {
      document.documentElement.style.setProperty('--text-primary', '#ffffff')
      document.documentElement.style.setProperty('--text-secondary', 'rgba(255, 255, 255, 0.8)')
      document.documentElement.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.2)')
      document.documentElement.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.1)')
      document.documentElement.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.2)')
    } else {
      document.documentElement.style.setProperty('--text-primary', '#1d1d1f')
      document.documentElement.style.setProperty('--text-secondary', 'rgba(29, 29, 31, 0.8)')
      document.documentElement.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.1)')
      document.documentElement.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.8)')
      document.documentElement.style.setProperty('--glass-border', 'rgba(0, 0, 0, 0.1)')
    }
  }

  // Set theme and save to localStorage
  const setTheme = (newTheme: string) => {
    theme.value = newTheme
    if (import.meta.client) {
      localStorage.setItem('dxos-theme', newTheme)
    }
    applyTheme(newTheme)
  }

  // Watch for theme changes and apply them
  watch(theme, (newTheme) => {
    applyTheme(newTheme)
  })

  // Watch for system theme changes when in auto mode
  if (import.meta.client) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', () => {
      if (theme.value === 'auto') {
        applyTheme('auto')
      }
    })
  }

  // Initialize theme on mount
  onMounted(() => {
    applyTheme(theme.value)
  })

  return {
    theme,
    currentTheme,
    setTheme
  }
} 