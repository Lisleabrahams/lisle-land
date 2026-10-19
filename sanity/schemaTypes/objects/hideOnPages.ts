import {defineField} from 'sanity'

/**
 * Per-module page visibility — the simple version of "only this page".
 * Add an application page here and THIS module disappears on that page
 * only; the main site and every other page keep it. No copies, no forks:
 * one project, per-page module visibility.
 */
export const hideOnPagesField = defineField({
  name: 'hideOnPages',
  title: 'Hide on pages',
  type: 'array',
  description:
    'This module is hidden on the application pages picked here — every other page and the main site keep it.',
  of: [{type: 'reference', to: [{type: 'pitchPage'}]}],
})
