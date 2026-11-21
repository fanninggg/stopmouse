import { addDoc, collection, deleteDoc, doc, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import { useApp, Side, Week, fmtDate, fmtTime } from './ui'

const played = f => f.hs !== '' && f.as !== ''
const byDate = (list, newestFirst) =>
  Object.entries(Object.groupBy(list.toSorted((a, b) => a.time.localeCompare(b.time)), f => f.date))
    .sort(([a], [b]) => newestFirst ? b.localeCompare(a) : a.localeCompare(b))

// One sheet adds, edits and scores a fixture. Leave scores blank until it's played.
function useFixtureSheet() {
  const { teams, game, open } = useApp()
  const options = teams.map(t => ({ value: t.id, label: t.name }))
  return (f = { date: game.date, time: game.time, home: teams[0].id, away: teams[1].id }) => open({
    title: f.id ? 'Fixture' : 'Add fixture',
    values: f,
    fields: [
      { key: 'date', label: 'Date', type: 'date', half: true },
      { key: 'time', label: 'Kick-off', type: 'time', half: true },
      { key: 'home', label: 'Home', options, half: true },
      { key: 'away', label: 'Away', options, half: true },
      { key: 'hs', label: 'Home score', type: 'number', optional: true, half: true },
      { key: 'as', label: 'Away score', type: 'number', optional: true, half: true },
    ],
    onSave: v => f.id ? setDoc(doc(db, 'fixtures', f.id), v) : addDoc(collection(db, 'fixtures'), v),
    onDelete: f.id && (() => deleteDoc(doc(db, 'fixtures', f.id))),
  })
}

function Match({ f }) {
  const { teams, isAdmin } = useApp()
  const edit = useFixtureSheet()
  const team = id => teams.find(t => t.id === id)
  const done = played(f)
  const outcome = diff => done ? (diff > 0 ? 'win' : diff < 0 ? 'lose' : '') : ''
  return (
    <button className={`item match ${done ? 'result' : ''}`} disabled={!isAdmin} onClick={() => edit(f)}>
      {!done && <span className="muted small time">{fmtTime(f.time)}</span>}
      <Side t={team(f.home)} right cls={outcome(f.hs - f.as)} />
      <span className={done ? 'num' : 'muted small'}>{done ? `${f.hs} – ${f.as}` : 'v'}</span>
      <Side t={team(f.away)} cls={outcome(f.as - f.hs)} />
    </button>
  )
}

export default function Fixtures() {
  const { game, fixtures, isAdmin } = useApp()
  const add = useFixtureSheet()
  return (
    <>
      <header className="stack">
        <h1>Fixtures</h1>
        <p className="muted">{game.venue}</p>
      </header>
      {byDate(fixtures.filter(f => !played(f))).map(([date, list]) => (
        <Week key={date} title={fmtDate(date)} badge={date === game.date && 'This week'}>
          {list.map(f => <Match key={f.id} f={f} />)}
        </Week>
      ))}
      {isAdmin && <button className="ghost" onClick={() => add()}>Add fixture</button>}
    </>
  )
}

export function Results() {
  const { game, teams, fixtures } = useApp()
  const done = fixtures.filter(played)
  const table = teams.map(t => {
    const row = { t, p: 0, w: 0, d: 0, l: 0, gd: 0 }
    done.forEach(f => {
      const side = f.home === t.id ? 1 : f.away === t.id ? -1 : 0
      if (!side) return
      const diff = side * (f.hs - f.as)
      row.p++
      row.gd += diff
      row[diff > 0 ? 'w' : diff < 0 ? 'l' : 'd']++
    })
    return { ...row, pts: row.w * 3 + row.d }
  }).sort((a, b) => b.pts - a.pts || b.gd - a.gd)

  return (
    <>
      <header className="stack">
        <h1>Results</h1>
        <p className="muted">{game.name}</p>
      </header>
      <Week title="Table">
        <div className="table head">{['#', 'Team', 'P', 'W', 'D', 'L', 'GD', 'Pts'].map(h => <span key={h}>{h}</span>)}</div>
        {table.map((r, i) => (
          <div className="table" key={r.t.id}>
            <span className="muted">{i + 1}</span>
            <Side t={r.t} />
            {[r.p, r.w, r.d, r.l, r.gd > 0 ? `+${r.gd}` : r.gd < 0 ? `−${-r.gd}` : 0].map((n, j) => <span key={j} className="muted">{n}</span>)}
            <span className={`num ${i ? '' : 'leader'}`}>{r.pts}</span>
          </div>
        ))}
      </Week>
      {byDate(done, true).map(([date, list]) => (
        <Week key={date} title={fmtDate(date)}>{list.map(f => <Match key={f.id} f={f} />)}</Week>
      ))}
    </>
  )
}
