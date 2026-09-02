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
    defineField({
      name: 'desktopHeight',
      title: 'Desktop height (% of screen)',
      type: 'string',
      description: 'Strip height on desktop. 100 = full viewport (default).',
      options: {list: ['100', '90', '80', '70', '60', '50', '40', '30']},
    }),
    defineField({
      name: 'mobileHeight',
      title: 'Mobile height (% of screen)',
      type: 'string',
      description: 'Strip height on mobile. Default 70.',
      options: {list: ['100', '90', '80', '70', '60', '50', '40', '30']},
    }),
  ],
  preview: {
    select: {media: 'image'},
    prepare: ({media}) => ({title: 'Horizontal scroll image', media}),
  },
})
