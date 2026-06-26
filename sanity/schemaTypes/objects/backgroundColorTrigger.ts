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
    defineField({
      name: 'activationPoint',
      title: 'Activation point (% from top of viewport)',
      type: 'number',
      description:
        'When this colour kicks in as you scroll — % of the viewport height from the top. 50 = middle (default), 30 = upper third, 70 = lower third. Stack triggers (e.g. white → red → white) to fade through colours.',
      initialValue: 50,
      validation: (R) => R.min(0).max(100),
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
