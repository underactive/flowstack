<template>
  <div class="music-player">
    <!-- Track Info Section -->
    <div class="track-info">
      <div class="track-title" :class="{ 'loading': isLoadingTrack }">
        {{ isLoadingTrack ? 'Loading track...' : (currentTrack.title || 'No track loaded') }}
      </div>
      <div class="track-artist" :class="{ 'loading': isLoadingTrack }">
        {{ isLoadingTrack ? 'Please wait' : (currentTrack.artist || '---') }}
      </div>
      <div class="time-info">
        <span class="time-elapsed">{{ formatTime(currentTime) }}</span>
        <span class="time-separator">•</span>
        <span class="time-total">{{ formatTime(duration) }}</span>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="progress-container">
      <input 
        type="range" 
        class="progress-bar"
        :value="currentTime"
        :max="duration"
        @input="seekTo($event.target.value)"
        @mousedown="seeking = true"
        @mouseup="seeking = false"
      />
      <div class="progress-track"></div>
      <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
    </div>

    <!-- Controls Section -->
    <div class="controls-container">
      <div class="transport-controls">
        <button class="control-btn repeat-btn" @click="toggleRepeat" :class="{ active: repeatMode }" title="Repeat">
          <svg width="16" height="16" viewBox="0 0 20 20">
            <path d="M4 5h10l-2-2M16 15H6l2 2M4 10v5h12v-5" stroke="currentColor" stroke-width="1.5" fill="none"/>
          </svg>
        </button>

        <button class="control-btn prev-btn" @click="previousTrack" title="Previous">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M6 4v16l6-4.5L18 20V4l-6 4.5z" fill="currentColor"/>
            <rect x="4" y="4" width="2" height="16" fill="currentColor"/>
          </svg>
        </button>
        
        <button class="control-btn play-btn" @click="togglePlayPause" title="Play/Pause">
          <svg v-if="!isPlaying" width="24" height="24" viewBox="0 0 32 32">
            <path d="M8 4v24l20-12z" fill="currentColor"/>
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 32 32">
            <rect x="10" y="6" width="4" height="20" fill="currentColor"/>
            <rect x="18" y="6" width="4" height="20" fill="currentColor"/>
          </svg>
        </button>
        
        <button class="control-btn next-btn" @click="nextTrack" title="Next">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M18 4v16l-6-4.5L6 20V4l6 4.5z" fill="currentColor"/>
            <rect x="18" y="4" width="2" height="16" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <div class="volume-control">
        <button class="volume-btn" @click="toggleMute" title="Mute/Unmute">
          <svg v-if="volume > 0" width="16" height="16" viewBox="0 0 20 20">
            <path d="M3 7v6h3l4 4V3L6 7zM13 10c0-1-.4-1.8-.9-2.4M16 10c0-2-.8-3.8-2-5.2" stroke="currentColor" stroke-width="1.5" fill="none"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 20 20">
            <path d="M3 7v6h3l4 4V3L6 7zM11 6l4 4M11 14l4-4" stroke="currentColor" stroke-width="1.5" fill="none"/>
          </svg>
        </button>
        <input 
          type="range" 
          class="volume-slider"
          v-model="volume"
          min="0"
          max="100"
          @input="updateVolume"
        />
      </div>
    </div>

    <!-- Status Indicators -->
    <div class="status-bar">
      <div class="status-indicator" :class="{ active: isPlaying }">
        {{ isPlaying ? 'Playing' : 'Paused' }}
      </div>
      <div class="status-indicator" :class="{ active: repeatMode }">
        Repeat
      </div>
    </div>

    <!-- Hidden SoundCloud Player for Audio -->
    <iframe 
      id="soundcloud-player"
      class="soundcloud-audio-player"
      :src="`https://w.soundcloud.com/player/?url=${encodeURIComponent(currentTrack.soundcloudUrl)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`"
      frameborder="0"
      allow="autoplay"
    ></iframe>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// State management
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(240) // Default 4 minutes
const volume = ref(75)
const seeking = ref(false)
const repeatMode = ref(false)
const isLoadingTrack = ref(false)

// Current track info
const currentTrack = ref({
  title: 'Older Girl', 
  artist: 'Omega Tribe', 
  soundcloudUrl: 'https://soundcloud.com/marvin-gabriel-169359727/older-girl-1986-omega-tribe'
})

// Playlist for demonstration (Real SoundCloud tracks - Creative Commons)
const playlist = ref([
  { 
    title: 'Older Girl', 
    artist: 'Omega Tribe', 
    soundcloudUrl: 'https://soundcloud.com/marvin-gabriel-169359727/older-girl-1986-omega-tribe'
  },
  { 
    title: 'Stay With Me', 
    artist: 'Miki Matsubara', 
    soundcloudUrl: 'https://soundcloud.com/miles-reid-80639115/miki-matsubara-stay-with-me'
  },
])

