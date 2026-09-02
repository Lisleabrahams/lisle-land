import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'negativeSpacer',
  title: 'Negative spacer (pull up)',
  type: 'object',
  fields: [
    defineField({
      name: 'desktopAmount',
      title: 'Pull up — desktop (%)',
      type: 'number',
      description: 'Pulls the following module up by this % of the screen height, overlapping the one above. 0–100.',
      initialValue: 20,
      validation: (R) => R.min(0).max(100),
    }),
    defineField({
      name: 'mobileAmount',
      title: 'Pull up — mobile (%)',
      type: 'number',
      description: 'Mobile pull-up. Empty = no pull on mobile (mobile reflows differently, so pulls are opt-in per breakpoint).',
      validation: (R) => R.min(0).max(100),
    }),
  ],
  preview: {
    select: {desktop: 'desktopAmount', mobile: 'mobileAmount'},
    prepare: ({desktop, mobile}) => ({
      title: `Negative spacer — pull up ${desktop ?? 20}%${mobile != null ? ` / ${mobile}% mobile` : ''}`,
    }),
  },
})
