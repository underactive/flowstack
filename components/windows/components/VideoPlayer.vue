<template>
  <div class="video-container">
    <div class="player-wrapper">
      <div id="youtube-player" class="youtube-player"/>
      <img src="/images/player/player_logo.svg" alt="Player Logo" class="player-logo" />
      <div v-if="showStatic" class="tv-static"/>
      <div v-if="!isPoweredOn" class="power-off-overlay"/>
      <div v-if="showPowerOffStatic" class="power-off-static"/>
      <div v-if="showPowerOnStatic" class="power-on-static"/>
      <div class="crt-overlay"/>
    </div>
  </div>
  
  <!-- Control Bar -->
  <div class="control-bar">
    <button class="nav-button" @click="previousVideo" title="Previous Video">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M7 2L3 5L7 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    
    <button class="nav-button" @click="nextVideo" title="Next Video">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M3 2L7 5L3 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    
    <button class="power-button" @click="togglePower" :title="isPoweredOn ? 'Power Off' : 'Power On'">
      {{ isPoweredOn ? 'CRT on' : 'CRT off' }}
    </button>
    
    <div class="info-display">
      {{ showStatic ? 'tuning in...' : fakeFilename }}
    </div>
    
    <button class="fullscreen-button" @click="toggleFullscreen" title="Toggle Fullscreen">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M2.5 1H1V2.5M8.5 1H10V2.5M10 7.5V9H8.5M1 7.5V9H2.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
import { useVibeConfig } from '~/composables/useVibeConfig'

const { getCurrentVideoPlaylist, currentVibe } = useVibeConfig()

// Constants
const DURATIONS = {
  VIDEO: 15000, // 15 seconds
  STATIC: 4000, // 4 seconds
  POWER_OFF: 1500, // 1.5 seconds
  STATIC_DELAY: 100 // Small delay to ensure static shows first
}

const VIDEO_EXTENSIONS = ['.mov', '.mp4', '.avi', '.mkv', '.webm', '.qt', '.wmv', '.m4v', '.mpeg']

const FULLSCREEN_EVENTS = [
  'fullscreenchange',
  'webkitfullscreenchange', 
  'mozfullscreenchange',
  'MSFullscreenChange'
]

// State
const videoPlaylist = computed(() => getCurrentVideoPlaylist())
let player = null
let cycleTimer = null

const showStatic = ref(false)
const isPoweredOn = ref(false)
const showPowerOffStatic = ref(false)
const showPowerOnStatic = ref(false)
const isPoweringOn = ref(false)
const currentVideoIndex = ref(0)
const currentVideoTitle = ref('Loading...')

// Utility functions
const getRandomVideoIndex = () => {
  const playlist = videoPlaylist.value
  return playlist.length > 0 ? Math.floor(Math.random() * playlist.length) : 0
}

const getCurrentVideoDuration = () => {
  const currentVideo = videoPlaylist.value[currentVideoIndex.value]
  if (currentVideo?.playDuration > 0) {
    const duration = currentVideo.playDuration * 1000
    console.log(`Using custom playDuration: ${currentVideo.playDuration}s (${duration}ms) for video: ${currentVideo.id}`)
    return duration
  }
  console.log(`Using default VIDEO_DURATION: ${DURATIONS.VIDEO}ms for video: ${currentVideo?.id}`)
  return DURATIONS.VIDEO
}

const logVideoInfo = (action, videoIndex, video) => {
  const duration = video.playDuration > 0 ? `${video.playDuration}s` : 'default'
  console.log(`${action}: Playing video ${videoIndex + 1}/${videoPlaylist.value.length}: ${video.id} (start: ${video.startTime}s, duration: ${duration})`)
}

const loadVideoWithStatic = (newIndex, action = 'Auto') => {
  pauseVideoCycle()
  showStatic.value = true
  
  setTimeout(() => {
    currentVideoIndex.value = newIndex
    const currentVideo = videoPlaylist.value[currentVideoIndex.value]
    
    logVideoInfo(action, currentVideoIndex.value, currentVideo)
    
    if (player?.loadVideoById) {
      player.loadVideoById({
        videoId: currentVideo.id,
        startSeconds: currentVideo.startTime
      })
    }
    
    setTimeout(() => {
      showStatic.value = false
      updateVideoTitle()
      resumeVideoCycle()
    }, DURATIONS.STATIC)
  }, DURATIONS.STATIC_DELAY)
}

const cycleToNextVideo = () => {
  const nextIndex = (currentVideoIndex.value + 1) % videoPlaylist.value.length
  loadVideoWithStatic(nextIndex, 'Auto')
}

const nextVideo = () => {
  const nextIndex = (currentVideoIndex.value + 1) % videoPlaylist.value.length
  loadVideoWithStatic(nextIndex, 'Manual next')
}

