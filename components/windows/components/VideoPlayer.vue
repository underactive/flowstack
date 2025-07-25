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

// Reactive video playlist that updates with vibe changes
const videoPlaylist = computed(() => getCurrentVideoPlaylist())
let player = null
const showStatic = ref(true)
const isPoweredOn = ref(true)
const showPowerOffStatic = ref(false)
const showPowerOnStatic = ref(false)
const isPoweringOn = ref(false)
const currentVideoIndex = ref(0)
const currentVideoTitle = ref('Loading...')

// Function to get a random video index
const getRandomVideoIndex = () => {
  const playlist = videoPlaylist.value
  return playlist.length > 0 ? Math.floor(Math.random() * playlist.length) : 0
}

// Duration constants (in milliseconds)
const VIDEO_DURATION = 25000 // 25 seconds
const STATIC_DURATION = 4000 // 5 seconds

// Video file extensions for fake filename
const videoExtensions = ['.mov', '.mp4', '.avi', '.mkv', '.webm', '.qt', '.wmv', '.m4v', '.mpeg']

// Computed property to create fake unix-style filename
const fakeFilename = computed(() => {
  // Return empty string when CRT is powered off
  if (!isPoweredOn.value) {
    return ''
  }
  
  // Take first 4 words, convert to lowercase, replace spaces with underscores
  const words = currentVideoTitle.value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters except spaces
    .split(/\s+/) // Split on whitespace
    .filter(word => word.length > 0) // Remove empty strings
    .slice(0, 4) // Take first 4 words
    .join('_') // Join with underscores
  
  // Get random video extension
  const randomExtension = videoExtensions[Math.floor(Math.random() * videoExtensions.length)]
  
  return `${words}${randomExtension}`
})

// Load YouTube IFrame API
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
      autoplay: 1,
      mute: 1,
      loop: 0, // Disable loop since we're manually cycling
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
      onReady: (_event) => {
        console.log('YouTube player ready')
        // Hide overlays after player is ready
        hideYouTubeOverlays()
        // Start the video cycling timer
        startVideoCycle()
        // Update video title when player is ready (with delay to ensure video data is loaded)
        setTimeout(() => {
          updateVideoTitle()
        }, 1000)
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

// Start video cycling timer
let cycleTimer = null

// Function to get the current video's play duration
const getCurrentVideoDuration = () => {
  const currentVideo = videoPlaylist.value[currentVideoIndex.value]
  if (currentVideo && currentVideo.playDuration > 0) {
    const duration = currentVideo.playDuration * 1000 // Convert seconds to milliseconds
    console.log(`Using custom playDuration: ${currentVideo.playDuration}s (${duration}ms) for video: ${currentVideo.id}`)
    return duration
  }
  console.log(`Using default VIDEO_DURATION: ${VIDEO_DURATION}ms for video: ${currentVideo?.id}`)
  return VIDEO_DURATION // Use default duration if playDuration is 0
}

const startVideoCycle = () => {
  const duration = getCurrentVideoDuration()
  cycleTimer = setInterval(() => {
    cycleToNextVideo()
  }, duration)
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
    cycleTimer = setInterval(() => {
      cycleToNextVideo()
    }, duration)
  }
}

// Cycle to next video in playlist
const cycleToNextVideo = () => {
  // Pause the cycle timer during static overlay
  pauseVideoCycle()
  
  // Show static overlay
  showStatic.value = true
  
  // Wait for static to show, then load next video
  setTimeout(() => {
    currentVideoIndex.value = (currentVideoIndex.value + 1) % videoPlaylist.value.length
    const currentVideo = videoPlaylist.value[currentVideoIndex.value]
    
    console.log(`Playing video ${currentVideoIndex.value + 1}/${videoPlaylist.value.length}: ${currentVideo.id} (start: ${currentVideo.startTime}s, duration: ${currentVideo.playDuration > 0 ? currentVideo.playDuration + 's' : 'default'})`)
    
    if (player && player.loadVideoById) {
      player.loadVideoById({
        videoId: currentVideo.id,
        startSeconds: currentVideo.startTime
      })
    }
    
    // Hide static after video loads and resume timer
    setTimeout(() => {
      showStatic.value = false
      // Update video title immediately when static disappears
      updateVideoTitle()
      // Resume the cycle timer after static disappears with new video's duration
      resumeVideoCycle()
    }, STATIC_DURATION)
  }, 100) // Small delay to ensure static shows first
}

// Manual navigation functions
const nextVideo = () => {
  // Pause auto-cycling temporarily
  pauseVideoCycle()
  
  // Show static overlay
  showStatic.value = true
  
  setTimeout(() => {
    currentVideoIndex.value = (currentVideoIndex.value + 1) % videoPlaylist.value.length
    const currentVideo = videoPlaylist.value[currentVideoIndex.value]
    
    console.log(`Manual next: Playing video ${currentVideoIndex.value + 1}/${videoPlaylist.value.length}: ${currentVideo.id} (start: ${currentVideo.startTime}s, duration: ${currentVideo.playDuration > 0 ? currentVideo.playDuration + 's' : 'default'})`)
    
    if (player && player.loadVideoById) {
      player.loadVideoById({
        videoId: currentVideo.id,
        startSeconds: currentVideo.startTime
      })
    }
    
    setTimeout(() => {
      showStatic.value = false
      // Update video title immediately when static disappears
      updateVideoTitle()
      // Resume auto-cycling with new video's duration
      resumeVideoCycle()
    }, STATIC_DURATION)
  }, 100)
}

