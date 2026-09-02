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
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Internal label shown in the Media modules list. Never rendered on the site.',
    }),
    defineField({name: 'backgroundImage', title: 'Background image', type: 'image', options: {hotspot: true}}),
    defineField({name: 'backgroundImageMobile', title: 'Background image (mobile)', type: 'image', options: {hotspot: true}}),
    defineField({
      name: 'backgroundVideo',
      title: 'Background video',
      type: 'file',
      description: 'Autoplaying, muted, looped. When set, used instead of the background image.',
      options: {accept: 'video/*'},
    }),
    defineField({
      name: 'backgroundVideoMobile',
      title: 'Background video (mobile)',
      type: 'file',
      options: {accept: 'video/*'},
    }),
    defineField({
      name: 'backgroundWidth',
      title: 'Background width (%)',
      type: 'string',
      description: 'Desktop width of the background layer. 100 = full module width.',
      options: {list: WIDTHS},
    }),
    defineField({
      name: 'backgroundPosition',
      title: 'Background position',
      type: 'string',
      description: 'Where the background layer sits horizontally on desktop.',
      options: {list: POSITIONS, layout: 'radio', direction: 'horizontal'},
    }),
    defineField({name: 'foregroundImage', title: 'Foreground image', type: 'image', options: {hotspot: true}}),
    defineField({name: 'foregroundImageMobile', title: 'Foreground image (mobile)', type: 'image', options: {hotspot: true}}),
    defineField({
      name: 'foregroundVideo',
      title: 'Foreground video',
      type: 'file',
      description: 'Autoplaying, muted, looped. When set, used instead of the foreground image.',
      options: {accept: 'video/*'},
    }),
    defineField({
      name: 'foregroundVideoMobile',
      title: 'Foreground video (mobile)',
      type: 'file',
      options: {accept: 'video/*'},
    }),
    defineField({
      name: 'foregroundWidth',
      title: 'Foreground width (%)',
      type: 'string',
      description: 'Desktop width of the foreground layer. 100 = full module width.',
      options: {list: WIDTHS},
    }),
    defineField({
      name: 'foregroundPosition',
      title: 'Foreground position',
      type: 'string',
      description: 'Where the foreground layer sits horizontally on desktop.',
      options: {list: POSITIONS, layout: 'radio', direction: 'horizontal'},
    }),
    defineField({
      name: 'intensity',
      title: 'Parallax intensity',
      type: 'number',
      description: 'Higher = more movement.',
      validation: (R) => R.min(0).max(20),
    }),
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
