import {   createCookieSessionStorage } from '@remix-run/node'
import type {AppLoadContext, ServerBuild} from '@remix-run/node'
import { Hono } from 'hono/quick'
import { remix } from 'remix-hono/handler'
import { getSession, getSessionStorage, sessions } from './helpers/session'
const app = new Hono()
const mode = process.env.NODE_ENV
const isProduction = mode === 'production'

app.use(
  sessions([
    {
      id: 'sapporo_app',
      autoCommit: true,
      createSessionStorage() {
        const sessionStorage = createCookieSessionStorage({
          cookie: {
            name: 'sapporo_app',
            httpOnly: true,
            path: '/',
            sameSite: 'lax',
            secrets: ['some-secret'],
            secure: process.env.NODE_ENV === 'production',
          },
        })
        return {
          ...sessionStorage,
          // If a user doesn't come back to the app within 14 days, their session will be deleted.
          async commitSession(session) {
            return sessionStorage.commitSession(session, {
              maxAge: 60 * 60 * 24 * 14,
            })
          },
        }
      },
    },
    {
      id: 'sapporo_auth',
      autoCommit: true,
      createSessionStorage() {
        const sessionStorage = createCookieSessionStorage({
          cookie: {
            name: 'sapporo_auth',
            httpOnly: true,
            path: '/',
            sameSite: 'lax',
            secrets: ['some-other-secret'],
            secure: process.env.NODE_ENV === 'production',
          },
        })
        return {
          ...sessionStorage,
          // If a user doesn't come back to the app within 14 days, their session will be deleted.
          async commitSession(session) {
            return sessionStorage.commitSession(session, {
              maxAge: 60 * 60 * 24 * 14,
            })
          },
        }
      },
    },
  ]),
)
app.get('/hono', (c) => c.text('Hono has launched successfully'))
app.use(
  async (c, next) => {
    const serverBuild = isProduction ?
      await import('./build/server') as ServerBuild : 
              // @ts-expect-error it's not typed
       await import('virtual:remix/server-build') as ServerBuild
    return remix({
      build: serverBuild,
      mode: isProduction ? 'production' : 'development',
     async getLoadContext() {
       const session = getSession(c, 'sapporo_app')
        const storage = getSessionStorage(c, 'sapporo_app')
        return {
         
        } satisfies AppLoadContext
      }
    })(c, next)
    }
)


export default app
