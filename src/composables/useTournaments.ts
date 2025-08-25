import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type Tournament = Database['public']['Tables']['tournaments']['Row']
type TournamentInsert = Database['public']['Tables']['tournaments']['Insert']
type TournamentUpdate = Database['public']['Tables']['tournaments']['Update']

export function useTournaments() {
  const tournaments = ref<Tournament[]>([])
  const currentTournament = ref<Tournament | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const activeTournament = computed(() => 
    tournaments.value.find(t => t.status === 'active')
  )

  const fetchTournaments = async () => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      tournaments.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
    } finally {
      loading.value = false
    }
  }

  const getTournament = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError
      currentTournament.value = data
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      return null
    } finally {
      loading.value = false
    }
  }

  const createTournament = async (tournament: TournamentInsert) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: insertError } = await supabase
        .from('tournaments')
        .insert([tournament])
        .select()
        .single()

      if (insertError) throw insertError
      tournaments.value.unshift(data)
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTournament = async (id: string, updates: TournamentUpdate) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: updateError } = await supabase
        .from('tournaments')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      
      const index = tournaments.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tournaments.value[index] = data
      }
      
      if (currentTournament.value?.id === id) {
        currentTournament.value = data
      }
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteTournament = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const { error: deleteError } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      
      tournaments.value = tournaments.value.filter(t => t.id !== id)
      if (currentTournament.value?.id === id) {
        currentTournament.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    tournaments,
    currentTournament,
    activeTournament,
    loading,
    error,
    fetchTournaments,
    getTournament,
    createTournament,
    updateTournament,
    deleteTournament
  }
}