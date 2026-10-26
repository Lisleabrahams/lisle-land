import {useClient, type DocumentActionComponent} from 'sanity'

/**
 * One-click move between "Projects (main site)" and "Application-only
 * projects" in the desk. Shows in the chevron menu next to Publish on any
 * project. Writes the hidden `hideFromHome` flag straight to both the
 * published doc and its draft (if any), so the project jumps lists — and on
 * / off the public homepage — immediately, no re-publish needed.
 */
export const ToggleMainSiteAction: DocumentActionComponent = (props) => {
  const client = useClient({apiVersion: '2024-01-01'})
  const doc = (props.draft || props.published) as {hideFromHome?: boolean} | null
  if (!doc) return null
  const hidden = doc.hideFromHome === true

  return {
    label: hidden ? 'Show on main site' : 'Remove from main site',
    tone: hidden ? 'positive' : 'caution',
    onHandle: async () => {
      const set = {hideFromHome: !hidden}
      // Patch both ids; either may not exist — ignore that failure.
      await client.patch(props.id).set(set).commit().catch(() => null)
      await client
        .patch(`drafts.${props.id}`)
        .set(set)
        .commit()
        .catch(() => null)
      props.onComplete()
    },
  }
}
