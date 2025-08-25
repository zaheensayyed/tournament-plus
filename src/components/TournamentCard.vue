<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <div class="p-6">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ tournament.name }}</h3>
          <div class="space-y-2">
            <div class="flex items-center text-sm text-gray-600">
              <span class="font-medium w-20">Teams:</span>
              <span>{{ tournament.max_teams }}</span>
            </div>
            <div class="flex items-center text-sm text-gray-600">
              <span class="font-medium w-20">Players:</span>
              <span>{{ tournament.max_players }}</span>
            </div>
            <div class="flex items-center text-sm text-gray-600">
              <span class="font-medium w-20">Points:</span>
              <span>{{ tournament.points_per_team }}</span>
            </div>
          </div>
        </div>
        <div class="flex flex-col items-end space-y-2">
          <span
            :class="statusClasses"
            class="px-3 py-1 text-xs font-medium rounded-full"
          >
            {{ tournament.status }}
          </span>
          <div class="text-xs text-gray-500">
            {{ formatDate(tournament.created_at) }}
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-100">
        <button
          @click="$emit('view')"
          class="px-3 py-1.5 text-sm font-medium text-primary-700 bg-primary-50 rounded-md hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          View
        </button>
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

type Tournament = Database['public']['Tables']['tournaments']['Row']

interface Props {
  tournament: Tournament
}

defineProps<Props>()
defineEmits<{
  view: []
  edit: []
  delete: []
}>()

const statusClasses = computed(() => {
  const status = defineProps<Props>().tournament.status
  return {
    'bg-gray-100 text-gray-800': status === 'draft',
    'bg-green-100 text-green-800': status === 'active',
    'bg-blue-100 text-blue-800': status === 'completed'
  }
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>