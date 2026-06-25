import type {StructureResolver} from 'sanity/structure'

/**
 * Custom desk: only the two things you manage — Projects and Pitch pages.
 * Legacy `duck` documents from the old lisleandpool dataset are intentionally
 * not surfaced (the data is left untouched, just hidden from the editor).
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Projects')
        .schemaType('project')
        .child(S.documentTypeList('project').title('Projects').defaultOrdering([{field: 'order', direction: 'asc'}])),
      S.divider(),
      S.listItem()
        .title('Pitches / applications')
        .schemaType('pitchPage')
        .child(S.documentTypeList('pitchPage').title('Pitches / applications')),
    ])
