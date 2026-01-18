import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Trading from '../views/Trading.vue'
import Strategies from '../views/Strategies.vue'
import Assets from '../views/Assets.vue'
import Analytics from '../views/Analytics.vue'
import Orders from '../views/Orders.vue'

const routes = [{
        path: '/',
        name: 'Dashboard',
        component: Dashboard
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
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router