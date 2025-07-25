<template>
  <div class="vibes-section">
    <span class="vibe-label">Vibe</span>
    <select v-model="selectedVibe" class="vibes-dropdown" @change="onVibeChange">
      <option value="">Select a vibe...</option>
      <option v-for="vibe in vibeOptions" :key="vibe.value" :value="vibe.value">
        {{ vibe.label }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useVibeConfig } from '~/composables/useVibeConfig'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'vibe-changed'])

// Use vibe configuration
const { vibeOptions, setVibe, currentVibe } = useVibeConfig()

// Local state
const selectedVibe = ref(props.modelValue || currentVibe.value)
console.log('VibeSelector: initialized with selectedVibe:', selectedVibe.value, 'currentVibe:', currentVibe.value)

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue && newValue !== selectedVibe.value) {
    selectedVibe.value = newValue
  }
})

// Watch for changes to currentVibe from the composable
watch(currentVibe, (newValue) => {
  if (newValue !== selectedVibe.value) {
    selectedVibe.value = newValue
  }
})

// Handle vibe change
const onVibeChange = () => {
  console.log('VibeSelector: onVibeChange called with:', selectedVibe.value)
  if (selectedVibe.value) {
    console.log('VibeSelector: setting vibe to:', selectedVibe.value)
    setVibe(selectedVibe.value)
    emit('update:modelValue', selectedVibe.value)
    emit('vibe-changed', selectedVibe.value)
  }
}
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