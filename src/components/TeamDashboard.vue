<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto p-6">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Team Dashboard</h1>
        <p class="text-gray-600">Tournament: {{ tournament?.name }}</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div
          v-for="team in teamsList"
          :key="team.id"
          class="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <div class="bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-bold">{{ team.name }}</h2>
                <p class="text-primary-100">{{ team.owner_name }}</p>
              </div>
              <div class="text-right">
                <div class="text-sm text-primary-100">Remaining</div>
                <div class="text-2xl font-bold">{{ team.remaining_points }} pts</div>
              </div>
            </div>
          </div>

          <div class="p-4">
            <div class="mb-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Squad</h3>
              <div v-if="getTeamPlayers(team.id).length === 0" class="text-gray-500 text-center py-8">
                No players purchased yet
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="teamPlayer in getTeamPlayers(team.id)"
                  :key="teamPlayer.id"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div class="flex items-center space-x-3">
                    <img
                      v-if="getPlayerById(teamPlayer.player_id)?.image_url"
                      :src="getPlayerById(teamPlayer.player_id)?.image_url"
                      :alt="getPlayerById(teamPlayer.player_id)?.name"
                      class="w-10 h-10 object-cover rounded-full"
                    />
                    <div
                      v-else
                      class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center"
                    >
                      <span class="text-primary-600 font-semibold">
                        {{ getPlayerById(teamPlayer.player_id)?.name.charAt(0) }}
                      </span>
                    </div>
                    <div>
                      <div class="font-medium text-gray-900">
                        {{ getPlayerById(teamPlayer.player_id)?.name }}
                        <span
                          v-if="getPlayerById(teamPlayer.player_id)?.is_icon"
                          class="ml-2 px-2 py-0.5 text-xs font-bold bg-cricket-500 text-white rounded-full"
                        >
                          ICON
                        </span>
                      </div>
                      <div class="text-sm text-gray-600">
                        {{ getPlayerById(teamPlayer.player_id)?.position }}
                      </div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-semibold text-primary-600">
                      {{ teamPlayer.purchase_price }} pts
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="border-t border-gray-200 pt-4">
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-600">Total Spent:</span>
                <span class="font-semibold">{{ getTotalSpent(team.id) }} pts</span>
              </div>
              <div class="flex justify-between items-center text-sm mt-1">
                <span class="text-gray-600">Players:</span>
                <span class="font-semibold">{{ getTeamPlayers(team.id).length }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTournaments } from '../composables/useTournaments'
import { useTeams } from '../composables/useTeams'
import { usePlayers } from '../composables/usePlayers'
import { useAuction } from '../composables/useAuction'
import type { Database } from '../lib/supabase'

type Tournament = Database['public']['Tables']['tournaments']['Row']

interface Props {
  tournamentId: string
}

const props = defineProps<Props>()

const { getTournament } = useTournaments()
const { teams, fetchTeams } = useTeams()
const { players, fetchPlayers } = usePlayers()
const { teamPlayers, fetchTeamPlayers } = useAuction()

const tournament = ref<Tournament | null>(null)

const teamsList = computed(() =>
  teams.value.filter(t => t.tournament_id === props.tournamentId)
)

onMounted(async () => {
  tournament.value = await getTournament(props.tournamentId)
  await fetchTeams(props.tournamentId)
  await fetchPlayers(props.tournamentId)
  await fetchTeamPlayers(props.tournamentId)
})

const getTeamPlayers = (teamId: string) => {
  return teamPlayers.value.filter(tp => tp.team_id === teamId)
}

const getPlayerById = (playerId: string) => {
  return players.value.find(p => p.id === playerId)
}

const getTotalSpent = (teamId: string) => {
  return getTeamPlayers(teamId).reduce((total, tp) => total + tp.purchase_price, 0)
}
</script>