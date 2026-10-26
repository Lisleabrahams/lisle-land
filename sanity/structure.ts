import type {StructureResolver} from 'sanity/structure'

/**
 * Custom desk: Projects (main site), Application-only projects, Pitch pages.
 * The "Projects (main site)" list IS the public lisle.land homepage — a
 * project in it shows there, a project moved out doesn't. Moving between the
 * two lists is the "Remove from main site" / "Show on main site" action in
 * the document's publish-chevron menu (it flips the hidden `hideFromHome`
 * flag, which app/page.tsx and the pitch fallback filter on). Legacy `duck`
 * documents from the old lisleandpool dataset stay hidden.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Projects (main site)')
        .schemaType('project')
        .child(
          S.documentList()
            .title('Projects (main site)')
            .schemaType('project')
            .apiVersion('2024-01-01')
            .filter('_type == "project" && hideFromHome != true')
            .defaultOrdering([{field: 'order', direction: 'asc'}])
        ),
      S.listItem()
        .title('Application-only projects')
        .schemaType('project')
        .child(
          S.documentList()
            .title('Application-only projects')
            .schemaType('project')
            .apiVersion('2024-01-01')
            .filter('_type == "project" && hideFromHome == true')
            .defaultOrdering([{field: 'title', direction: 'asc'}])
        ),
      S.divider(),
      S.listItem()
        .title('Pitches / applications')
        .schemaType('pitchPage')
        .child(S.documentTypeList('pitchPage').title('Pitches / applications')),
    ])
