'use client'

import { useState } from 'react'

interface Props {
  name: string
  label: string
  options: string[]         // predefined values
  defaultValue?: string     // existing value (could be custom)
  placeholder?: string
}

const cls = 'w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 transition'

export default function OtherSelect({ name, label, options, defaultValue = '', placeholder }: Props) {
  const isKnown = options.includes(defaultValue)
  const [sel, setSel] = useState(defaultValue && !isKnown ? '__other__' : defaultValue)
  const [custom, setCustom] = useState(isKnown ? '' : defaultValue)

  const finalValue = sel === '__other__' ? custom : sel

  function fmt(v: string) {
    return v.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-gray-400">{label}</label>
      <select value={sel} onChange={e => setSel(e.target.value)} title={label} className={cls}>
        <option value="">— Select —</option>
        {options.map(o => <option key={o} value={o}>{fmt(o)}</option>)}
        <option value="__other__">Other (type below)</option>
      </select>
      {sel === '__other__' && (
        <input
          value={custom}
          onChange={e => setCustom(e.target.value)}
          placeholder={placeholder ?? `Enter ${label.toLowerCase()}…`}
          className={cls}
        />
      )}
      <input type="hidden" name={name} value={finalValue} />
    </div>
  )
}
