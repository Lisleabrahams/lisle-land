import {useCallback, useEffect, useMemo, useState} from 'react'
import {
  PatchEvent,
  insert,
  useClient,
  type ArrayOfObjectsInputProps,
} from 'sanity'

/**
 * Project listing input for application pages. Wraps the default array
 * input and adds two faster ways in:
 *  — "Add all projects": appends every project not already in the list,
 *    ordered like the main site (order asc).
 *  — "Select multiple…": a checkbox panel of the remaining projects, added
 *    together with one click.
 * The one-by-one picker (with its already-added filtering) stays untouched.
 */

type ProjectRow = {_id: string; title?: string; order?: number}

const newKey = () => Math.random().toString(36).slice(2, 14)

export function ProjectListInput(props: ArrayOfObjectsInputProps) {
  const client = useClient({apiVersion: '2024-01-01'})
  const [all, setAll] = useState<ProjectRow[] | null>(null)
  const [panel, setPanel] = useState(false)
  const [picked, setPicked] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let cancelled = false
    client
      .fetch(`*[_type == "project"] | order(order asc, title asc){_id, title, order}`)
      .then((res: ProjectRow[]) => !cancelled && setAll(res || []))
      .catch(() => !cancelled && setAll([]))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedIds = useMemo(
    () => new Set(((props.value as any[]) || []).map((r) => r && r._ref).filter(Boolean)),
    [props.value]
  )
  const remaining = useMemo(
    () => (all || []).filter((p) => !selectedIds.has(p._id)),
    [all, selectedIds]
  )

  const addProjects = useCallback(
    (rows: ProjectRow[]) => {
      if (!rows.length) return
      const items = rows.map((p) => ({_type: 'reference', _ref: p._id, _key: newKey()}))
      props.onChange(PatchEvent.from(insert(items, 'after', [-1])))
      setPicked({})
      setPanel(false)
    },
    [props]
  )

  const btn: React.CSSProperties = {
    fontSize: 13,
    padding: '6px 12px',
    borderRadius: 4,
    border: '1px solid rgba(128,128,128,0.5)',
    background: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
      {props.renderDefault(props)}
      <div style={{display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap'}}>
        <button
          type="button"
          style={{...btn, opacity: remaining.length ? 1 : 0.5}}
          disabled={!remaining.length}
          onClick={() => addProjects(remaining)}
        >
          {all === null
            ? 'Loading…'
            : remaining.length
              ? `Add all projects (${remaining.length})`
              : 'All projects added'}
        </button>
        {remaining.length > 0 && (
          <button type="button" style={btn} onClick={() => setPanel((v) => !v)}>
            {panel ? 'Close' : 'Select multiple…'}
          </button>
        )}
      </div>
      {panel && remaining.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            border: '1px solid rgba(128,128,128,0.35)',
            borderRadius: 4,
            padding: 12,
          }}
        >
          {remaining.map((p) => (
            <label
              key={p._id}
              style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer'}}
            >
              <input
                type="checkbox"
                checked={!!picked[p._id]}
                onChange={(e) => setPicked((prev) => ({...prev, [p._id]: e.target.checked}))}
              />
              {p.title || p._id}
            </label>
          ))}
          <div style={{marginTop: 6}}>
            <button
              type="button"
              style={{...btn, opacity: Object.values(picked).some(Boolean) ? 1 : 0.5}}
              disabled={!Object.values(picked).some(Boolean)}
              onClick={() => addProjects(remaining.filter((p) => picked[p._id]))}
            >
              Add selected ({remaining.filter((p) => picked[p._id]).length})
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
