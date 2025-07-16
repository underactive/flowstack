interface WindowState {
  id: string
  title: string
  route: string
  x: number
  y: number
  width: number
  height: number
  isMinimized: boolean
  isMaximized: boolean
  zIndex: number
  isVisible: boolean
}

interface WindowOptions {
  x?: number
  y?: number
  width?: number
  height?: number
}

export const useWindowManager = () => {
  // Use useState to create global state that's shared across components
  const windows = useState<WindowState[]>('dxos-windows', () => [])
  const nextZIndex = useState<number>('dxos-next-z-index', () => 1000)

  // Initialize windows from localStorage if available
  onMounted(() => {
    // Clear localStorage for now to start fresh
    localStorage.removeItem('dxos-windows')
    
    // For now, don't load saved windows to avoid showing all windows at once
    // const savedWindows = localStorage.getItem('dxos-windows')
    // if (savedWindows) {
    //   try {
    //     windows.value = JSON.parse(savedWindows)
    //     // Update z-index to ensure proper layering
    //     nextZIndex.value = Math.max(...windows.value.map(w => w.zIndex), 1000) + 1
    //   } catch (e) {
    //     console.error('Failed to load saved windows:', e)
    //   }
    // }
  })

  // Debounce function for localStorage saving
  let saveTimeout: NodeJS.Timeout | null = null
  
  // Save windows to localStorage whenever they change (debounced)
  watch(windows, (newWindows) => {
    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
    
    // Debounce the save to avoid excessive localStorage writes
    saveTimeout = setTimeout(() => {
      localStorage.setItem('dxos-windows', JSON.stringify(newWindows))
    }, 100) // Save after 100ms of no changes
  }, { deep: true })

  const openWindow = (route: string, title: string, options: WindowOptions = {}): string => {
    const existingWindow = windows.value.find(w => w.route === route)
    
    if (existingWindow) {
      // If window exists, bring it to front and make it visible
      const index = windows.value.findIndex(w => w.id === existingWindow.id)
      if (index !== -1) {
        windows.value[index] = {
          ...windows.value[index],
          isVisible: true,
          isMinimized: false,
          zIndex: nextZIndex.value++
        }
      }
      return existingWindow.id
    }

    // Create new window
    const windowId = `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newWindow: WindowState = {
      id: windowId,
      title,
      route,
      x: options.x ?? 100 + (windows.value.length * 50),
      y: options.y ?? 100 + (windows.value.length * 50),
      width: options.width ?? 800,
      height: options.height ?? 600,
      isMinimized: false,
      isMaximized: false,
      zIndex: nextZIndex.value++,
      isVisible: true
    }

    windows.value.push(newWindow)
    return windowId
  }

  const closeWindow = (windowId: string): void => {
    const index = windows.value.findIndex(w => w.id === windowId)
    if (index !== -1) {
      windows.value.splice(index, 1)
    }
  }

  const minimizeWindow = (windowId: string): void => {
    const index = windows.value.findIndex(w => w.id === windowId)
    if (index !== -1) {
      windows.value[index] = {
        ...windows.value[index],
        isMinimized: true
      }
    }
  }

  const maximizeWindow = (windowId: string): void => {
    const index = windows.value.findIndex(w => w.id === windowId)
    if (index !== -1) {
      windows.value[index] = {
        ...windows.value[index],
        isMaximized: !windows.value[index].isMaximized
      }
    }
  }

  const bringToFront = (windowId: string): void => {
    const index = windows.value.findIndex(w => w.id === windowId)
    if (index !== -1) {
      windows.value[index] = {
        ...windows.value[index],
        zIndex: nextZIndex.value++
      }
    }
  }

  const updateWindowPosition = (windowId: string, x: number, y: number): void => {
    const index = windows.value.findIndex(w => w.id === windowId)
    if (index !== -1) {
      // Only update if position actually changed
      const currentWindow = windows.value[index]
      if (currentWindow.x !== x || currentWindow.y !== y) {
        // Create a new object to ensure reactivity
        windows.value[index] = {
          ...currentWindow,
          x,
          y
        }
      }
    }
  }

  const updateWindowSize = (windowId: string, width: number, height: number): void => {
    const window = windows.value.find(w => w.id === windowId)
    if (window) {
      window.width = width
      window.height = height
    }
  }

  const getVisibleWindows = (): WindowState[] => {
    return windows.value.filter(w => w.isVisible && !w.isMinimized)
  }

  const getWindowByRoute = (route: string): WindowState | undefined => {
    return windows.value.find(w => w.route === route)
  }

  return {
    windows,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    bringToFront,
    updateWindowPosition,
    updateWindowSize,
    getVisibleWindows,
    getWindowByRoute
  }
} 