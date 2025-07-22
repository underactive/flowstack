<template>
  <div class="visualizer-section">
    <div class="vu-meters">
      <div class="vu-meter">
        <label>L</label>
        <div class="vu-bar-container">
          <div 
            v-for="segment in 40" 
            :key="`left-${segment}`"
            class="led-segment"
            :class="{ 
              'active': segment <= Math.ceil(leftChannelLevel / 2.5),
              'peak': segment > 32 && segment <= Math.ceil(leftChannelLevel / 2.5),
              'peak-hold': segment === Math.ceil(leftChannelPeak / 2.5) && leftChannelPeak > 0,
              'playing': isPlaying
            }"
          ></div>
        </div>
      </div>
      <div class="vu-meter">
        <label>R</label>
        <div class="vu-bar-container">
          <div 
            v-for="segment in 40" 
            :key="`right-${segment}`"
            class="led-segment"
            :class="{ 
              'active': segment <= Math.ceil(rightChannelLevel / 2.5),
              'peak': segment > 32 && segment <= Math.ceil(rightChannelLevel / 2.5),
              'peak-hold': segment === Math.ceil(rightChannelPeak / 2.5) && rightChannelPeak > 0,
              'playing': isPlaying
            }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

// Props
const props = defineProps({
  isPlaying: {
    type: Boolean,
    default: false
  }
})

// State
const leftChannelLevel = ref(0)
const rightChannelLevel = ref(0)
const leftChannelPeak = ref(0)
const rightChannelPeak = ref(0)
let animationInterval = null
let leftPeakTimer = null
let rightPeakTimer = null

// Fake VU meter animation
const animateVUMeters = () => {
  if (props.isPlaying) {
    // Generate random levels that look like audio levels
    const baseLevelL = 20 + Math.random() * 60 // Base level 20-80%
    const baseLevelR = 20 + Math.random() * 60 // Base level 20-80%
    
    // Add some variation and peaks
    const peakFactorL = Math.random() > 0.85 ? 1.2 : 1
    const peakFactorR = Math.random() > 0.85 ? 1.2 : 1
    
    leftChannelLevel.value = Math.min(95, baseLevelL * peakFactorL)
    rightChannelLevel.value = Math.min(95, baseLevelR * peakFactorR)
    
    // Handle peak holding for left channel
    if (leftChannelLevel.value > leftChannelPeak.value) {
      leftChannelPeak.value = leftChannelLevel.value
      if (leftPeakTimer) clearTimeout(leftPeakTimer)
      leftPeakTimer = setTimeout(() => {
        leftChannelPeak.value = 0
      }, 1500) // Hold peak for 1.5 seconds
    }
    
    // Handle peak holding for right channel
    if (rightChannelLevel.value > rightChannelPeak.value) {
      rightChannelPeak.value = rightChannelLevel.value
      if (rightPeakTimer) clearTimeout(rightPeakTimer)
      rightPeakTimer = setTimeout(() => {
        rightChannelPeak.value = 0
      }, 1500) // Hold peak for 1.5 seconds
    }
  } else {
    // Gradually fade out when not playing
    leftChannelLevel.value = Math.max(0, leftChannelLevel.value - 5)
    rightChannelLevel.value = Math.max(0, rightChannelLevel.value - 5)
    
    // Reset peaks when not playing
    leftChannelPeak.value = 0
    rightChannelPeak.value = 0
    if (leftPeakTimer) clearTimeout(leftPeakTimer)
    if (rightPeakTimer) clearTimeout(rightPeakTimer)
  }
}

// Start VU meter animation
onMounted(() => {
  animationInterval = setInterval(animateVUMeters, 80) // Update every 80ms for smooth but not overwhelming response
})

// Cleanup
onUnmounted(() => {
  if (animationInterval) {
    clearInterval(animationInterval)
  }
  if (leftPeakTimer) {
    clearTimeout(leftPeakTimer)
  }
  if (rightPeakTimer) {
    clearTimeout(rightPeakTimer)
  }
})

// Watch for changes in playing state
watch(() => props.isPlaying, (newVal) => {
  if (!newVal) {
    // Reset levels when stopped
    setTimeout(() => {
      if (!props.isPlaying) {
        leftChannelLevel.value = 0
        rightChannelLevel.value = 0
      }
    }, 500)
  }
})
</script>

<style scoped>
.visualizer-section {
  height: 16px;
  padding-left: 6px;
  padding-right: 6px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.vu-meters {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 100%;
}

.vu-meter {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 6px;
}

.vu-meter label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 8px;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
  min-width: 6px;
  text-align: center;
  line-height: 1;
}

.vu-bar-container {
  flex: 1;
  height: 4px;
  display: flex;
  gap: 0.5px;
  align-items: center;
}

.led-segment {
  flex: 1;
  height: 100%;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5px;
  transition: all 0.12s ease-out;
  min-width: 1px;
}

.led-segment.active {
  background: #ffffff;
  box-shadow: 0 0 2px rgba(255, 255, 255, 0.5);
}

.led-segment.active.peak {
  background: #ef4444;
  box-shadow: 0 0 2px rgba(239, 68, 68, 0.5);
}

.led-segment.peak-hold {
  background: #ff0000;
  box-shadow: 0 0 4px rgba(255, 0, 0, 0.8);
  animation: peakHoldGlow 0.6s ease-in-out infinite alternate;
}

.led-segment.playing.active {
  animation: ledGlow 0.4s ease-in-out infinite alternate;
}

.led-segment.playing.active.peak {
  animation: ledGlowRed 0.4s ease-in-out infinite alternate;
}

@keyframes ledGlow {
  from {
    box-shadow: 0 0 2px rgba(255, 255, 255, 0.5);
  }
  to {
    box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
  }
}

@keyframes ledGlowRed {
  from {
    box-shadow: 0 0 2px rgba(239, 68, 68, 0.5);
  }
  to {
    box-shadow: 0 0 4px rgba(239, 68, 68, 0.8);
  }
}

@keyframes peakHoldGlow {
  from {
    box-shadow: 0 0 4px rgba(255, 0, 0, 0.8);
  }
  to {
    box-shadow: 0 0 6px rgba(255, 0, 0, 1);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .vu-meter {
    gap: 3px;
  }
  
  .vu-meter label {
    font-size: 7px;
  }
  
  .vu-bar-container {
    height: 3px;
    gap: 0.25px;
  }
  
  .led-segment {
    border-radius: 0.25px;
    min-width: 0.5px;
  }
}

@media (max-width: 480px) {
  .vu-meter label {
    font-size: 6px;
  }
  
  .vu-bar-container {
    height: 3px;
    gap: 0.25px;
  }
  
  .led-segment {
    border-radius: 0.25px;
    min-width: 0.5px;
  }
}
</style> 