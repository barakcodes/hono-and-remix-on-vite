import type {
  Session,
  SessionData,
  SessionStorage,
} from '@remix-run/node'
import type { Context } from 'hono'

import { createMiddleware } from 'hono/factory'

const sessionStorageSymbol = Symbol() as unknown as string
const sessionSymbol = Symbol() as unknown as string
const toId = (id: string,suffix?:string ) => Symbol.for(id+suffix)
const sessionSuffix = '_session'
const sessionStorageSuffix = '_session_storage'

type CreateSessionOpts<Data = SessionData, FlashData = Data> = {
  autoCommit?: boolean
  createSessionStorage(c: Context): SessionStorage<Data, FlashData>
}

type CreateMultipleSessionOpts<
  Data = SessionData,
  FlashData = Data,
> = (CreateSessionOpts<Data, FlashData> & { id: string })[]

export function session<Data = SessionData, FlashData = Data>(
  options: CreateSessionOpts<Data, FlashData>,
) {
  return createMiddleware(async (c, next) => {
    const sessionStorage = options.createSessionStorage(c)

    c.set(sessionStorageSymbol, sessionStorage)

    // If autoCommit is disabled, we just create the SessionStorage and make it
    // available with c.get(sessionStorageSymbol), then call next() and
    // return.
    if (!options.autoCommit) {
      return await next()
    }

    // If autoCommit is enabled, we get the Session from the request.
    const session = await sessionStorage.getSession(
      c.req.raw.headers.get('cookie'),
    )

    // And make it available with c.get(sessionSymbol).
    c.set(sessionSymbol, session)

    // Then we call next() to let the rest of the middlewares run.
    await next()

    // Finally, we commit the session before the response is sent.
    c.header('set-cookie', await sessionStorage.commitSession(session), {
      append: true,
    })
  })
}

export function sessions<Data = SessionData, FlashData = Data>(
  optionsSet: CreateMultipleSessionOpts<Data, FlashData>,
) {
  toId
  return createMiddleware(async (c, next) => {
    const headers = new Headers()
    // append existing cookie headers
    for (const options of optionsSet) {
      const sessionStorage = options.createSessionStorage(c)
      c.set(
        toId(options.id,sessionStorageSuffix) as unknown as string,
        sessionStorage,
      )
      if (options.autoCommit) {
        const session = await sessionStorage.getSession(
          c.req.raw.headers.get('cookie'),
        )
        // And make it available with c.get(sessionSymbol).
        c.set(toId(options.id, sessionSuffix) as unknown as string, session)
        headers.append(
          'set-cookie',
          await sessionStorage.commitSession(session),
        )
      }
    }

    const autoCommitEnabled = optionsSet.some((options) => options.autoCommit)
    if (!autoCommitEnabled) {
      return await next()
    }
    // Then we call next() to let the rest of the middlewares run.
    await next()
    // Finally, we commit the session before the response is sent.
    headers.forEach((value, key) => {
      c.header(key, value, {
        append: true,
      })
    })
  })
}

export function getSessionStorage<Data = SessionData, FlashData = Data>(
  c: Context,
  id?: string,
): SessionStorage<Data, FlashData> {
  const sessionKey = id
    ? (toId(id,sessionStorageSuffix) as unknown as string)
    : sessionStorageSymbol
  const sessionStorage = c.get(sessionKey ?? sessionStorageSymbol)
  if (!sessionStorage) {
    throw new Error('A session middleware was not set.')
  }
  return sessionStorage as SessionStorage<Data, FlashData>
}

export function getSession<Data = SessionData, FlashData = Data>(
  c: Context,
  id?: string,
): Session<Data, FlashData> {
  const sessionKey = id
    ? (toId(id,sessionSuffix) as unknown as string)
    : sessionStorageSymbol
  const session = c.get(sessionKey ?? sessionStorageSymbol)
  if (!session) {
    throw new Error('A session middleware was not set.')
  }
  return session as Session<Data, FlashData>
}
