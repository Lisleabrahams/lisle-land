import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './sanity/schemaTypes'
import {structure} from './sanity/structure'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'lmmr04bx'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

/**
 * Embedded Studio for lisle.land. Served at /studio (Sanity login) and
 * deployed with the site to Vercel — no local dev server needed. Edits the
 * existing `production` dataset, which is now lisle.land's own once
 * lisleandpool.com is retired.
 */
export default defineConfig({
  name: 'lisle-land-studio',
  title: 'lisle.land',
  projectId,
  dataset,
  basePath: '/studio',
  plugins: [structureTool({structure}), visionTool()],
  schema: {types: schemaTypes},
})