const currentTrackIndex = ref(0)

// SoundCloud Player
let musicPlayer = null

// Computed properties
const progressPercentage = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

// Time formatting
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// SoundCloud Integration
const loadSoundCloudAPI = () => {
  return new Promise((resolve) => {
    if (window.SC) {
      resolve(window.SC)
      return
    }

    const tag = document.createElement('script')
    tag.src = 'https://w.soundcloud.com/player/api.js'
    document.head.appendChild(tag)

    tag.onload = () => {
      resolve(window.SC)
    }
  })
}

const initMusicPlayer = async () => {
  try {
    await loadSoundCloudAPI()
    
    const iframe = document.querySelector('#soundcloud-player')
    if (iframe) {
      musicPlayer = window.SC.Widget(iframe)
      
      musicPlayer.bind(window.SC.Widget.Events.READY, () => {
        console.log('SoundCloud player ready')
        updatePlayerVolume()
        setupEventListeners()
      })
    }
  } catch (error) {
    console.error('Failed to initialize SoundCloud player:', error)
  }
}

const setupEventListeners = () => {
  if (!musicPlayer) return
  
  // Set up event listeners
  musicPlayer.bind(window.SC.Widget.Events.PLAY, () => {
    console.log('SoundCloud PLAY event')
    isPlaying.value = true
    startTimeUpdater()
  })
  
  musicPlayer.bind(window.SC.Widget.Events.PAUSE, () => {
    console.log('SoundCloud PAUSE event')
    isPlaying.value = false
    stopTimeUpdater()
  })
  
  musicPlayer.bind(window.SC.Widget.Events.FINISH, () => {
    console.log('SoundCloud FINISH event')
    isPlaying.value = false
    stopTimeUpdater()
    if (repeatMode.value) {
      musicPlayer.seekTo(0)
      musicPlayer.play()
    } else {
      nextTrack()
    }
  })
  
  // Handle when a new track is loaded and ready
  musicPlayer.bind(window.SC.Widget.Events.LOAD_PROGRESS, () => {
    // Update duration when track is loaded
    if (musicPlayer.getDuration) {
      musicPlayer.getDuration((duration_ms) => {
        duration.value = duration_ms / 1000
      })
    }
  })
}

// Time updater
let timeUpdateInterval = null

const startTimeUpdater = () => {
  stopTimeUpdater()
  timeUpdateInterval = setInterval(() => {
    if (musicPlayer && !seeking.value) {
      musicPlayer.getPosition((position) => {
        currentTime.value = position / 1000 // Convert to seconds
      })
      musicPlayer.getDuration((duration_ms) => {
        duration.value = duration_ms / 1000 // Convert to seconds
      })
    }
  }, 1000)
}

const stopTimeUpdater = () => {
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval)
    timeUpdateInterval = null
  }
}

// Control functions
const togglePlayPause = () => {
  if (!musicPlayer) return
  
  if (isPlaying.value) {
    musicPlayer.pause()
  } else {
    musicPlayer.play()
  }
}

const seekTo = (time) => {
  if (musicPlayer) {
    const timeMs = parseFloat(time) * 1000 // Convert to milliseconds
    musicPlayer.seekTo(timeMs)
    currentTime.value = parseFloat(time)
  }
}

const previousTrack = () => {
  const shouldKeepPlaying = isPlaying.value
  console.log('Previous track - current playing state:', shouldKeepPlaying)
  
  currentTrackIndex.value = currentTrackIndex.value > 0 
    ? currentTrackIndex.value - 1 
    : playlist.value.length - 1
  
  loadCurrentTrack(shouldKeepPlaying)
}

const nextTrack = () => {
  const shouldKeepPlaying = isPlaying.value
  console.log('Next track - current playing state:', shouldKeepPlaying)
  
  currentTrackIndex.value = (currentTrackIndex.value + 1) % playlist.value.length
  loadCurrentTrack(shouldKeepPlaying)
}

