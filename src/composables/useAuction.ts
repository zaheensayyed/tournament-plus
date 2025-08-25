import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type TeamPlayer = Database['public']['Tables']['team_players']['Row']
type TeamPlayerInsert = Database['public']['Tables']['team_players']['Insert']

export function useAuction() {
  const teamPlayers = ref<TeamPlayer[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const playersByTeam = computed(() => (teamId: string) =>
    teamPlayers.value.filter(tp => tp.team_id === teamId)
  )

  const fetchTeamPlayers = async (tournamentId?: string) => {
    loading.value = true
    error.value = null
    
    try {
      let query = supabase
        .from('team_players')
        .select(`
          *,
          teams!inner(tournament_id, name),
          players!inner(name, position, image_url, is_icon)
        `)
      
      if (tournamentId) {
        query = query.eq('teams.tournament_id', tournamentId)
      }
      
      const { data, error: fetchError } = await query.order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      teamPlayers.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
    } finally {
      loading.value = false
    }
  }

  const sellPlayer = async (teamId: string, playerId: string, price: number) => {
    loading.value = true
    error.value = null
    
    try {
      // Start transaction
      const { data: teamPlayerData, error: insertError } = await supabase
        .from('team_players')
        .insert([{
          team_id: teamId,
          player_id: playerId,
          purchase_price: price
        }])
        .select()
        .single()

      if (insertError) throw insertError

      // Update player status to sold
      const { error: playerUpdateError } = await supabase
        .from('players')
        .update({ status: 'sold' })
        .eq('id', playerId)

      if (playerUpdateError) throw playerUpdateError

      // Update team remaining points
      const { data: teamData, error: teamFetchError } = await supabase
        .from('teams')
        .select('remaining_points')
        .eq('id', teamId)
        .single()

      if (teamFetchError) throw teamFetchError

      const { error: teamUpdateError } = await supabase
        .from('teams')
        .update({ remaining_points: teamData.remaining_points - price })
        .eq('id', teamId)

      if (teamUpdateError) throw teamUpdateError

      teamPlayers.value.unshift(teamPlayerData)
      return teamPlayerData
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      loading.value = false
    }
  }

  const unsoldPlayer = async (playerId: string) => {
    loading.value = true
    error.value = null
    
    try {
      const { error: updateError } = await supabase
        .from('players')
        .update({ status: 'unsold' })
        .eq('id', playerId)

      if (updateError) throw updateError
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    teamPlayers,
    playersByTeam,
    loading,
    error,
    fetchTeamPlayers,
    sellPlayer,
    unsoldPlayer
  }
}