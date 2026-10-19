import {useCallback, useEffect, useState} from 'react'
import {useClient, type DocumentActionComponent, type DocumentActionProps} from 'sanity'
import {useRouter} from 'sanity/router'

/**
 * "Only this page edits" — lives on the PROJECT document itself, where Lisle
 * is when she's about to edit modules for one application page.
 *
 * Editing a shared project is global; isolation requires a page-local copy.
 * This action: lists the application pages that use this project → she picks
 * one → the project is duplicated with `pitchOnly: true` (hidden from the
 * main site), that page's reference is swapped to the copy in place, and the
 * Studio navigates straight into the copy so the edits she makes next are
 * page-only. It must be used BEFORE making page-specific edits — it cannot
 * un-share edits already made to the shared project.
 */

type PitchRow = {
  id: string
  clientName: string
  slug?: string
  refKey?: string
}

const sysFields = ['_id', '_rev', '_createdAt', '_updatedAt', '_system', '_originalId']

export const OnlyThisPageEditsAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const {id, draft, published, onComplete} = props
  const client = useClient({apiVersion: '2024-01-01'})
  const router = useRouter()
  const doc = (draft || published) as any
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<PitchRow[] | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const publishedId = id.replace(/^drafts\./, '')

  useEffect(() => {
    if (!open) return
    let cancelled = false
    client
      .fetch(
        `*[_type == "pitchPage" && references($id)]{
          _id,
          clientName,
          "slug": slug.current,
          "refKey": selectedProjects[_ref == $id][0]._key
        }`,
        {id: publishedId}
      )
      .then((res: any[]) => !cancelled && setRows(res || []))
      .catch(() => !cancelled && setRows([]))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const fork = useCallback(
    async (pitch: PitchRow) => {
      setBusyId(pitch.id)
      setMessage(null)
      try {
        const src =
          (await client.getDocument(`drafts.${publishedId}`)) ||
          (await client.getDocument(publishedId))
        if (!src) throw new Error('Could not load this project')
        const copy: any = {...src}
        for (const f of sysFields) delete copy[f]
        copy.title = `${(src as any).title} — ${pitch.clientName} only`
        copy.pitchOnly = true
        if (copy.slug?.current) {
          copy.slug = {
            _type: 'slug',
            current: `${copy.slug.current}-${pitch.slug || 'page'}-only`.slice(0, 96),
          }
        }
        const created = await client.create({_type: 'project', ...copy})

        // Swap the page's reference to the copy, in place. Patch the page's
        // draft if one exists, and the published page otherwise (publishing
        // a stale draft later would undo a published-only patch).
        const pitchPublishedId = pitch.id.replace(/^drafts\./, '')
        const pitchDraft = await client.getDocument(`drafts.${pitchPublishedId}`)
        const targetId = pitchDraft ? `drafts.${pitchPublishedId}` : pitchPublishedId
        if (!pitch.refKey) throw new Error("Couldn't locate this project in that page's list")
        await client
          .patch(targetId)
          .insert('replace', `selectedProjects[_key=="${pitch.refKey}"]`, [
            {_type: 'reference', _ref: created._id, _key: pitch.refKey},
          ])
          .commit()

        setOpen(false)
        setRows(null)
        onComplete()
        // Jump straight into the copy so the next edits are page-only.
        router.navigateIntent('edit', {id: created._id, type: 'project'})
      } catch (err: any) {
        setMessage(`Something went wrong: ${err?.message || err}`)
      } finally {
        setBusyId(null)
      }
    },
    [client, publishedId, onComplete, router]
  )

  // A page-only copy never forks again from here.
  if (doc?.pitchOnly === true) return null

  return {
    label: 'Only this page edits…',
    onHandle: () => setOpen(true),
    dialog: open && {
      type: 'dialog' as const,
      header: 'Only this page edits',
      onClose: () => {
        setOpen(false)
        onComplete()
      },
      content: (
        <div style={{display: 'flex', flexDirection: 'column', gap: 12, padding: 4}}>
          <div style={{fontSize: 13, lineHeight: 1.5, opacity: 0.8}}>
            This is the <strong>shared</strong> project — editing it here changes every page
            that uses it. Pick the application page you&apos;re working on: you&apos;ll get a
            copy only that page uses, and be taken straight into it. Edit the copy, not
            this one.
          </div>
          {!rows && <div style={{fontSize: 13}}>Finding pages that use this project…</div>}
          {rows && rows.length === 0 && (
            <div style={{fontSize: 13}}>
              No application page uses this project yet — add it to the page first, then
              come back here.
            </div>
          )}
          {rows &&
            rows.map((pitch) => (
              <div
                key={pitch.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  border: '1px solid rgba(128,128,128,0.35)',
                  borderRadius: 4,
                  padding: '8px 12px',
                }}
              >
                <span style={{fontSize: 13}}>
                  {pitch.clientName}
                  {pitch.slug ? ` — /for/${pitch.slug}` : ''}
                </span>
                <button
                  type="button"
                  disabled={busyId !== null}
                  onClick={() => fork(pitch)}
                  style={{
                    fontSize: 13,
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: '1px solid rgba(128,128,128,0.5)',
                    background: 'transparent',
                    color: 'inherit',
                    cursor: busyId !== null ? 'default' : 'pointer',
                  }}
                >
                  {busyId === pitch.id ? 'Copying…' : 'Copy for this page'}
                </button>
              </div>
            ))}
          {message && <div style={{fontSize: 13, lineHeight: 1.5}}>{message}</div>}
        </div>
      ),
    },
  }
}
