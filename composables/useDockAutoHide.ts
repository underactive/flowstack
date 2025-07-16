export const useDockAutoHide = () => {
  const { settings } = useSettings()
  
  const isDockVisible = ref(true)
  const isMouseNearDock = ref(false)
  const dockElement = ref<HTMLElement | null>(null)
  
  // Auto-hide functionality
  const handleMouseMove = (event: MouseEvent) => {
    if (!settings.value.autoHideDock || !dockElement.value) return
    
    const dockRect = dockElement.value.getBoundingClientRect()
    const mouseX = event.clientX
    const mouseY = event.clientY
    
    // Define the "hot zone" around the dock (similar to macOS)
    const hotZoneSize = 20 // pixels from dock edge
    
    const isInHotZone = 
      mouseX >= dockRect.left - hotZoneSize &&
      mouseX <= dockRect.right + hotZoneSize &&
      mouseY >= dockRect.top - hotZoneSize &&
      mouseY <= dockRect.bottom + hotZoneSize
    
    if (isInHotZone && !isMouseNearDock.value) {
      isMouseNearDock.value = true
      showDock()
    } else if (!isInHotZone && isMouseNearDock.value) {
      isMouseNearDock.value = false
      hideDock()
    }
  }
  
  const showDock = () => {
    if (settings.value.autoHideDock) {
      isDockVisible.value = true
    }
  }
  
  const hideDock = () => {
    if (settings.value.autoHideDock) {
      isDockVisible.value = false
    }
  }
  
  // Watch for auto-hide setting changes
  watch(() => settings.value.autoHideDock, (newValue) => {
    if (newValue) {
      // When enabling auto-hide, hide the dock initially
      isDockVisible.value = false
      isMouseNearDock.value = false
    } else {
      // When disabling auto-hide, show the dock
      isDockVisible.value = true
      isMouseNearDock.value = false
    }
  })
  
  // Set up mouse tracking when auto-hide is enabled
  const setupMouseTracking = () => {
    if (settings.value.autoHideDock) {
      document.addEventListener('mousemove', handleMouseMove)
    } else {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }
  
  // Watch for auto-hide setting changes and update event listeners
  watch(() => settings.value.autoHideDock, setupMouseTracking)
  
  // Clean up on unmount
  onUnmounted(() => {
    document.removeEventListener('mousemove', handleMouseMove)
  })
  
  // Initialize
  onMounted(() => {
    setupMouseTracking()
    // Set initial state based on auto-hide setting
    if (settings.value.autoHideDock) {
      isDockVisible.value = false
    }
  })
  
  return {
    isDockVisible,
    isMouseNearDock,
    dockElement,
    showDock,
    hideDock
  }
} 