const previousVideo = () => {
  // Pause auto-cycling temporarily
  pauseVideoCycle()
  
  // Show static overlay
  showStatic.value = true
  
  setTimeout(() => {
    // Go to previous video with wrap-around (if at 0, go to last video)
    currentVideoIndex.value = currentVideoIndex.value === 0 
      ? videoPlaylist.value.length - 1 
      : currentVideoIndex.value - 1
    
    const currentVideo = videoPlaylist.value[currentVideoIndex.value]
    
    console.log(`Manual previous: Playing video ${currentVideoIndex.value + 1}/${videoPlaylist.value.length}: ${currentVideo.id} (start: ${currentVideo.startTime}s, duration: ${currentVideo.playDuration > 0 ? currentVideo.playDuration + 's' : 'default'})`)
    
    if (player && player.loadVideoById) {
      player.loadVideoById({
        videoId: currentVideo.id,
        startSeconds: currentVideo.startTime
      })
    }
    
    setTimeout(() => {
      showStatic.value = false
      // Update video title immediately when static disappears
      updateVideoTitle()
      // Resume auto-cycling with new video's duration
      resumeVideoCycle()
    }, STATIC_DURATION)
  }, 100)
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
    }, 1500) // 1.5 seconds for the power-down animation
  } else {
    // Powering on
    isPoweringOn.value = true
    
    // Step 1: Show static overlay underneath black overlay
    showPowerOnStatic.value = true
    
    // Step 2: Unpause the video (but it's still hidden by overlays)
    if (player) {
      player.playVideo()
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
      isPoweredOn.value = true
      isPoweringOn.value = false
      resumeVideoCycle()
      
      // Restore the video info when powering back on
      updateVideoTitle()
      
      // Reset black overlay opacity for next power-off
      const powerOffOverlay = document.querySelector('.power-off-overlay')
      if (powerOffOverlay) {
        powerOffOverlay.style.opacity = '1'
        powerOffOverlay.style.transition = ''
      }
    }, 1200) // 1 second for fade + 200ms buffer
  }
}

// Fullscreen functionality
const toggleFullscreen = () => {
  const videoContainer = document.querySelector('.video-container')
  
  if (!document.fullscreenElement) {
    // Enter fullscreen
    if (videoContainer.requestFullscreen) {
      videoContainer.requestFullscreen()
    } else if (videoContainer.webkitRequestFullscreen) {
      videoContainer.webkitRequestFullscreen()
    } else if (videoContainer.msRequestFullscreen) {
      videoContainer.msRequestFullscreen()
    }
  } else {
    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    }
  }
}

// Handle fullscreen change events to resize player
const handleFullscreenChange = () => {
  if (player && player.getIframe) {
    setTimeout(() => {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        // In fullscreen - resize to full viewport
        player.getIframe().width = window.innerWidth
        player.getIframe().height = window.innerHeight - 20 // Leave space for control bar
      } else {
        // Exit fullscreen - restore original size
        player.getIframe().width = 640
        player.getIframe().height = 360
      }
    }, 100)
  }
}

// Function to update video title from YouTube API
const updateVideoTitle = () => {
  if (player && player.getVideoData) {
    try {
      const videoData = player.getVideoData()
      if (videoData && videoData.title) {
        currentVideoTitle.value = videoData.title
      } else {
        currentVideoTitle.value = `Video ${currentVideoIndex.value + 1} of ${videoPlaylist.value.length}`
      }
    } catch (error) {
      console.log('Unable to get video title:', error)
      currentVideoTitle.value = `Video ${currentVideoIndex.value + 1} of ${videoPlaylist.value.length}`
    }
  } else {
    currentVideoTitle.value = `Video ${currentVideoIndex.value + 1} of ${videoPlaylist.value.length}`
  }
}

// Watch for vibe changes and reload player
watch(currentVibe, () => {
  if (player) {
    // Pause auto-cycling temporarily
    pauseVideoCycle()
    
    // Show static overlay
    showStatic.value = true
    
    setTimeout(() => {
      // Start at a random video in the new playlist
      currentVideoIndex.value = getRandomVideoIndex()
      // Reload player with new video
      const currentVideo = videoPlaylist.value[currentVideoIndex.value]
      if (currentVideo && player.loadVideoById) {
        console.log(`Vibe changed: Playing video ${currentVideoIndex.value + 1}/${videoPlaylist.value.length}: ${currentVideo.id} (start: ${currentVideo.startTime}s, duration: ${currentVideo.playDuration > 0 ? currentVideo.playDuration + 's' : 'default'})`)
        player.loadVideoById({
          videoId: currentVideo.id,
          startSeconds: currentVideo.startTime
        })
      }
      
      // Hide static after video loads and resume timer
      setTimeout(() => {
        showStatic.value = false
        // Update video title immediately when static disappears
        updateVideoTitle()
        // Resume the cycle timer after static disappears with new video's duration
        resumeVideoCycle()
      }, STATIC_DURATION)
    }, 100) // Small delay to ensure static shows first
  }
})

