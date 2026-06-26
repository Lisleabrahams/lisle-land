'use client'

// Client boundary for the embedded Studio. Importing the Sanity config (and
// therefore `sanity`) only from a client component keeps it out of the server
// build graph — otherwise Next/Turbopack evaluates Sanity's client-only code
// (React.createContext) during "collect page data" and the build fails.
import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity.config'

export default function StudioClient() {
  return <NextStudio config={config} />
}
