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
  isAnimating?: boolean
  animationProgress?: number
  // System 7 animation properties
  animationOutlines?: Array<{
    x: number
    y: number
    width: number
    height: number
    opacity: number
  }>
  originalPosition?: { x: number, y: number, width: number, height: number }
  dockPosition?: { x: number, y: number }
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
  const dockPosition = useState<{ x: number, y: number }>('dxos-dock-position', () => ({ x: 0, y: 0 }))

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

  const restoreWindow = (windowId: string): void => {
    const index = windows.value.findIndex(w => w.id === windowId)
    if (index !== -1) {
      const window = windows.value[index]
      if (window.originalPosition) {
        // Start restore animation
        restoreWindowWithAnimation(windowId, window.originalPosition)
      } else {
        // Fallback if no original position stored
        windows.value[index] = {
          ...window,
          isMinimized: false
        }
      }
    }
  }

  const restoreWindowWithAnimation = (windowId: string, originalPosition: { x: number, y: number, width: number, height: number }): void => {
    const index = windows.value.findIndex(w => w.id === windowId)
    if (index === -1) return

    const windowState = windows.value[index]
    
    // Use current dock position where the window is actually located
    const dockPosition = getCurrentDockPositionForWindow(windowId)
    
    // Start animation
    windows.value[index] = {
      ...windowState,
      isAnimating: true,
      animationProgress: 0,
      animationOutlines: []
    }

    // Animation duration in milliseconds (System 7 was faster and choppier)
    const duration = 400
    const startTime = Date.now()
    
    // Number of outline frames to create during animation (fewer for choppier effect)
    const outlineCount = 8
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // System 7 style easing - completely linear, no smoothness
      const easeOut = progress
      
      // Calculate current position and size (reverse of minimize)
      const currentX = dockPosition.x + (originalPosition.x - dockPosition.x) * easeOut
      const currentY = dockPosition.y + (originalPosition.y - dockPosition.y) * easeOut
      const currentWidth = 60 + (originalPosition.width - 60) * easeOut // From dock size to original
      const currentHeight = 60 + (originalPosition.height - 60) * easeOut // From dock size to original

      // Create trail of outlines (chunkier, less smooth)
      const outlines = []
      for (let i = 0; i < outlineCount; i++) {
        const outlineProgress = Math.max(0, easeOut - (i * 0.12)) // Larger gaps between outlines
        if (outlineProgress > 0) {
          const outlineX = dockPosition.x + (originalPosition.x - dockPosition.x) * outlineProgress
          const outlineY = dockPosition.y + (originalPosition.y - dockPosition.y) * outlineProgress
          const outlineWidth = 60 + (originalPosition.width - 60) * outlineProgress
          const outlineHeight = 60 + (originalPosition.height - 60) * outlineProgress
          const outlineOpacity = Math.max(0, 1 - (i * 0.2)) // Faster fade out
          
          outlines.push({
            x: outlineX,
            y: outlineY,
            width: outlineWidth,
            height: outlineHeight,
            opacity: outlineOpacity
          })
        }
      }

      // Update window state
      windows.value[index] = {
        ...windows.value[index],
        x: currentX,
        y: currentY,
        width: currentWidth,
        height: currentHeight,
        animationProgress: easeOut,
        animationOutlines: outlines
      }

      if (progress < 1) {
        // Use setTimeout with a longer interval for choppier animation (System 7 style)
        setTimeout(animate, 50) // 20fps instead of 60fps
      } else {
        // Animation complete
        windows.value[index] = {
          ...windows.value[index],
          isMinimized: false,
          isAnimating: false,
          animationProgress: 1,
          animationOutlines: []
        }
      }
    }

    setTimeout(animate, 50) // Start with choppy timing
  }

  const setDockPosition = (position: { x: number, y: number }) => {
    dockPosition.value = position
  }



  const getCurrentDockPositionForWindow = (windowId: string): { x: number, y: number } => {
    // Find the minimized window in the dock
    const minimizedWindows = windows.value.filter(w => w.isMinimized)
    const windowIndex = minimizedWindows.findIndex(w => w.id === windowId)
    
    if (windowIndex === -1) {
      // Fallback to default dock position
      return { x: 600, y: 700 }
    }
    
    // Calculate dock position based on current window index
    const dockElement = document.querySelector('.dock')
    if (dockElement) {
      const dockContainer = dockElement.querySelector('.dock-container')
      
      if (dockContainer) {
        const containerRect = dockContainer.getBoundingClientRect()
        const itemWidth = 60 // Approximate dock item width
        const itemSpacing = 8 // Gap between items
        
        // Calculate position within the dock
        const totalWidth = minimizedWindows.length * (itemWidth + itemSpacing) - itemSpacing
        const startX = containerRect.left + (containerRect.width - totalWidth) / 2
        const itemX = startX + windowIndex * (itemWidth + itemSpacing)
        const itemY = containerRect.top + 20 // Top of dock area
        
        return { x: itemX, y: itemY }
      }
    }
    
    // Fallback to default position
    return { x: 600, y: 700 }
  }

  const minimizeWindowWithAnimation = (windowId: string, targetDockPosition?: { x: number, y: number }): void => {
    const index = windows.value.findIndex(w => w.id === windowId)
    if (index === -1) return

    const windowState = windows.value[index]
    
    // Use provided dock position or fallback to center bottom
    const finalDockPosition = targetDockPosition || {
      x: 600, // Default center
      y: 700  // Default bottom
    }
    
    // Store original position and size
    const originalPosition = {
      x: windowState.x,
      y: windowState.y,
      width: windowState.width,
      height: windowState.height
    }
    
    // Start animation
    windows.value[index] = {
      ...windowState,
      isAnimating: true,
      isMinimized: true,
      animationProgress: 0,
      originalPosition,
      dockPosition: finalDockPosition,
      animationOutlines: []
    }

    // Animation duration in milliseconds (System 7 was faster and choppier)
    const duration = 400
    const startTime = Date.now()
    
    // Number of outline frames to create during animation (fewer for choppier effect)
    const outlineCount = 8
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // System 7 style easing - completely linear, no smoothness
      const easeOut = progress
      
      // Calculate current position and size
      const currentX = originalPosition.x + (finalDockPosition.x - originalPosition.x) * easeOut
      const currentY = originalPosition.y + (finalDockPosition.y - originalPosition.y) * easeOut
      const currentWidth = originalPosition.width + (60 - originalPosition.width) * easeOut // Dock item width
      const currentHeight = originalPosition.height + (60 - originalPosition.height) * easeOut // Dock item height

      // Create trail of outlines (chunkier, less smooth)
      const outlines = []
      for (let i = 0; i < outlineCount; i++) {
        const outlineProgress = Math.max(0, easeOut - (i * 0.12)) // Larger gaps between outlines
        if (outlineProgress > 0) {
          const outlineX = originalPosition.x + (finalDockPosition.x - originalPosition.x) * outlineProgress
          const outlineY = originalPosition.y + (finalDockPosition.y - originalPosition.y) * outlineProgress
          const outlineWidth = originalPosition.width + (60 - originalPosition.width) * outlineProgress
          const outlineHeight = originalPosition.height + (60 - originalPosition.height) * outlineProgress
          const outlineOpacity = Math.max(0, 1 - (i * 0.2)) // Faster fade out
          
          outlines.push({
            x: outlineX,
            y: outlineY,
            width: outlineWidth,
            height: outlineHeight,
            opacity: outlineOpacity
          })
        }
      }

      // Update window state
      windows.value[index] = {
        ...windows.value[index],
        x: currentX,
        y: currentY,
        width: currentWidth,
        height: currentHeight,
        animationProgress: easeOut,
        animationOutlines: outlines
      }

      if (progress < 1) {
        // Use setTimeout with a longer interval for choppier animation (System 7 style)
        setTimeout(animate, 50) // 20fps instead of 60fps
      } else {
        // Animation complete
        windows.value[index] = {
          ...windows.value[index],
          isMinimized: true,
          isAnimating: false,
          animationProgress: 1,
          animationOutlines: []
        }
      }
    }

    setTimeout(animate, 50) // Start with choppy timing
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
    dockPosition,
    openWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    minimizeWindowWithAnimation,
    setDockPosition,
    maximizeWindow,
    bringToFront,
    updateWindowPosition,
    updateWindowSize,
    getVisibleWindows,
    getWindowByRoute
  }
} 