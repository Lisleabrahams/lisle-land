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
  ],
  preview: {
    select: {media: 'image'},
    prepare: ({media}) => ({title: 'Horizontal scroll image', media}),
  },
})