const previousVideo = () => {
  const prevIndex = currentVideoIndex.value === 0 
    ? videoPlaylist.value.length - 1 
    : currentVideoIndex.value - 1
  loadVideoWithStatic(prevIndex, 'Manual previous')
}

// Timer management
const startVideoCycle = () => {
  const duration = getCurrentVideoDuration()
  cycleTimer = setInterval(cycleToNextVideo, duration)
}

const pauseVideoCycle = () => {
  if (cycleTimer) {
    clearInterval(cycleTimer)
    cycleTimer = null
  }
}

const resumeVideoCycle = () => {
  if (!cycleTimer) {
    const duration = getCurrentVideoDuration()
    cycleTimer = setInterval(cycleToNextVideo, duration)
  }
}

// YouTube API management
const loadYouTubeAPI = () => {
  return new Promise((resolve) => {
    if (window.YT) {
      resolve(window.YT)
      return
    }

    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = () => {
      resolve(window.YT)
    }
  })
}

// Initialize YouTube player
const initPlayer = async () => {
  const YT = await loadYouTubeAPI()
  
  // Set initial video index to a random video
  currentVideoIndex.value = getRandomVideoIndex()
  
  player = new YT.Player('youtube-player', {
    height: '360',
    width: '640',
    videoId: videoPlaylist.value[currentVideoIndex.value].id,
    playerVars: {
      autoplay: 0,
      mute: 1,
      loop: 0,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      fs: 1,
      iv_load_policy: 3,
      cc_load_policy: 0,
      disablekb: 1,
      enablejsapi: 1,
      origin: window.location.origin,
      start: videoPlaylist.value[currentVideoIndex.value].startTime
    },
    events: {
      onReady: () => {
        console.log('YouTube player ready')
        // Hide overlays after player is ready
        hideYouTubeOverlays()
      },
      onStateChange: (event) => {
        // Handle player state changes
        if (event.data === YT.PlayerState.ENDED) {
          // Video ended, cycle to next
          cycleToNextVideo()
        }
      }
    }
  })
}

// Power management
const powerOn = () => {
  if (!isPoweredOn.value) {
    // Powering on
    isPoweringOn.value = true
    
    // Step 1: Show static overlay underneath black overlay
    showPowerOnStatic.value = true
    
    // Step 2: Start playing the video (but it's still hidden by overlays)
    if (player) {
      player.playVideo()
      // Start the video cycling timer
      startVideoCycle()
    }
    
    // Step 3: Start fading the black overlay to reveal static after animation starts
    setTimeout(() => {
      const powerOffOverlay = document.querySelector('.power-off-overlay')
      if (powerOffOverlay) {
        powerOffOverlay.style.transition = 'opacity 1s ease-in-out'
        powerOffOverlay.style.opacity = '0'
      }
    }, 500) // Delay to let the static animation start first
    
    // Step 4: After black overlay fades, hide static to reveal video
    setTimeout(() => {
      showPowerOnStatic.value = false
      showStatic.value = false // Hide the initial static overlay
      isPoweredOn.value = true
      isPoweringOn.value = false
      
      // Update video title when powering back on
      updateVideoTitle()
      
      // Reset black overlay opacity for next power-off
      const powerOffOverlay = document.querySelector('.power-off-overlay')
      if (powerOffOverlay) {
        powerOffOverlay.style.opacity = '1'
        powerOffOverlay.style.transition = ''
      }
    }, DURATIONS.STATIC)
  }
}

// Power toggle functionality
const togglePower = () => {
  if (isPoweredOn.value) {
    // Powering off
    isPoweredOn.value = false
    
    // Clear the video info immediately when powering off
    currentVideoTitle.value = ''
    
    // Show power-off static animation first
    showPowerOffStatic.value = true
    
    if (player) {
      player.pauseVideo()
      pauseVideoCycle()
    }
    
    // Hide the static after animation completes
    setTimeout(() => {
      showPowerOffStatic.value = false
    }, DURATIONS.POWER_OFF)
  } else {
    // Powering on - use the same logic as powerOn()
    powerOn()
  }
}

// Fullscreen management
const toggleFullscreen = () => {
  const videoContainer = document.querySelector('.video-container')
  
  if (!document.fullscreenElement) {
    const requestMethods = [
      'requestFullscreen',
      'webkitRequestFullscreen', 
      'msRequestFullscreen'
    ]
    
    for (const method of requestMethods) {
      if (videoContainer[method]) {
        videoContainer[method]()
        break
      }
    }
  } else {
    const exitMethods = [
      'exitFullscreen',
      'webkitExitFullscreen',
      'msExitFullscreen'
    ]
    
    for (const method of exitMethods) {
      if (document[method]) {
        document[method]()
        break
      }
    }
  }
}

