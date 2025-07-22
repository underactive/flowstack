<template>
  <div class="home-page">
    <VideoPlayer />
    <MusicPlayer ref="musicPlayerRef" />
    
    <!-- New sections below music player -->
    <div class="music-controls-wrapper">
      <div class="music-controls-section">
        <!-- Left: Vibes Dropdown -->
        <VibeSelector v-model="selectedVibe" @vibe-changed="onVibeChanged" />
        
        <!-- Right: VU Meters -->
        <AudioVisualizer :is-playing="isPlaying" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import VideoPlayer from './components/VideoPlayer.vue'
import MusicPlayer from './components/MusicPlayer.vue'
import VibeSelector from './components/VibeSelector.vue'
import AudioVisualizer from './components/AudioVisualizer.vue'

// Refs and state
const musicPlayerRef = ref(null)
const selectedVibe = ref('')

// Computed property to check if music is playing
const isPlaying = computed(() => {
  return musicPlayerRef.value?.isPlaying || false
})

// Event handlers
const onVibeChanged = (vibe) => {
  console.log('Vibe changed to:', vibe)
  // TODO: Implement vibe functionality
}
</script>

<style scoped>
.home-page {
  min-height: 100%;
}



/* Music controls wrapper */
.music-controls-wrapper {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 6px;
  padding: 0;
  margin-top: 0;
}

/* Music controls section */
.music-controls-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .music-controls-section {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style> 