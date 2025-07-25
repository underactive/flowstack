<template>
  <div class="vibes-section">
    <span class="vibe-label">Vibe</span>
    <div class="custom-dropdown" ref="dropdownRef" @click="toggleDropdown">
      <div class="dropdown-display">
        <span class="dropdown-text">{{ selectedVibeLabel }}</span>
        <span class="dropdown-arrow" :class="{ 'rotated': isOpen }">▼</span>
      </div>
      <Teleport to="body">
        <div v-if="isOpen" class="dropdown-options" :style="dropdownPosition">
          <div 
            v-for="vibe in vibeOptions" 
            :key="vibe.value" 
            class="dropdown-option"
            :class="{ 'selected': vibe.value === selectedVibe }"
            @click.stop="selectVibe(vibe.value)"
          >
            {{ vibe.label }}
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
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
const isOpen = ref(false)
const dropdownRef = ref(null)
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

// Computed property for display text
const selectedVibeLabel = computed(() => {
  if (!selectedVibe.value) return 'Select a vibe...'
  const vibe = vibeOptions.value.find(v => v.value === selectedVibe.value)
  return vibe ? vibe.label : 'Select a vibe...'
})

// Computed property for dropdown position
const dropdownPosition = computed(() => {
  if (!dropdownRef.value || !isOpen.value) return {}
  
  const rect = dropdownRef.value.getBoundingClientRect()
  return {
    position: 'fixed',
    top: `${rect.bottom + 2}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: 10000
  }
})

// Toggle dropdown
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

// Select vibe
const selectVibe = (vibeValue) => {
  selectedVibe.value = vibeValue
  isOpen.value = false
  
  if (vibeValue) {
    console.log('VibeSelector: setting vibe to:', vibeValue)
    setVibe(vibeValue)
    emit('update:modelValue', vibeValue)
    emit('vibe-changed', vibeValue)
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

.custom-dropdown {
  flex: 1;
  position: relative;
  cursor: pointer;
}

.dropdown-display {
  height: 10px;
  padding: 0 4px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 2px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 8px;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
}

.dropdown-display:hover {
  background: rgba(255, 255, 255, 0.4);
  color: rgba(255, 255, 255, 1);
  transform: scale(1.1);
}

.dropdown-display:active {
  transform: scale(0.95);
}

.dropdown-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  font-size: 6px;
  transition: transform 0.2s ease;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.dropdown-options {
  background: #1a1a1a;
  border-radius: 2px;
  max-height: 120px;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.dropdown-option {
  padding: 4px 6px;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-option:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 1);
}

.dropdown-option.selected {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 1);
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