// Handle fullscreen change events to resize player
const handleFullscreenChange = () => {
  if (player?.getIframe) {
    setTimeout(() => {
      const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement
      const iframe = player.getIframe()
      
      if (isFullscreen) {
        iframe.width = window.innerWidth
        iframe.height = window.innerHeight - 20
      } else {
        iframe.width = 640
        iframe.height = 360
      }
    }, 100)
  }
}

// Video title management
const updateVideoTitle = () => {
  if (player?.getVideoData) {
    try {
      const videoData = player.getVideoData()
      currentVideoTitle.value = videoData?.title || `Video ${currentVideoIndex.value + 1} of ${videoPlaylist.value.length}`
    } catch (error) {
      console.log('Unable to get video title:', error)
      currentVideoTitle.value = `Video ${currentVideoIndex.value + 1} of ${videoPlaylist.value.length}`
    }
  } else {
    currentVideoTitle.value = `Video ${currentVideoIndex.value + 1} of ${videoPlaylist.value.length}`
  }
}

// YouTube overlay management
const hideYouTubeOverlays = () => {
  const hideOverlays = () => {
    const iframe = document.querySelector('#youtube-player iframe')
    if (iframe?.contentDocument) {
      try {
        const elements = iframe.contentDocument.querySelectorAll('[class*="ytp-"]')
        elements.forEach(el => {
          el.style.display = 'none'
          el.style.opacity = '0'
          el.style.visibility = 'hidden'
          el.style.pointerEvents = 'none'
        })
      } catch {
        console.log('Cannot access iframe content due to CORS')
      }
    }
  }

  // Hide overlays immediately and on intervals
  hideOverlays()
  setInterval(hideOverlays, 1000)
  
  // Also hide on mouse events
  const playerElement = document.querySelector('#youtube-player')
  if (playerElement) {
    ['mouseenter', 'mouseover', 'mousemove'].forEach(event => {
      playerElement.addEventListener(event, hideOverlays)
    })
  }
}

// Event listener management
const addFullscreenListeners = () => {
  FULLSCREEN_EVENTS.forEach(event => {
    document.addEventListener(event, handleFullscreenChange)
  })
}

const removeFullscreenListeners = () => {
  FULLSCREEN_EVENTS.forEach(event => {
    document.removeEventListener(event, handleFullscreenChange)
  })
}

// Computed properties
const fakeFilename = computed(() => {
  if (!isPoweredOn.value) return ''
  if (showStatic.value) return 'tuning in...'
  
  const words = currentVideoTitle.value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0)
    .slice(0, 4)
    .join('_')
  
  const randomExtension = VIDEO_EXTENSIONS[Math.floor(Math.random() * VIDEO_EXTENSIONS.length)]
  return `${words}${randomExtension}`
})

// Watchers
watch(currentVibe, () => {
  if (player) {
    pauseVideoCycle()
    showStatic.value = true
    
    setTimeout(() => {
      currentVideoIndex.value = getRandomVideoIndex()
      const currentVideo = videoPlaylist.value[currentVideoIndex.value]
      
      if (currentVideo && player.loadVideoById) {
        logVideoInfo('Vibe changed', currentVideoIndex.value, currentVideo)
        player.loadVideoById({
          videoId: currentVideo.id,
          startSeconds: currentVideo.startTime
        })
      }
      
      setTimeout(() => {
        showStatic.value = false
        updateVideoTitle()
        resumeVideoCycle()
      }, DURATIONS.STATIC)
    }, DURATIONS.STATIC_DELAY)
  }
})

// Lifecycle
onMounted(() => {
  initPlayer()
  addFullscreenListeners()
})

onUnmounted(() => {
  if (player?.destroy) {
    player.destroy()
  }
  removeFullscreenListeners()
})

// Expose methods
defineExpose({ powerOn })
</script>

<style scoped>
.video-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
}

.player-wrapper {
  position: relative;
  width: 640px;
  height: 360px;
  max-width: 100%;
  max-height: 100%;
}

