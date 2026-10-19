import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './sanity/schemaTypes'
import {structure} from './sanity/structure'
import {ForkProjectForPageAction} from './sanity/components/ForkProjectForPage'
import {OnlyThisPageEditsAction} from './sanity/components/OnlyThisPageEdits'

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
  document: {
    // "This page only" forking lives in the application page's action menu
    // (the ⋮ next to Publish): pick a selected project and it is duplicated
    // as a page-only copy and swapped into this page's listing in place.
    actions: (prev, ctx) => {
      if (ctx.schemaType === 'pitchPage') return [...prev, ForkProjectForPageAction]
      // "Only this page edits" sits on the project itself — first in the
      // menu, since reaching for it BEFORE editing is the whole point.
      if (ctx.schemaType === 'project') return [OnlyThisPageEditsAction, ...prev]
      return prev
    },
  },
})
