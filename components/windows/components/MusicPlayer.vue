<template>
  <div class="music-player">
    <!-- Track Info Section -->
    <div class="track-info">
      <div class="track-title" :class="{ 'loading': isLoadingTrack }">
        {{ isLoadingTrack ? 'Loading track...' : currentTrackInfo.title }}
      </div>
      <div class="track-artist" :class="{ 'loading': isLoadingTrack }">
        {{ isLoadingTrack ? 'Please wait' : currentTrackInfo.artist }}
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
          <UIcon name="i-heroicons-arrow-path-solid" class="w-6 h-6" />
        </button>

        <button class="control-btn prev-btn" @click="previousTrack" title="Previous">
          <UIcon name="i-heroicons-backward-solid" class="w-6 h-6" />
        </button>
        
        <button class="control-btn play-btn" @click="togglePlayPause" title="Play/Pause">
          <UIcon v-if="!isPlaying" name="i-heroicons-play-solid" class="w-8 h-8" />
          <UIcon v-else name="i-heroicons-pause-solid" class="w-8 h-8" />
        </button>
        
        <button class="control-btn next-btn" @click="nextTrack" title="Next">
          <UIcon name="i-heroicons-forward-solid" class="w-6 h-6" />
        </button>
      </div>

      <div class="volume-control">
        <button class="volume-btn" @click="toggleMute" title="Mute/Unmute">
          <UIcon v-if="volume > 0" name="i-heroicons-speaker-wave-solid" class="w-5 h-5" />
          <UIcon v-else name="i-heroicons-speaker-x-mark-solid" class="w-5 h-5" />
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
      <div v-if="!hasUserInteracted" class="status-indicator autoplay-blocked">
        Click to enable autoplay
      </div>
    </div>

    <!-- Hidden SoundCloud Player for Audio -->
    <iframe 
      id="soundcloud-player"
      class="soundcloud-audio-player"
      :src="`https://w.soundcloud.com/player/?url=${encodeURIComponent(playlistUrl)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&show_playlist=true`"
      frameborder="0"
      allow="autoplay"
    ></iframe>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useVibeConfig } from '~/composables/useVibeConfig'

// State management
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(240) // Default 4 minutes
const volume = ref(75)
const seeking = ref(false)
const repeatMode = ref(false)
const isLoadingTrack = ref(false)
const hasUserInteracted = ref(false)

// Use vibe configuration for music playlist
const { getCurrentPlaylistUrl, currentVibe } = useVibeConfig()

// Current track info from SoundCloud
const currentTrackInfo = ref({
  title: 'City Pop Collection',
  artist: 'Japanese City Pop'
})

// Reactive playlist URL that updates with vibe changes
const playlistUrl = computed(() => getCurrentPlaylistUrl())

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

const initMusicPlayer = async (shouldAutoplay = false) => {
  try {
    console.log('Initializing SoundCloud player, shouldAutoplay:', shouldAutoplay)
    await loadSoundCloudAPI()
    
    const iframe = document.querySelector('#soundcloud-player')
    if (iframe) {
      console.log('Creating SoundCloud widget...')
      musicPlayer = window.SC.Widget(iframe)
      
      musicPlayer.bind(window.SC.Widget.Events.READY, () => {
        console.log('SoundCloud player ready, setting up event listeners...')
        setupEventListeners()
        
        // Wait a bit for the track to load, set volume and update track info
        setTimeout(() => {
          updatePlayerVolume()
          updateCurrentTrackInfo()
          
          // Autoplay if requested and user has interacted before
          if (shouldAutoplay && hasUserInteracted.value) {
            console.log('Autoplaying new playlist...')
            musicPlayer.play()
            isPlaying.value = true
            startTimeUpdater()
          }
        }, 1000)
        
        // Check if player is already playing and update state accordingly
        musicPlayer.isPaused((paused) => {
          console.log('Player paused state:', paused)
          isPlaying.value = !paused
        })
      })
    } else {
      console.error('SoundCloud iframe not found')
    }
  } catch (error) {
    console.error('Failed to initialize SoundCloud player:', error)
  }
}

