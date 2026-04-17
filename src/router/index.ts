import { createRouter, createWebHistory } from 'vue-router'
import { reportVisit } from '@/api/visitor'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/home/index.vue'), // component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/cesium',
      name: 'cesium',
      meta: { title: '三维地理信息系统', subtitle: '3D GEOGRAPHIC INFORMATION SYSTEM' },
      component: () => import('../views/pages/cesium/index.vue'), // component: () => import('../views/CesiumView.vue'),
    },
    {
      path: '/threejs',
      name: 'threejs',
      meta: { title: '三维渲染引擎', subtitle: '3D RENDERING ENGINE' },
      component: () => import('../views/pages/threejs/index.vue'), // component: () => import('../views/ThreejsView.vue'),
    },
    {
      path: '/components',
      name: 'components',
      meta: { title: '数据可视化组件库', subtitle: 'DATA VISUALIZATION COMPONENTS' },
      component: () => import('../views/pages/zujian/index.vue'), // component: () => import('../views/ZujianView.vue'),
    },
    {
      path: '/communication',
      name: 'communication',
      meta: { title: '访客分析中心', subtitle: 'VISITOR ANALYTICS CENTER' },
      component: () => import('../views/pages/communicat/index.vue'), // component: () => import('../views/CommunicatView.vue'),
    },
    {
      path: '/websocket',
      name: 'websocket',
      meta: { title: '民航数据监控大屏', subtitle: 'AVIATION DATA MONITORING DASHBOARD' },
      component: () => import('../views/pages/websocket/index.vue'), // component: () => import('../views/WebsocketView.vue'),
    },
    {
      path: '/konva',
      name: 'konva',
      meta: { title: '低代码可视化编辑器', subtitle: 'LOW-CODE VISUAL EDITOR' },
      component: () => import('../views/pages/konva/index.vue'), // component: () => import('../views/KonvaView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/not-found/index.vue'),
    },
  ],
})

// 路由守卫：每次页面访问上报访客记录
router.afterEach((to) => {
  reportVisit(to.path, getBrowser(), getDevice())
})

function getBrowser(): string {
  const ua = navigator.userAgent
  if (ua.includes('Edg/')) return 'Edge'
  if (ua.includes('Chrome/')) return 'Chrome'
  if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Safari'
  if (ua.includes('Firefox/')) return 'Firefox'
  return 'Other'
}

function getDevice(): string {
  const ua = navigator.userAgent
  if (/Android|iPhone|iPad|iPod/i.test(ua)) return 'Mobile'
  if (/iPad|Tablet/i.test(ua)) return 'Tablet'
  return 'Desktop'
}

export default router
