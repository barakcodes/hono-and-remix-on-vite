import {  streamHandle } from 'hono/aws-lambda'
import server from '../server'

export const handler = streamHandle(server)
