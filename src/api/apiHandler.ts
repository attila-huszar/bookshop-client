import * as node from './node'
import * as elastic from './elastic'
import * as jsonServer from './json-server'
import * as stripe from './stripe'
import { apiChoice } from '@/constants'

const apiHandlers = {
  NODE: node,
  ELASTIC: elastic,
  JSON_SERVER: jsonServer,
}

const selectedApi = apiHandlers[apiChoice]

if (!selectedApi) {
  throw new Error(`Unknown API choice: ${apiChoice}`)
}

export const apiHandler = { ...selectedApi, ...stripe }
