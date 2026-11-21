import { doc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'
import { useApp, Icon, I, Bib, Week, answer, fmtDate, fmtTime, initials } from './ui'

const GROUPS = [['Playing', 'in'], ['Yet to reply', ''], ['Out', 'out']]

const Toggle = ({ kind, d, label, pressed, ...props }) => (
  <button className={`toggle ${kind}`} aria-label={label} aria-pressed={pressed} {...props}><Icon d={d} w={2.6} /></button>
)

export default function Team({ id }) {
  const { teams, users, game, me, join, nextMatch } = useApp()
  const t = teams.find(t => t.id === id)
  if (!t) return null

  const match = nextMatch(id)
  const rival = match && teams.find(r => r.id === (match.home === id ? match.away : match.home))
  const players = users.filter(u => u.team === id)
  const inCount = players.filter(u => answer(match, u) === 'in').length
  const setAnswer = (u, s) => updateDoc(doc(db, 'fixtures', match.id), { [`avail.${u.id}`]: answer(match, u) === s ? '' : s })

  return (
    <>
      <nav className="row">
        <a href="#/" className="back"><Icon d={I.back} size={20} w={2.2} />This week</a>
        {me.team !== id && <button className="link" onClick={() => join(id)}>Switch team</button>}
      </nav>

      <header className="stack">
        <p className="eyebrow muted">{t.name}</p>
        {rival ? (
          <div className="row start">
            <Bib t={rival} size="xl" />
            <div className="stack">
              <h1>v {rival.name}</h1>
              <p className="muted">{fmtDate(match.date)} · {fmtTime(match.time)}</p>
              <p className="venue muted"><Icon d={I.pin} size={16} />{match.venue}</p>
            </div>
          </div>
        ) : <h1>No game coming up</h1>}
        {match && <p><span className="num">{inCount} of {game.perTeam}</span> <span className="muted">in</span></p>}
        {match && (
          <div className="segs" style={{ gridTemplateColumns: `repeat(${game.perTeam}, 1fr)` }}>
            {Array.from({ length: game.perTeam }, (_, i) => <span key={i} className={i < inCount ? 'on' : ''} />)}
          </div>
        )}
      </header>

      {match && GROUPS.map(([label, status]) => {
        const list = players.filter(u => answer(match, u) === status)
        return list.length > 0 && (
          <Week key={label} title={`${label} · ${list.length}`}>
            {list.map(u => (
              <div className="item player" key={u.id}>
                <span className="face">{initials(u.name)}</span>
                <span className="grow name">{u.name}</span>
                <span role="group" aria-label={`${u.name} availability`} className="row">
                  {['in', 'out'].map(s => (
                    <Toggle key={s} kind={s} d={s === 'in' ? I.tick : I.cross} label={`${u.name} is ${s}`} pressed={answer(match, u) === s} disabled={u.id !== me.id} onClick={() => setAnswer(u, s)} />
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
