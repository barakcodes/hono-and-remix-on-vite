import devServer, { defaultOptions } from '@hono/vite-dev-server'
import { vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'

export default defineConfig({
  ssr: {
  },
  plugins: [
    remix(),
    devServer({
      entry: 'server.ts',
      exclude: [...defaultOptions.exclude, '/assets/**', '/app/**'],
      injectClientScript: false
    })
  ]
})
