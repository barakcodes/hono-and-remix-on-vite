/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'obira',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
    }
  },
  async run() {
    const server = new sst.aws.Function('Web', {
      url: true,
      streaming: true,
      handler: 'functions/server.handler',
      environment: {
         NODE_ENV: 'production',
      },
      nodejs: {
        esbuild: {
          external:['virtual:remix/server-build'],
        }
      }
    })

    const assets = new sst.aws.StaticAssets('Assets', { 
      build: {
        command: 'bun run build',
        output: 'build/client',
      }
    })
    
    const router = new sst.aws.Router('MyRouter', {
     routes: {
        '/*': server.url,
        '/assets/*': assets.url,
        '/favicon.ico': assets.url,
        '/_routes.json': assets.url,
      }
     }) 

   return {
     server: server.url,
     assets: assets.url,
     router: router.url,
    }
  },
})
