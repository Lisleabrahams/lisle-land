// Shown when a pitch is past its expiry date. Matches the loader's quiet
// monospace aesthetic. No tracking, no project data.
export default function PitchExpired({ clientName }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#fff',
        color: '#1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Geist Mono", monospace',
        fontSize: '12px',
        lineHeight: '16px',
        fontWeight: 300,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <span>
        {clientName ? `${clientName} — ` : ''}this link has expired.
      </span>
    </div>
  )
}
