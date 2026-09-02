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
    defineField({
      name: 'appliesTo',
      title: 'Applies to',
      type: 'string',
      description: 'Which breakpoint gets this spacer.',
      options: {
        list: [
          {title: 'Both', value: 'both'},
          {title: 'Desktop only', value: 'desktop'},
          {title: 'Mobile only', value: 'mobile'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'both',
    }),
  ],
  preview: {
    select: {size: 'size', appliesTo: 'appliesTo'},
    prepare: ({size, appliesTo}) => ({
      title: `Spacer — ${size || 'medium'}`,
      subtitle: appliesTo && appliesTo !== 'both' ? `${appliesTo} only` : undefined,
    }),
  },
})
