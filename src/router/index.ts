import { createRouter, createWebHistory } from 'vue-router'

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
      meta: { title: 'Cesium 三维地球', subtitle: 'CESIUM 3D GLOBE' },
      component: () => import('../views/pages/cesium/index.vue'), // component: () => import('../views/CesiumView.vue'),
    },
    {
      path: '/threejs',
      name: 'threejs',
      meta: { title: 'Three.js 场景', subtitle: 'THREE.JS SCENE' },
      component: () => import('../views/pages/threejs/index.vue'), // component: () => import('../views/ThreejsView.vue'),
    },
    {
      path: '/components',
      name: 'components',
      meta: { title: '组件展示', subtitle: 'COMPONENTS' },
      component: () => import('../views/pages/zujian/index.vue'), // component: () => import('../views/ZujianView.vue'),
    },
    {
      path: '/communication',
      name: 'communication',
      meta: { title: '组件通信', subtitle: 'COMMUNICATION' },
      component: () => import('../views/pages/communicat/index.vue'), // component: () => import('../views/CommunicatView.vue'),
    },
    {
      path: '/websocket',
      name: 'websocket',
      meta: { title: '民航数据大屏', subtitle: 'AVIATION DATA DASHBOARD' },
      component: () => import('../views/pages/websocket/index.vue'), // component: () => import('../views/WebsocketView.vue'),
    },
    {
      path: '/konva',
      name: 'konva',
      meta: { title: '低代码解决方案', subtitle: '低代码解决方案' },
      component: () => import('../views/pages/konva/index.vue'), // component: () => import('../views/KonvaView.vue'),
    },
  ],
})

export default router
