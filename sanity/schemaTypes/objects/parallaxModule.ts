import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'parallaxModule',
  title: 'Parallax module',
  type: 'object',
  fields: [
    defineField({name: 'backgroundImage', title: 'Background image', type: 'image', options: {hotspot: true}}),
    defineField({name: 'backgroundImageMobile', title: 'Background image (mobile)', type: 'image', options: {hotspot: true}}),
    defineField({name: 'foregroundImage', title: 'Foreground image', type: 'image', options: {hotspot: true}}),
    defineField({name: 'foregroundImageMobile', title: 'Foreground image (mobile)', type: 'image', options: {hotspot: true}}),
    defineField({
      name: 'intensity',
      title: 'Parallax intensity',
      type: 'number',
      description: 'Higher = more movement.',
      validation: (R) => R.min(0).max(20),
    }),
  ],
  preview: {
    select: {media: 'foregroundImage'},
    prepare: ({media}) => ({title: 'Parallax module', media}),
  },
})
