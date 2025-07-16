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
    
    // Add window resize listener to ensure windows stay within bounds
    const handleResize = () => {
      ensureWindowsInBounds()
    }
    
    window.addEventListener('resize', handleResize)
    
    // Cleanup on unmount
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })
  })

  // Debounce function for localStorage saving
  let saveTimeout: NodeJS.Timeout | null = null
  let lastSavedState: string = ''
  
  // Save windows to localStorage whenever they change (debounced)
  watch(windows, (newWindows) => {
    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
    
    // Debounce the save to avoid excessive localStorage writes
    saveTimeout = setTimeout(() => {
      const newState = JSON.stringify(newWindows)
      // Only save if the state actually changed
      if (newState !== lastSavedState) {
        localStorage.setItem('dxos-windows', newState)
        lastSavedState = newState
      }
    }, 100) // Save after 100ms of no changes
  }, { deep: false }) // Don't use deep watching for better performance

    // Calculate responsive window position that ensures the window is fully visible
  const calculateResponsivePosition = (
    desiredX: number | undefined, 
    desiredY: number | undefined, 
    width: number, 
    height: number,
    windowIndex: number = 0
  ): { x: number, y: number } => {
    // Get viewport dimensions
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    // Get actual menu bar and dock positions
    const menuBar = document.querySelector('.menu-bar')
    const dockContainer = document.querySelector('.dock-container')
    
    let minY = 0
    let maxY = viewportHeight - height
    
    if (menuBar) {
      const menuBarRect = menuBar.getBoundingClientRect()
      minY = menuBarRect.bottom // Start below the menu bar
    }
    
    if (dockContainer) {
      const dockRect = dockContainer.getBoundingClientRect()
      maxY = dockRect.top - height // Stop above the dock
    }
    
    // Calculate maximum allowed position
    const maxX = viewportWidth - width
    
    // Ensure minimum position
    const minX = 0
    
    // Start with desired position or use cascading offset
    let x: number
    let y: number
    
    // If no specific position provided, use cascading offset
    if (desiredX === undefined || desiredY === undefined) {
      const cascadeOffset = 30
      x = 20 + (windowIndex * cascadeOffset) // Small offset for cascading, but no margin constraint
      y = minY + (windowIndex * cascadeOffset)
    } else {
      x = desiredX
      y = desiredY
    }
    
    // Ensure window is within bounds
    x = Math.max(minX, Math.min(maxX, x))
    y = Math.max(minY, Math.min(maxY, y))
    
    return { x, y }
  }

  // Calculate responsive window size based on screen size
  const calculateResponsiveSize = (desiredWidth: number | undefined, desiredHeight: number | undefined): { width: number, height: number } => {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    // Get actual menu bar and dock positions
    const menuBar = document.querySelector('.menu-bar')
    const dockContainer = document.querySelector('.dock-container')
    
    let maxHeight = viewportHeight - 40
    
    if (menuBar) {
      const menuBarRect = menuBar.getBoundingClientRect()
      maxHeight = viewportHeight - menuBarRect.bottom - 40
    }
    
    if (dockContainer) {
      const dockRect = dockContainer.getBoundingClientRect()
      maxHeight = Math.min(maxHeight, dockRect.top - 40)
    }
    
    // Maximum window size (leave some space for margins)
    const maxWidth = viewportWidth
    
  // Default sizes for different screen sizes
  let width: number
  let height: number
  
  // If no specific size provided, use responsive defaults
  if (desiredWidth === undefined || desiredHeight === undefined) {
    if (viewportWidth < 768) {
      // Mobile/tablet
      width = viewportWidth
      height = Math.min(600, maxHeight)
    } else if (viewportWidth < 1024) {
      // Small laptop
      width = Math.min(700, viewportWidth)
      height = Math.min(500, maxHeight)
    } else {
      // Desktop
      width = 800
      height = Math.min(600, maxHeight)
    }
  } else {
    width = desiredWidth
    height = desiredHeight
  }
  
  // Ensure window size is within bounds
  width = Math.min(maxWidth, Math.max(300, width))
  height = Math.min(maxHeight, Math.max(200, height))
    
    return { width, height }
  }

  // Smooth resize updates
  const smoothUpdateSize = (windowId: string, width: number, height: number) => {
    // Update immediately for responsive feel
    updateWindowSize(windowId, width, height)
  }

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

    // Calculate responsive size and position
    const { width: responsiveWidth, height: responsiveHeight } = calculateResponsiveSize(
      options.width, 
      options.height
    )
    
    const { x: responsiveX, y: responsiveY } = calculateResponsivePosition(
      options.x, 
      options.y, 
      responsiveWidth, 
      responsiveHeight,
      windows.value.length
    )

    // Create new window
    const windowId = `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newWindow: WindowState = {
      id: windowId,
      title,
      route,
      x: responsiveX,
      y: responsiveY,
      width: responsiveWidth,
      height: responsiveHeight,
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

    // Animation duration in milliseconds (faster for better responsiveness)
    const duration = 250
    const startTime = Date.now()
    
    // Number of outline frames to create during animation
    const outlineCount = 6
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Smooth easing for better feel
      const easeOut = progress
      
      // Calculate current position and size (reverse of minimize)
      const currentX = dockPosition.x + (originalPosition.x - dockPosition.x) * easeOut
      const currentY = dockPosition.y + (originalPosition.y - dockPosition.y) * easeOut
      const currentWidth = 60 + (originalPosition.width - 60) * easeOut // From dock size to original
      const currentHeight = 60 + (originalPosition.height - 60) * easeOut // From dock size to original

      // Create trail of outlines
      const outlines = []
      for (let i = 0; i < outlineCount; i++) {
        const outlineProgress = Math.max(0, easeOut - (i * 0.15)) // Adjusted gaps
        if (outlineProgress > 0) {
          const outlineX = dockPosition.x + (originalPosition.x - dockPosition.x) * outlineProgress
          const outlineY = dockPosition.y + (originalPosition.y - dockPosition.y) * outlineProgress
          const outlineWidth = 60 + (originalPosition.width - 60) * outlineProgress
          const outlineHeight = 60 + (originalPosition.height - 60) * outlineProgress
          const outlineOpacity = Math.max(0, 1 - (i * 0.25)) // Faster fade out
          
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
        // Use requestAnimationFrame for smoother animation
        requestAnimationFrame(animate)
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

    requestAnimationFrame(animate) // Start with smooth timing
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

    // Animation duration in milliseconds (faster for better responsiveness)
    const duration = 250
    const startTime = Date.now()
    
    // Number of outline frames to create during animation
    const outlineCount = 6
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Smooth easing for better feel
      const easeOut = progress
      
      // Calculate current position and size
      const currentX = originalPosition.x + (finalDockPosition.x - originalPosition.x) * easeOut
      const currentY = originalPosition.y + (finalDockPosition.y - originalPosition.y) * easeOut
      const currentWidth = originalPosition.width + (60 - originalPosition.width) * easeOut // Dock item width
      const currentHeight = originalPosition.height + (60 - originalPosition.height) * easeOut // Dock item height

      // Create trail of outlines
      const outlines = []
      for (let i = 0; i < outlineCount; i++) {
        const outlineProgress = Math.max(0, easeOut - (i * 0.15)) // Adjusted gaps
        if (outlineProgress > 0) {
          const outlineX = originalPosition.x + (finalDockPosition.x - originalPosition.x) * outlineProgress
          const outlineY = originalPosition.y + (finalDockPosition.y - originalPosition.y) * outlineProgress
          const outlineWidth = originalPosition.width + (60 - originalPosition.width) * outlineProgress
          const outlineHeight = originalPosition.height + (60 - originalPosition.height) * outlineProgress
          const outlineOpacity = Math.max(0, 1 - (i * 0.25)) // Faster fade out
          
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
        // Use requestAnimationFrame for smoother animation
        requestAnimationFrame(animate)
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

    requestAnimationFrame(animate) // Start with smooth timing
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
      const currentWindow = windows.value[index]
      
      // Use responsive positioning to ensure window stays within bounds
      const { x: responsiveX, y: responsiveY } = calculateResponsivePosition(
        x, 
        y, 
        currentWindow.width, 
        currentWindow.height
      )
      
      // Only update if position actually changed
      if (currentWindow.x !== responsiveX || currentWindow.y !== responsiveY) {
        // Update properties directly for better performance
        currentWindow.x = responsiveX
        currentWindow.y = responsiveY
        // Trigger reactivity by reassigning the array
        windows.value = [...windows.value]
      }
    }
  }

  // Ensure all windows are within screen bounds (useful for screen resize)
  const ensureWindowsInBounds = (): void => {
    windows.value.forEach((window, index) => {
      const { x: responsiveX, y: responsiveY } = calculateResponsivePosition(
        window.x, 
        window.y, 
        window.width, 
        window.height
      )
      
      if (window.x !== responsiveX || window.y !== responsiveY) {
        windows.value[index] = {
          ...window,
          x: responsiveX,
          y: responsiveY
        }
      }
    })
  }

  const updateWindowSize = (windowId: string, width: number, height: number): void => {
    const index = windows.value.findIndex(w => w.id === windowId)
    if (index !== -1) {
      const currentWindow = windows.value[index]
      // Only update if size actually changed
      if (currentWindow.width !== width || currentWindow.height !== height) {
        // Update properties directly for better performance
        currentWindow.width = width
        currentWindow.height = height
        // Trigger reactivity by reassigning the array
        windows.value = [...windows.value]
      }
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
    getWindowByRoute,
    smoothUpdateSize,
    ensureWindowsInBounds
  }
} 