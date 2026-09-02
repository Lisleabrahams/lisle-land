import {defineType, defineField, defineArrayMember} from 'sanity'

/**
 * Portfolio project. Schema reproduced from the existing `production` dataset
 * so every field on current documents is editable without data loss. The
 * `media` array mixes custom modules with extended built-in image/file members
 * (their stored `_type` stays "image"/"file", matching existing content).
 */
export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (R) => R.required()}),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Controls position in the portfolio (ascending).',
    }),
    defineField({name: 'description', title: 'Description', type: 'text', rows: 4}),
    defineField({
      name: 'media',
      title: 'Media modules',
      type: 'array',
      of: [
        defineArrayMember({type: 'parallaxModule'}),
        defineArrayMember({type: 'splitScreenModule'}),
        defineArrayMember({type: 'horizontalImage'}),
        defineArrayMember({type: 'backgroundColorTrigger'}),
        defineArrayMember({type: 'spacer'}),
        defineArrayMember({type: 'negativeSpacer'}),
        // Extended built-in image — stored _type "image".
        defineArrayMember({
          type: 'image',
          name: 'image',
          title: 'Image',
          options: {hotspot: true},
          fields: [
            defineField({name: 'title', title: 'Title', type: 'string'}),
            defineField({name: 'description', title: 'Caption', type: 'text', rows: 2}),
            defineField({name: 'alt', title: 'Alt text', type: 'string'}),
            defineField({
              name: 'desktopWidth',
              title: 'Desktop width (%)',
              type: 'string',
              options: {list: ['100', '80', '60', '50', '40', '30', '20', '10']},
            }),
            defineField({
              name: 'parallax',
              title: 'Parallax',
              type: 'number',
              description: 'Scroll drift. Empty or 0 = static. 5 = parallax-module baseline, higher = more. Negative drifts the opposite direction — good for overlapped images pulling apart.',
              validation: (R) => R.min(-20).max(20),
            }),
            defineField({
              name: 'desktopPosition',
              title: 'Desktop position',
              type: 'string',
              description: 'Desktop only. Defaults to centre.',
              options: {
                list: [
                  {title: 'Left', value: 'left'},
                  {title: 'Centre', value: 'center'},
                  {title: 'Right', value: 'right'},
                ],
                layout: 'radio',
                direction: 'horizontal',
              },
            }),
            defineField({name: 'mobileImage', title: 'Mobile image', type: 'image', options: {hotspot: true}}),
            defineField({name: 'mobileFullHeight', title: 'Mobile full height', type: 'boolean'}),
          ],
        }),
        // Extended built-in file (video) — stored _type "file".
        defineArrayMember({
          type: 'file',
          name: 'file',
          title: 'Video / file',
          fields: [
            defineField({
              name: 'desktopWidth',
              title: 'Desktop width (%)',
              type: 'string',
              options: {list: ['100', '80', '60', '50', '40', '30', '20', '10']},
            }),
            defineField({
              name: 'desktopPosition',
              title: 'Desktop position',
              type: 'string',
              description: 'Desktop only. Defaults to centre.',
              options: {
                list: [
                  {title: 'Left', value: 'left'},
                  {title: 'Centre', value: 'center'},
                  {title: 'Right', value: 'right'},
                ],
                layout: 'radio',
                direction: 'horizontal',
              },
            }),
            defineField({
              name: 'parallax',
              title: 'Parallax',
              type: 'number',
              description: 'Scroll drift. Empty or 0 = static. 5 = parallax-module baseline, higher = more. Negative drifts the opposite direction.',
              validation: (R) => R.min(-20).max(20),
            }),
            defineField({
              name: 'mobileVideo',
              title: 'Mobile video',
              type: 'file',
              options: {accept: 'video/*'},
              description: 'Optional mobile-specific video. Falls back to the main video when empty.',
            }),
            defineField({name: 'mobileFullHeight', title: 'Mobile full height', type: 'boolean'}),
          ],
          preview: {
            select: {
              filename: 'asset.originalFilename',
              width: 'desktopWidth',
              position: 'desktopPosition',
              parallax: 'parallax',
            },
            prepare: ({filename, width, position, parallax}) => {
              const bits = [
                width ? `${width}%` : null,
                position && position !== 'center' ? position : null,
                parallax ? `parallax ${parallax}` : null,
              ].filter(Boolean)
              return {
                title: filename || 'Video',
                subtitle: bits.length ? bits.join(' · ') : 'video',
              }
            },
          },
        }),
      ],
    }),
  ],
  orderings: [
    {title: 'Order, ascending', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'title', subtitle: 'slug.current'},
  },
})
