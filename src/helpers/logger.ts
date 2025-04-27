import { Logtail } from '@logtail/browser'

export const log = new Logtail(import.meta.env.VITE_LOGTAIL_SOURCE_TOKEN, {
  endpoint: import.meta.env.VITE_LOGTAIL_INGESTING_HOST,
})
