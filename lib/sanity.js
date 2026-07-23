import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: 'lmmr04bx',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
})