.youtube-player {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.player-logo {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 72px;
  height: auto;
  z-index: 500; /* Above video, below static overlay */
  opacity: 0.8;
  pointer-events: none;
  mix-blend-mode: multiply; /* Makes white background transparent, keeps black visible */
}

/* Responsive design */
@media (max-width: 768px) {
  .player-wrapper {
    width: 100%;
    height: 240px;
  }
}

@media (max-width: 480px) {
  .player-wrapper {
    height: 200px;
  }
}

/* YouTube overlay hiding - consolidated rules */
:global(.ytp-watermark),
:global(.ytp-show-cards-title),
:global(.ytp-pause-overlay),
:global(.ytp-gradient-top),
:global(.ytp-gradient-bottom),
:global(.ytp-chrome-top),
:global(.ytp-chrome-bottom),
:global(.ytp-large-play-button),
:global(.ytp-button),
:global(.ytp-title),
:global(.ytp-youtube-button),
:global(.ytp-fullscreen-button),
:global(.ytp-cued-thumbnail-overlay),
:global([class*="ytp-"]) {
  display: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
  transform: scale(0) !important;
  width: 0 !important;
  height: 0 !important;
  overflow: hidden !important;
}

/* Static overlays */
.tv-static,
.power-on-static {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  background-image: repeating-radial-gradient(circle at 17% 32%, white, black 0.00085px);
  animation: back 5s linear infinite;
}

.power-on-static {
  z-index: 1400;
  border-radius: 12px;
  pointer-events: none;
}

@keyframes back {
  from { background-size: 100% 100%; }
  to { background-size: 200% 200%; }
}

/* Power overlays */
.power-off-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1500;
  background: black;
  border-radius: 12px;
  pointer-events: none;
}

.power-off-static {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1600;
  background-image: repeating-radial-gradient(circle at 17% 32%, white, black 0.00085px);
  border-radius: 12px;
  pointer-events: none;
  animation: powerOffShrink 1.5s ease-in-out forwards, back 5s linear infinite;
}

@keyframes powerOffShrink {
  0% { height: 100%; opacity: 1; top: 0; }
  50% { height: 100%; opacity: 0.8; top: 0; }
  90% { height: 2px; opacity: 0.6; top: calc(50% - 1px); }
  100% { height: 0px; opacity: 0; top: 50%; }
}

/* CRT overlay */
.crt-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 1px,
    rgba(0, 0, 0, 0.4) 1px,
    rgba(0, 0, 0, 0.4) 2px
  );
  border-radius: 12px;
  overflow: hidden;
}

.crt-overlay::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    ellipse at center,
    transparent 0%,
    transparent 80%,
    rgba(0, 0, 0, 0.1) 100%
  );
  animation: crtFlicker 0.15s infinite linear;
}

.crt-overlay::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.02) 50%,
    transparent 100%
  );
  animation: crtScan 2s infinite linear;
}

@keyframes crtFlicker {
  0% { opacity: 1; }
  98% { opacity: 1; }
  99% { opacity: 0.85; }
  100% { opacity: 1; }
}

@keyframes crtScan {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Iframe and pointer events */
:global(iframe[src*="youtube"]),
:global(iframe[src*="youtube"] *),
.youtube-player iframe {
  pointer-events: none;
}

.youtube-player:hover :global([class*="ytp-"]) {
  display: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
}

/* Control Bar */
.control-bar {
  display: flex;
  align-items: center;
  width: 640px;
  max-width: 100%;
  height: 16px;
  padding: 0 6px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 0 0 6px 6px;
  gap: 6px;
}

.nav-button,
.power-button,
.fullscreen-button {
  width: 10px;
  height: 10px;
  min-width: 10px;
  min-height: 10px;
  padding: 0;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: rgba(255, 255, 255, 0.8);
}

.nav-button:hover,
.power-button:hover,
.fullscreen-button:hover {
  background: rgba(255, 255, 255, 0.4);
  color: rgba(255, 255, 255, 1);
  transform: scale(1.1);
}

.nav-button:active,
.power-button:active,
.fullscreen-button:active {
  transform: scale(0.95);
}

.power-button {
  background: rgba(255, 255, 255, 0.15);
  font-size: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
  white-space: nowrap;
  padding: 0 4px;
  min-width: auto;
  width: auto;
}

.power-button:hover {
  background: rgba(255, 255, 255, 0.35);
  color: rgba(255, 255, 255, 1);
}

.info-display {
  flex: 1;
  font-size: 8px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .control-bar { width: 100%; }
  .info-display { font-size: 7px; }
}

@media (max-width: 480px) {
  .info-display { font-size: 6px; }
}

/* Fullscreen styles - consolidated */
.video-container:fullscreen,
.video-container:-webkit-full-screen {
  width: 100vw !important;
  height: 100vh !important;
  background: black;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0;
  margin: 0;
}

.video-container:fullscreen .player-wrapper,
.video-container:-webkit-full-screen .player-wrapper {
  width: 100vw !important;
  height: calc(100vh - 20px) !important;
  max-width: none !important;
  max-height: none !important;
}

.video-container:fullscreen .youtube-player,
.video-container:-webkit-full-screen .youtube-player {
  width: 100% !important;
  height: 100% !important;
}

.video-container:fullscreen .control-bar,
.video-container:-webkit-full-screen .control-bar {
  width: 100vw !important;
  height: 20px !important;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 0;
}
</style> 