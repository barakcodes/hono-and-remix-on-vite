/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
  app(input) {
    return {
      name: 'other',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
    }
  },
  async run() {
    new sst.aws.Remix('MyWeb', {
      environment: {
         NODE_ENV: $dev ? "development" : "production",
      },
      transform: {
        server: {
          // name must be index for now(issue with sst)
          handler: 'functions/index.handler',
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
