<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <div class="relative">
      <img
        v-if="player.image_url"
        :src="player.image_url"
        :alt="player.name"
        class="w-full h-48 object-cover"
        @error="handleImageError"
      />
      <div
        v-else
        class="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center"
      >
        <div class="text-primary-600 text-4xl font-bold">
          {{ player.name.charAt(0) }}
        </div>
      </div>
      
      <div v-if="player.is_icon" class="absolute top-2 right-2">
        <span class="bg-cricket-500 text-white px-2 py-1 text-xs font-bold rounded-full shadow-lg">
          ICON
        </span>
      </div>

      <div class="absolute bottom-2 left-2">
        <span
          :class="statusClasses"
          class="px-2 py-1 text-xs font-medium rounded-full shadow-lg"
        >
          {{ player.status }}
        </span>
      </div>
    </div>

    <div class="p-4">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ player.name }}</h3>
      <div class="space-y-1">
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600">Position:</span>
          <span class="font-medium">{{ player.position }}</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600">Base Price:</span>
          <span class="font-medium text-primary-600">{{ player.base_price }} pts</span>
        </div>
      </div>

      <div v-if="!hideActions" class="flex justify-end space-x-2 mt-4 pt-3 border-t border-gray-100">
        <button
          @click="$emit('edit')"
          class="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Edit
        </button>
        <button
          @click="$emit('delete')"
          class="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Database } from '../lib/supabase'

type Player = Database['public']['Tables']['players']['Row']

interface Props {
  player: Player
  hideActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hideActions: false
})

defineEmits<{
  edit: []
  delete: []
}>()

const statusClasses = computed(() => {
  const status = props.player.status
  return {
    'bg-green-100 text-green-800': status === 'available',
    'bg-blue-100 text-blue-800': status === 'sold',
    'bg-red-100 text-red-800': status === 'unsold'
  }
})

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}
</script>