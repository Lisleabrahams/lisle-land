import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: 'lmmr04bx',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
})