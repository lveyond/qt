import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Trading from '../views/Trading.vue'
import Strategies from '../views/Strategies.vue'
import Assets from '../views/Assets.vue'
import Analytics from '../views/Analytics.vue'
import Orders from '../views/Orders.vue'
import Community from '../views/Community.vue'
import Game from '../views/Game.vue'

const routes = [{
        path: '/',
        name: 'Dashboard',
        component: Dashboard,
        alias: '/dashboard' // 添加别名，/dashboard 也会指向 Dashboard
    },
    {
        path: '/trading',
        name: 'Trading',
        component: Trading
    },
    {
        path: '/strategies',
        name: 'Strategies',
        component: Strategies
    },
    {
        path: '/assets',
        name: 'Assets',
        component: Assets
    },
    {
        path: '/analytics',
        name: 'Analytics',
        component: Analytics
    },
    {
        path: '/orders',
        name: 'Orders',
        component: Orders
    },
    {
        path: '/community',
        name: 'Community',
        component: Community
    },
    {
        path: '/game',
        name: 'Game',
        component: Game
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router