import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'horizontalImage',
  title: 'Horizontal scroll image',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Wide image',
      type: 'image',
      options: {hotspot: true},
      description: 'A wide image that scrolls horizontally as the page scrolls.',
    }),
    defineField({
      name: 'mobileImage',
      title: 'Mobile image',
      type: 'image',
      options: {hotspot: true},
      description: 'Optional mobile-specific image. Falls back to the wide image when empty.',
    }),
  ],
  preview: {
    select: {media: 'image'},
    prepare: ({media}) => ({title: 'Horizontal scroll image', media}),
  },
})
