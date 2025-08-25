<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto p-6">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ tournament?.name }}</h1>
            <div class="flex items-center space-x-6 text-sm text-gray-600">
              <div>Teams: {{ tournament?.max_teams }}</div>
              <div>Players: {{ tournament?.max_players }}</div>
              <div>Points: {{ tournament?.points_per_team }}</div>
              <div>
                <span
                  :class="statusClasses"
                  class="px-3 py-1 text-xs font-medium rounded-full"
                >
                  {{ tournament?.status }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex space-x-3">
            <button
              @click="goToAuction"
              :disabled="tournament?.status !== 'active'"
              class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Auction Screen
            </button>
            <button
              @click="goToDashboard"
              class="px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-md hover:bg-primary-100"
            >
              Team Dashboard
            </button>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="bg-white rounded-lg shadow-sm mb-6">
        <nav class="flex space-x-8 px-6" aria-label="Tabs">
          <button
            @click="activeTab = 'teams'"
            :class="{ 'border-primary-500 text-primary-600': activeTab === 'teams', 'border-transparent text-gray-500': activeTab !== 'teams' }"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm hover:text-gray-700 hover:border-gray-300"
          >
            Teams ({{ teamsList.length }})
          </button>
          <button
            @click="activeTab = 'players'"
            :class="{ 'border-primary-500 text-primary-600': activeTab === 'players', 'border-transparent text-gray-500': activeTab !== 'players' }"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm hover:text-gray-700 hover:border-gray-300"
          >
            Players ({{ playersList.length }})
          </button>
        </nav>
      </div>

      <!-- Teams Tab -->
      <div v-if="activeTab === 'teams'">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Teams</h2>
          <button
            @click="showTeamForm = true"
            class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
          >
            Add Team
          </button>
        </div>

        <!-- Teams Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="team in teamsList"
            :key="team.id"
            class="bg-white rounded-lg shadow-md p-6"
          >
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ team.name }}</h3>
            <div class="space-y-2 text-sm text-gray-600">
              <div>Owner: {{ team.owner_name }}</div>
              <div>Remaining Points: {{ team.remaining_points }}</div>
            </div>
            <div class="flex justify-end space-x-2 mt-4">
              <button
                @click="editTeam(team)"
                class="px-3 py-1.5 text-sm text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100"
              >
                Edit
              </button>
              <button
                @click="deleteTeam(team)"
                class="px-3 py-1.5 text-sm text-red-700 bg-red-50 rounded-md hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Players Tab -->
      <div v-if="activeTab === 'players'">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Players</h2>
          <button
            @click="showPlayerForm = true"
            class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
          >
            Add Player
          </button>
        </div>

        <!-- Players Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <PlayerCard
            v-for="player in playersList"
            :key="player.id"
            :player="player"
            @edit="editPlayer(player)"
            @delete="deletePlayer(player)"
          />
        </div>
      </div>

      <!-- Team Form Modal -->
      <div
        v-if="showTeamForm"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <div class="bg-white rounded-lg max-w-2xl w-full">
          <div class="p-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Add Team</h2>
            <form @submit.prevent="handleTeamSubmit" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Team Name</label>
                <input
                  v-model="teamForm.name"
                  type="text"
                  required
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Owner Name</label>
                <input
                  v-model="teamForm.owner_name"
                  type="text"
                  required
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div class="flex justify-end space-x-4">
                <button
                  type="button"
                  @click="cancelTeamForm"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                >
                  Add Team
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Player Form Modal -->
      <div
        v-if="showPlayerForm || showEditPlayerForm"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <div class="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
          <PlayerForm
            :player="editingPlayer"
            :tournament-id="tournamentId"
            :is-editing="showEditPlayerForm"
            @success="handlePlayerFormSuccess"
            @cancel="handlePlayerFormCancel"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTournaments } from '../composables/useTournaments'
import { useTeams } from '../composables/useTeams'
import { usePlayers } from '../composables/usePlayers'
import PlayerForm from '../components/PlayerForm.vue'
import PlayerCard from '../components/PlayerCard.vue'
import type { Database } from '../lib/supabase'

type Tournament = Database['public']['Tables']['tournaments']['Row']
type Team = Database['public']['Tables']['teams']['Row']
type Player = Database['public']['Tables']['players']['Row']

const route = useRoute()
const router = useRouter()
const tournamentId = route.params.id as string

const { currentTournament: tournament, getTournament } = useTournaments()
const { teams, createTeam, deleteTeam: deleteTeamFn, fetchTeams } = useTeams()
const { players, fetchPlayers, deletePlayer: deletePlayerFn } = usePlayers()

const activeTab = ref('teams')
const showTeamForm = ref(false)
const showPlayerForm = ref(false)
const showEditPlayerForm = ref(false)
const editingPlayer = ref<Player | null>(null)

const teamForm = ref({
  tournament_id: tournamentId,
  name: '',
  owner_name: '',
  logo_url: '',
  remaining_points: 0
})

const teamsList = computed(() =>
  teams.value.filter(t => t.tournament_id === tournamentId)
)

const playersList = computed(() =>
  players.value.filter(p => p.tournament_id === tournamentId)
)

const statusClasses = computed(() => {
  const status = tournament.value?.status
  return {
    'bg-gray-100 text-gray-800': status === 'draft',
    'bg-green-100 text-green-800': status === 'active',
    'bg-blue-100 text-blue-800': status === 'completed'
  }
})

onMounted(async () => {
  await getTournament(tournamentId)
  await fetchTeams(tournamentId)
  await fetchPlayers(tournamentId)
  
  if (tournament.value) {
    teamForm.value.remaining_points = tournament.value.points_per_team
  }
})

const handleTeamSubmit = async () => {
  try {
    await createTeam(teamForm.value)
    showTeamForm.value = false
    teamForm.value.name = ''
    teamForm.value.owner_name = ''
    teamForm.value.logo_url = ''
  } catch (error) {
    console.error('Error creating team:', error)
  }
}

const cancelTeamForm = () => {
  showTeamForm.value = false
  teamForm.value.name = ''
  teamForm.value.owner_name = ''
  teamForm.value.logo_url = ''
}

const editTeam = (team: Team) => {
  // Team editing functionality
  console.log('Edit team:', team)
}

const deleteTeam = async (team: Team) => {
  if (confirm(`Are you sure you want to delete team "${team.name}"?`)) {
    try {
      await deleteTeamFn(team.id)
    } catch (error) {
      console.error('Error deleting team:', error)
    }
  }
}

const editPlayer = (player: Player) => {
  editingPlayer.value = player
  showEditPlayerForm.value = true
}

const deletePlayer = async (player: Player) => {
  if (confirm(`Are you sure you want to delete player "${player.name}"?`)) {
    try {
      await deletePlayerFn(player.id)
    } catch (error) {
      console.error('Error deleting player:', error)
    }
  }
}

const handlePlayerFormSuccess = () => {
  showPlayerForm.value = false
  showEditPlayerForm.value = false
  editingPlayer.value = null
}

const handlePlayerFormCancel = () => {
  showPlayerForm.value = false
  showEditPlayerForm.value = false
  editingPlayer.value = null
}

const goToAuction = () => {
  router.push(`/auction/${tournamentId}`)
}

const goToDashboard = () => {
  router.push(`/dashboard/${tournamentId}`)
}
</script>