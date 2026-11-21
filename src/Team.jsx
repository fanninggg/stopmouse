import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'
import { useApp, Icon, I, Bib, Week, fmtDate, fmtTime, initials } from './ui'

const GROUPS = [['Playing', 'in'], ['Yet to reply', ''], ['Out', 'out']]

const Toggle = ({ kind, d, label, pressed, ...props }) => (
  <button className={`toggle ${kind}`} aria-label={label} aria-pressed={pressed} {...props}><Icon d={d} w={2.6} /></button>
)

export default function Team({ id }) {
  const { teams, users, game, me, isAdmin, open, join, saveGame } = useApp()
  const t = teams.find(t => t.id === id)
  if (!t) return null

  const players = users.filter(u => u.team === id)
  const inCount = players.filter(u => u.status === 'in').length
  const setStatus = (u, status) => updateDoc(doc(db, 'users', u.id), { status: u.status === status ? '' : status })
  const isAdminUser = u => game.admins.includes(u.id)
  const toggleAdmin = u => saveGame({ admins: (isAdminUser(u) ? arrayRemove : arrayUnion)(u.id) })
  const rename = () => open({
    title: 'Edit team', values: t, fields: [{ key: 'name', label: 'Name' }],
    onSave: v => saveGame({ [`teams.${id}`]: v.name }),
  })

  return (
    <>
      <nav className="row">
        <a href="#/" className="back"><Icon d={I.back} size={20} w={2.2} />This week</a>
        <span className="row">
          {me.team !== id && <button className="link" onClick={() => join(id)}>Switch team</button>}
          {isAdmin && <button className="pill" onClick={rename}>Edit team</button>}
        </span>
      </nav>

      <header className="stack">
        <div className="row start">
          <Bib t={t} size="xl" />
          <div className="stack">
            <h1>{t.name}</h1>
            <p className="muted">{fmtDate(game.date)} · {fmtTime(game.time)}</p>
          </div>
        </div>
        <p><span className="num">{inCount} of {game.perTeam}</span> <span className="muted">in</span></p>
        <div className="segs" style={{ gridTemplateColumns: `repeat(${game.perTeam}, 1fr)` }}>
          {Array.from({ length: game.perTeam }, (_, i) => <span key={i} style={{ background: i < inCount ? t.color : undefined }} />)}
        </div>
      </header>

      {GROUPS.map(([label, status]) => {
        const list = players.filter(u => (u.status || '') === status)
        return list.length > 0 && (
          <Week key={label} title={`${label} · ${list.length}`}>
            {list.map(u => (
              <div className="item player" key={u.id}>
                <span className="face">{initials(u.name)}</span>
                <span className="grow name">{u.name}</span>
                <span role="group" aria-label={`${u.name} availability`} className="row">
                  {isAdmin && <Toggle kind="admin" d={I.star} label={`${u.name} is an admin`} pressed={isAdminUser(u)} disabled={u.id === me.id} onClick={() => toggleAdmin(u)} />}
                  {['in', 'out'].map(s => (
                    <Toggle key={s} kind={s} d={s === 'in' ? I.tick : I.cross} label={`${u.name} is ${s}`} pressed={u.status === s} disabled={u.id !== me.id && !isAdmin} onClick={() => setStatus(u, s)} />
                  ))}
                </span>
              </div>
            ))}
          </Week>
        )
      })}
    </>
  )
}
