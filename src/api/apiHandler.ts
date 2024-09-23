import * as elastic from './elastic'
import * as jsonServer from './json-server'
import { apiChoice } from '@/constants'

const apiHandlers = {
  ELASTIC: elastic,
  JSON_SERVER: jsonServer,
}

const selectedApi = apiHandlers[apiChoice]

if (!selectedApi) {
  throw new Error(`Unknown API choice: ${apiChoice}`)
}

export const apiHandler = { ...selectedApi }
