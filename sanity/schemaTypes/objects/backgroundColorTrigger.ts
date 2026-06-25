import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'backgroundColorTrigger',
  title: 'Background colour trigger',
  type: 'object',
  description: 'Changes the page background colour from this point as the reader scrolls.',
  fields: [
    defineField({
      name: 'quickPresets',
      title: 'Background colour',
      type: 'string',
      description: 'Hex value, e.g. #000000 or #ffffff.',
    }),
    // Retained for backward compatibility with older documents.
    defineField({
      name: 'colorHex',
      title: 'Colour (legacy)',
      type: 'string',
      hidden: true,
    }),
  ],
  preview: {
    select: {color: 'quickPresets'},
    prepare: ({color}) => ({title: 'Background colour', subtitle: color || '—'}),
  },
})
