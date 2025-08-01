import { ref, computed, watch } from 'vue'

// Types for vibe configuration
export interface VideoItem {
  id: string
  startTime: number
  playDuration: number
}

export interface VibeConfig {
  name: string
  videoPlaylist: VideoItem[]
  playlistUrl: string
}

export interface VibeConfigMap {
  [key: string]: VibeConfig
}

// Centralized vibe configuration
const vibeConfigs: VibeConfigMap = {
  citypop: {
    name: "Tokyo City Pop",
    videoPlaylist: [
      { id: 'SRGxH_CTwRM', startTime: 0, playDuration: 0 },
      { id: '39GOyG2_luY', startTime: 0, playDuration: 8 },
      { id: 'JMNUd6qqVOM', startTime: 0, playDuration: 0 },
      { id: 'RQ-EE5m30BY', startTime: 0, playDuration: 0 },
      { id: 'HN1J87jPCxU', startTime: 208, playDuration: 0 },
      { id: 'SAZJY-NnjbE', startTime: 80, playDuration: 14 },
      { id: 'xsex62QupRA', startTime: 9, playDuration: 27 },
      { id: 'SRGxH_CTwRM', startTime: 500, playDuration: 26 },
      { id: '_gkZ6jhytb8', startTime: 266, playDuration: 15 }
    ],
    playlistUrl: 'https://soundcloud.com/iannnnnnnnnn/sets/80s-japanese-city-pop-playlist'
  },
  synthwave: {
    name: "Synthwave",
    videoPlaylist: [

      { id: 'Iv76oc22Qr4', startTime: 2, playDuration: 0 },
      { id: 'ibNrPjETR_k', startTime: 145, playDuration: 0 },
      { id: 'cOEZgwFcpF0', startTime: 8, playDuration: 0 },
      { id: 'J_Dxhr_kXGk', startTime: 33, playDuration: 0 },
      { id: 'k3WkJq478To', startTime: 5, playDuration: 0 },
      { id: 'rDBbaGCCIhk', startTime: 90, playDuration: 0 },
    ],
    playlistUrl: 'https://soundcloud.com/ferzrrn/sets/synth_20-24'
  },
  lofi: {
    name: "Lo-fi Hip Hop",
    videoPlaylist: [
      { id: 'jfKfPfyJRdk', startTime: 0, playDuration: 0 }, // Placeholder - replace with lofi videos
      { id: 'rUxyKA_-grg', startTime: 25, playDuration: 0 },
      { id: 'DWcJFNfaw9c', startTime: 10, playDuration: 0 },
      { id: '5yx6BWlEVcY', startTime: 40, playDuration: 0 },
      { id: '7NOSDKb0HlU', startTime: 15, playDuration: 0 },
      { id: 'lTRiuFIWV54', startTime: 35, playDuration: 0 },
    ],
    playlistUrl: 'https://soundcloud.com/lofi-hip-hop-music/sets/lofi-lofi'
  }
}

// Default vibe
const DEFAULT_VIBE = 'citypop'

// Reactive state
const currentVibe = ref(DEFAULT_VIBE)

// Debug watcher
watch(currentVibe, (newVibe) => {
  console.log('useVibeConfig: currentVibe changed to:', newVibe)
})

// Computed properties
const currentVibeConfig = computed(() => vibeConfigs[currentVibe.value] || vibeConfigs[DEFAULT_VIBE])
const availableVibes = computed(() => Object.keys(vibeConfigs))
const vibeOptions = computed(() => 
  Object.entries(vibeConfigs).map(([key, config]) => ({
    value: key,
    label: config.name
  }))
)

// Functions
const setVibe = (vibeKey: string) => {
  console.log('useVibeConfig: setVibe called with:', vibeKey)
  if (vibeConfigs[vibeKey]) {
    console.log('useVibeConfig: setting currentVibe to:', vibeKey)
    currentVibe.value = vibeKey
    return true
  }
  console.log('useVibeConfig: invalid vibe key:', vibeKey)
  return false
}

const getVibeConfig = (vibeKey: string): VibeConfig | null => {
  return vibeConfigs[vibeKey] || null
}

const getCurrentVideoPlaylist = () => currentVibeConfig.value.videoPlaylist
const getCurrentPlaylistUrl = () => currentVibeConfig.value.playlistUrl
const getCurrentVibeName = () => currentVibeConfig.value.name

export function useVibeConfig() {
  return {
    // State
    currentVibe,
    currentVibeConfig,
    
    // Computed
    availableVibes,
    vibeOptions,
    
    // Functions
    setVibe,
    getVibeConfig,
    getCurrentVideoPlaylist,
    getCurrentPlaylistUrl,
    getCurrentVibeName,
    
    // Constants
    DEFAULT_VIBE,
    vibeConfigs
  }
} 