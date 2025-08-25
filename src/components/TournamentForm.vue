<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">
      {{ isEditing ? 'Edit Tournament' : 'Create Tournament' }}
    </h2>
    
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
          Tournament Name
        </label>
        <input
          v-model="form.name"
          type="text"
          id="name"
          required
          class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="Enter tournament name"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label for="max_players" class="block text-sm font-medium text-gray-700 mb-2">
            Max Players
          </label>
          <input
            v-model.number="form.max_players"
            type="number"
            id="max_players"
            required
            min="1"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div>
          <label for="max_teams" class="block text-sm font-medium text-gray-700 mb-2">
            Max Teams
          </label>
          <input
            v-model.number="form.max_teams"
            type="number"
            id="max_teams"
            required
            min="2"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div>
          <label for="points_per_team" class="block text-sm font-medium text-gray-700 mb-2">
            Points per Team
          </label>
          <input
            v-model.number="form.points_per_team"
            type="number"
            id="points_per_team"
            required
            min="100"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
      </div>

      <div v-if="isEditing">
        <label for="status" class="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          v-model="form.status"
          id="status"
          class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
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
          {{ loading ? 'Saving...' : (isEditing ? 'Update' : 'Create') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTournaments } from '../composables/useTournaments'
import type { Database } from '../lib/supabase'

type Tournament = Database['public']['Tables']['tournaments']['Row']
type TournamentInsert = Database['public']['Tables']['tournaments']['Insert']

interface Props {
  tournament?: Tournament | null
  isEditing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  tournament: null,
  isEditing: false
})

const emit = defineEmits<{
  success: [tournament: Tournament]
  cancel: []
}>()

const { createTournament, updateTournament, loading } = useTournaments()

const form = ref<TournamentInsert & { status?: 'draft' | 'active' | 'completed' }>({
  name: '',
  max_players: 100,
  max_teams: 8,
  points_per_team: 1000,
  status: 'draft'
})

watch(() => props.tournament, (tournament) => {
  if (tournament) {
    form.value = {
      name: tournament.name,
      max_players: tournament.max_players,
      max_teams: tournament.max_teams,
      points_per_team: tournament.points_per_team,
      status: tournament.status
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  try {
    let result
    if (props.isEditing && props.tournament) {
      result = await updateTournament(props.tournament.id, form.value)
    } else {
      const { status, ...insertData } = form.value
      result = await createTournament(insertData)
    }
    emit('success', result)
  } catch (error) {
    console.error('Error saving tournament:', error)
  }
}
</script>