<template>
  <div class="min-h-screen bg-gray-900">
    <!-- Host Controls -->
    <div class="bg-gray-800 p-4 border-b border-gray-700">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        <h1 class="text-xl font-bold text-white">Auction Control Panel</h1>
        <div class="flex items-center space-x-4">
          <select
            v-model="selectedPlayerId"
            class="rounded-md border-gray-600 bg-gray-700 text-white focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">Select Player</option>
            <option
              v-for="player in availablePlayersList"
              :key="player.id"
              :value="player.id"
            >
              {{ player.name }} ({{ player.position }})
            </option>
          </select>
          <button
            @click="startPlayerBidding"
            :disabled="!selectedPlayerId"
            class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Bidding
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-6xl mx-auto p-6">
      <div v-if="!currentBiddingPlayer" class="text-center py-20">
        <div class="text-white text-2xl mb-4">Select a player to start the auction</div>
        <div class="text-gray-400">Available players: {{ availablePlayersList.length }}</div>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Player Display -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-xl overflow-hidden">
            <div class="relative h-80">
              <img
                v-if="currentBiddingPlayer.image_url"
                :src="currentBiddingPlayer.image_url"
                :alt="currentBiddingPlayer.name"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center"
              >
                <div class="text-primary-600 text-8xl font-bold">
                  {{ currentBiddingPlayer.name.charAt(0) }}
                </div>
              </div>
              
              <div v-if="currentBiddingPlayer.is_icon" class="absolute top-4 right-4">
                <span class="bg-cricket-500 text-white px-4 py-2 text-lg font-bold rounded-full shadow-lg">
                  ICON PLAYER
                </span>
              </div>
            </div>

            <div class="p-6">
              <h2 class="text-3xl font-bold text-gray-900 mb-4">{{ currentBiddingPlayer.name }}</h2>
              <div class="grid grid-cols-2 gap-4 text-lg">
                <div>
                  <span class="text-gray-600">Position:</span>
                  <span class="ml-2 font-semibold">{{ currentBiddingPlayer.position }}</span>
                </div>
                <div>
                  <span class="text-gray-600">Base Price:</span>
                  <span class="ml-2 font-semibold text-primary-600">{{ currentBiddingPlayer.base_price }} pts</span>
                </div>
              </div>

              <div class="mt-6">
                <div class="text-center">
                  <div class="text-gray-600 text-lg">Current Bid</div>
                  <div class="text-4xl font-bold text-primary-600 mb-4">{{ currentBid }} pts</div>
                  
                  <div v-if="highestBidder" class="text-lg text-gray-700 mb-6">
                    Highest Bidder: <span class="font-semibold">{{ highestBidder.name }}</span>
                  </div>

                  <div class="flex justify-center space-x-4">
                    <button
                      @click="sellToHighestBidder"
                      :disabled="!highestBidder || loading"
                      class="px-6 py-3 text-lg font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sold!
                    </button>
                    <button
                      @click="markAsUnsold"
                      :disabled="loading"
                      class="px-6 py-3 text-lg font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Unsold
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Team Bidding Panel -->
        <div class="space-y-4">
          <h3 class="text-xl font-bold text-white mb-4">Teams</h3>
          <div
            v-for="team in teamsList"
            :key="team.id"
            class="bg-white rounded-lg p-4 shadow-lg"
          >
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-semibold text-gray-900">{{ team.name }}</h4>
              <div class="text-sm text-gray-600">{{ team.remaining_points }} pts</div>
            </div>
            
            <div class="space-y-2">
              <input
                v-model.number="bidAmounts[team.id]"
                type="number"
                :min="Math.max(currentBid + 10, currentBiddingPlayer.base_price)"
                :max="team.remaining_points"
                :placeholder="`Min: ${Math.max(currentBid + 10, currentBiddingPlayer.base_price)}`"
                class="w-full rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
              />
              <button
                @click="placeBid(team.id, bidAmounts[team.id])"
                :disabled="!bidAmounts[team.id] || bidAmounts[team.id] < Math.max(currentBid + 10, currentBiddingPlayer.base_price) || bidAmounts[team.id] > team.remaining_points"
                class="w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Bid
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePlayers } from '../composables/usePlayers'
import { useTeams } from '../composables/useTeams'
import { useAuction } from '../composables/useAuction'
import type { Database } from '../lib/supabase'

type Player = Database['public']['Tables']['players']['Row']
type Team = Database['public']['Tables']['teams']['Row']

interface Props {
  tournamentId: string
}

const props = defineProps<Props>()

const { players, fetchPlayers } = usePlayers()
const { teams, fetchTeams } = useTeams()
const { sellPlayer, unsoldPlayer, loading } = useAuction()

const selectedPlayerId = ref('')
const currentBiddingPlayer = ref<Player | null>(null)
const currentBid = ref(0)
const highestBidder = ref<Team | null>(null)
const bidAmounts = ref<Record<string, number>>({})

const availablePlayersList = computed(() =>
  players.value.filter(p => p.tournament_id === props.tournamentId && p.status === 'available')
)

const teamsList = computed(() =>
  teams.value.filter(t => t.tournament_id === props.tournamentId)
)

onMounted(async () => {
  await fetchPlayers(props.tournamentId)
  await fetchTeams(props.tournamentId)
})

const startPlayerBidding = () => {
  const player = players.value.find(p => p.id === selectedPlayerId.value)
  if (player) {
    currentBiddingPlayer.value = player
    currentBid.value = player.base_price
    highestBidder.value = null
    bidAmounts.value = {}
  }
}

const placeBid = (teamId: string, amount: number) => {
  if (amount > currentBid.value) {
    currentBid.value = amount
    highestBidder.value = teams.value.find(t => t.id === teamId) || null
  }
}

const sellToHighestBidder = async () => {
  if (currentBiddingPlayer.value && highestBidder.value) {
    try {
      await sellPlayer(highestBidder.value.id, currentBiddingPlayer.value.id, currentBid.value)
      // Update team points locally
      const teamIndex = teams.value.findIndex(t => t.id === highestBidder.value?.id)
      if (teamIndex !== -1) {
        teams.value[teamIndex].remaining_points -= currentBid.value
      }
      // Reset for next player
      currentBiddingPlayer.value = null
      selectedPlayerId.value = ''
      await fetchPlayers(props.tournamentId)
    } catch (error) {
      console.error('Error selling player:', error)
    }
  }
}

const markAsUnsold = async () => {
  if (currentBiddingPlayer.value) {
    try {
      await unsoldPlayer(currentBiddingPlayer.value.id)
      currentBiddingPlayer.value = null
      selectedPlayerId.value = ''
      await fetchPlayers(props.tournamentId)
    } catch (error) {
      console.error('Error marking player as unsold:', error)
    }
  }
}
</script>