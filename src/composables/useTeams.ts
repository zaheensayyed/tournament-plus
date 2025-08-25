import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type Team = Database['public']['Tables']['teams']['Row']
type TeamInsert = Database['public']['Tables']['teams']['Insert']
type TeamUpdate = Database['public']['Tables']['teams']['Update']

export function useTeams() {
  const teams = ref<Team[]>([])
  const currentTeam = ref<Team | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const teamsByTournament = computed(() => (tournamentId: string) =>
    teams.value.filter(team => team.tournament_id === tournamentId)
  )

  const fetchTeams = async (tournamentId?: string) => {
    loading.value = true
    error.value = null
    
    try {
      let query = supabase.from('teams').select('*')
      
      if (tournamentId) {
        query = query.eq('tournament_id', tournamentId)
      }
      
      const { data, error: fetchError } = await query.order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      teams.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
    } finally {
      loading.value = false
    }
  }

  const getTeam = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError
      currentTeam.value = data
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      return null
    } finally {
      loading.value = false
    }
  }

  const createTeam = async (team: TeamInsert) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: insertError } = await supabase
        .from('teams')
        .insert([team])
        .select()
        .single()

      if (insertError) throw insertError
      teams.value.unshift(data)
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTeam = async (id: string, updates: TeamUpdate) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: updateError } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      
      const index = teams.value.findIndex(t => t.id === id)
      if (index !== -1) {
        teams.value[index] = data
      }
      
      if (currentTeam.value?.id === id) {
        currentTeam.value = data
      }
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTeamPoints = async (id: string, points: number) => {
    return updateTeam(id, { remaining_points: points })
  }

  const deleteTeam = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const { error: deleteError } = await supabase
        .from('teams')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      
      teams.value = teams.value.filter(t => t.id !== id)
      if (currentTeam.value?.id === id) {
        currentTeam.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    teams,
    currentTeam,
    teamsByTournament,
    loading,
    error,
    fetchTeams,
    getTeam,
    createTeam,
    updateTeam,
    updateTeamPoints,
    deleteTeam
  }
}