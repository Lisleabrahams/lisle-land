import React from 'react'

/**
 * Render `text` with any of the given `names` wrapped in <strong>. Works with
 * the typewriter (partial text just isn't matched until a name is fully typed).
 * Used to bold "Lisle Abrahams" on the site and the client name on pitch pages.
 */
export function boldNames(text, names) {
  if (!text) return text
  const targets = (names || [])
    .filter(Boolean)
    .map((n) => String(n).trim())
    .filter((n) => n.length)
    .sort((a, b) => b.length - a.length)
  if (!targets.length) return text

  const escaped = targets.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const re = new RegExp(`(${escaped.join('|')})`, 'g')

  return text.split(re).map((part, i) =>
    targets.includes(part)
      ? (
        <strong key={i} style={{ fontWeight: 700 }}>
          {part}
        </strong>
      )
      : part,
  )
}
