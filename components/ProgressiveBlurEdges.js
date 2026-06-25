'use client'

/**
 * ProgressiveBlurEdges
 *
 * Fixed, non-interactive progressive-blur bands pinned to the top and bottom
 * edges of the viewport. The blur intensifies toward each edge and fades to
 * fully sharp at the inner side of the band — the same graduated falloff as the
 * JorgeCapillo / Codrops "WebGL Progressive Blur" demo, plus a faint film grain
 * carried over from that shader (it subtracts a little TV-noise). Because this
 * is a backdrop overlay it blurs EVERYTHING beneath it — the intro text, images
 * and video alike — which the WebGL version (image-planes only) can't do.
 *
 * Everything is tunable from CSS variables so the size is easy to finesse:
 *   --blur-top-height      height of the top band      (default 22vh)
 *   --blur-bottom-height   height of the bottom band   (default 22vh)
 *   --blur-max             peak blur at the very edge  (default 6px)
 *   --blur-grain-opacity   grain strength              (default 0.05)
 * Set them on :root (globals.css) or per-page to adjust.
 */

const LAYERS = 6
const INNER_FADE = 9 // % of band over which each layer fades to transparent
const INNER_CUTOFF = 16 // % — how close to the edge the strongest layer is confined

function buildLayers(edge) {
  // Sharp side is the INNER edge of the band; black (blurred) side is the
  // viewport edge. Top band: edge at top  -> gradient runs "to bottom".
  //                          Bottom band: edge at bottom -> gradient runs "to top".
  const dir = edge === 'top' ? 'to bottom' : 'to top'
  const layers = []
  for (let k = 0; k < LAYERS; k++) {
    // Peak blur (k = LAYERS-1) equals --blur-max; lower layers scale down.
    const blurExpr = `calc(var(--blur-max, 6px) * ${((k + 1) / LAYERS).toFixed(3)})`
    // Higher-blur layers are confined nearer the edge; the lowest-blur layer
    // covers the whole band. Layers compound, giving a smooth progressive blur.
    const cutoff = 100 - ((100 - INNER_CUTOFF) * (k / (LAYERS - 1)))
    const c1 = Math.max(0, cutoff - INNER_FADE)
    const mask = `linear-gradient(${dir}, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${c1.toFixed(1)}%, rgba(0,0,0,0) ${cutoff.toFixed(1)}%)`
    layers.push({ blurExpr, mask })
  }
  return layers
}

// Static, very fine grain — fractalNoise turbulence baked into a data URI so
// there's no extra network request and nothing animating per frame.
const GRAIN_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

function Band({ edge }) {
  const layers = buildLayers(edge)
  const heightVar =
    edge === 'top' ? 'var(--blur-top-height, 22vh)' : 'var(--blur-bottom-height, 22vh)'
  const grainDir = edge === 'top' ? 'to bottom' : 'to top'

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        [edge]: 0,
        height: heightVar,
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
            backdropFilter: `blur(${l.blurExpr})`,
            WebkitBackdropFilter: `blur(${l.blurExpr})`,
            maskImage: l.mask,
            WebkitMaskImage: l.mask,
          }}
        />
      ))}
      {/* Subtle grain, faded toward the sharp inner edge like the blur itself */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: GRAIN_URI,
          backgroundSize: '140px 140px',
          opacity: 'var(--blur-grain-opacity, 0.05)',
          mixBlendMode: 'overlay',
          maskImage: `linear-gradient(${grainDir}, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)`,
          WebkitMaskImage: `linear-gradient(${grainDir}, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)`,
        }}
      />
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
