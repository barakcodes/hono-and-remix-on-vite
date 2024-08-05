/// <reference path="./.sst/platform/config.d.ts" />

let stage: string | undefined

export default $config({
  app(input) {
    stage = input?.stage
    return {
      name: 'other',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
    }
  },
  async run() {
    new sst.aws.Remix('MyWeb', {
      environment: {
        NODE_ENV: (stage!=='production'&& stage!=='development') ? 'development' : 'production',
      },
      buildCommand: 'bun run build',
      transform: {
        server: {
          handler: 'functions/server.handler',
          nodejs: {
            esbuild: {
               external:['virtual:remix/server-build'],
               loader: {
                '.node': 'file',
              },
            },
          },
        },
      },
    })
  },
})
