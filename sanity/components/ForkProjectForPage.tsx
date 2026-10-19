import {useCallback, useEffect, useState} from 'react'
import {useClient, type DocumentActionComponent, type DocumentActionProps} from 'sanity'

/**
 * "This page only" forking for application pages.
 *
 * A reference edit in Sanity is global by nature — editing a project's
 * modules changes it on every page that references it. The only way to make
 * page-local module edits is to edit a page-local COPY. This document action
 * turns that into one click: pick a project from the pitch's list and it
 * (1) duplicates the project document with `pitchOnly: true` (hidden from
 * the main site and from pitches that inherit the full portfolio), and
 * (2) swaps this pitch's reference to point at the copy, in place, keeping
 * the list order. The original project and every other page stay untouched.
 * The fork must happen BEFORE page-specific edits — it cannot retroactively
 * un-share edits already made to the shared project.
 */

type Row = {
  key: string
  ref: string
  title: string
  pitchOnly?: boolean
}

const sysFields = ['_id', '_rev', '_createdAt', '_updatedAt', '_system', '_originalId']

export const ForkProjectForPageAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const {id, draft, published, onComplete} = props
  const client = useClient({apiVersion: '2024-01-01'})
  const doc = (draft || published) as any
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<Row[] | null>(null)
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const refs: {_key: string; _ref: string}[] = (doc?.selectedProjects || []).filter(
    (r: any) => r && r._ref
  )

  useEffect(() => {
    if (!open) return
    let cancelled = false
    const ids = refs.map((r) => r._ref)
    client
      .fetch(`*[_id in $ids]{_id, title, pitchOnly}`, {ids})
      .then((docs: any[]) => {
        if (cancelled) return
        setRows(
          refs.map((r) => {
            const d = docs.find((x) => x._id === r._ref)
            return {
              key: r._key,
              ref: r._ref,
              title: d?.title || r._ref,
              pitchOnly: d?.pitchOnly === true,
            }
          })
        )
      })
      .catch(() => !cancelled && setRows([]))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const fork = useCallback(
    async (row: Row) => {
      setBusyKey(row.key)
      setMessage(null)
      try {
        const src =
          (await client.getDocument(`drafts.${row.ref}`)) || (await client.getDocument(row.ref))
        if (!src) throw new Error('Could not load the project')
        const copy: any = {...src}
        for (const f of sysFields) delete copy[f]
        const pageLabel = doc?.clientName || doc?.slug?.current || 'this page'
        copy.title = `${src.title} — ${pageLabel} only`
        copy.pitchOnly = true
        if (copy.slug?.current) {
          copy.slug = {
            _type: 'slug',
            current: `${copy.slug.current}-${(doc?.slug?.current || 'page')}-only`.slice(0, 96),
          }
        }
        const created = await client.create({_type: 'project', ...copy})

        // Studio edits live on the draft — make sure one exists, then swap
        // the reference in place (same _key keeps the list order).
        const draftId = id.startsWith('drafts.') ? id : `drafts.${id}`
        const tx = client.transaction()
        if (!draft && published) {
          tx.createIfNotExists({...(published as any), _id: draftId})
        }
        tx.patch(draftId, (p) =>
          p.insert('replace', `selectedProjects[_key=="${row.key}"]`, [
            {_type: 'reference', _ref: created._id, _key: row.key},
          ])
        )
        await tx.commit()
        setMessage(
          `Done — this page now uses "${copy.title}". Open it from the Project listing and edit its modules freely; the original is untouched.`
        )
        setRows(null)
        setOpen(false)
        onComplete()
      } catch (err: any) {
        setMessage(`Something went wrong: ${err?.message || err}`)
      } finally {
        setBusyKey(null)
      }
    },
    [client, doc, draft, published, id, onComplete]
  )

  return {
    label: 'Copy a project for this page only…',
    onHandle: () => setOpen(true),
    dialog: open && {
      type: 'dialog' as const,
      header: 'This page only — fork a project',
      onClose: () => {
        setOpen(false)
        onComplete()
      },
      content: (
        <div style={{display: 'flex', flexDirection: 'column', gap: 12, padding: 4}}>
          <div style={{fontSize: 13, lineHeight: 1.5, opacity: 0.8}}>
            Pick a project to copy for this page. The copy replaces it in this page&apos;s
            Project listing, is hidden from the main site, and its modules can be edited
            without touching the original. Do this <strong>before</strong> making
            page-specific module changes.
          </div>
          {!rows && <div style={{fontSize: 13}}>Loading projects…</div>}
          {rows && rows.length === 0 && (
            <div style={{fontSize: 13}}>No projects selected on this page yet.</div>
          )}
          {rows &&
            rows.map((row) => (
              <div
                key={row.key}
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
                  {row.title}
                  {row.pitchOnly ? ' (already page-only)' : ''}
                </span>
                <button
                  type="button"
                  disabled={row.pitchOnly || busyKey !== null}
                  onClick={() => fork(row)}
                  style={{
                    fontSize: 13,
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: '1px solid rgba(128,128,128,0.5)',
                    background: 'transparent',
                    color: 'inherit',
                    cursor: row.pitchOnly || busyKey !== null ? 'default' : 'pointer',
                    opacity: row.pitchOnly ? 0.5 : 1,
                  }}
                >
                  {busyKey === row.key ? 'Copying…' : 'Copy for this page'}
                </button>
              </div>
            ))}
          {message && <div style={{fontSize: 13, lineHeight: 1.5}}>{message}</div>}
        </div>
      ),
    },
  }
}