const loadCurrentTrack = (shouldAutoPlay = false) => {
  currentTrack.value = playlist.value[currentTrackIndex.value]
  
  console.log('Loading track:', currentTrack.value.title, 'shouldAutoPlay:', shouldAutoPlay)
  
  if (musicPlayer) {
    // Show loading state
    isLoadingTrack.value = true
    
    // Stop the current track first and reset state
    musicPlayer.pause()
    isPlaying.value = false
    stopTimeUpdater()
    currentTime.value = 0
    duration.value = 240 // Reset to default
    
    // Load the new track
    musicPlayer.load(currentTrack.value.soundcloudUrl, {
      auto_play: false,
      buying: false,
      liking: false,
      download: false,
      sharing: false,
      show_artwork: false,
      show_comments: false,
      show_playcount: false,
      show_user: false,
      start_track: 0
    })
    
    // Wait for track to load, then handle auto-play and hide loading
    setTimeout(() => {
      isLoadingTrack.value = false
      
      if (shouldAutoPlay && musicPlayer) {
        console.log('Attempting to auto-play loaded track')
        musicPlayer.play()
      }
      
      console.log('Track loading complete')
    }, 2500) // 2.5 second delay to ensure track is loaded
  }
}

const toggleRepeat = () => {
  repeatMode.value = !repeatMode.value
}

const toggleMute = () => {
  if (volume.value > 0) {
    volume.value = 0
  } else {
    volume.value = 75
  }
  updatePlayerVolume()
}

const updateVolume = () => {
  updatePlayerVolume()
}

const updatePlayerVolume = () => {
  if (musicPlayer) {
    // SoundCloud volume is 0-100
    musicPlayer.setVolume(volume.value)
  }
}

// Expose state for parent components
defineExpose({
  isPlaying
})

// Lifecycle
onMounted(() => {
  initMusicPlayer()
})

onUnmounted(() => {
  stopTimeUpdater()
  if (musicPlayer && musicPlayer.destroy) {
    musicPlayer.destroy()
  }
})
</script>

<style scoped>
.music-player {
  width: 100%;
  margin: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  padding: 20px 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Track Info Section */
.track-info {
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
}

.track-info .track-title,
.track-info .track-artist {
  transition: opacity 0.3s ease, font-style 0.3s ease;
}

.track-info .track-title.loading,
.track-info .track-artist.loading {
  opacity: 0.6;
  font-style: italic;
}

.track-title {
  font-weight: 700;
  font-size: 20px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.track-artist {
  font-size: 14px;
  opacity: 0.7;
  font-weight: 400;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.time-info {
  font-size: 12px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  opacity: 0.8;
}

.time-separator {
  margin: 0 8px;
  opacity: 0.6;
}

/* Progress Bar */
.progress-container {
  position: relative;
  height: 8px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}

.progress-track {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  border-radius: 16px;
  transition: width 0.2s ease;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
}

/* Controls Section */
.controls-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.transport-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.control-btn {
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  aspect-ratio: 1;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.control-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.play-btn {
  width: 56px;
  height: 56px;
  min-width: 56px;
  min-height: 56px;
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
}

.play-btn:hover {
  background: rgba(59, 130, 246, 0.3);
  box-shadow: 0 12px 32px rgba(59, 130, 246, 0.3);
}

.repeat-btn.active {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.3);
  color: rgba(255, 255, 255, 1);
  box-shadow: 0 12px 32px rgba(34, 197, 94, 0.2);
}

/* Volume Control */
.volume-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.volume-btn {
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
  aspect-ratio: 1;
}

.volume-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 1);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.volume-slider {
  width: 80px;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.volume-slider::-webkit-slider-thumb:hover {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transform: scale(1.1);
}

.volume-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Status Bar */
.status-bar {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.status-indicator {
  padding: 4px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: 11px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.status-indicator.active {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
  color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 12px rgba(59, 130, 246, 0.2);
}

/* Hidden SoundCloud Player */
.soundcloud-audio-player {
  position: absolute;
  left: -9999px;
  opacity: 0;
  pointer-events: none;
  width: 1px;
  height: 1px;
}

/* Responsive Design */
@media (max-width: 480px) {
  .music-player {
    margin: 0;
    padding: 16px 20px;
    gap: 12px;
  }
  
  .track-title {
    font-size: 18px;
  }
  
  .track-artist {
    font-size: 13px;
  }
  
  .time-info {
    font-size: 11px;
  }
  
  .controls-container {
    flex-direction: column;
    gap: 16px;
  }
  
  .transport-controls {
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .control-btn {
    width: 40px;
    height: 40px;
    min-width: 40px;
    min-height: 40px;
  }
  
  .play-btn {
    width: 48px;
    height: 48px;
    min-width: 48px;
    min-height: 48px;
    order: -1;
    flex-basis: 100%;
    margin: 0 auto;
  }
  
  .volume-control {
    justify-content: center;
  }
  
  .volume-btn {
    width: 32px;
    height: 32px;
    min-width: 32px;
    min-height: 32px;
  }
  
  .volume-slider {
    width: 100px;
  }
  
  .status-bar {
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .status-indicator {
    font-size: 10px;
    padding: 3px 8px;
  }
}
</style> 