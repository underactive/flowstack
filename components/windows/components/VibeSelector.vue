<template>
  <div class="vibes-section">
    <span class="vibe-label">Vibe</span>
    <select v-model="selectedVibe" class="vibes-dropdown" @change="$emit('vibe-changed', selectedVibe)">
      <option value="">Select a vibe...</option>
      <option value="japanese-city-pop">Japanese City Pop</option>
      <option value="synthwave">Synthwave</option>
      <option value="lofi-hip-hop">Lo-fi Hip Hop</option>
      <option value="vaporwave">Vaporwave</option>
      <option value="chillwave">Chillwave</option>
      <option value="retrowave">Retrowave</option>
    </select>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Props
defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

// Emits
defineEmits(['update:modelValue', 'vibe-changed'])

// State
const selectedVibe = ref('')
</script>

<style scoped>
.vibes-section {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 16px;
  padding-left: 6px;
  padding-right: 6px;
  box-sizing: border-box;
}

.vibe-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 8px;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
  white-space: nowrap;
  min-width: fit-content;
}

.vibes-dropdown {
  flex: 1;
  height: 10px;
  padding: 0 4px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 2px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 8px;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
}

.vibes-dropdown:hover {
  background: rgba(255, 255, 255, 0.4);
  color: rgba(255, 255, 255, 1);
  transform: scale(1.1);
}

.vibes-dropdown:active {
  transform: scale(0.95);
}

.vibes-dropdown option {
  background: #1a1a1a;
  color: white;
  padding: 2px;
  font-size: 8px;
}

/* Responsive design */
@media (max-width: 768px) {
  .vibe-label {
    font-size: 7px;
  }
  
  .vibes-dropdown {
    font-size: 7px;
  }
}

@media (max-width: 480px) {
  .vibe-label {
    font-size: 6px;
  }
  
  .vibes-dropdown {
    font-size: 6px;
  }
}
</style> 