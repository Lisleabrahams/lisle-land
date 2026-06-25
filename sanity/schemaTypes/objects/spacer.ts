import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'spacer',
  title: 'Spacer',
  type: 'object',
  fields: [
    defineField({
      name: 'size',
      title: 'Size',
      type: 'string',
      options: {list: ['small', 'medium', 'xlarge'], layout: 'radio'},
      initialValue: 'medium',
    }),
  ],
  preview: {
    select: {size: 'size'},
    prepare: ({size}) => ({title: `Spacer — ${size || 'medium'}`}),
  },
})
