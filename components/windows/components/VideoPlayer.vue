<template>
  <div class="video-container">
    <div class="player-wrapper">
      <div id="youtube-player" class="youtube-player"/>
      <img src="/images/player/player_logo.svg" alt="Player Logo" class="player-logo" />
      <div v-if="showStatic" class="tv-static"/>
      <div class="crt-overlay"/>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

// YouTube video playlist with start times (in seconds)
const videoPlaylist = [
  { id: 'Iv76oc22Qr4', startTime: 2 },
  { id: 'ibNrPjETR_k', startTime: 145 },
  { id: 'cOEZgwFcpF0', startTime: 8 },
  { id: 'J_Dxhr_kXGk', startTime: 33 },
  { id: 'k3WkJq478To', startTime: 5 },
  { id: 'rDBbaGCCIhk', startTime: 90 },
]
let player = null
const showStatic = ref(true)
const currentVideoIndex = ref(0)

// Duration constants (in milliseconds)
const VIDEO_DURATION = 12000 // 12 seconds
const STATIC_DURATION = 4500 // 4 seconds

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
  
  player = new YT.Player('youtube-player', {
    height: '360',
    width: '640',
    videoId: videoPlaylist[currentVideoIndex.value].id,
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
      start: videoPlaylist[currentVideoIndex.value].startTime
    },
    events: {
      onReady: (_event) => {
        console.log('YouTube player ready')
        // Hide overlays after player is ready
        hideYouTubeOverlays()
        // Start the video cycling timer
        startVideoCycle()
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

const startVideoCycle = () => {
  cycleTimer = setInterval(() => {
    cycleToNextVideo()
  }, VIDEO_DURATION)
}

const pauseVideoCycle = () => {
  if (cycleTimer) {
    clearInterval(cycleTimer)
    cycleTimer = null
  }
}

const resumeVideoCycle = () => {
  if (!cycleTimer) {
    cycleTimer = setInterval(() => {
      cycleToNextVideo()
    }, VIDEO_DURATION)
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
    currentVideoIndex.value = (currentVideoIndex.value + 1) % videoPlaylist.length
    const currentVideo = videoPlaylist[currentVideoIndex.value]
    
    console.log(`Playing video ${currentVideoIndex.value + 1}/${videoPlaylist.length}: ${currentVideo.id} (start: ${currentVideo.startTime}s)`)
    
    if (player && player.loadVideoById) {
      player.loadVideoById({
        videoId: currentVideo.id,
        startSeconds: currentVideo.startTime
      })
    }
    
    // Hide static after video loads and resume timer
    setTimeout(() => {
      showStatic.value = false
      // Resume the cycle timer after static disappears
      resumeVideoCycle()
    }, STATIC_DURATION)
  }, 100) // Small delay to ensure static shows first
}

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
})

onUnmounted(() => {
  if (player && player.destroy) {
    player.destroy()
  }
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
      transparent 2px,
      rgba(0, 0, 0, 0.4) 2px,
      rgba(0, 0, 0, 0.4) 4px
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
</style> 