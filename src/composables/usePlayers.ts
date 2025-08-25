import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type Player = Database['public']['Tables']['players']['Row']
type PlayerInsert = Database['public']['Tables']['players']['Insert']
type PlayerUpdate = Database['public']['Tables']['players']['Update']

export function usePlayers() {
  const players = ref<Player[]>([])
  const currentPlayer = ref<Player | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const playersByTournament = computed(() => (tournamentId: string) =>
    players.value.filter(player => player.tournament_id === tournamentId)
  )

  const availablePlayers = computed(() => (tournamentId: string) =>
    players.value.filter(player => 
      player.tournament_id === tournamentId && player.status === 'available'
    )
  )

  const iconPlayers = computed(() => (tournamentId: string) =>
    players.value.filter(player => 
      player.tournament_id === tournamentId && player.is_icon
    )
  )

  const fetchPlayers = async (tournamentId?: string) => {
    loading.value = true
    error.value = null
    
    try {
      let query = supabase.from('players').select('*')
      
      if (tournamentId) {
        query = query.eq('tournament_id', tournamentId)
      }
      
      const { data, error: fetchError } = await query.order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      players.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
    } finally {
      loading.value = false
    }
  }

  const getPlayer = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await supabase
        .from('players')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError
      currentPlayer.value = data
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      return null
    } finally {
      loading.value = false
    }
  }

  const createPlayer = async (player: PlayerInsert) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: insertError } = await supabase
        .from('players')
        .insert([player])
        .select()
        .single()

      if (insertError) throw insertError
      players.value.unshift(data)
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePlayer = async (id: string, updates: PlayerUpdate) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: updateError } = await supabase
        .from('players')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      
      const index = players.value.findIndex(p => p.id === id)
      if (index !== -1) {
        players.value[index] = data
      }
      
      if (currentPlayer.value?.id === id) {
        currentPlayer.value = data
      }
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePlayerStatus = async (id: string, status: 'available' | 'sold' | 'unsold') => {
    return updatePlayer(id, { status })
  }

  const deletePlayer = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const { error: deleteError } = await supabase
        .from('players')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      
      players.value = players.value.filter(p => p.id !== id)
      if (currentPlayer.value?.id === id) {
        currentPlayer.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    players,
    currentPlayer,
    playersByTournament,
    availablePlayers,
    iconPlayers,
    loading,
    error,
    fetchPlayers,
    getPlayer,
    createPlayer,
    updatePlayer,
    updatePlayerStatus,
    deletePlayer
  }
}