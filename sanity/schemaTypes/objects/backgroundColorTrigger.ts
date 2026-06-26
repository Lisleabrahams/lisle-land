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
      title: 'Activation point (% of viewport from top)',
      type: 'number',
      description:
        'When this colour kicks in as you scroll. Lower % = fires higher up the screen (later); higher % = fires nearer the bottom (sooner). 50 = middle. Stack triggers (e.g. white → red → white) to fade through colours.',
      options: {
        layout: 'dropdown',
        list: [
          {title: '10% — top (latest)', value: 10},
          {title: '20%', value: 20},
          {title: '30%', value: 30},
          {title: '40%', value: 40},
          {title: '50% — middle (default)', value: 50},
          {title: '60%', value: 60},
          {title: '70%', value: 70},
          {title: '80%', value: 80},
          {title: '90% — bottom (soonest)', value: 90},
        ],
      },
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
