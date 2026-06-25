import 'server-only'
import { createClient } from '@sanity/client'

// Server-side write client for incrementing the pitch view counter.
// Needs SANITY_API_WRITE_TOKEN (a token with write access) in the env —
// added in the Vercel project settings, never committed.
export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'lmmr04bx',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})
