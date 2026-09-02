import {defineType, defineField} from 'sanity'

const WIDTHS = ['100', '80', '60', '50', '40', '30', '20']
const POSITIONS = [
  {title: 'Left', value: 'left'},
  {title: 'Centre', value: 'center'},
  {title: 'Right', value: 'right'},
]

export default defineType({
  name: 'parallaxModule',
  title: 'Parallax module',
  type: 'object',
  fieldsets: [
    {name: 'desktop', title: 'Desktop', options: {collapsible: true, collapsed: false}},
    {name: 'mobile', title: 'Mobile', options: {collapsible: true, collapsed: true}},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Internal label shown in the Media modules list. Never rendered on the site.',
    }),
    // ---------- Desktop ----------
    defineField({name: 'backgroundImage', title: 'Background image', type: 'image', options: {hotspot: true}, fieldset: 'desktop'}),
    defineField({
      name: 'backgroundVideo',
      title: 'Background video',
      type: 'file',
      description: 'Autoplaying, muted, looped. When set, used instead of the background image.',
      options: {accept: 'video/*'},
      fieldset: 'desktop',
    }),
    defineField({
      name: 'backgroundWidth',
      title: 'Background width (%)',
      type: 'string',
      description: 'Desktop width of the background layer. 100 = full module width.',
      options: {list: WIDTHS},
      fieldset: 'desktop',
    }),
    defineField({
      name: 'backgroundPosition',
      title: 'Background position',
      type: 'string',
      description: 'Where the background layer sits horizontally on desktop.',
      options: {list: POSITIONS, layout: 'radio', direction: 'horizontal'},
      fieldset: 'desktop',
    }),
    defineField({name: 'foregroundImage', title: 'Foreground image', type: 'image', options: {hotspot: true}, fieldset: 'desktop'}),
    defineField({
      name: 'foregroundVideo',
      title: 'Foreground video',
      type: 'file',
      description: 'Autoplaying, muted, looped. When set, used instead of the foreground image.',
      options: {accept: 'video/*'},
      fieldset: 'desktop',
    }),
    defineField({
      name: 'foregroundWidth',
      title: 'Foreground width (%)',
      type: 'string',
      description: 'Desktop width of the foreground layer. 100 = full module width.',
      options: {list: WIDTHS},
      fieldset: 'desktop',
    }),
    defineField({
      name: 'foregroundPosition',
      title: 'Foreground position',
      type: 'string',
      description: 'Where the foreground layer sits horizontally on desktop.',
      options: {list: POSITIONS, layout: 'radio', direction: 'horizontal'},
      fieldset: 'desktop',
    }),
    // ---------- Mobile ----------
    defineField({
      name: 'backgroundMobile',
      title: 'Background (mobile)',
      type: 'file',
      description: 'Image OR video — it works out which. Overrides everything else on mobile; empty falls back to the desktop background.',
      options: {accept: 'image/*,video/*'},
      fieldset: 'mobile',
    }),
    defineField({
      name: 'foregroundMobile',
      title: 'Foreground (mobile)',
      type: 'file',
      description: 'Image OR video — it works out which. Overrides everything else on mobile; empty falls back to the desktop foreground.',
      options: {accept: 'image/*,video/*'},
      fieldset: 'mobile',
    }),
    defineField({
      name: 'mobileLayerGap',
      title: 'Gap between layers (mobile, %)',
      type: 'number',
      description: 'Vertical space between the 1st (background) and 2nd (foreground) art on mobile, as % of the screen. Negative pulls the 2nd up over the 1st (e.g. -30); 50 = half a screen of air between them. Blank = default overlay layout.',
      validation: (R) => R.min(-100).max(150),
      fieldset: 'mobile',
    }),
    // ---------- Shared ----------
    defineField({
      name: 'intensity',
      title: 'Parallax intensity',
      type: 'number',
      description: 'Higher = more movement.',
      validation: (R) => R.min(0).max(20),
    }),
    // Legacy per-type mobile fields — hidden but still rendered as fallbacks
    // so existing content keeps working.
    defineField({name: 'backgroundImageMobile', title: 'Background image (mobile) — legacy', type: 'image', hidden: true}),
    defineField({name: 'backgroundVideoMobile', title: 'Background video (mobile) — legacy', type: 'file', hidden: true}),
    defineField({name: 'foregroundImageMobile', title: 'Foreground image (mobile) — legacy', type: 'image', hidden: true}),
    defineField({name: 'foregroundVideoMobile', title: 'Foreground video (mobile) — legacy', type: 'file', hidden: true}),
  ],
  preview: {
    select: {title: 'title', media: 'foregroundImage', bg: 'backgroundImage'},
    prepare: ({title, media, bg}) => ({
      title: title || 'Parallax module',
      subtitle: title ? 'Parallax module' : undefined,
      media: media || bg,
    }),
  },
})
