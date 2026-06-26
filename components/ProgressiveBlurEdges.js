'use client'

/**
 * Top + bottom viewport edge blur, applied over ALL page content (text, images,
 * parallax, video) via stacked backdrop-filter layers — the same mechanism the
 * portfolio already uses for its transitions. Progressive falloff: strongest at
 * the very edge, sharp by the inner side of the band. No grain.
 *
 * Tunables (CSS vars on :root, or defaults below):
 *   --edge-blur-height  band height at each edge   (default 100px)
 *   --edge-blur-max     peak blur at the edge      (default 9px)
 */

const LAYERS = 6
const INNER_FADE = 12 // % of band over which each layer fades out
const INNER_CUTOFF = 18 // % — how close to the edge the strongest layer sits

function buildLayers(edge) {
  const dir = edge === 'top' ? 'to bottom' : 'to top'
  const layers = []
  for (let k = 0; k < LAYERS; k++) {
    const blur = `calc(var(--edge-blur-max, 9px) * ${((k + 1) / LAYERS).toFixed(3)})`
    const cutoff = 100 - (100 - INNER_CUTOFF) * (k / (LAYERS - 1))
    const c1 = Math.max(0, cutoff - INNER_FADE)
    const mask = `linear-gradient(${dir}, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${c1.toFixed(1)}%, rgba(0,0,0,0) ${cutoff.toFixed(1)}%)`
    layers.push({ blur, mask })
  }
  return layers
}

function Band({ edge }) {
  const layers = buildLayers(edge)
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        [edge]: 0,
        height: 'var(--edge-blur-height, 120px)',
        zIndex: 10000,
        pointerEvents: 'none',
      }}
    >
      {layers.map((l, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            inset: 0,
            backdropFilter: `blur(${l.blur})`,
            WebkitBackdropFilter: `blur(${l.blur})`,
            maskImage: l.mask,
            WebkitMaskImage: l.mask,
          }}
        />
      ))}
    </div>
  )
}

export default function ProgressiveBlurEdges() {
  return (
    <>
      <Band edge="top" />
      <Band edge="bottom" />
    </>
  )
}
