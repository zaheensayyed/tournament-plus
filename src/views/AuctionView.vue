<template>
  <AuctionScreen :tournament-id="tournamentId" />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import AuctionScreen from '../components/AuctionScreen.vue'

const route = useRoute()
const tournamentId = route.params.id as string
</script>