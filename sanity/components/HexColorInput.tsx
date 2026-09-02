import {useCallback} from 'react'
import {set, unset, type StringInputProps} from 'sanity'

/**
 * Hex colour input with a native colour picker swatch alongside the regular
 * text field — pick visually or type a hex, both write the same string.
 */
export function HexColorInput(props: StringInputProps) {
  const {value = '', onChange} = props

  const handlePick = useCallback(
    (next: string) => {
      onChange(next ? set(next) : unset())
    },
    [onChange],
  )

  const isValidHex = /^#[0-9a-fA-F]{6}$/.test(value)
  const pickerValue = isValidHex ? value : '#ffffff'

  return (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <input
        type="color"
        value={pickerValue}
        onChange={(e) => handlePick(e.target.value)}
        title="Pick a colour"
        style={{
          width: '42px',
          height: '35px',
          padding: 0,
          border: '1px solid var(--card-border-color, #ccc)',
          borderRadius: '3px',
          background: 'none',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      />
      <div style={{flexGrow: 1}}>{props.renderDefault(props)}</div>
    </div>
  )
}