const setupEventListeners = () => {
  console.log('Setting up event listeners for music player:', musicPlayer)
  if (!musicPlayer) {
    console.log('No music player available for event listeners')
    return
  }
  
  try {
    // Set up event listeners
    musicPlayer.bind(window.SC.Widget.Events.PLAY, () => {
      console.log('SoundCloud PLAY event received')
      isPlaying.value = true
      startTimeUpdater()
      
      // Update track info when play starts (should definitely have track data)
      setTimeout(() => {
        updateCurrentTrackInfo()
      }, 200)
    })
    
    musicPlayer.bind(window.SC.Widget.Events.PAUSE, () => {
      console.log('SoundCloud PAUSE event received')
      isPlaying.value = false
      stopTimeUpdater()
    })
    
    musicPlayer.bind(window.SC.Widget.Events.FINISH, () => {
      console.log('SoundCloud FINISH event')
      const wasPlaying = isPlaying.value
      isPlaying.value = false
      stopTimeUpdater()
      if (repeatMode.value) {
        musicPlayer.seekTo(0)
        musicPlayer.play()
      } else {
        // Pass true to indicate the next track should autoplay since the previous was playing
        nextTrackWithAutoplay(wasPlaying)
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
      
      // Update track info when track is loaded
      setTimeout(() => {
        updateCurrentTrackInfo()
      }, 500)
    })
    
    // Handle when track changes
    musicPlayer.bind(window.SC.Widget.Events.TRACK_CHANGE, () => {
      console.log('SoundCloud TRACK_CHANGE event')
      updateCurrentTrackInfo()
    })
    
    console.log('Event listeners bound successfully')
  } catch (error) {
    console.error('Error binding event listeners:', error)
  }
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
  console.log('togglePlayPause called, isPlaying:', isPlaying.value, 'musicPlayer:', musicPlayer)
  if (!musicPlayer) {
    console.log('No music player available for toggle')
    return
  }
  
  // Mark that user has interacted
  hasUserInteracted.value = true
  
  if (isPlaying.value) {
    console.log('Attempting to pause music')
    musicPlayer.pause()
    // Manually update state since events might not fire
    isPlaying.value = false
    stopTimeUpdater()
  } else {
    console.log('Attempting to play music')
    musicPlayer.play()
    // Manually update state since events might not fire
    isPlaying.value = true
    startTimeUpdater()
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
  
  // Mark that user has interacted
  hasUserInteracted.value = true
  
  // For playlist mode, we can go to previous track (SoundCloud handles the bounds)
  currentTrackIndex.value = Math.max(0, currentTrackIndex.value - 1)
  
  loadCurrentTrack(shouldKeepPlaying)
}

const nextTrack = () => {
  const shouldKeepPlaying = isPlaying.value
  console.log('Next track - current playing state:', shouldKeepPlaying)
  
  // Mark that user has interacted
  hasUserInteracted.value = true
  
  // For playlist mode, we can go to next track (SoundCloud handles the bounds)
  currentTrackIndex.value = currentTrackIndex.value + 1
  
  loadCurrentTrack(shouldKeepPlaying)
}

const nextTrackWithAutoplay = (shouldAutoPlay = true) => {
  console.log('Next track with autoplay - shouldAutoPlay:', shouldAutoPlay)
  
  // For playlist mode, we can go to next track (SoundCloud handles the bounds)
  currentTrackIndex.value = currentTrackIndex.value + 1
  loadCurrentTrack(shouldAutoPlay)
}

const loadCurrentTrack = (shouldAutoPlay = false) => {
  console.log('Loading track index:', currentTrackIndex.value, 'shouldAutoPlay:', shouldAutoPlay)
  
  if (musicPlayer) {
    // Show loading state
    isLoadingTrack.value = true
    
    // For playlist mode, we skip to the next track instead of loading individual tracks
    if (shouldAutoPlay) {
      // Skip to next track in playlist
      musicPlayer.skip(currentTrackIndex.value)
      
      setTimeout(() => {
        isLoadingTrack.value = false
        updatePlayerVolume()
        updateCurrentTrackInfo()
        
        // Only attempt autoplay if user has interacted with the player
        if (hasUserInteracted.value) {
          musicPlayer.play()
          console.log('Track loading complete - autoplay with user interaction')
        } else {
          console.log('Track loading complete - autoplay blocked (no user interaction)')
        }
      }, 1000)
    } else {
      // Just skip to track without playing
      musicPlayer.skip(currentTrackIndex.value)
      
      setTimeout(() => {
        isLoadingTrack.value = false
        updatePlayerVolume()
        updateCurrentTrackInfo()
        console.log('Track loading complete - no autoplay')
      }, 1000)
    }
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

const updateCurrentTrackInfo = () => {
  console.log('updateCurrentTrackInfo called, musicPlayer:', musicPlayer)
  if (!musicPlayer) {
    console.log('No music player available for track info update')
    return
  }
  
  // Get current track info from SoundCloud
  musicPlayer.getCurrentSound((sound) => {
    console.log('getCurrentSound callback, sound:', sound)
    if (sound) {
      // Extract artist and title from the track title
      // SoundCloud track titles often include "Artist - Title" format
      let title = sound.title || 'Unknown Track'
      let artist = sound.user?.username || 'Unknown Artist'
      
      // Try to parse "Artist - Title" format from the track title
      const titleParts = title.split(' - ')
      if (titleParts.length >= 2) {
        artist = titleParts[0].trim()
        title = titleParts.slice(1).join(' - ').trim()
      }
      
      currentTrackInfo.value = {
        title: title,
        artist: artist
      }
      console.log('Updated track info:', currentTrackInfo.value)
    } else {
      console.log('No sound data available yet')
    }
  })
}

// Watch for vibe changes and reload music player
watch(currentVibe, () => {
  console.log('Vibe changed, reloading music player with:', playlistUrl.value)
  
  // Store current playing state before resetting
  const wasPlaying = isPlaying.value
  
  // Reset track index and player state
  currentTrackIndex.value = 0
  isPlaying.value = false
  currentTime.value = 0
  
  // Show loading state for track info
  currentTrackInfo.value = {
    title: 'Loading...',
    artist: 'Please wait'
  }
  
  // Stop current player and unbind events
  if (musicPlayer) {
    stopTimeUpdater()
    musicPlayer.unbind(window.SC.Widget.Events.READY)
    musicPlayer.unbind(window.SC.Widget.Events.PLAY)
    musicPlayer.unbind(window.SC.Widget.Events.PAUSE)
    musicPlayer.unbind(window.SC.Widget.Events.FINISH)
    musicPlayer.unbind(window.SC.Widget.Events.LOAD_PROGRESS)
    musicPlayer.unbind(window.SC.Widget.Events.TRACK_CHANGE)
    musicPlayer = null
  }
  
  // Update iframe src with new playlist
  const iframe = document.querySelector('#soundcloud-player')
  if (iframe) {
    const newSrc = `https://w.soundcloud.com/player/?url=${encodeURIComponent(playlistUrl.value)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&show_playlist=true`
    console.log('Updating iframe src to:', newSrc)
    iframe.src = newSrc
    
    // Reinitialize player after iframe loads
    iframe.onload = () => {
      console.log('Iframe loaded, reinitializing player...')
      setTimeout(() => {
        initMusicPlayer(wasPlaying)
      }, 500)
    }
  }
})

// Also watch playlistUrl directly to ensure it updates
watch(playlistUrl, (newUrl) => {
  console.log('Playlist URL changed to:', newUrl)
})

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
  max-height: 242px;
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

.status-indicator.autoplay-blocked {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.3);
  color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 12px rgba(239, 68, 68, 0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
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

/* Override Heroicons sizing for music player */
.music-player .control-btn :where(.i-heroicons\:arrow-path-solid),
.music-player .control-btn :where(.i-heroicons\:backward-solid),
.music-player .control-btn :where(.i-heroicons\:forward-solid) {
  width: 1.5em !important;
  height: 1.5em !important;
}

.music-player .play-btn :where(.i-heroicons\:play-solid),
.music-player .play-btn :where(.i-heroicons\:pause-solid) {
  width: 1.8em !important;
  height: 1.8em !important;
}

.music-player .volume-btn :where(.i-heroicons\:speaker-wave-solid),
.music-player .volume-btn :where(.i-heroicons\:speaker-x-mark-solid) {
  width: 1.3em !important;
  height: 1.3em !important;
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