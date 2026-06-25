import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'splitScreenModule',
  title: 'Split-screen module',
  type: 'object',
  fields: [
    defineField({name: 'leftImage', title: 'Left image', type: 'image', options: {hotspot: true}}),
    defineField({name: 'rightImage', title: 'Right image', type: 'image', options: {hotspot: true}}),
    defineField({
      name: 'framedImageSize',
      title: 'Framed image size (%)',
      type: 'string',
      options: {list: ['40', '50', '60', '70', '80', '90']},
    }),
    defineField({
      name: 'fullBleedSide',
      title: 'Full-bleed side',
      type: 'string',
      options: {list: ['left', 'right'], layout: 'radio'},
    }),
    defineField({
      name: 'mobileLayout',
      title: 'Mobile layout',
      type: 'string',
      options: {list: ['fullBleedTop', 'fullBleedBottom', 'stacked']},
    }),
    defineField({
      name: 'parallaxIntensity',
      title: 'Parallax intensity',
      type: 'number',
      validation: (R) => R.min(0).max(20),
    }),
  ],
  preview: {
    select: {media: 'leftImage'},
    prepare: ({media}) => ({title: 'Split-screen module', media}),
  },
})
