import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import cesium from 'vite-plugin-cesium'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
    }),
    cesium(),
  ],
  base: './',
  server: {
    proxy: {
      '/opensky': {
        target: 'https://opensky-network.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/opensky/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('echarts')) return 'echarts'
          if (id.includes('element-plus')) return 'element-plus'
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
