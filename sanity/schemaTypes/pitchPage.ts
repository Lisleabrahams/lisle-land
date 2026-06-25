import {defineType, defineField} from 'sanity'

/**
 * Targeted pitch / application page. Served at /for/<slug> as a private,
 * noindex link. Overrides the loader copy, intro copy and project listing for
 * a specific prospect, expires on a date you set, and pings Slack the first
 * time it's opened. Mirrors the Symbols of Wealth pitch system.
 */
export default defineType({
  name: 'pitchPage',
  title: 'Pitch / application',
  type: 'document',
  fields: [
    defineField({
      name: 'clientName',
      title: 'Client / recipient name',
      type: 'string',
      description: 'e.g. "Nike". Shown in the Slack ping and usable in the copy.',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'The URL: lisle.land/for/<slug>.',
      options: {source: 'clientName', maxLength: 40},
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'loaderCopy',
      title: 'Loader copy (override)',
      type: 'string',
      description:
        'Text shown in the loading screen (the "… Creative Selection" line). Leave blank to use the site default.',
    }),
    defineField({
      name: 'introText',
      title: 'Intro copy (override)',
      type: 'text',
      rows: 4,
      description: 'The typewriter intro paragraph. Leave blank to use the site default.',
    }),
    defineField({
      name: 'selectedProjects',
      title: 'Project listing',
      type: 'array',
      description: 'Pick and drag-to-reorder the projects shown on this pitch. Leave empty to show all projects.',
      of: [{type: 'reference', to: [{type: 'project'}]}],
    }),
    defineField({
      name: 'expiresAt',
      title: 'Expires at',
      type: 'datetime',
      description: 'After this moment the page shows an "expired" screen and stops tracking.',
      initialValue: () => new Date(Date.now() + 60 * 86400 * 1000).toISOString(),
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'views',
      title: 'Views',
      type: 'number',
      description:
        'Auto-increments on each visit. Set back to 0 to re-arm the first-view Slack ping before sending the link to a real prospect.',
      initialValue: 0,
    }),
    defineField({
      name: 'published',
      title: 'Published',
      type: 'boolean',
      description: 'When off, the public /for/<slug> link 404s.',
      initialValue: false,
    }),
    defineField({
      name: 'internalNotes',
      title: 'Internal notes',
      type: 'text',
      rows: 3,
      description: 'Private context. Never shown on the page.',
    }),
  ],
  preview: {
    select: {title: 'clientName', slug: 'slug.current', published: 'published'},
    prepare: ({title, slug, published}) => ({
      title: title || '(untitled pitch)',
      subtitle: [slug ? `/for/${slug}` : null, published ? 'published' : 'draft'].filter(Boolean).join(' · '),
    }),
  },
})
