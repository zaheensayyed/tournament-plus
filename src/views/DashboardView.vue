<template>
  <TeamDashboard :tournament-id="tournamentId" />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import TeamDashboard from '../components/TeamDashboard.vue'

const route = useRoute()
const tournamentId = route.params.id as string
</script>