<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">
      {{ isEditing ? 'Edit Player' : 'Add Player' }}
    </h2>
    
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
            Player Name
          </label>
          <input
            v-model="form.name"
            type="text"
            id="name"
            required
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="Enter player name"
          />
        </div>

        <div>
          <label for="position" class="block text-sm font-medium text-gray-700 mb-2">
            Position
          </label>
          <select
            v-model="form.position"
            id="position"
            required
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">Select position</option>
            <option value="Batsman">Batsman</option>
            <option value="Bowler">Bowler</option>
            <option value="All-rounder">All-rounder</option>
            <option value="Wicket-keeper">Wicket-keeper</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="base_price" class="block text-sm font-medium text-gray-700 mb-2">
            Base Price
          </label>
          <input
            v-model.number="form.base_price"
            type="number"
            id="base_price"
            required
            min="50"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div>
          <label for="image_url" class="block text-sm font-medium text-gray-700 mb-2">
            Image URL
          </label>
          <input
            v-model="form.image_url"
            type="url"
            id="image_url"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="https://example.com/player-image.jpg"
          />
        </div>
      </div>

      <div>
        <label class="flex items-center space-x-3">
          <input
            v-model="form.is_icon"
            type="checkbox"
            class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span class="text-sm font-medium text-gray-700">Icon Player</span>
        </label>
        <p class="mt-1 text-xs text-gray-500">
          Each team can have only one icon player
        </p>
      </div>

      <div v-if="form.image_url" class="flex justify-center">
        <img
          :src="form.image_url"
          :alt="form.name"
          class="w-32 h-32 object-cover rounded-lg shadow-md"
          @error="handleImageError"
        />
      </div>

      <div class="flex justify-end space-x-4">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {{ loading ? 'Saving...' : (isEditing ? 'Update' : 'Add') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { usePlayers } from '../composables/usePlayers'
import type { Database } from '../lib/supabase'

type Player = Database['public']['Tables']['players']['Row']
type PlayerInsert = Database['public']['Tables']['players']['Insert']

interface Props {
  player?: Player | null
  tournamentId: string
  isEditing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  player: null,
  isEditing: false
})

const emit = defineEmits<{
  success: [player: Player]
  cancel: []
}>()

const { createPlayer, updatePlayer, loading } = usePlayers()

const form = ref<PlayerInsert>({
  tournament_id: props.tournamentId,
  name: '',
  position: '',
  base_price: 50,
  image_url: '',
  is_icon: false,
  status: 'available'
})

watch(() => props.player, (player) => {
  if (player) {
    form.value = {
      tournament_id: player.tournament_id,
      name: player.name,
      position: player.position,
      base_price: player.base_price,
      image_url: player.image_url,
      is_icon: player.is_icon,
      status: player.status
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  try {
    let result
    if (props.isEditing && props.player) {
      result = await updatePlayer(props.player.id, form.value)
    } else {
      result = await createPlayer(form.value)
    }
    emit('success', result)
  } catch (error) {
    console.error('Error saving player:', error)
  }
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}
</script>