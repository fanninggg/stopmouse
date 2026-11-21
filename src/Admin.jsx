import { arrayRemove, arrayUnion } from 'firebase/firestore'
import { useApp, Icon, I, Bib, Week, fmtDate, fmtTime, initials } from './ui'
import { Match, byDate, useFixtureSheet } from './Fixtures'

const addWeek = date => new Date(Date.parse(date) + 7 * 864e5).toISOString().slice(0, 10)

const Row = ({ title, detail, onClick, children }) => (
  <button className="item" onClick={onClick}>
    {children}
    <span className="grow stack">
      <span className="name">{title}</span>
      {detail && <span className="muted small">{detail}</span>}
    </span>
    <span className="faint"><Icon d={I.chevron} w={2.2} /></span>
  </button>
)

export default function Admin() {
  const { game, teams, users, fixtures, me, open, saveGame } = useApp()
  const editFixture = useFixtureSheet()
  const isAdmin = u => game.admins.includes(u.id)
  const editGame = () => open({
    title: 'Game details', values: game, onSave: saveGame,
    note: 'Changing the date starts a fresh week and clears drinks.',
    fields: [
      { key: 'name', label: 'Name' },
      { key: 'date', label: 'Date', type: 'date', half: true },
      { key: 'time', label: 'Kick-off', type: 'time', half: true },
      { key: 'venue', label: 'Where' },
      { key: 'perTeam', label: 'Players per team', type: 'stepper', min: 1, max: 11 },
    ],
  })
  const editDrinks = () => open({
    title: 'Drinks after', values: game, onSave: saveGame,
    fields: [{ key: 'pub', label: 'Pub' }, { key: 'pubNote', label: 'Details', optional: true }],
  })
  const rename = t => open({
    title: 'Team name', values: t, fields: [{ key: 'name', label: 'Name' }],
    onSave: v => saveGame({ [`teams.${t.id}`]: v.name }),
  })

  return (
    <>
      <nav className="row">
        <a href="#/" className="back"><Icon d={I.back} size={20} w={2.2} />This week</a>
      </nav>
      <h1>Admin</h1>

      <section>
        <h2>This week</h2>
        <div className="card">
          <Row title="Game details" detail={`${fmtDate(game.date)} · ${fmtTime(game.time)} · ${game.venue}`} onClick={editGame} />
          <Row title="Drinks after" detail={game.pub || 'Not booked yet'} onClick={editDrinks} />
        </div>
        <button className="ghost" onClick={() => saveGame({ date: addWeek(game.date) })}>Start next week</button>
        <p className="muted small center">Moves the date on 7 days and clears drinks.</p>
      </section>

      <section>
        <h2>Fixtures</h2>
        <button className="ghost" onClick={() => editFixture()}>Add fixture</button>
        {byDate(fixtures, true).map(([date, list]) => (
          <Week key={date} title={fmtDate(date)}>{list.map(f => <Match key={f.id} f={f} onClick={() => editFixture(f)} />)}</Week>
        ))}
      </section>

      <section>
        <h2>Teams</h2>
        <div className="card">{teams.map(t => <Row key={t.id} title={t.name} onClick={() => rename(t)}><Bib t={t} size="lg" /></Row>)}</div>
      </section>

      <section>
        <h2>Admins</h2>
        <div className="card">
          {users.map(u => (
            <div className="item player" key={u.id}>
              <span className="face">{initials(u.name)}</span>
              <span className="grow stack">
                <span className="name">{u.name}</span>
                <span className="muted small">{isAdmin(u) ? 'Admin' : 'Player'}</span>
              </span>
              {u.id !== me.id && (
                <button className="pill" onClick={() => saveGame({ admins: (isAdmin(u) ? arrayRemove : arrayUnion)(u.id) })}>
                  {isAdmin(u) ? 'Remove admin' : 'Make admin'}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
