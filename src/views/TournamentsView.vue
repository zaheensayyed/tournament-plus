<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto p-6">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Cricket Tournaments</h1>
        <button
          @click="showCreateForm = true"
          class="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Create Tournament
        </button>
      </div>

      <!-- Create/Edit Form Modal -->
      <div
        v-if="showCreateForm || showEditForm"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <div class="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
          <TournamentForm
            :tournament="editingTournament"
            :is-editing="showEditForm"
            @success="handleFormSuccess"
            @cancel="handleFormCancel"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-600 mb-4">{{ error }}</div>
        <button
          @click="fetchTournaments"
          class="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-md hover:bg-primary-100"
        >
          Try Again
        </button>
      </div>

      <!-- Tournaments Grid -->
      <div v-else-if="tournaments.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TournamentCard
          v-for="tournament in tournaments"
          :key="tournament.id"
          :tournament="tournament"
          @view="viewTournament(tournament)"
          @edit="editTournament(tournament)"
          @delete="deleteTournament(tournament)"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <div class="text-gray-500 text-lg mb-4">No tournaments found</div>
        <button
          @click="showCreateForm = true"
          class="px-6 py-3 text-base font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Create Your First Tournament
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTournaments } from '../composables/useTournaments'
import TournamentForm from '../components/TournamentForm.vue'
import TournamentCard from '../components/TournamentCard.vue'
import type { Database } from '../lib/supabase'

type Tournament = Database['public']['Tables']['tournaments']['Row']

const router = useRouter()
const { tournaments, loading, error, fetchTournaments, deleteTournament: deleteTournamentFn } = useTournaments()

const showCreateForm = ref(false)
const showEditForm = ref(false)
const editingTournament = ref<Tournament | null>(null)

onMounted(() => {
  fetchTournaments()
})

const handleFormSuccess = () => {
  showCreateForm.value = false
  showEditForm.value = false
  editingTournament.value = null
}

const handleFormCancel = () => {
  showCreateForm.value = false
  showEditForm.value = false
  editingTournament.value = null
}

const viewTournament = (tournament: Tournament) => {
  router.push(`/tournament/${tournament.id}`)
}

const editTournament = (tournament: Tournament) => {
  editingTournament.value = tournament
  showEditForm.value = true
}

const deleteTournament = async (tournament: Tournament) => {
  if (confirm(`Are you sure you want to delete "${tournament.name}"? This action cannot be undone.`)) {
    try {
      await deleteTournamentFn(tournament.id)
    } catch (error) {
      console.error('Error deleting tournament:', error)
    }
  }
}
</script>