// Function to hide YouTube overlays
const hideYouTubeOverlays = () => {
  const hideOverlays = () => {
    const iframe = document.querySelector('#youtube-player iframe')
    if (iframe && iframe.contentDocument) {
      try {
        const elements = iframe.contentDocument.querySelectorAll('[class*="ytp-"]')
        elements.forEach(el => {
          el.style.display = 'none'
          el.style.opacity = '0'
          el.style.visibility = 'hidden'
          el.style.pointerEvents = 'none'
        })
      } catch {
        // Cross-origin restrictions might prevent this
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
    playerElement.addEventListener('mouseenter', hideOverlays)
    playerElement.addEventListener('mouseover', hideOverlays)
    playerElement.addEventListener('mousemove', hideOverlays)
  }
}

onMounted(() => {
  initPlayer()
  
  // Hide initial static overlay after STATIC_DURATION
  setTimeout(() => {
    showStatic.value = false
  }, STATIC_DURATION)
  
  // Add fullscreen change listeners
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.addEventListener('mozfullscreenchange', handleFullscreenChange)
  document.addEventListener('MSFullscreenChange', handleFullscreenChange)
})

onUnmounted(() => {
  if (player && player.destroy) {
    player.destroy()
  }
  
  // Remove fullscreen change listeners
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
  document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
})
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

/* Hide YouTube overlay elements - Global approach */
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
}

/* Static overlay to hide YouTube initial overlay */
.tv-static {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  background-image: repeating-radial-gradient(circle at 17% 32%, white, black 0.00085px);
  animation: back 5s linear infinite;
}

@keyframes back {
    from {
    background-size: 100% 100%;
  }
  to {
    background-size: 200% 200%;
  }
}

/* Power off overlay */
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

/* Power off static animation */
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
  0% {
    height: 100%;
    opacity: 1;
    top: 0;
  }
  50% {
    height: 100%;
    opacity: 0.8;
    top: 0;
  }
  90% {
    height: 2px;
    opacity: 0.6;
    top: calc(50% - 1px);
  }
  100% {
    height: 0px;
    opacity: 0;
    top: 50%;
  }
}

/* Power on static overlay */
.power-on-static {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1400;
  background-image: repeating-radial-gradient(circle at 17% 32%, white, black 0.00085px);
  border-radius: 12px;
  pointer-events: none;
  animation: back 5s linear infinite;
}

/* CRT overlay with interlaced scan lines */
.crt-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000;
  pointer-events: none;
  background: 
    repeating-linear-gradient(
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
  background: 
    radial-gradient(
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
  background: 
    linear-gradient(
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

/* Additional global rules for iframe content */
:global(iframe[src*="youtube"]) {
  pointer-events: none;
}

:global(iframe[src*="youtube"] * ) {
  pointer-events: none !important;
}

/* Target YouTube iframe specifically */
.youtube-player iframe {
  pointer-events: none;
}

/* Force hide on hover */
.youtube-player:hover :global([class*="ytp-"]) {
  display: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
}

/* Additional aggressive hiding */
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
:global(.ytp-cued-thumbnail-overlay) {
  display: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
  transform: scale(0) !important;
  width: 0 !important;
  height: 0 !important;
  overflow: hidden !important;
}

/* Control Bar Styles */
.control-bar {
  display: flex;
  align-items: center;
  width: 640px;
  max-width: 100%;
  height: 16px;
  padding-left: 6px;
  padding-right: 6px;
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

/* Responsive adjustments for control bar */
@media (max-width: 768px) {
  .control-bar {
    width: 100%;
  }
  
  .info-display {
    font-size: 7px;
  }
}

@media (max-width: 480px) {
  .info-display {
    font-size: 6px;
  }
}

/* Fullscreen styles */
.video-container:fullscreen {
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

.video-container:fullscreen .player-wrapper {
  width: 100vw !important;
  height: calc(100vh - 20px) !important; /* Leave space for control bar */
  max-width: none !important;
  max-height: none !important;
}

.video-container:fullscreen .youtube-player {
  width: 100% !important;
  height: 100% !important;
}

.video-container:fullscreen .control-bar {
  width: 100vw !important;
  height: 20px !important;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 0;
}

/* Webkit fullscreen support */
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

.video-container:-webkit-full-screen .player-wrapper {
  width: 100vw !important;
  height: calc(100vh - 20px) !important;
  max-width: none !important;
  max-height: none !important;
}

.video-container:-webkit-full-screen .youtube-player {
  width: 100% !important;
  height: 100% !important;
}

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