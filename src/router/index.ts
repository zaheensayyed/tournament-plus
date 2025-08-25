import { createRouter, createWebHistory } from 'vue-router'
import TournamentsView from '../views/TournamentsView.vue'
import TournamentDetailView from '../views/TournamentDetailView.vue'
import AuctionView from '../views/AuctionView.vue'
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/tournaments'
    },
    {
      path: '/tournaments',
      name: 'tournaments',
      component: TournamentsView
    },
    {
      path: '/tournament/:id',
      name: 'tournament-detail',
      component: TournamentDetailView
    },
    {
      path: '/auction/:id',
      name: 'auction',
      component: AuctionView
    },
    {
      path: '/dashboard/:id',
      name: 'dashboard',
      component: DashboardView
    }
  ]
})

export default router