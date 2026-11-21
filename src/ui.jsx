import { createContext, useContext, useState } from 'react'

export const AppContext = createContext()
export const useApp = () => useContext(AppContext)

export const fmtDate = iso => new Date(iso + 'T12:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
export const fmtTime = time => {
  const [h, m] = time.split(':')
  return `${h % 12 || 12}:${m}${h < 12 ? 'am' : 'pm'}`
}
export const initials = name => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

export const I = {
  pin: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21zM9.5 9.5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0',
  pencil: 'M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4',
  chevron: 'M9 6l6 6-6 6',
  back: 'M15 6l-6 6 6 6',
  cross: 'M6 6l12 12M18 6L6 18',
  tick: 'M5 12.5l4.5 4.5L19 7.5',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  star: 'M12 4l2.4 5 5.6.6-4.2 3.8 1.2 5.6-5-2.9-5 2.9 1.2-5.6L4 9.6 9.6 9z',
  info: 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 11v5M12 8h.01',
  drink: 'M4 4h16l-8 9zM12 13v7M8 20h8',
  arrow: 'M7 17L17 7M8 7h9v9',
  calendar: 'M6.5 5h11a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-11a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3zM3.5 10h17M8 3v4M16 3v4',
  list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  trophy: 'M7 4h10v5a5 5 0 0 1-10 0V4zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M12 14v4M8 21h8M9 18h6',
}

export const Icon = ({ d, size = 18, w = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
)

export const Bib = ({ t, size = '' }) => <span className={`bib ${size}`} style={{ background: t.color }}>{t.name[0]}</span>

export const Side = ({ t, right, cls = '' }) => (
  <span className={`side ${right ? 'right' : ''} ${cls}`}>{right && t.name}<Bib t={t} />{!right && t.name}</span>
)

export const Week = ({ title, badge, children }) => (
  <section>
    <h3>{title}{badge && <span className="badge">{badge}</span>}</h3>
    <div className="card">{children}</div>
  </section>
)

const TABS = [['', 'This week', I.calendar], ['fixtures', 'Fixtures', I.list], ['results', 'Results', I.trophy]]

export const TabBar = ({ page }) => (
  <nav className={`tabs ${page === 'team' ? 'desktop-only' : ''}`} aria-label="Main">
    {TABS.map(([p, label, d]) => (
      <a key={p} href={`#/${p}`} aria-current={page === p ? 'page' : undefined}><Icon d={d} size={22} />{label}</a>
    ))}
  </nav>
)

export function Sheet({ title, fields, values, note, onSave, onDelete, close }) {
  const [v, setV] = useState(values)
  const submit = e => {
    e.preventDefault()
    onSave(Object.fromEntries(fields.map(f => [f.key, v[f.key] ?? ''])))
    close()
  }
  return (
    <div className="scrim" onClick={close}>
      <form className="sheet" onClick={e => e.stopPropagation()} onSubmit={submit}>
        <span className="grab" />
        <div className="row">
          <h2>{title}</h2>
          <button type="button" className="round" aria-label="Close" onClick={close}><Icon d={I.cross} w={2.2} /></button>
        </div>
        <div className="fields">
          {fields.map(f => <Field key={f.key} f={f} value={v[f.key] ?? ''} set={x => setV({ ...v, [f.key]: x })} />)}
        </div>
        {note && <p className="note"><Icon d={I.info} />{note}</p>}
        <button className="primary">Save</button>
        {onDelete && <button type="button" className="ghost" onClick={() => { onDelete(); close() }}>Delete</button>}
      </form>
    </div>
  )
}

function Field({ f, value, set }) {
  if (f.type === 'stepper') return (
    <div className="row full">
      <span className="name">{f.label}</span>
      <span className="stepper">
        <button type="button" className="round" aria-label={`Fewer ${f.label}`} onClick={() => set(Math.max(f.min, value - 1))}><Icon d={I.minus} w={2.4} /></button>
        <span className="num" aria-live="polite">{value}</span>
        <button type="button" className="round" aria-label={`More ${f.label}`} onClick={() => set(Math.min(f.max, value + 1))}><Icon d={I.plus} w={2.4} /></button>
      </span>
    </div>
  )
  const Input = f.options ? 'select' : 'input'
  return (
    <label className={`field ${f.half ? '' : 'full'}`}>
      {f.label}
      <Input type={f.type} value={value} required={!f.optional} onChange={e => set(e.target.value)}>
        {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </Input>
    </label>
  )
}
